/**
 * Smart Suggestions
 * AI-powered suggestions for improving creatives
 */

export interface Suggestion {
    id: string;
    type: 'improvement' | 'warning' | 'tip' | 'best-practice';
    category: 'layout' | 'typography' | 'color' | 'content' | 'compliance' | 'performance';
    title: string;
    description: string;
    action?: {
        label: string;
        apply: (canvas: any) => void;
    };
    priority: 'low' | 'medium' | 'high';
}

/**
 * Generate smart suggestions for a creative
 */
export function generateSmartSuggestions(canvas: any, metadata?: any): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Layout suggestions
    suggestions.push(...analyzeLayout(canvas));

    // Typography suggestions
    suggestions.push(...analyzeTypography(canvas));

    // Color suggestions
    suggestions.push(...analyzeColors(canvas));

    // Content suggestions
    suggestions.push(...analyzeContent(canvas));

    // Performance suggestions
    suggestions.push(...analyzePerformance(canvas, metadata));

    // Sort by priority
    return suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Analyze layout
 */
function analyzeLayout(canvas: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const objects = canvas.getObjects();

    // Check for cluttered layout
    if (objects.length > 10) {
        suggestions.push({
            id: 'layout_cluttered',
            type: 'warning',
            category: 'layout',
            title: 'Layout may be too cluttered',
            description: `You have ${objects.length} elements. Consider simplifying to improve readability.`,
            priority: 'medium',
        });
    }

    // Check for centered elements
    const centerX = canvas.width / 2;
    const centeredElements = objects.filter((obj: any) =>
        Math.abs(obj.left - centerX) < 50
    );

    if (centeredElements.length === 0 && objects.length > 0) {
        suggestions.push({
            id: 'layout_no_center',
            type: 'tip',
            category: 'layout',
            title: 'Consider centering key elements',
            description: 'Centered elements often draw more attention and create visual balance.',
            action: {
                label: 'Center main text',
                apply: (canvas: any) => {
                    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));
                    if (textObjects.length > 0) {
                        const mainText = textObjects[0];
                        mainText.set({ left: canvas.width / 2, originX: 'center' });
                        canvas.renderAll();
                    }
                },
            },
            priority: 'low',
        });
    }

    // Check for whitespace
    const totalArea = canvas.width * canvas.height;
    const usedArea = objects.reduce((sum: number, obj: any) => {
        const width = (obj.width || 0) * (obj.scaleX || 1);
        const height = (obj.height || 0) * (obj.scaleY || 1);
        return sum + (width * height);
    }, 0);

    const whitespaceRatio = (totalArea - usedArea) / totalArea;

    if (whitespaceRatio < 0.3) {
        suggestions.push({
            id: 'layout_whitespace',
            type: 'improvement',
            category: 'layout',
            title: 'Add more whitespace',
            description: 'Your design could benefit from more breathing room. Aim for 30-40% whitespace.',
            priority: 'medium',
        });
    }

    return suggestions;
}

/**
 * Analyze typography
 */
function analyzeTypography(canvas: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));

    if (textObjects.length === 0) {
        suggestions.push({
            id: 'typography_no_text',
            type: 'warning',
            category: 'typography',
            title: 'No text found',
            description: 'Consider adding a headline or call-to-action to communicate your message.',
            priority: 'high',
        });
        return suggestions;
    }

    // Check font sizes
    const fontSizes = textObjects.map((obj: any) => obj.fontSize || 16);
    const minSize = Math.min(...fontSizes);
    const maxSize = Math.max(...fontSizes);

    if (minSize < 12) {
        suggestions.push({
            id: 'typography_too_small',
            type: 'warning',
            category: 'typography',
            title: 'Text may be too small',
            description: `Smallest text is ${minSize}px. Minimum recommended is 12px for readability.`,
            action: {
                label: 'Increase small text',
                apply: (canvas: any) => {
                    canvas.getObjects('text').concat(canvas.getObjects('i-text')).forEach((obj: any) => {
                        if (obj.fontSize < 12) {
                            obj.set('fontSize', 12);
                        }
                    });
                    canvas.renderAll();
                },
            },
            priority: 'high',
        });
    }

    // Check font variety
    const fontFamilies = new Set(textObjects.map((obj: any) => obj.fontFamily));

    if (fontFamilies.size > 3) {
        suggestions.push({
            id: 'typography_too_many_fonts',
            type: 'warning',
            category: 'typography',
            title: 'Too many fonts',
            description: `You're using ${fontFamilies.size} different fonts. Stick to 2-3 for consistency.`,
            priority: 'medium',
        });
    }

    // Check hierarchy
    if (maxSize - minSize < 8 && textObjects.length > 1) {
        suggestions.push({
            id: 'typography_no_hierarchy',
            type: 'improvement',
            category: 'typography',
            title: 'Create visual hierarchy',
            description: 'Increase size difference between headline and body text for better hierarchy.',
            action: {
                label: 'Increase headline size',
                apply: (canvas: any) => {
                    const texts = canvas.getObjects('text').concat(canvas.getObjects('i-text'));
                    if (texts.length > 0) {
                        const largest = texts.reduce((max: any, obj: any) =>
                            (obj.fontSize || 0) > (max.fontSize || 0) ? obj : max
                        );
                        largest.set('fontSize', (largest.fontSize || 16) * 1.5);
                        canvas.renderAll();
                    }
                },
            },
            priority: 'medium',
        });
    }

    return suggestions;
}

