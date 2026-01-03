/**
 * Brand Kit
 * Store and manage brand assets (colors, fonts, logos, guidelines)
 */

export interface BrandKit {
    id: string;
    name: string;
    description?: string;
    colors: BrandColor[];
    fonts: BrandFont[];
    logos: BrandLogo[];
    guidelines: BrandGuidelines;
    createdAt: number;
    updatedAt: number;
}

export interface BrandColor {
    id: string;
    name: string;
    hex: string;
    usage: 'primary' | 'secondary' | 'accent' | 'background' | 'text';
    description?: string;
}

export interface BrandFont {
    id: string;
    name: string;
    family: string;
    weights: number[];
    usage: 'heading' | 'body' | 'accent';
    fallback?: string;
}

export interface BrandLogo {
    id: string;
    name: string;
    url: string;
    type: 'primary' | 'secondary' | 'icon' | 'wordmark';
    format: 'png' | 'svg' | 'jpg';
    minWidth?: number;
    minHeight?: number;
}

export interface BrandGuidelines {
    logoUsage: {
        minSize: number;
        clearSpace: number;
        backgrounds: string[];
        doNots: string[];
    };
    typography: {
        headingSizes: number[];
        bodySizes: number[];
        lineHeights: Record<string, number>;
    };
    spacing: {
        baseUnit: number;
        scale: number[];
    };
    imagery: {
        style: string;
        filters: string[];
        doNots: string[];
    };
}

/**
 * Create a new brand kit
 */
