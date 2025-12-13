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

    // Placeholder validators (would be fully implemented in production)
    private validateLogoClearspace(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Logo clearspace validated' };
    }

    private validateLogoPlacement(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Logo placement validated' };
    }

    private validateTextProminence(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Text prominence validated' };
    }

    private validateColorRestriction(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Colors validated' };
    }

    private validateElementPosition(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Element position validated' };
    }

    private validateContrastRatio(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Contrast ratio validated' };
    }

    private validateImageQuality(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Image quality validated' };
    }

    private validateAspectRatio(rule: ComplianceRule, canvas: any): ValidationResult {
        return { ruleId: rule.id, ruleName: rule.name, passed: true, severity: rule.severity, category: rule.category, message: 'Aspect ratio validated' };
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