/**
 * Analyze colors
 */
function analyzeColors(canvas: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const objects = canvas.getObjects();

    // Extract colors
    const colors = new Set<string>();
    objects.forEach((obj: any) => {
        if (obj.fill && typeof obj.fill === 'string') {
            colors.add(obj.fill.toLowerCase());
        }
    });

    // Check color variety
    if (colors.size > 5) {
        suggestions.push({
            id: 'color_too_many',
            type: 'warning',
            category: 'color',
            title: 'Too many colors',
            description: `You're using ${colors.size} colors. Limit to 3-5 for a cohesive look.`,
            priority: 'medium',
        });
    }

    // Check for contrast
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));
    textObjects.forEach((text: any, index: number) => {
        const textColor = text.fill;
        const background = canvas.backgroundColor || '#FFFFFF';

        const contrast = calculateContrast(textColor, background);

        if (contrast < 4.5) {
            suggestions.push({
                id: `color_contrast_${index}`,
                type: 'warning',
                category: 'color',
                title: 'Low contrast detected',
                description: `Text contrast ratio is ${contrast.toFixed(1)}. Minimum is 4.5 for accessibility.`,
                action: {
                    label: 'Fix contrast',
                    apply: (canvas: any) => {
                        text.set('fill', contrast < 2 ? '#000000' : '#FFFFFF');
                        canvas.renderAll();
                    },
                },
                priority: 'high',
            });
        }
    });

    return suggestions;
}

/**
 * Analyze content
 */
function analyzeContent(canvas: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));

    // Check for CTA
    const ctaKeywords = ['shop', 'buy', 'get', 'learn', 'discover', 'try', 'start', 'click'];
    const hasCTA = textObjects.some((obj: any) =>
        ctaKeywords.some(keyword => obj.text?.toLowerCase().includes(keyword))
    );

    if (!hasCTA) {
        suggestions.push({
            id: 'content_no_cta',
            type: 'improvement',
            category: 'content',
            title: 'Add a call-to-action',
            description: 'Include a clear CTA like "Shop Now" or "Learn More" to drive engagement.',
            priority: 'high',
        });
    }

    // Check text length
    textObjects.forEach((obj: any, index: number) => {
        const text = obj.text || '';

        if (text.length > 100) {
            suggestions.push({
                id: `content_too_long_${index}`,
                type: 'tip',
                category: 'content',
                title: 'Text may be too long',
                description: `Text has ${text.length} characters. Keep it concise for better impact.`,
                priority: 'low',
            });
        }

        // Check for all caps
        if (text.length > 10 && text === text.toUpperCase()) {
            suggestions.push({
                id: `content_all_caps_${index}`,
                type: 'tip',
                category: 'content',
                title: 'Avoid all caps',
                description: 'All caps can be hard to read. Use sentence case or title case instead.',
                priority: 'low',
            });
        }
    });

    return suggestions;
}

/**
 * Analyze performance
 */
function analyzePerformance(canvas: any, metadata?: any): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Check image count
    const images = canvas.getObjects('image');

    if (images.length > 3) {
        suggestions.push({
            id: 'performance_too_many_images',
            type: 'warning',
            category: 'performance',
            title: 'Too many images',
            description: `You have ${images.length} images. This may slow down loading. Consider reducing to 1-3.`,
            priority: 'medium',
        });
    }

    // Check canvas size
    const totalPixels = canvas.width * canvas.height;

    if (totalPixels > 2000000) { // > 2 megapixels
        suggestions.push({
            id: 'performance_large_canvas',
            type: 'tip',
            category: 'performance',
            title: 'Large canvas size',
            description: 'Your canvas is quite large. Consider optimizing for faster loading.',
            priority: 'low',
        });
    }

    // Platform-specific suggestions
    if (metadata?.platform === 'facebook') {
        suggestions.push({
            id: 'performance_facebook_text',
            type: 'best-practice',
            category: 'performance',
            title: 'Facebook 20% text rule',
            description: 'Keep text under 20% of image area for better Facebook ad performance.',
            priority: 'medium',
        });
    }

    return suggestions;
}

/**
 * Calculate contrast ratio
 */
function calculateContrast(color1: string, color2: string): number {
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
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
 * Apply suggestion
 */
export function applySuggestion(canvas: any, suggestion: Suggestion): void {
    if (suggestion.action) {
        suggestion.action.apply(canvas);
    }
}

/**
 * Get suggestion summary
 */
export function getSuggestionSummary(suggestions: Suggestion[]): {
    total: number;
    byType: Record<Suggestion['type'], number>;
    byPriority: Record<Suggestion['priority'], number>;
} {
    return {
        total: suggestions.length,
        byType: {
            improvement: suggestions.filter(s => s.type === 'improvement').length,
            warning: suggestions.filter(s => s.type === 'warning').length,
            tip: suggestions.filter(s => s.type === 'tip').length,
            'best-practice': suggestions.filter(s => s.type === 'best-practice').length,
        },
        byPriority: {
            high: suggestions.filter(s => s.priority === 'high').length,
            medium: suggestions.filter(s => s.priority === 'medium').length,
            low: suggestions.filter(s => s.priority === 'low').length,
        },
    };
}
