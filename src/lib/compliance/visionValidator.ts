import { ComplianceValidator } from './validator';
import { ComplianceRule, ValidationResult, ComplianceReport } from './rules';
import { analyzeCreativeImage, detectLogo, analyzeTextCompliance, analyzeColorCompliance } from './imageAnalysis';

/**
 * Enhanced compliance validator with computer vision integration
 */
export class VisionEnhancedValidator extends ComplianceValidator {
    /**
     * Validate with image analysis support
     */
    async validateWithVision(
        canvasJSON: any,
        imageUrl?: string,
        metadata?: any
    ): Promise<ComplianceReport> {
        // Get base validation results
        const baseReport = await this.validate(canvasJSON, metadata);

        // If no image URL, return base validation
        if (!imageUrl) {
            return baseReport;
        }

        try {
            // Perform image analysis
            const imageAnalysis = await analyzeCreativeImage(imageUrl);

            // Enhance validation results with vision data
            const enhancedResults = await this.enhanceWithVision(
                baseReport.results,
                imageAnalysis,
                canvasJSON
            );

            // Regenerate report with enhanced results
            return this.generateReport(enhancedResults, metadata?.creativeId);
        } catch (error) {
            console.error('Vision enhancement error:', error);
            // Return base report if vision fails
            return baseReport;
        }
    }

    /**
     * Enhance validation results with vision data
     */
    private async enhanceWithVision(
        baseResults: ValidationResult[],
        imageAnalysis: any,
        canvasJSON: any
    ): Promise<ValidationResult[]> {
        const enhanced = [...baseResults];

        // Enhance logo validation
        const logoResult = this.enhanceLogoValidation(imageAnalysis, canvasJSON);
        if (logoResult) {
            const index = enhanced.findIndex(r => r.category === 'logo');
            if (index >= 0) {
                enhanced[index] = logoResult;
            } else {
                enhanced.push(logoResult);
            }
        }

        // Enhance text validation
        const textResult = this.enhanceTextValidation(imageAnalysis, canvasJSON);
        if (textResult) {
            enhanced.push(textResult);
        }

        // Enhance color validation
        const colorResult = this.enhanceColorValidation(imageAnalysis);
        if (colorResult) {
            enhanced.push(colorResult);
        }

        return enhanced;
    }

    /**
     * Enhance logo validation with vision detection
     */
    private enhanceLogoValidation(imageAnalysis: any, canvasJSON: any): ValidationResult | null {
        if (!imageAnalysis.logos || imageAnalysis.logos.length === 0) {
            return {
                ruleId: 'vision-logo-detection',
                ruleName: 'Logo Detection (Vision)',
                passed: false,
                severity: 'warning',
                category: 'logo',
                message: 'No logo detected in the image',
                suggestion: 'Ensure logo is clearly visible and recognizable',
            };
        }

        const logo = imageAnalysis.logos[0];
        const logoSizePx = logo.size.width;

        // Estimate size in mm (assuming standard print dimensions)
        const canvasWidth = canvasJSON.width || 1080;
        const logoSizeMM = (logoSizePx / canvasWidth) * 210; // Assuming A4 width

        const passed = logoSizeMM >= 15; // Tesco requirement

        return {
            ruleId: 'vision-logo-size',
            ruleName: 'Logo Size (Vision-Detected)',
            passed,
            severity: passed ? 'info' : 'error',
            category: 'logo',
            message: passed
                ? `Logo detected and meets size requirement (${logoSizeMM.toFixed(1)}mm)`
                : `Logo too small (${logoSizeMM.toFixed(1)}mm). Minimum: 15mm`,
            suggestion: passed ? undefined : 'Increase logo size to at least 15mm',
            details: {
                detectedLogo: logo.description,
                confidence: logo.confidence,
                sizeMM: logoSizeMM,
            },
        };
    }

    /**
     * Enhance text validation with OCR
     */
    private enhanceTextValidation(imageAnalysis: any, canvasJSON: any): ValidationResult | null {
        if (!imageAnalysis.text || !imageAnalysis.text.fullText) {
            return null;
        }

        const textBlocks = imageAnalysis.text.blocks || [];
        const hasDisclaimer = imageAnalysis.text.fullText.toLowerCase().includes('terms') ||
            imageAnalysis.text.fullText.toLowerCase().includes('conditions') ||
            imageAnalysis.text.fullText.toLowerCase().includes('*');

        // Check for minimum text sizes
        const smallText = textBlocks.filter(block => block.boundingBox.height < 20); // Rough threshold

        return {
            ruleId: 'vision-text-analysis',
            ruleName: 'Text Analysis (OCR)',
            passed: textBlocks.length > 0 && imageAnalysis.text.confidence > 0.8,
            severity: 'info',
            category: 'text',
            message: `Detected ${textBlocks.length} text blocks with ${(imageAnalysis.text.confidence * 100).toFixed(0)}% confidence`,
            details: {
                totalBlocks: textBlocks.length,
                hasDisclaimer,
                smallTextCount: smallText.length,
                extractedText: imageAnalysis.text.fullText.substring(0, 200), // First 200 chars
            },
        };
    }

    /**
     * Enhance color validation with vision analysis
     */
    private enhanceColorValidation(imageAnalysis: any): ValidationResult | null {
        if (!imageAnalysis.colors || imageAnalysis.colors.length === 0) {
            return null;
        }

        const dominantColors = imageAnalysis.colors.slice(0, 5);
        const colorCount = imageAnalysis.colors.length;

        // Tesco brand colors
        const brandColors = ['#00539F', '#EE1C2E', '#FFFFFF', '#000000'];

        const passed = colorCount <= 6; // Reasonable color limit

        return {
            ruleId: 'vision-color-analysis',
            ruleName: 'Color Analysis (Vision)',
            passed,
            severity: passed ? 'info' : 'warning',
            category: 'color',
            message: passed
                ? `Using ${colorCount} colors (within recommended range)`
                : `Using ${colorCount} colors. Consider simplifying palette`,
            details: {
                dominantColors: dominantColors.map(c => c.color),
                totalColors: colorCount,
            },
        };
    }

    /**
     * Generate enhanced report
     */
    private generateReport(results: ValidationResult[], creativeId?: string): ComplianceReport {
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
}

/**
 * Create validator instance with vision support
 */
export function createVisionValidator(rules: ComplianceRule[]): VisionEnhancedValidator {
    return new VisionEnhancedValidator(rules);
}
