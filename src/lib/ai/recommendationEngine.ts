import openAIClient from './openaiClient';

interface CanvasAnalysis {
    elements: {
        type: string;
        count: number;
        properties: any;
    }[];
    colors: string[];
    layout: {
        balance: 'balanced' | 'unbalanced';
        density: 'sparse' | 'moderate' | 'crowded';
    };
    typography: {
        fontCount: number;
        sizes: number[];
    };
}

interface Recommendation {
    id: string;
    type: 'color' | 'layout' | 'typography' | 'element' | 'spacing';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    reasoning: string;
    action: {
        type: string;
        params: any;
    };
    impact: number; // 1-10 scale
}

/**
 * Analyze canvas and generate recommendations
 */
export async function generateRecommendations(
    canvasJSON: any,
    format: { width: number; height: number; name: string },
    brandGuidelines?: string
): Promise<Recommendation[]> {
    const analysis = analyzeCanvas(canvasJSON);
    const recommendations: Recommendation[] = [];

    // Rule-based recommendations
    recommendations.push(...getColorRecommendations(analysis));
    recommendations.push(...getLayoutRecommendations(analysis, format));
    recommendations.push(...getTypographyRecommendations(analysis));
    recommendations.push(...getSpacingRecommendations(analysis));

    // AI-powered recommendations
    const aiRecommendations = await getAIRecommendations(analysis, format, brandGuidelines);
    recommendations.push(...aiRecommendations);

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const scoreA = priorityWeight[a.priority] * a.impact;
        const scoreB = priorityWeight[b.priority] * b.impact;
        return scoreB - scoreA;
    }).slice(0, 6); // Top 6 recommendations
}

/**
 * Analyze canvas structure
 */
function analyzeCanvas(canvasJSON: any): CanvasAnalysis {
    const objects = canvasJSON.objects || [];

    const elementCounts = objects.reduce((acc: any, obj: any) => {
        acc[obj.type] = (acc[obj.type] || 0) + 1;
        return acc;
    }, {});

    const colors = new Set<string>();
    const fontSizes = new Set<number>();
    let fontCount = 0;

    objects.forEach((obj: any) => {
        if (obj.fill && typeof obj.fill === 'string') {
            colors.add(obj.fill);
        }
        if (obj.type === 'i-text' || obj.type === 'text') {
            if (obj.fontSize) fontSizes.add(obj.fontSize);
            fontCount++;
        }
    });

    const totalArea = objects.reduce((sum: number, obj: any) => {
        return sum + ((obj.width || 0) * (obj.height || 0) * (obj.scaleX || 1) * (obj.scaleY || 1));
    }, 0);

    const canvasArea = (canvasJSON.width || 1080) * (canvasJSON.height || 1080);
    const density = totalArea / canvasArea;

    return {
        elements: Object.entries(elementCounts).map(([type, count]) => ({
            type,
            count: count as number,
            properties: {},
        })),
        colors: Array.from(colors),
        layout: {
            balance: objects.length > 0 ? 'balanced' : 'unbalanced',
            density: density < 0.3 ? 'sparse' : density > 0.7 ? 'crowded' : 'moderate',
        },
        typography: {
            fontCount,
            sizes: Array.from(fontSizes),
        },
    };
}

/**
 * Color-based recommendations
 */
function getColorRecommendations(analysis: CanvasAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.colors.length > 5) {
        recommendations.push({
            id: 'color-simplify',
            type: 'color',
            priority: 'high',
            title: 'Simplify Color Palette',
            description: 'Too many colors can make the design feel chaotic',
            reasoning: `You're using ${analysis.colors.length} colors. Limit to 3-4 for better visual harmony.`,
            action: { type: 'suggest_palette', params: { maxColors: 4 } },
            impact: 8,
        });
    }

    if (analysis.colors.length < 2) {
        recommendations.push({
            id: 'color-add',
            type: 'color',
            priority: 'medium',
            title: 'Add Accent Color',
            description: 'A pop of color can increase engagement',
            reasoning: 'Single-color designs can feel flat. Add an accent color for visual interest.',
            action: { type: 'suggest_accent', params: {} },
            impact: 6,
        });
    }

    return recommendations;
}

/**
 * Layout-based recommendations
 */
function getLayoutRecommendations(
    analysis: CanvasAnalysis,
    format: { width: number; height: number; name: string }
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.layout.density === 'crowded') {
        recommendations.push({
            id: 'layout-breathing-room',
            type: 'layout',
            priority: 'high',
            title: 'Add Breathing Room',
            description: 'Crowded layouts reduce readability',
            reasoning: 'Elements are too close together. Increase spacing for better visual hierarchy.',
            action: { type: 'increase_spacing', params: { factor: 1.2 } },
            impact: 9,
        });
    }

    if (analysis.layout.density === 'sparse') {
        recommendations.push({
            id: 'layout-fill-space',
            type: 'layout',
            priority: 'medium',
            title: 'Utilize Empty Space',
            description: 'Too much empty space can feel incomplete',
            reasoning: 'Consider adding supporting elements or increasing element sizes.',
            action: { type: 'suggest_elements', params: {} },
            impact: 5,
        });
    }

    return recommendations;
}

/**
 * Typography recommendations
 */
function getTypographyRecommendations(analysis: CanvasAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.typography.sizes.length > 4) {
        recommendations.push({
            id: 'typography-consistency',
            type: 'typography',
            priority: 'medium',
            title: 'Standardize Font Sizes',
            description: 'Too many font sizes create visual noise',
            reasoning: `You're using ${analysis.typography.sizes.length} different sizes. Stick to 2-3 for hierarchy.`,
            action: { type: 'standardize_sizes', params: { maxSizes: 3 } },
            impact: 7,
        });
    }

    return recommendations;
}

/**
 * Spacing recommendations
 */
function getSpacingRecommendations(analysis: CanvasAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // This would analyze actual element positions in a real implementation
    // For now, we'll provide general spacing guidance

    return recommendations;
}

/**
 * AI-powered recommendations using GPT-4
 */
async function getAIRecommendations(
    analysis: CanvasAnalysis,
    format: { width: number; height: number; name: string },
    brandGuidelines?: string
): Promise<Recommendation[]> {
    try {
        const prompt = `
You are an expert creative director analyzing an advertising design.

Canvas Analysis:
- Format: ${format.name} (${format.width}x${format.height})
- Elements: ${JSON.stringify(analysis.elements)}
- Colors: ${analysis.colors.length} colors
- Layout density: ${analysis.layout.density}
- Typography: ${analysis.typography.fontCount} text elements

${brandGuidelines ? `Brand Guidelines: ${brandGuidelines}` : ''}

Provide 2-3 specific, actionable recommendations to improve this creative.
For each recommendation, include:
1. A clear title (max 6 words)
2. A brief description (max 15 words)
3. Detailed reasoning (max 30 words)
4. Priority (high/medium/low)
5. Impact score (1-10)

Respond in JSON format as an array of recommendations.
    `.trim();

        const response = await openAIClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert creative director providing design recommendations. Always respond with valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 800,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return [];

        const parsed = JSON.parse(content);
        const aiRecs = parsed.recommendations || [];

        return aiRecs.map((rec: any, index: number) => ({
            id: `ai-${index}`,
            type: 'element',
            priority: rec.priority || 'medium',
            title: rec.title || 'AI Suggestion',
            description: rec.description || '',
            reasoning: rec.reasoning || '',
            action: { type: 'manual', params: {} },
            impact: rec.impact || 5,
        }));
    } catch (error) {
        console.error('AI recommendations error:', error);
        return [];
    }
}
