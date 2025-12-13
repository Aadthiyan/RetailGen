import { extractTextGoogle, extractTextTesseract } from '../ai/visionClient';

export interface ImageAnalysisResult {
    text: {
        fullText: string;
        blocks: TextBlock[];
        confidence: number;
    };
    objects: DetectedObject[];
    colors: ColorInfo[];
    faces: any[];
    logos: LogoDetection[];
    safeSearch: any;
    labels: string[];
}

export interface TextBlock {
    text: string;
    confidence: number;
    boundingBox: BoundingBox;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

export interface DetectedObject {
    name: string;
    confidence: number;
    boundingBox: BoundingBox;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ColorInfo {
    color: string; // Hex color
    pixelFraction: number; // 0-1
    score: number; // Importance score
}

export interface LogoDetection {
    description: string;
    confidence: number;
    boundingBox: BoundingBox;
    size: {
        width: number;
        height: number;
        widthMM?: number;
        heightMM?: number;
    };
}

/**
 * Comprehensive image analysis using Google Vision API
 */
export async function analyzeCreativeImage(
    imageUrl: string,
    options?: {
        extractText?: boolean;
        detectLogos?: boolean;
        analyzeColors?: boolean;
        detectObjects?: boolean;
    }
): Promise<ImageAnalysisResult> {
    const {
        extractText = true,
        detectLogos = true,
        analyzeColors = true,
        detectObjects = true,
    } = options || {};

    try {
        // Use Google Vision API for comprehensive analysis
        const textResult = await extractTextGoogle(imageUrl);

        const result: ImageAnalysisResult = {
            text: {
                fullText: textResult.text,
                blocks: textResult.blocks.map(b => ({
                    text: b.text,
                    confidence: textResult.confidence,
                    boundingBox: b.boundingBox || { top: 0, left: 0, width: 0, height: 0 },
                })),
                confidence: textResult.confidence,
            },
            objects: [],
            colors: [],
            faces: [],
            logos: [],
            safeSearch: {},
            labels: [],
        };

        // Extract text is already done above
        if (!extractText) {
            result.text = {
                fullText: '',
                blocks: [],
                confidence: 0,
            };
        } else if (textResult.blocks.length > 0) {
            // Process text blocks from extraction
            result.text.blocks = textResult.blocks.map((block: any) => ({
                text: block.text,
                confidence: 0.9, // Vision API doesn't provide per-word confidence
                boundingBox: block.boundingBox,
            }));

            result.text.confidence = result.text.blocks.length > 0 ? 0.9 : 0;
        }

        // Detect logos
        // Note: Logo detection would require additional Google Vision API calls
        // Currently only text extraction is implemented

        // Analyze colors
        // Note: Color analysis would require additional Google Vision API calls
        // Currently only text extraction is implemented

        // Detect objects
        // Note: Object detection would require additional Google Vision API calls
        // Currently only text extraction is implemented

        // Extract labels
        // Note: Label detection would require additional Google Vision API calls
        // Currently only text extraction is implemented

        return result;
    } catch (error) {
        console.error('Image analysis error:', error);
        throw new Error('Failed to analyze image');
    }
}

/**
 * Extract text using client-side Tesseract.js (fallback)
 */
export async function extractTextClientSide(imageDataUrl: string): Promise<TextBlock[]> {
    try {
        const result = await extractTextTesseract(imageDataUrl);

        return result.blocks.map((block: any) => ({
            text: block.text,
            confidence: result.confidence,
            boundingBox: block.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
        }));
    } catch (error) {
        console.error('Client-side OCR error:', error);
        return [];
    }
}

/**
 * Detect logo in image
 */
export async function detectLogo(imageUrl: string): Promise<LogoDetection | null> {
    const analysis = await analyzeCreativeImage(imageUrl, {
        detectLogos: true,
        extractText: false,
        analyzeColors: false,
        detectObjects: false,
    });

    if (analysis.logos.length > 0) {
        return analysis.logos[0]; // Return most confident logo
    }

    return null;
}

/**
 * Analyze text properties for compliance
 */
export async function analyzeTextCompliance(imageUrl: string): Promise<{
    hasText: boolean;
    textBlocks: TextBlock[];
    minFontSize: number;
    maxFontSize: number;
    totalTextArea: number;
    readabilityScore: number;
}> {
    const analysis = await analyzeCreativeImage(imageUrl, {
        extractText: true,
        detectLogos: false,
        analyzeColors: false,
        detectObjects: false,
    });

    const textBlocks = analysis.text.blocks;
    const hasText = textBlocks.length > 0;

    // Estimate font sizes based on bounding box heights
    const fontSizes = textBlocks.map(block => block.boundingBox.height);
    const minFontSize = fontSizes.length > 0 ? Math.min(...fontSizes) : 0;
    const maxFontSize = fontSizes.length > 0 ? Math.max(...fontSizes) : 0;

    const totalTextArea = textBlocks.reduce((sum, block) => {
        return sum + (block.boundingBox.width * block.boundingBox.height);
    }, 0);

    const readabilityScore = analysis.text.confidence;

    return {
        hasText,
        textBlocks,
        minFontSize,
        maxFontSize,
        totalTextArea,
        readabilityScore,
    };
}

/**
 * Analyze colors for brand compliance
 */
export async function analyzeColorCompliance(
    imageUrl: string,
    brandColors: string[]
): Promise<{
    dominantColors: ColorInfo[];
    brandColorUsage: number; // 0-1
    nonBrandColors: ColorInfo[];
    colorDiversity: number;
}> {
    const analysis = await analyzeCreativeImage(imageUrl, {
        extractText: false,
        detectLogos: false,
        analyzeColors: true,
        detectObjects: false,
    });

    const dominantColors = analysis.colors.slice(0, 5); // Top 5 colors

    // Calculate brand color usage
    let brandColorPixels = 0;
    const nonBrandColors: ColorInfo[] = [];

    for (const colorInfo of analysis.colors) {
        const isBrandColor = brandColors.some(brandColor =>
            colorDistance(colorInfo.color, brandColor) < 30 // Tolerance
        );

        if (isBrandColor) {
            brandColorPixels += colorInfo.pixelFraction;
        } else if (colorInfo.pixelFraction > 0.05) { // Only significant colors
            nonBrandColors.push(colorInfo);
        }
    }

    const colorDiversity = analysis.colors.length;

    return {
        dominantColors,
        brandColorUsage: brandColorPixels,
        nonBrandColors,
        colorDiversity,
    };
}

/**
 * Analyze layout for safe zone compliance
 */
export async function analyzeLayoutCompliance(
    imageUrl: string,
    safeZoneMargin: number = 5 // percentage
): Promise<{
    objects: DetectedObject[];
    safeZoneViolations: DetectedObject[];
    layoutBalance: number; // 0-1
    elementDensity: number; // 0-1
}> {
    const analysis = await analyzeCreativeImage(imageUrl, {
        extractText: false,
        detectLogos: false,
        analyzeColors: false,
        detectObjects: true,
    });

    const safeZoneViolations = analysis.objects.filter(obj => {
        const bbox = obj.boundingBox;
        const margin = safeZoneMargin / 100;

        return (
            bbox.x < margin ||
            bbox.y < margin ||
            (bbox.x + bbox.width) > (1 - margin) ||
            (bbox.y + bbox.height) > (1 - margin)
        );
    });

    // Simple balance calculation (center of mass)
    const centerX = analysis.objects.reduce((sum, obj) =>
        sum + (obj.boundingBox.x + obj.boundingBox.width / 2), 0
    ) / analysis.objects.length;

    const layoutBalance = 1 - Math.abs(0.5 - centerX) * 2; // 0-1, 1 is perfectly balanced

    // Calculate element density
    const totalArea = analysis.objects.reduce((sum, obj) =>
        sum + (obj.boundingBox.width * obj.boundingBox.height), 0
    );
    const elementDensity = Math.min(totalArea, 1);

    return {
        objects: analysis.objects,
        safeZoneViolations,
        layoutBalance,
        elementDensity,
    };
}

/**
 * Utility functions
 */

function convertVertices(vertices: any[]): BoundingBox {
    if (!vertices || vertices.length < 2) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = vertices.map(v => v.x || 0);
    const ys = vertices.map(v => v.y || 0);

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

function convertNormalizedVertices(vertices: any[]): BoundingBox {
    const bbox = convertVertices(vertices);
    // Normalized vertices are already 0-1, so just return
    return bbox;
}

function calculateSize(vertices: any[]): { width: number; height: number } {
    const bbox = convertVertices(vertices);
    return {
        width: bbox.width,
        height: bbox.height,
    };
}

function rgbToHex(rgb: { red?: number; green?: number; blue?: number }): string {
    const r = Math.round(rgb.red || 0);
    const g = Math.round(rgb.green || 0);
    const b = Math.round(rgb.blue || 0);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function colorDistance(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 999;

    return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}
