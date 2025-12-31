import OpenAI from 'openai';
import { ApiError } from '../api-error';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export type ImageGenerationOptions = {
    width?: number;
    height?: number;
    numOutputs?: number;
    style?: 'vivid' | 'natural';
    quality?: 'standard' | 'hd';
};

/**
 * Generate images using OpenAI DALL-E 3
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
            style = 'vivid', // vivid = more dramatic, natural = more realistic
            quality = 'standard', // standard or hd
        } = options;

        // DALL-E 3 only supports specific sizes
        let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
        if (width > height) {
            size = '1792x1024'; // Landscape
        } else if (height > width) {
            size = '1024x1792'; // Portrait
        }

        // DALL-E 3 can only generate 1 image at a time, so we'll make multiple requests if needed
        const imagePromises = Array.from({ length: numOutputs }, async () => {
            const response = await openai.images.generate({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: size,
                quality: quality,
                style: style,
            });

            if (!response.data || !response.data[0]?.url) {
                throw new Error('No image URL in response');
            }

            return response.data[0].url;
        });

        const imageUrls = await Promise.all(imagePromises);

        // Filter out any undefined URLs
        const validUrls = imageUrls.filter((url): url is string => url !== undefined);

        if (validUrls.length === 0) {
            throw new Error('No images generated');
        }

        return validUrls;
    } catch (error: any) {
        console.error('OpenAI API Error:', error);

        // Provide more helpful error messages
        if (error.status === 400) {
            throw new ApiError(
                'Invalid prompt or parameters. Please try a different description.',
                400,
                'INVALID_PROMPT'
            );
        }

        if (error.status === 429) {
            throw new ApiError(
                'Rate limit exceeded. Please wait a moment and try again.',
                429,
                'RATE_LIMIT_EXCEEDED'
            );
        }

        throw new ApiError(
            error.message || 'Failed to generate image',
            error.status || 500,
            'IMAGE_GENERATION_FAILED'
        );
    }
}

export default openai;
