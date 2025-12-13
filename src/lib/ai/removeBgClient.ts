import axios from 'axios';
import { ApiError } from '../api-error';

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

/**
 * Remove background from image URL
 * Returns base64 string of the processed image
 */
export async function removeBackground(imageUrl: string): Promise<string> {
    try {
        const apiKey = process.env.REMOVE_BG_API_KEY;
        if (!apiKey) {
            throw new Error('Remove.bg API key not configured');
        }

        const response = await axios.post(
            REMOVE_BG_API_URL,
            {
                image_url: imageUrl,
                size: 'auto',
                type: 'product', // Optimized for product photos
                format: 'png',
            },
            {
                headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // Request JSON response with base64
                },
            }
        );

        if (response.data.errors) {
            throw new Error(response.data.errors[0].title);
        }

        return response.data.data.result_b64;
    } catch (error) {
        console.error('Remove.bg Error:', error);
        throw new ApiError('Failed to remove background', 500, 'BG_REMOVAL_FAILED');
    }
}
