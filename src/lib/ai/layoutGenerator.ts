// Switch between AI providers based on environment variable
// Set AI_PROVIDER=openai in .env.local to use OpenAI (requires billing)
// Default is pollinations (free, no API key needed)
const AI_PROVIDER = process.env.AI_PROVIDER || 'pollinations';

// Dynamic import based on provider
const getImageGenerator = async () => {
    if (AI_PROVIDER === 'openai') {
        const { generateImage } = await import('./openaiClient');
        return generateImage;
    } else {
        const { generateImage } = await import('./pollinationsClient');
        return generateImage;
    }
};


interface LayoutGenerationParams {
    productName: string;
    brandColors?: string[];
    style?: 'modern' | 'minimalist' | 'bold' | 'elegant' | 'playful';
    format: {
        width: number;
        height: number;
        name: string;
    };
    additionalContext?: string;
}

interface GeneratedLayout {
    imageUrl: string;
    prompt: string;
}

/**
 * Generate creative layout variations using AI
 */
export async function generateLayoutVariations(
    params: LayoutGenerationParams,
    count: number = 3
): Promise<GeneratedLayout[]> {
    const { productName, brandColors, style = 'modern', format, additionalContext } = params;

    // Build base prompt with layout-specific instructions
    const basePrompt = buildLayoutPrompt(params);

    const results: GeneratedLayout[] = [];

    // Get the appropriate image generator
    const generateImage = await getImageGenerator();

    // Generate multiple variations
    for (let i = 0; i < count; i++) {
        try {
            const imageUrls = await generateImage(basePrompt, {
                width: format.width,
                height: format.height,
                numOutputs: 1,
            });

            if (imageUrls && imageUrls.length > 0) {
                results.push({
                    imageUrl: imageUrls[0],
                    prompt: basePrompt,
                });
            }
        } catch (error) {
            console.error(`Failed to generate variation ${i + 1}:`, error);
            // Continue with other generations even if one fails
        }
    }

    return results;
}

/**
 * Build optimized prompt for layout generation
 */
function buildLayoutPrompt(params: LayoutGenerationParams): string {
    const { productName, brandColors, style = 'modern', format, additionalContext } = params;

    const styleDescriptors = {
        modern: 'clean, contemporary, sleek design with bold typography',
        minimalist: 'simple, uncluttered, lots of white space, minimal elements',
        bold: 'vibrant colors, strong contrast, eye-catching, dynamic composition',
        elegant: 'sophisticated, refined, luxury aesthetic, subtle gradients',
        playful: 'fun, energetic, creative, whimsical elements, bright colors',
    };

    const colorInstruction = brandColors && brandColors.length > 0
        ? `using brand colors: ${brandColors.join(', ')}`
        : 'with harmonious color palette';

    const formatContext = getFormatContext(format.name);

    const prompt = `
Professional advertising layout for ${productName}.
${styleDescriptors[style as keyof typeof styleDescriptors]}.
${colorInstruction}.
${formatContext}
${additionalContext || ''}
High quality, commercial photography style, product-focused composition.
No text, clean background, professional lighting.
  `.trim().replace(/\s+/g, ' ');

    return prompt;
}

/**
 * Get format-specific context for better generation
 */
function getFormatContext(formatName: string): string {
    const contexts: Record<string, string> = {
        'Instagram Story': 'Vertical mobile format, centered composition, suitable for 9:16 aspect ratio',
        'Instagram Feed': 'Square or portrait format, balanced composition, suitable for social media',
        'Facebook Feed': 'Square format, eye-level composition, suitable for desktop and mobile',
        'LinkedIn Feed': 'Horizontal format, professional aesthetic, suitable for business context',
        'Leaderboard': 'Wide horizontal banner, prominent central focus',
        'Medium Rectangle': 'Compact rectangular format, efficient use of space',
        'Wide Skyscraper': 'Tall vertical format, top-to-bottom visual flow',
    };

    return contexts[formatName] || 'Optimized composition for advertising';
}

/**
 * Generate a single layout variation
 */
export async function generateSingleLayout(
    params: LayoutGenerationParams
): Promise<GeneratedLayout> {
    const variations = await generateLayoutVariations(params, 1);
    if (variations.length === 0) {
        throw new Error('Failed to generate layout');
    }
    return variations[0];
}
