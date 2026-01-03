/**
 * A/B Test Generator
 * Generate variations of creatives for A/B testing
 */

export interface ABTestVariation {
    id: string;
    name: string;
    description: string;
    canvasData: any;
    thumbnail?: string;
    changes: string[];
}

export interface ABTest {
    id: string;
    name: string;
    originalId: string;
    variations: ABTestVariation[];
    variationType: 'headline' | 'color' | 'layout' | 'image' | 'cta' | 'comprehensive';
    createdAt: number;
}

/**
 * Generate A/B test variations
 */
export function generateABTestVariations(
    canvas: any,
    variationType: ABTest['variationType'],
    count: number = 3
): ABTestVariation[] {
    const variations: ABTestVariation[] = [];

    switch (variationType) {
        case 'headline':
            return generateHeadlineVariations(canvas, count);
        case 'color':
            return generateColorVariations(canvas, count);
        case 'layout':
            return generateLayoutVariations(canvas, count);
        case 'image':
            return generateImageVariations(canvas, count);
        case 'cta':
            return generateCTAVariations(canvas, count);
        case 'comprehensive':
            return generateComprehensiveVariations(canvas, count);
        default:
            return variations;
    }
}

/**
 * Generate headline variations
 */
function generateHeadlineVariations(canvas: any, count: number): ABTestVariation[] {
    const variations: ABTestVariation[] = [];
    const originalData = canvas.toJSON(['name', 'selectable', 'evented']);

    // Find headline text objects (largest text)
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));
    if (textObjects.length === 0) return variations;

    const headline = textObjects.reduce((largest: any, current: any) =>
        (current.fontSize || 0) > (largest.fontSize || 0) ? current : largest
    );

    const headlineVariations = [
        { text: headline.text?.toUpperCase(), name: 'All Caps', change: 'Headline in uppercase' },
        { text: headline.text?.toLowerCase(), name: 'Lowercase', change: 'Headline in lowercase' },
        { text: `${headline.text} →`, name: 'With Arrow', change: 'Added arrow to headline' },
        { text: `✓ ${headline.text}`, name: 'With Checkmark', change: 'Added checkmark to headline' },
    ];

    for (let i = 0; i < Math.min(count, headlineVariations.length); i++) {
        const variation = headlineVariations[i];
        const newData = JSON.parse(JSON.stringify(originalData));

        // Update headline in variation
        const headlineObj = newData.objects.find((obj: any) =>
            obj.text === headline.text
        );

        if (headlineObj) {
            headlineObj.text = variation.text;
        }

        variations.push({
            id: `variation_${Date.now()}_${i}`,
            name: variation.name,
            description: `Variation with ${variation.change}`,
            canvasData: newData,
            changes: [variation.change],
        });
    }

    return variations;
}

/**
 * Generate color variations
 */
function generateColorVariations(canvas: any, count: number): ABTestVariation[] {
    const variations: ABTestVariation[] = [];
    const originalData = canvas.toJSON(['name', 'selectable', 'evented']);

    const colorSchemes = [
        { name: 'Blue Theme', primary: '#3B82F6', secondary: '#1E40AF', change: 'Blue color scheme' },
        { name: 'Green Theme', primary: '#10B981', secondary: '#047857', change: 'Green color scheme' },
        { name: 'Purple Theme', primary: '#8B5CF6', secondary: '#6D28D9', change: 'Purple color scheme' },
        { name: 'Red Theme', primary: '#EF4444', secondary: '#B91C1C', change: 'Red color scheme' },
        { name: 'Orange Theme', primary: '#F59E0B', secondary: '#D97706', change: 'Orange color scheme' },
    ];

    for (let i = 0; i < Math.min(count, colorSchemes.length); i++) {
        const scheme = colorSchemes[i];
        const newData = JSON.parse(JSON.stringify(originalData));

        // Apply color scheme
        newData.objects.forEach((obj: any) => {
            if (obj.type === 'rect' && obj.fill && obj.fill !== '#FFFFFF') {
                obj.fill = scheme.primary;
            }
            if (obj.stroke) {
                obj.stroke = scheme.secondary;
            }
        });

        variations.push({
            id: `variation_${Date.now()}_${i}`,
            name: scheme.name,
            description: `Variation with ${scheme.change}`,
            canvasData: newData,
            changes: [scheme.change],
        });
    }

    return variations;
}

