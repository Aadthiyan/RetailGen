import Replicate from 'replicate';
import { ApiError } from '../api-error';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export type ImageGenerationOptions = {
    width?: number;
    height?: number;
    numOutputs?: number;
    negativePrompt?: string;
};

/**
 * Generate images using Stable Diffusion XL via Replicate
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
            negativePrompt = 'blur, low quality, distortion, watermark, text, logo',
        } = options;

        const output = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
                input: {
                    prompt,
                    negative_prompt: negativePrompt,
                    width,
                    height,
                    num_outputs: numOutputs,
                    refine: "expert_ensemble_refiner",
                }
            }
        );

        if (!output || !Array.isArray(output)) {
            throw new Error('Invalid response from Replicate');
        }

        return output as string[];
    } catch (error) {
        console.error('Replicate API Error:', error);
        throw new ApiError('Failed to generate image', 500, 'IMAGE_GENERATION_FAILED');
    }
}

export default replicate;
