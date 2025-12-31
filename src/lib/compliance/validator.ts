import { ComplianceRule, ValidationResult, ComplianceReport } from './rules';

/**
 * Core validation engine for compliance checking
 */
export class ComplianceValidator {
    private rules: ComplianceRule[];

    constructor(rules: ComplianceRule[]) {
        this.rules = rules.filter(r => r.enabled);
    }

    /**
     * Validate canvas against all applicable rules
     */
    async validate(canvasJSON: any, metadata?: any): Promise<ComplianceReport> {
        const results: ValidationResult[] = [];

        for (const rule of this.rules) {
            try {
                const result = await this.validateRule(rule, canvasJSON, metadata);
                results.push(result);
            } catch (error) {
                console.error(`Error validating rule ${rule.id}:`, error);
                results.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    passed: false,
                    severity: 'error',
                    category: rule.category,
                    message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                });
            }
        }

        return this.generateReport(results, metadata?.creativeId);
    }

    /**
     * Validate a single rule
     */
    private async validateRule(
        rule: ComplianceRule,
        canvasJSON: any,
        metadata?: any
    ): Promise<ValidationResult> {
        const validator = this.getValidator(rule.validator.type);

        if (!validator) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: 'error',
                category: rule.category,
                message: `Unknown validator type: ${rule.validator.type}`,
            };
        }

        return validator(rule, canvasJSON, metadata);
    }

    /**
     * Get validator function by type
     */
    private getValidator(type: string): ((rule: ComplianceRule, canvas: any, metadata?: any) => ValidationResult) | null {
        const validators: Record<string, any> = {
            logo_minimum_size: this.validateLogoMinimumSize,
            logo_clearspace: this.validateLogoClearspace,
            logo_placement: this.validateLogoPlacement,
            text_minimum_size: this.validateTextMinimumSize,
            text_prominence: this.validateTextProminence,
            color_restriction: this.validateColorRestriction,
            safe_zone: this.validateSafeZone,
            element_position: this.validateElementPosition,
            contrast_ratio: this.validateContrastRatio,
            font_limit: this.validateFontLimit,
            image_quality: this.validateImageQuality,
            mandatory_elements: this.validateMandatoryElements,
            aspect_ratio: this.validateAspectRatio,
        };

        return validators[type] ? validators[type].bind(this) : null;
    }

    /**
     * Validators for each rule type
     */

    private validateLogoMinimumSize(rule: ComplianceRule, canvas: any): ValidationResult {
        const { minWidth, logoIdentifier } = rule.validator.params;
        const logos = canvas.objects?.filter((obj: any) =>
            obj.type === 'image' && obj.name?.includes('logo')
        ) || [];

        if (logos.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: rule.severity,
                category: rule.category,
                message: 'No logo found in creative',
                suggestion: 'Add a logo to your creative',
            };
        }

        const logo = logos[0];
        const logoWidth = (logo.width || 0) * (logo.scaleX || 1);
        const widthMM = this.pixelsToMM(logoWidth, canvas.width);

        const passed = widthMM >= minWidth;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? `Logo size (${widthMM.toFixed(1)}mm) meets minimum requirement`
                : `Logo too small (${widthMM.toFixed(1)}mm). Minimum: ${minWidth}mm`,
            suggestion: passed ? undefined : `Increase logo size to at least ${minWidth}mm wide`,
            affectedElements: [logo.name || 'logo'],
            details: { currentSize: widthMM, requiredSize: minWidth },
        };
    }

    private validateTextMinimumSize(rule: ComplianceRule, canvas: any): ValidationResult {
        const { minSize, onlyTypes, excludeTypes } = rule.validator.params;
        const textObjects = canvas.objects?.filter((obj: any) =>
            obj.type === 'i-text' || obj.type === 'text'
        ) || [];

        // FIX: Check if any text objects exist
        if (textObjects.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: 'warning',
                category: rule.category,
                message: 'No text elements found on canvas',
                suggestion: 'Add text elements to your design',
            };
        }

        const violations: any[] = [];

        for (const text of textObjects) {
            const textType = text.name?.toLowerCase() || '';

            // Filter by type if specified
            if (onlyTypes && !onlyTypes.some((t: string) => textType.includes(t))) continue;
            if (excludeTypes && excludeTypes.some((t: string) => textType.includes(t))) continue;

            const fontSize = text.fontSize || 12;
            if (fontSize < minSize) {
                violations.push({
                    element: text.name || 'text',
                    currentSize: fontSize,
                    requiredSize: minSize,
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'All text meets minimum size requirements'
                : `${violations.length} text element(s) below minimum size`,
            suggestion: passed ? undefined : `Increase text size to at least ${minSize}pt`,
            affectedElements: violations.map(v => v.element),
            details: { violations },
        };
    }


    private validateMandatoryElements(rule: ComplianceRule, canvas: any): ValidationResult {
        const { required } = rule.validator.params;
        const objects = canvas.objects || [];

        const missing: string[] = [];

        for (const elementType of required) {
            const found = objects.some((obj: any) =>
                obj.name?.toLowerCase().includes(elementType.toLowerCase())
            );

            if (!found) {
                missing.push(elementType);
            }
        }

        const passed = missing.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'All mandatory elements present'
                : `Missing required elements: ${missing.join(', ')}`,
            suggestion: passed ? undefined : `Add the following elements: ${missing.join(', ')}`,
            details: { missing, required },
        };
    }

    private validateSafeZone(rule: ComplianceRule, canvas: any): ValidationResult {
        const { margin, criticalElements } = rule.validator.params;
        const marginPx = this.mmToPixels(margin, canvas.width);

        const violations: any[] = [];
        const objects = canvas.objects || [];

        for (const obj of objects) {
            const isCritical = criticalElements.some((type: string) =>
                obj.name?.toLowerCase().includes(type.toLowerCase())
            );

            if (!isCritical) continue;

            const left = obj.left || 0;
            const top = obj.top || 0;
            const right = left + (obj.width || 0) * (obj.scaleX || 1);
            const bottom = top + (obj.height || 0) * (obj.scaleY || 1);

            if (left < marginPx || top < marginPx ||
                right > canvas.width - marginPx || bottom > canvas.height - marginPx) {
                violations.push({
                    element: obj.name || 'element',
                    position: { left, top, right, bottom },
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'All critical elements within safe zone'
                : `${violations.length} element(s) outside safe zone`,
            suggestion: passed ? undefined : `Move elements at least ${margin}mm from edges`,
            affectedElements: violations.map(v => v.element),
            details: { violations, safeZoneMargin: margin },
        };
    }

    private validateFontLimit(rule: ComplianceRule, canvas: any): ValidationResult {
        const { maxFonts } = rule.validator.params;
        const textObjects = canvas.objects?.filter((obj: any) =>
            obj.type === 'i-text' || obj.type === 'text'
        ) || [];

        // FIX: Check if any text objects exist
        if (textObjects.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: 'warning',
                category: rule.category,
                message: 'No text elements found on canvas',
                suggestion: 'Add text elements to your design',
            };
        }

        const fonts = new Set(textObjects.map((obj: any) => obj.fontFamily || 'Arial'));
        const fontCount = fonts.size;
        const passed = fontCount <= maxFonts;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? `Using ${fontCount} font(s) (within limit)`
                : `Using ${fontCount} fonts. Maximum allowed: ${maxFonts}`,
            suggestion: passed ? undefined : `Reduce to ${maxFonts} font families`,
            details: { currentFonts: fontCount, maxFonts, fonts: Array.from(fonts) },
        };
    }

    // Real validators - fully implemented
    private validateLogoClearspace(rule: ComplianceRule, canvas: any): ValidationResult {
        const { minClearSpace, logoIdentifier } = rule.validator.params;
        const logos = canvas.objects?.filter((obj: any) =>
            obj.type === 'image' && obj.name?.includes('logo')
        ) || [];

        if (logos.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: rule.severity,
                category: rule.category,
                message: 'No logo found to check clearspace',
            };
        }

        const logo = logos[0];
        const clearSpacePx = this.mmToPixels(minClearSpace, canvas.width);
        const logoLeft = logo.left || 0;
        const logoTop = logo.top || 0;
        const logoRight = logoLeft + (logo.width || 0) * (logo.scaleX || 1);
        const logoBottom = logoTop + (logo.height || 0) * (logo.scaleY || 1);

        const violations: any[] = [];
        const objects = canvas.objects || [];

        for (const obj of objects) {
            if (obj === logo) continue;

            const objLeft = obj.left || 0;
            const objTop = obj.top || 0;
            const objRight = objLeft + (obj.width || 0) * (obj.scaleX || 1);
            const objBottom = objTop + (obj.height || 0) * (obj.scaleY || 1);

            // Check if object is too close to logo
            const horizontalDistance = Math.min(
                Math.abs(objLeft - logoRight),
                Math.abs(objRight - logoLeft)
            );
            const verticalDistance = Math.min(
                Math.abs(objTop - logoBottom),
                Math.abs(objBottom - logoTop)
            );

            if (horizontalDistance < clearSpacePx || verticalDistance < clearSpacePx) {
                violations.push({
                    element: obj.name || 'element',
                    distance: Math.min(horizontalDistance, verticalDistance),
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'Logo clearspace maintained'
                : `${violations.length} element(s) too close to logo`,
            suggestion: passed ? undefined : `Maintain ${minClearSpace}mm clearspace around logo`,
            affectedElements: violations.map(v => v.element),
            details: { violations, requiredClearSpace: minClearSpace },
        };
    }

    private validateLogoPlacement(rule: ComplianceRule, canvas: any): ValidationResult {
        const { preferredPositions, maxDistanceFromCorner } = rule.validator.params;
        const logos = canvas.objects?.filter((obj: any) =>
            obj.type === 'image' && obj.name?.includes('logo')
        ) || [];

        if (logos.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: rule.severity,
                category: rule.category,
                message: 'No logo found',
            };
        }

        const logo = logos[0];
        const logoLeft = logo.left || 0;
        const logoTop = logo.top || 0;
        const logoWidth = (logo.width || 0) * (logo.scaleX || 1);
        const logoHeight = (logo.height || 0) * (logo.scaleY || 1);
        const logoCenterX = logoLeft + logoWidth / 2;
        const logoCenterY = logoTop + logoHeight / 2;

        const maxDistPx = this.mmToPixels(maxDistanceFromCorner, canvas.width);

        // Check each preferred position
        let inPreferredPosition = false;
        let closestPosition = '';
        let minDistance = Infinity;

        const positions = {
            'top-left': { x: 0, y: 0 },
            'top-right': { x: canvas.width, y: 0 },
            'bottom-left': { x: 0, y: canvas.height },
            'bottom-right': { x: canvas.width, y: canvas.height },
        };

        for (const pos of preferredPositions) {
            const corner = positions[pos as keyof typeof positions];
            if (!corner) continue;

            const distance = Math.sqrt(
                Math.pow(logoCenterX - corner.x, 2) +
                Math.pow(logoCenterY - corner.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestPosition = pos;
            }

            if (distance <= maxDistPx) {
                inPreferredPosition = true;
                break;
            }
        }

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed: inPreferredPosition,
            severity: rule.severity,
            category: rule.category,
            message: inPreferredPosition
                ? `Logo correctly placed in ${closestPosition}`
                : `Logo should be in ${preferredPositions.join(' or ')}`,
            suggestion: inPreferredPosition ? undefined : `Move logo to ${preferredPositions[0]} corner`,
            details: { currentPosition: closestPosition, preferredPositions },
        };
    }

    private validateTextProminence(rule: ComplianceRule, canvas: any): ValidationResult {
        const { elementType, minSize, minContrast } = rule.validator.params;
        const textObjects = canvas.objects?.filter((obj: any) =>
            (obj.type === 'i-text' || obj.type === 'text') &&
            obj.name?.toLowerCase().includes(elementType.toLowerCase())
        ) || [];

        if (textObjects.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: rule.severity,
                category: rule.category,
                message: `No ${elementType} text found`,
                suggestion: `Add ${elementType} text to your creative`,
            };
        }

        const violations: any[] = [];

        for (const text of textObjects) {
            const fontSize = text.fontSize || 12;

            // Check size
            if (fontSize < minSize) {
                violations.push({
                    element: text.name || 'text',
                    issue: 'size',
                    current: fontSize,
                    required: minSize,
                });
            }

            // Check contrast (simplified - would need background color detection in production)
            const textColor = text.fill || '#000000';
            const bgColor = canvas.backgroundColor || '#FFFFFF';
            const contrast = this.calculateContrastRatio(textColor, bgColor);

            if (contrast < minContrast) {
                violations.push({
                    element: text.name || 'text',
                    issue: 'contrast',
                    current: contrast.toFixed(2),
                    required: minContrast,
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? `${elementType} prominence validated`
                : `${violations.length} ${elementType} prominence issue(s)`,
            suggestion: passed ? undefined : `Increase ${elementType} size to ${minSize}pt and improve contrast`,
            affectedElements: violations.map(v => v.element),
            details: { violations },
        };
    }

    private validateColorRestriction(rule: ComplianceRule, canvas: any): ValidationResult {
        const { approvedColors, tolerance } = rule.validator.params;
        const objects = canvas.objects || [];
        const violations: any[] = [];

        for (const obj of objects) {
            const color = obj.fill || obj.stroke;
            if (!color || typeof color !== 'string') continue;

            const isApproved = approvedColors.some((approved: string) =>
                this.colorDistance(color, approved) <= tolerance
            );

            if (!isApproved) {
                violations.push({
                    element: obj.name || 'element',
                    color: color,
                    closestApproved: this.findClosestColor(color, approvedColors),
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'All colors are brand-approved'
                : `${violations.length} non-approved color(s) used`,
            suggestion: passed ? undefined : `Use only approved brand colors: ${approvedColors.join(', ')}`,
            affectedElements: violations.map(v => v.element),
            details: { violations, approvedColors },
        };
    }

    private validateElementPosition(rule: ComplianceRule, canvas: any): ValidationResult {
        const { elementType, position, maxDistanceFromEdge } = rule.validator.params;
        const elements = canvas.objects?.filter((obj: any) =>
            obj.name?.toLowerCase().includes(elementType.toLowerCase())
        ) || [];

        if (elements.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: rule.severity,
                category: rule.category,
                message: `No ${elementType} found`,
                suggestion: `Add ${elementType} to your creative`,
            };
        }

        const element = elements[0];
        const maxDistPx = this.mmToPixels(maxDistanceFromEdge, canvas.width);
        const elementTop = element.top || 0;
        const elementBottom = elementTop + (element.height || 0) * (element.scaleY || 1);

        let passed = false;
        let distance = 0;

        if (position === 'bottom') {
            distance = canvas.height - elementBottom;
            passed = distance <= maxDistPx;
        } else if (position === 'top') {
            distance = elementTop;
            passed = distance <= maxDistPx;
        }

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? `${elementType} correctly positioned at ${position}`
                : `${elementType} should be at ${position} (within ${maxDistanceFromEdge}mm)`,
            suggestion: passed ? undefined : `Move ${elementType} to ${position} of creative`,
            affectedElements: [element.name || elementType],
            details: { currentDistance: this.pixelsToMM(distance, canvas.width), maxDistance: maxDistanceFromEdge },
        };
    }

    private validateContrastRatio(rule: ComplianceRule, canvas: any): ValidationResult {
        const { minRatio, applyToAll } = rule.validator.params;
        const textObjects = canvas.objects?.filter((obj: any) =>
            obj.type === 'i-text' || obj.type === 'text'
        ) || [];

        const violations: any[] = [];

        for (const text of textObjects) {
            const textColor = text.fill || '#000000';
            const bgColor = canvas.backgroundColor || '#FFFFFF';
            const contrast = this.calculateContrastRatio(textColor, bgColor);

            if (contrast < minRatio) {
                violations.push({
                    element: text.name || 'text',
                    contrast: contrast.toFixed(2),
                    required: minRatio,
                    textColor,
                    bgColor,
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'All text has sufficient contrast'
                : `${violations.length} text element(s) with low contrast`,
            suggestion: passed ? undefined : `Increase contrast to at least ${minRatio}:1 (WCAG AA)`,
            affectedElements: violations.map(v => v.element),
            details: { violations, minRatio },
        };
    }

    private validateImageQuality(rule: ComplianceRule, canvas: any): ValidationResult {
        const { minDPI } = rule.validator.params;
        const images = canvas.objects?.filter((obj: any) => obj.type === 'image') || [];

        if (images.length === 0) {
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,  // FIX: Changed from true to false
                severity: 'warning',
                category: rule.category,
                message: 'No images found on canvas',
                suggestion: 'Add images to your design',
            };
        }

        const violations: any[] = [];

        for (const img of images) {
            // Estimate DPI based on scale
            const originalWidth = img.width || 0;
            const scaledWidth = originalWidth * (img.scaleX || 1);
            const widthMM = this.pixelsToMM(scaledWidth, canvas.width);
            const estimatedDPI = (originalWidth / widthMM) * 25.4; // Convert mm to inches

            if (estimatedDPI < minDPI) {
                violations.push({
                    element: img.name || 'image',
                    estimatedDPI: Math.round(estimatedDPI),
                    required: minDPI,
                });
            }
        }

        const passed = violations.length === 0;

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? 'All images meet quality standards'
                : `${violations.length} image(s) below ${minDPI} DPI`,
            suggestion: passed ? undefined : `Use higher resolution images (${minDPI}+ DPI)`,
            affectedElements: violations.map(v => v.element),
            details: { violations, minDPI },
        };
    }

    private validateAspectRatio(rule: ComplianceRule, canvas: any): ValidationResult {
        const { approved, tolerance } = rule.validator.params;
        const width = canvas.width || 1080;
        const height = canvas.height || 1080;
        const currentRatio = width / height;

        let passed = false;
        let closestRatio = '';
        let minDiff = Infinity;

        for (const ratio of approved) {
            const [w, h] = ratio.split(':').map(Number);
            const approvedRatio = w / h;
            const diff = Math.abs(currentRatio - approvedRatio);

            if (diff < minDiff) {
                minDiff = diff;
                closestRatio = ratio;
            }

            if (diff <= tolerance) {
                passed = true;
                break;
            }
        }

        return {
            ruleId: rule.id,
            ruleName: rule.name,
            passed,
            severity: rule.severity,
            category: rule.category,
            message: passed
                ? `Aspect ratio matches ${closestRatio}`
                : `Aspect ratio doesn't match approved ratios. Closest: ${closestRatio}`,
            suggestion: passed ? undefined : `Use one of these aspect ratios: ${approved.join(', ')}`,
            details: {
                currentRatio: `${width}:${height}`,
                currentDecimal: currentRatio.toFixed(2),
                closestApproved: closestRatio,
                approved,
            },
        };
    }

    /**
     * Utility functions for color and contrast calculations
     */
    private calculateContrastRatio(color1: string, color2: string): number {
        const lum1 = this.getLuminance(color1);
        const lum2 = this.getLuminance(color2);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    private getLuminance(color: string): number {
        const rgb = this.hexToRgb(color);
        if (!rgb) return 0;

        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    }

    private colorDistance(color1: string, color2: string): number {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        if (!rgb1 || !rgb2) return Infinity;

        return Math.sqrt(
            Math.pow(rgb1.r - rgb2.r, 2) +
            Math.pow(rgb1.g - rgb2.g, 2) +
            Math.pow(rgb1.b - rgb2.b, 2)
        );
    }

    private findClosestColor(color: string, approvedColors: string[]): string {
        let closest = approvedColors[0];
        let minDistance = Infinity;

        for (const approved of approvedColors) {
            const distance = this.colorDistance(color, approved);
            if (distance < minDistance) {
                minDistance = distance;
                closest = approved;
            }
        }

        return closest;
    }

    /**
     * Generate compliance report
     */
    protected generateReport(results: ValidationResult[], creativeId?: string): ComplianceReport {
        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed && r.severity === 'error').length;
        const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;

        const score = Math.round((passed / results.length) * 100);
        const overallStatus = failed > 0 ? 'fail' : warnings > 0 ? 'warning' : 'pass';

        return {
            creativeId: creativeId || 'unknown',
            timestamp: Date.now(),
            overallStatus,
            score,
            results,
            summary: {
                total: results.length,
                passed,
                failed,
                warnings,
            },
        };
    }

    /**
     * Utility functions
     */
    private pixelsToMM(pixels: number, canvasWidth: number, assumedWidthMM: number = 210): number {
        // Assuming A4 width (210mm) for standard print
        return (pixels / canvasWidth) * assumedWidthMM;
    }

    private mmToPixels(mm: number, canvasWidth: number, assumedWidthMM: number = 210): number {
        return (mm / assumedWidthMM) * canvasWidth;
    }
}