/**
 * Generate layout variations
 */
function generateLayoutVariations(canvas: any, count: number): ABTestVariation[] {
    const variations: ABTestVariation[] = [];
    const originalData = canvas.toJSON(['name', 'selectable', 'evented']);

    const layouts = [
        {
            name: 'Left Aligned',
            change: 'Left-aligned layout',
            transform: (obj: any) => {
                if (obj.type === 'text' || obj.type === 'i-text') {
                    obj.left = 100;
                    obj.textAlign = 'left';
                }
            },
        },
        {
            name: 'Right Aligned',
            change: 'Right-aligned layout',
            transform: (obj: any) => {
                if (obj.type === 'text' || obj.type === 'i-text') {
                    obj.left = canvas.width - 100;
                    obj.textAlign = 'right';
                }
            },
        },
        {
            name: 'Centered',
            change: 'Centered layout',
            transform: (obj: any) => {
                if (obj.type === 'text' || obj.type === 'i-text') {
                    obj.left = canvas.width / 2;
                    obj.textAlign = 'center';
                }
            },
        },
    ];

    for (let i = 0; i < Math.min(count, layouts.length); i++) {
        const layout = layouts[i];
        const newData = JSON.parse(JSON.stringify(originalData));

        newData.objects.forEach((obj: any) => layout.transform(obj));

        variations.push({
            id: `variation_${Date.now()}_${i}`,
            name: layout.name,
            description: `Variation with ${layout.change}`,
            canvasData: newData,
            changes: [layout.change],
        });
    }

    return variations;
}

/**
 * Generate image variations
 */
function generateImageVariations(canvas: any, count: number): ABTestVariation[] {
    const variations: ABTestVariation[] = [];
    const originalData = canvas.toJSON(['name', 'selectable', 'evented']);

    const imageTransforms = [
        { name: 'Larger Image', scale: 1.2, change: 'Increased image size by 20%' },
        { name: 'Smaller Image', scale: 0.8, change: 'Decreased image size by 20%' },
        { name: 'No Image', scale: 0, change: 'Removed image' },
    ];

    for (let i = 0; i < Math.min(count, imageTransforms.length); i++) {
        const transform = imageTransforms[i];
        const newData = JSON.parse(JSON.stringify(originalData));

        newData.objects.forEach((obj: any) => {
            if (obj.type === 'image') {
                if (transform.scale === 0) {
                    obj.visible = false;
                } else {
                    obj.scaleX = (obj.scaleX || 1) * transform.scale;
                    obj.scaleY = (obj.scaleY || 1) * transform.scale;
                }
            }
        });

        variations.push({
            id: `variation_${Date.now()}_${i}`,
            name: transform.name,
            description: `Variation with ${transform.change}`,
            canvasData: newData,
            changes: [transform.change],
        });
    }

    return variations;
}

/**
 * Generate CTA variations
 */
function generateCTAVariations(canvas: any, count: number): ABTestVariation[] {
    const variations: ABTestVariation[] = [];
    const originalData = canvas.toJSON(['name', 'selectable', 'evented']);

    // Find CTA text (usually contains action words)
    const ctaKeywords = ['shop', 'buy', 'get', 'learn', 'discover', 'try', 'start'];
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));

    const ctaObject = textObjects.find((obj: any) =>
        ctaKeywords.some(keyword =>
            obj.text?.toLowerCase().includes(keyword)
        )
    );

    if (!ctaObject) return variations;

    const ctaVariations = [
        { text: 'Shop Now →', name: 'Shop Now', change: 'CTA: Shop Now' },
        { text: 'Learn More', name: 'Learn More', change: 'CTA: Learn More' },
        { text: 'Get Started', name: 'Get Started', change: 'CTA: Get Started' },
        { text: 'Try Free', name: 'Try Free', change: 'CTA: Try Free' },
    ];

    for (let i = 0; i < Math.min(count, ctaVariations.length); i++) {
        const variation = ctaVariations[i];
        const newData = JSON.parse(JSON.stringify(originalData));

        const ctaObj = newData.objects.find((obj: any) =>
            obj.text === ctaObject.text
        );

        if (ctaObj) {
            ctaObj.text = variation.text;
        }

        variations.push({
            id: `variation_${Date.now()}_${i}`,
            name: variation.name,
            description: `Variation with ${variation.change}`,
            canvasData: newData,
            changes: [variation.change],
        });
    }

    return variations;
}

