import { ApiError } from '../api-error';

/**
 * Hugging Face Inference API client for Stable Diffusion
 * Get your free API token at: https://huggingface.co/settings/tokens
 */

export type ImageGenerationOptions = {
    width?: number;
    height?: number;
    numOutputs?: number;
    seed?: number;
    model?: string;
};

// Available Stable Diffusion models on Hugging Face
export const AVAILABLE_MODELS = {
    SD_3: 'stabilityai/stable-diffusion-3-medium-diffusers', // Best text rendering (RECOMMENDED)
    SDXL_TURBO: 'stabilityai/sdxl-turbo', // Fast, good quality
    SDXL_BASE: 'stabilityai/stable-diffusion-xl-base-1.0', // High quality
    PLAYGROUND_V2: 'playgroundai/playground-v2.5-1024px-aesthetic', // Great for aesthetic images
};

// Default to SD3 for best text rendering in retail creatives
const DEFAULT_MODEL = AVAILABLE_MODELS.SD_3;

/**
 * Generate images using Hugging Face Inference API with Stable Diffusion
 * Supports multiple variations by using different seeds
 */
export async function generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
): Promise<string[]> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new ApiError(
            'Hugging Face API key not found. Please set HUGGINGFACE_API_KEY in .env.local',
            401,
            'API_KEY_MISSING'
        );
    }

    const {
        width = 1024,
        height = 1024,
        numOutputs = 5, // Default to 5 variations
        seed = Math.floor(Math.random() * 1000000),
        model = DEFAULT_MODEL,
    } = options;

    const imageUrls: string[] = [];

    // Generate multiple variations with different seeds
    const generateSingleImage = async (currentSeed: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            width: Math.min(width, 1024), // SDXL max is 1024
                            height: Math.min(height, 1024),
                            seed: currentSeed,
                            num_inference_steps: 25, // Balance speed/quality
                            guidance_scale: 7.5,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Hugging Face API Error:', errorText);

                // Handle model loading (cold start)
                if (response.status === 503) {
                    throw new ApiError(
                        'Model is loading, please try again in 30 seconds',
                        503,
                        'MODEL_LOADING'
                    );
                }

                throw new ApiError(
                    `Image generation failed: ${response.statusText}`,
                    response.status,
                    'IMAGE_GENERATION_FAILED'
                );
            }

            // Response is a blob (image binary)
            const blob = await response.blob();

            // Convert blob to base64 data URL
            const buffer = await blob.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = blob.type || 'image/png';

            return `data:${mimeType};base64,${base64}`;
        } catch (error: any) {
            console.error(`Failed to generate image with seed ${currentSeed}:`, error);
            throw error;
        }
    };

    // Generate all variations in parallel (with limit to avoid rate limiting)
    const BATCH_SIZE = 3; // Generate 3 at a time

    for (let i = 0; i < numOutputs; i += BATCH_SIZE) {
        const batch = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE, numOutputs); j++) {
            batch.push(generateSingleImage(seed + j));
        }

        try {
            const batchResults = await Promise.all(batch);
            imageUrls.push(...batchResults);
        } catch (error: any) {
            // If we got some images before error, return them
            if (imageUrls.length > 0) {
                console.warn(`Generated ${imageUrls.length} images before error`);
                break;
            }
            throw error;
        }
    }

    if (imageUrls.length === 0) {
        throw new ApiError(
            'No images generated',
            500,
            'NO_IMAGES_GENERATED'
        );
    }

    return imageUrls;
}

export default { generateImage, AVAILABLE_MODELS };
