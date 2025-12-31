import { ApiError } from '../api-error';

export type ImageGenerationOptions = {
    width?: number;
    height?: number;
    numOutputs?: number;
    seed?: number;
};

/**
 * Generate images using Pollinations.ai (completely free, no API key needed)
 * Docs: https://pollinations.ai/
 */
export async function generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
): Promise<string[]> {
    try {
        const {
            width = 1024,
            height = 1024,
            numOutputs = 1,
            seed = Math.floor(Math.random() * 1000000),
        } = options;

        // Pollinations.ai uses a simple URL-based API
        // Format: https://image.pollinations.ai/prompt/{prompt}?width={width}&height={height}&seed={seed}

        const imageUrls: string[] = [];

        for (let i = 0; i < numOutputs; i++) {
            // Use different seeds for each variation
            const currentSeed = seed + i;

            // Encode the prompt for URL
            const encodedPrompt = encodeURIComponent(prompt);

            // Build the image URL
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${currentSeed}&nologo=true`;

            imageUrls.push(imageUrl);
        }

        return imageUrls;
    } catch (error: any) {
        console.error('Pollinations.ai Error:', error);
        throw new ApiError(
            error.message || 'Failed to generate image',
            500,
            'IMAGE_GENERATION_FAILED'
        );
    }
}

export default { generateImage };