export function createBrandKit(name: string, description?: string): BrandKit {
    return {
        id: generateBrandKitId(),
        name,
        description,
        colors: [],
        fonts: [],
        logos: [],
        guidelines: getDefaultGuidelines(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

/**
 * Generate brand kit ID
 */
function generateBrandKitId(): string {
    return `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get default guidelines
 */
function getDefaultGuidelines(): BrandGuidelines {
    return {
        logoUsage: {
            minSize: 40,
            clearSpace: 20,
            backgrounds: ['#FFFFFF', '#000000'],
            doNots: [
                'Do not stretch or distort',
                'Do not change colors',
                'Do not add effects',
            ],
        },
        typography: {
            headingSizes: [48, 36, 28, 24, 20],
            bodySizes: [16, 14, 12],
            lineHeights: {
                heading: 1.2,
                body: 1.5,
            },
        },
        spacing: {
            baseUnit: 8,
            scale: [4, 8, 12, 16, 24, 32, 48, 64],
        },
        imagery: {
            style: 'Professional, clean, modern',
            filters: ['None', 'Slight desaturation'],
            doNots: [
                'Avoid overly saturated images',
                'No clip art',
            ],
        },
    };
}

/**
 * Add color to brand kit
 */
export function addBrandColor(
    brandKit: BrandKit,
    name: string,
    hex: string,
    usage: BrandColor['usage'],
    description?: string
): BrandKit {
    const color: BrandColor = {
        id: `color_${Date.now()}`,
        name,
        hex,
        usage,
        description,
    };

    return {
        ...brandKit,
        colors: [...brandKit.colors, color],
        updatedAt: Date.now(),
    };
}

/**
 * Add font to brand kit
 */
export function addBrandFont(
    brandKit: BrandKit,
    name: string,
    family: string,
    weights: number[],
    usage: BrandFont['usage'],
    fallback?: string
): BrandKit {
    const font: BrandFont = {
        id: `font_${Date.now()}`,
        name,
        family,
        weights,
        usage,
        fallback,
    };

    return {
        ...brandKit,
        fonts: [...brandKit.fonts, font],
        updatedAt: Date.now(),
    };
}

/**
 * Add logo to brand kit
 */
export function addBrandLogo(
    brandKit: BrandKit,
    name: string,
    url: string,
    type: BrandLogo['type'],
    format: BrandLogo['format'],
    minWidth?: number,
    minHeight?: number
): BrandKit {
    const logo: BrandLogo = {
        id: `logo_${Date.now()}`,
        name,
        url,
        type,
        format,
        minWidth,
        minHeight,
    };

    return {
        ...brandKit,
        logos: [...brandKit.logos, logo],
        updatedAt: Date.now(),
    };
}

/**
 * Update brand guidelines
 */
export function updateBrandGuidelines(
    brandKit: BrandKit,
    guidelines: Partial<BrandGuidelines>
): BrandKit {
    return {
        ...brandKit,
        guidelines: {
            ...brandKit.guidelines,
            ...guidelines,
        },
        updatedAt: Date.now(),
    };
}

/**
 * Get brand color by usage
 */
export function getBrandColorByUsage(
    brandKit: BrandKit,
    usage: BrandColor['usage']
): BrandColor | undefined {
    return brandKit.colors.find(c => c.usage === usage);
}

/**
 * Get brand font by usage
 */
export function getBrandFontByUsage(
    brandKit: BrandKit,
    usage: BrandFont['usage']
): BrandFont | undefined {
    return brandKit.fonts.find(f => f.usage === usage);
}

/**
 * Get primary logo
 */
export function getPrimaryLogo(brandKit: BrandKit): BrandLogo | undefined {
    return brandKit.logos.find(l => l.type === 'primary');
}

/**
 * Validate creative against brand kit
 */
export function validateAgainstBrandKit(
    canvas: any,
    brandKit: BrandKit
): {
    isValid: boolean;
    violations: string[];
    suggestions: string[];
} {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check colors
    const usedColors = extractColorsFromCanvas(canvas);
    const brandColorHexes = brandKit.colors.map(c => c.hex.toLowerCase());

    usedColors.forEach(color => {
        if (!brandColorHexes.includes(color.toLowerCase())) {
            violations.push(`Color ${color} is not in brand kit`);
            const closest = findClosestBrandColor(color, brandKit.colors);
            if (closest) {
                suggestions.push(`Use ${closest.name} (${closest.hex}) instead of ${color}`);
            }
        }
    });

    // Check fonts
    const usedFonts = extractFontsFromCanvas(canvas);
    const brandFontFamilies = brandKit.fonts.map(f => f.family.toLowerCase());

    usedFonts.forEach(font => {
        if (!brandFontFamilies.includes(font.toLowerCase())) {
            violations.push(`Font ${font} is not in brand kit`);
            const headingFont = getBrandFontByUsage(brandKit, 'heading');
            if (headingFont) {
                suggestions.push(`Use ${headingFont.family} for headings`);
            }
        }
    });

    // Check logo size
    const logos = canvas.getObjects('image');
    logos.forEach((logo: any) => {
        const primaryLogo = getPrimaryLogo(brandKit);
        if (primaryLogo && primaryLogo.minWidth) {
            if (logo.width * logo.scaleX < primaryLogo.minWidth) {
                violations.push(`Logo is too small (min: ${primaryLogo.minWidth}px)`);
                suggestions.push(`Increase logo size to at least ${primaryLogo.minWidth}px`);
            }
        }
    });

    return {
        isValid: violations.length === 0,
        violations,
        suggestions,
    };
}

/**
 * Extract colors from canvas
 */
function extractColorsFromCanvas(canvas: any): string[] {
    const colors = new Set<string>();

    canvas.getObjects().forEach((obj: any) => {
        if (obj.fill && typeof obj.fill === 'string') {
            colors.add(obj.fill);
        }
        if (obj.stroke && typeof obj.stroke === 'string') {
            colors.add(obj.stroke);
        }
    });

    return Array.from(colors);
}

/**
 * Extract fonts from canvas
 */
function extractFontsFromCanvas(canvas: any): string[] {
    const fonts = new Set<string>();

    canvas.getObjects('text').forEach((obj: any) => {
        if (obj.fontFamily) {
            fonts.add(obj.fontFamily);
        }
    });

    canvas.getObjects('i-text').forEach((obj: any) => {
        if (obj.fontFamily) {
            fonts.add(obj.fontFamily);
        }
    });

    return Array.from(fonts);
}

/**
 * Find closest brand color
 */
function findClosestBrandColor(hex: string, brandColors: BrandColor[]): BrandColor | null {
    if (brandColors.length === 0) return null;

    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    let closest = brandColors[0];
    let minDistance = Infinity;

    brandColors.forEach(brandColor => {
        const brandRgb = hexToRgb(brandColor.hex);
        if (!brandRgb) return;

        const distance = Math.sqrt(
            Math.pow(rgb.r - brandRgb.r, 2) +
            Math.pow(rgb.g - brandRgb.g, 2) +
            Math.pow(rgb.b - brandRgb.b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closest = brandColor;
        }
    });

    return closest;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

/**
 * Apply brand kit to canvas
 */
export function applyBrandKitToCanvas(canvas: any, brandKit: BrandKit): void {
    // Apply brand colors to objects
    const primaryColor = getBrandColorByUsage(brandKit, 'primary');
    const textColor = getBrandColorByUsage(brandKit, 'text');

    if (primaryColor) {
        canvas.getObjects('rect').forEach((obj: any) => {
            if (!obj.isBackground) {
                obj.set('fill', primaryColor.hex);
            }
        });
    }

    if (textColor) {
        canvas.getObjects('text').forEach((obj: any) => {
            obj.set('fill', textColor.hex);
        });
        canvas.getObjects('i-text').forEach((obj: any) => {
            obj.set('fill', textColor.hex);
        });
    }

    // Apply brand fonts
    const headingFont = getBrandFontByUsage(brandKit, 'heading');
    if (headingFont) {
        canvas.getObjects('text').forEach((obj: any) => {
            if (obj.fontSize && obj.fontSize > 24) {
                obj.set('fontFamily', headingFont.family);
            }
        });
    }

    canvas.renderAll();
}

/**
 * Export brand kit
 */
export function exportBrandKit(brandKit: BrandKit): string {
    return JSON.stringify(brandKit, null, 2);
}

/**
 * Import brand kit
 */
export function importBrandKit(json: string): BrandKit {
    return JSON.parse(json);
}

/**
 * Get sample brand kit
 */
export function getSampleBrandKit(): BrandKit {
    let brandKit = createBrandKit('Sample Brand', 'A sample brand kit for demonstration');

    // Add colors
    brandKit = addBrandColor(brandKit, 'Primary Blue', '#3B82F6', 'primary', 'Main brand color');
    brandKit = addBrandColor(brandKit, 'Secondary Purple', '#8B5CF6', 'secondary', 'Accent color');
    brandKit = addBrandColor(brandKit, 'Text Dark', '#1F2937', 'text', 'Primary text color');
    brandKit = addBrandColor(brandKit, 'Background', '#FFFFFF', 'background', 'Main background');

    // Add fonts
    brandKit = addBrandFont(brandKit, 'Heading Font', 'Inter', [700, 800], 'heading', 'Arial');
    brandKit = addBrandFont(brandKit, 'Body Font', 'Inter', [400, 500], 'body', 'Arial');

    return brandKit;
}
