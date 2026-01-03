/**
 * Color Palette Generator
 * Generate harmonious color palettes from images or base colors
 */

export interface ColorPalette {
    id: string;
    name: string;
    colors: string[];
    type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'custom';
    createdAt: number;
}

/**
 * Extract dominant colors from image
 */
export async function extractColorsFromImage(imageUrl: string, count: number = 5): Promise<string[]> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            // Resize for performance
            const maxSize = 100;
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const colors = extractDominantColors(imageData, count);
            resolve(colors);
        };

        img.onerror = () => {
            // Fallback colors
            resolve(['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']);
        };

        img.src = imageUrl;
    });
}

/**
 * Extract dominant colors from image data
 */
function extractDominantColors(imageData: ImageData, count: number): string[] {
    const pixels = imageData.data;
    const colorMap = new Map<string, number>();

    // Sample every 10th pixel for performance
    for (let i = 0; i < pixels.length; i += 40) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Quantize colors (reduce precision)
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;

        const color = rgbToHex(qr, qg, qb);
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }

    // Sort by frequency and return top N
    const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([color]) => color);

    return sorted;
}

/**
 * Generate monochromatic palette
 */
export function generateMonochromaticPalette(baseColor: string, count: number = 5): ColorPalette {
    const hsl = hexToHSL(baseColor);
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
        const lightness = 20 + (i * (60 / (count - 1)));
        colors.push(hslToHex(hsl.h, hsl.s, lightness));
    }

    return {
        id: `mono-${Date.now()}`,
        name: 'Monochromatic',
        colors,
        type: 'monochromatic',
        createdAt: Date.now(),
    };
}

/**
 * Generate analogous palette
 */
export function generateAnalogousPalette(baseColor: string, count: number = 5): ColorPalette {
    const hsl = hexToHSL(baseColor);
    const colors: string[] = [];
    const step = 30; // 30 degrees on color wheel

    for (let i = 0; i < count; i++) {
        const hue = (hsl.h + (i - Math.floor(count / 2)) * step + 360) % 360;
        colors.push(hslToHex(hue, hsl.s, hsl.l));
    }

    return {
        id: `analogous-${Date.now()}`,
        name: 'Analogous',
        colors,
        type: 'analogous',
        createdAt: Date.now(),
    };
}

/**
 * Generate complementary palette
 */
export function generateComplementaryPalette(baseColor: string): ColorPalette {
    const hsl = hexToHSL(baseColor);
    const complementHue = (hsl.h + 180) % 360;

    const colors = [
        baseColor,
        hslToHex(complementHue, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 10)),
        hslToHex(complementHue, hsl.s, Math.max(hsl.l - 20, 10)),
        hslToHex(hsl.h, Math.max(hsl.s - 20, 10), hsl.l),
    ];

    return {
        id: `complementary-${Date.now()}`,
        name: 'Complementary',
        colors,
        type: 'complementary',
        createdAt: Date.now(),
    };
}

/**
 * Generate triadic palette
 */
export function generateTriadicPalette(baseColor: string): ColorPalette {
    const hsl = hexToHSL(baseColor);

    const colors = [
        baseColor,
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 10)),
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90)),
    ];

    return {
        id: `triadic-${Date.now()}`,
        name: 'Triadic',
        colors,
        type: 'triadic',
        createdAt: Date.now(),
    };
}

/**
 * Get popular color palettes
 */
export function getPopularPalettes(): ColorPalette[] {
    return [
        {
            id: 'sunset',
            name: 'Sunset',
            colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCF7F', '#4ECDC4'],
            type: 'custom',
            createdAt: Date.now(),
        },
        {
            id: 'ocean',
            name: 'Ocean',
            colors: ['#0077BE', '#00A8E8', '#00C9FF', '#84FAB0', '#8FD3F4'],
            type: 'custom',
            createdAt: Date.now(),
        },
        {
            id: 'forest',
            name: 'Forest',
            colors: ['#2D4A2B', '#3E885B', '#6BBF59', '#A8D5BA', '#E8F5E9'],
            type: 'custom',
            createdAt: Date.now(),
        },
        {
            id: 'berry',
            name: 'Berry',
            colors: ['#8B1E3F', '#C73E1D', '#E63946', '#F18F01', '#FFBA08'],
            type: 'custom',
            createdAt: Date.now(),
        },
        {
            id: 'pastel',
            name: 'Pastel',
            colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
            type: 'custom',
            createdAt: Date.now(),
        },
        {
            id: 'corporate',
            name: 'Corporate',
            colors: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
            type: 'custom',
            createdAt: Date.now(),
        },
    ];
}

/**
 * Convert hex to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    return rgbToHex(
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    );
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Check color contrast (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get relative luminance
 */
function getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Suggest text color based on background
 */
export function suggestTextColor(backgroundColor: string): string {
    const contrast = getContrastRatio(backgroundColor, '#FFFFFF');
    return contrast >= 4.5 ? '#FFFFFF' : '#000000';
}
