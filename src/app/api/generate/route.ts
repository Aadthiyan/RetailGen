import { NextRequest, NextResponse } from 'next/server';
import { generateLayoutVariations } from '@/lib/ai/layoutGenerator';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productName, style, count, format, brandColors, additionalContext } = body;

        // Validate required fields
        if (!productName || !format) {
            return errorResponse(ApiError.badRequest('Missing required fields'));
        }

        // Generate layouts
        const results = await generateLayoutVariations(
            {
                productName,
                style: style || 'modern',
                format,
                brandColors,
                additionalContext,
            },
            count || 3
        );

        return successResponse({
            results,
            count: results.length,
        });
    } catch (error: any) {
        console.error('Generation error:', error);

        // Extract status code from error if available (e.g. Replicate API errors)
        const status = error.status || error.statusCode || 500;
        const message = error.message || 'Failed to generate layouts';
        const code = status === 402 ? 'PAYMENT_REQUIRED' :
            status === 429 ? 'TOO_MANY_REQUESTS' :
                'IMAGE_GENERATION_FAILED';

        return errorResponse(new ApiError(message, status, code));
    }
}
