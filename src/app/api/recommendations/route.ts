import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/ai/recommendationEngine';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { canvasJSON, format, brandGuidelines } = body;

        // Validate required fields
        if (!canvasJSON || !format) {
            return errorResponse(ApiError.badRequest('Missing required fields: canvasJSON and format'));
        }

        // Generate recommendations
        const recommendations = await generateRecommendations(
            canvasJSON,
            format,
            brandGuidelines
        );

        return successResponse({
            recommendations,
            count: recommendations.length,
        });
    } catch (error: any) {
        console.error('Recommendation error:', error);
        return errorResponse(
            error instanceof Error
                ? ApiError.internal(error.message)
                : ApiError.internal('Failed to generate recommendations')
        );
    }
}