/**
 * Generate comprehensive variations (multiple changes)
 */
function generateComprehensiveVariations(canvas: any, count: number): ABTestVariation[] {
    const variations: ABTestVariation[] = [];
    const originalData = canvas.toJSON(['name', 'selectable', 'evented']);

    const comprehensiveChanges = [
        {
            name: 'Bold & Bright',
            changes: ['Increased font sizes', 'Brighter colors', 'Centered layout'],
            apply: (data: any) => {
                data.objects.forEach((obj: any) => {
                    if (obj.type === 'text' || obj.type === 'i-text') {
                        obj.fontSize = (obj.fontSize || 16) * 1.3;
                        obj.fontWeight = 'bold';
                        obj.left = canvas.width / 2;
                        obj.textAlign = 'center';
                    }
                    if (obj.type === 'rect' && obj.fill) {
                        obj.fill = '#F59E0B'; // Bright orange
                    }
                });
            },
        },
        {
            name: 'Minimal & Clean',
            changes: ['Smaller fonts', 'Muted colors', 'More whitespace'],
            apply: (data: any) => {
                data.objects.forEach((obj: any) => {
                    if (obj.type === 'text' || obj.type === 'i-text') {
                        obj.fontSize = (obj.fontSize || 16) * 0.9;
                        obj.fontWeight = 'normal';
                    }
                    if (obj.type === 'rect' && obj.fill) {
                        obj.fill = '#6B7280'; // Muted gray
                    }
                });
            },
        },
        {
            name: 'High Contrast',
            changes: ['Black & white theme', 'Bold typography', 'Strong borders'],
            apply: (data: any) => {
                data.objects.forEach((obj: any) => {
                    if (obj.type === 'text' || obj.type === 'i-text') {
                        obj.fill = '#000000';
                        obj.fontWeight = 'bold';
                    }
                    if (obj.type === 'rect') {
                        obj.fill = '#FFFFFF';
                        obj.stroke = '#000000';
                        obj.strokeWidth = 3;
                    }
                });
            },
        },
    ];

    for (let i = 0; i < Math.min(count, comprehensiveChanges.length); i++) {
        const variation = comprehensiveChanges[i];
        const newData = JSON.parse(JSON.stringify(originalData));

        variation.apply(newData);

        variations.push({
            id: `variation_${Date.now()}_${i}`,
            name: variation.name,
            description: `Comprehensive variation: ${variation.changes.join(', ')}`,
            canvasData: newData,
            changes: variation.changes,
        });
    }

    return variations;
}

/**
 * Create A/B test
 */
export function createABTest(
    name: string,
    originalId: string,
    canvas: any,
    variationType: ABTest['variationType'],
    count: number = 3
): ABTest {
    const variations = generateABTestVariations(canvas, variationType, count);

    return {
        id: `abtest_${Date.now()}`,
        name,
        originalId,
        variations,
        variationType,
        createdAt: Date.now(),
    };
}

/**
 * Apply variation to canvas
 */
export function applyVariationToCanvas(canvas: any, variation: ABTestVariation): void {
    canvas.loadFromJSON(variation.canvasData, () => {
        canvas.renderAll();
    });
}

/**
 * Get variation summary
 */
export function getVariationSummary(variation: ABTestVariation): string {
    return `${variation.name}: ${variation.changes.join(', ')}`;
}

/**
 * Export A/B test
 */
export function exportABTest(abTest: ABTest): string {
    return JSON.stringify(abTest, null, 2);
}

/**
 * Get recommended variation count
 */
export function getRecommendedVariationCount(variationType: ABTest['variationType']): number {
    const recommendations: Record<ABTest['variationType'], number> = {
        headline: 4,
        color: 5,
        layout: 3,
        image: 3,
        cta: 4,
        comprehensive: 3,
    };

    return recommendations[variationType];
}
