import { ValidationResult } from './rules';
import { fabric } from 'fabric';

/**
 * Auto-Fix Engine - Automatically fixes compliance violations
 */

export interface FixAction {
    type: 'resize' | 'reposition' | 'recolor' | 'add_element' | 'adjust_property';
    target: string; // Element name or ID
    params: Record<string, any>;
    description: string;
}

export interface AutoFixResult {
    success: boolean;
    appliedFixes: FixAction[];
    errors: string[];
    message: string;
}

export class ComplianceAutoFixer {
    private canvas: fabric.Canvas;
    private canvasJSON: any;

    constructor(canvas: fabric.Canvas) {
        this.canvas = canvas;
        this.canvasJSON = canvas.toJSON(['name']);
    }

    /**
     * Auto-fix all violations
     */
    async fixAll(violations: ValidationResult[]): Promise<AutoFixResult> {
        const appliedFixes: FixAction[] = [];
        const errors: string[] = [];

        // Filter only failed validations
        const failedViolations = violations.filter(v => !v.passed);

        if (failedViolations.length === 0) {
            return {
                success: true,
                appliedFixes: [],
                errors: [],
                message: 'No violations to fix!',
            };
        }

        // Apply fixes for each violation
        for (const violation of failedViolations) {
            try {
                const fix = await this.generateFix(violation);
                if (fix) {
                    const applied = await this.applyFix(fix);
                    if (applied) {
                        appliedFixes.push(fix);
                    }
                }
            } catch (error) {
                errors.push(`Failed to fix ${violation.ruleName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        this.canvas.renderAll();

        return {
            success: errors.length === 0,
            appliedFixes,
            errors,
            message: `Fixed ${appliedFixes.length} of ${failedViolations.length} violations`,
        };
    }

    /**
     * Generate fix action for a specific violation
     */
    private async generateFix(violation: ValidationResult): Promise<FixAction | null> {
        const ruleId = violation.ruleId;

        // Map rule IDs to fix generators
        const fixGenerators: Record<string, () => FixAction | null> = {
            'tesco-logo-size': () => this.fixLogoSize(violation),
            'tesco-text-minimum': () => this.fixTextSize(violation),
            'tesco-headline-minimum': () => this.fixTextSize(violation),
            'tesco-disclaimer-size': () => this.fixTextSize(violation),
            'tesco-safe-zone': () => this.fixSafeZone(violation),
            'tesco-logo-placement': () => this.fixLogoPlacement(violation),
            'tesco-contrast-ratio': () => this.fixContrast(violation),
            'tesco-color-brand': () => this.fixBrandColors(violation),
            'tesco-max-fonts': () => this.fixFontLimit(violation),
            'tesco-disclaimer-position': () => this.fixDisclaimerPosition(violation),
            'tesco-logo-clearspace': () => this.fixLogoClearspace(violation),
        };

        const generator = fixGenerators[ruleId];
        return generator ? generator() : null;
    }

    /**
     * Apply a fix action to the canvas
     */
    private async applyFix(fix: FixAction): Promise<boolean> {
        try {
            // Use smart findElement instead of name-only search
            const target = this.findElement(fix.target);

            if (!target) {
                console.warn(`Target element not found: ${fix.target}`);
                return false;
            }

            switch (fix.type) {
                case 'resize':
                    return this.applyResize(target, fix.params);
                case 'reposition':
                    return this.applyReposition(target, fix.params);
                case 'recolor':
                    return this.applyRecolor(target, fix.params);
                case 'adjust_property':
                    return this.applyPropertyAdjustment(target, fix.params);
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error applying fix:', error);
            return false;
        }
    }

    /**
     * Fix Generators for Each Rule Type
     */

    private fixLogoSize(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.requiredSize || !details.currentSize) return null;

        const logo = this.findElement('logo');
        if (!logo) return null;

        const scaleFactor = details.requiredSize / details.currentSize;

        return {
            type: 'resize',
            target: logo.name || 'logo',
            params: {
                scaleX: (logo.scaleX || 1) * scaleFactor,
                scaleY: (logo.scaleY || 1) * scaleFactor,
            },
            description: `Resize logo to ${details.requiredSize}mm`,
        };
    }

    private fixTextSize(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.violations || details.violations.length === 0) return null;

        const firstViolation = details.violations[0];
        const element = this.findElement(firstViolation.element);
        if (!element) return null;

        return {
            type: 'adjust_property',
            target: element.name || firstViolation.element,
            params: {
                fontSize: firstViolation.requiredSize,
            },
            description: `Increase text size to ${firstViolation.requiredSize}pt`,
        };
    }

    private fixSafeZone(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.violations || details.violations.length === 0) return null;

        const firstViolation = details.violations[0];
        const element = this.findElement(firstViolation.element);
        if (!element) return null;

        const marginMM = details.safeZoneMargin || 5;
        const marginPx = this.mmToPixels(marginMM);

        // Calculate new position within safe zone
        const left = Math.max(marginPx, Math.min(element.left || 0, this.canvas.width! - marginPx - (element.width || 0) * (element.scaleX || 1)));
        const top = Math.max(marginPx, Math.min(element.top || 0, this.canvas.height! - marginPx - (element.height || 0) * (element.scaleY || 1)));

        return {
            type: 'reposition',
            target: element.name || firstViolation.element,
            params: { left, top },
            description: `Move element into safe zone (${marginMM}mm margin)`,
        };
    }

    private fixLogoPlacement(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.preferredPositions) return null;

        const logo = this.findElement('logo');
        if (!logo) return null;

        const preferredPosition = details.preferredPositions[0];
        const logoWidth = (logo.width || 0) * (logo.scaleX || 1);
        const logoHeight = (logo.height || 0) * (logo.scaleY || 1);
        const margin = this.mmToPixels(10); // 10mm margin

        let left = margin;
        let top = margin;

        if (preferredPosition === 'top-right') {
            left = this.canvas.width! - logoWidth - margin;
        } else if (preferredPosition === 'bottom-left') {
            top = this.canvas.height! - logoHeight - margin;
        } else if (preferredPosition === 'bottom-right') {
            left = this.canvas.width! - logoWidth - margin;
            top = this.canvas.height! - logoHeight - margin;
        }

        return {
            type: 'reposition',
            target: logo.name || 'logo',
            params: { left, top },
            description: `Move logo to ${preferredPosition}`,
        };
    }

    private fixContrast(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.violations || details.violations.length === 0) return null;

        const firstViolation = details.violations[0];
        const element = this.findElement(firstViolation.element);
        if (!element) return null;

        // Simple fix: change text to black or white depending on background
        const bgColor = this.canvas.backgroundColor as string || '#FFFFFF';
        const newColor = this.isLightColor(bgColor) ? '#000000' : '#FFFFFF';

        return {
            type: 'recolor',
            target: element.name || firstViolation.element,
            params: { fill: newColor },
            description: `Improve contrast to ${details.minRatio}:1`,
        };
    }

    private fixBrandColors(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.violations || details.violations.length === 0) return null;

        const firstViolation = details.violations[0];
        const element = this.findElement(firstViolation.element);
        if (!element) return null;

        const closestApproved = firstViolation.closestApproved || details.approvedColors[0];

        return {
            type: 'recolor',
            target: element.name || firstViolation.element,
            params: { fill: closestApproved },
            description: `Change to approved brand color: ${closestApproved}`,
        };
    }

    private fixFontLimit(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.fonts) return null;

        // Find the most common font
        const textObjects = this.canvas.getObjects().filter(obj => obj.type === 'i-text' || obj.type === 'text');
        const fontCounts: Record<string, number> = {};

        textObjects.forEach(obj => {
            const font = (obj as any).fontFamily || 'Arial';
            fontCounts[font] = (fontCounts[font] || 0) + 1;
        });

        const mostCommonFont = Object.keys(fontCounts).reduce((a, b) => fontCounts[a] > fontCounts[b] ? a : b);

        // Change all text to the most common font
        const firstText = textObjects[0];
        if (!firstText) return null;

        return {
            type: 'adjust_property',
            target: (firstText as any).name || 'text',
            params: { fontFamily: mostCommonFont },
            description: `Standardize to ${mostCommonFont} font`,
        };
    }

    private fixDisclaimerPosition(violation: ValidationResult): FixAction | null {
        const disclaimer = this.findElement('disclaimer');
        if (!disclaimer) return null;

        const marginPx = this.mmToPixels(10);
        const left = disclaimer.left || 0;
        const top = this.canvas.height! - (disclaimer.height || 0) * (disclaimer.scaleY || 1) - marginPx;

        return {
            type: 'reposition',
            target: disclaimer.name || 'disclaimer',
            params: { left, top },
            description: 'Move disclaimer to bottom',
        };
    }

    private fixLogoClearspace(violation: ValidationResult): FixAction | null {
        const details = violation.details;
        if (!details || !details.violations || details.violations.length === 0) return null;

        const firstViolation = details.violations[0];
        const element = this.findElement(firstViolation.element);
        if (!element) return null;

        const logo = this.findElement('logo');
        if (!logo) return null;

        const clearSpacePx = this.mmToPixels(details.requiredClearSpace || 5);
        const logoRight = (logo.left || 0) + (logo.width || 0) * (logo.scaleX || 1);

        // Move element away from logo
        const newLeft = logoRight + clearSpacePx + 20;

        return {
            type: 'reposition',
            target: element.name || firstViolation.element,
            params: { left: newLeft },
            description: `Move element away from logo (${details.requiredClearSpace}mm clearspace)`,
        };
    }

    /**
     * Apply Fix Methods
     */

    private applyResize(target: fabric.Object, params: any): boolean {
        if (params.scaleX !== undefined) target.scaleX = params.scaleX;
        if (params.scaleY !== undefined) target.scaleY = params.scaleY;
        target.setCoords();
        return true;
    }

    private applyReposition(target: fabric.Object, params: any): boolean {
        if (params.left !== undefined) target.left = params.left;
        if (params.top !== undefined) target.top = params.top;
        target.setCoords();
        return true;
    }

    private applyRecolor(target: fabric.Object, params: any): boolean {
        if (params.fill !== undefined) (target as any).fill = params.fill;
        if (params.stroke !== undefined) (target as any).stroke = params.stroke;
        return true;
    }

    private applyPropertyAdjustment(target: fabric.Object, params: any): boolean {
        Object.keys(params).forEach(key => {
            (target as any)[key] = params[key];
        });
        target.setCoords();
        return true;
    }

    /**
     * Utility Methods
     */

    private findElement(namePattern: string): fabric.Object | null {
        const objects = this.canvas.getObjects();

        // First try to find by name
        let found = objects.find(obj =>
            (obj as any).name?.toLowerCase().includes(namePattern.toLowerCase())
        );

        // If not found by name, try to find by type
        if (!found) {
            if (namePattern.toLowerCase().includes('logo')) {
                // Find smallest image (logos are usually smaller than backgrounds)
                const images = objects.filter(obj => obj.type === 'image');
                if (images.length > 0) {
                    found = images.reduce((smallest: any, img: any) => {
                        const currentSize = (img.width || 0) * (img.scaleX || 1) * (img.height || 0) * (img.scaleY || 1);
                        const smallestSize = (smallest.width || 0) * (smallest.scaleX || 1) * (smallest.height || 0) * (smallest.scaleY || 1);
                        return currentSize < smallestSize ? img : smallest;
                    });
                }
            } else if (namePattern.toLowerCase().includes('text') || namePattern.toLowerCase().includes('headline')) {
                // Find any text element
                found = objects.find(obj => obj.type === 'i-text' || obj.type === 'text');
            }
        }

        return found || null;
    }

    private mmToPixels(mm: number): number {
        // Assuming 96 DPI and canvas width of 1080px represents ~285mm (A4 width)
        const canvasWidthMM = 285;
        return (mm / canvasWidthMM) * (this.canvas.width || 1080);
    }

    private isLightColor(color: string): boolean {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5;
    }
}
