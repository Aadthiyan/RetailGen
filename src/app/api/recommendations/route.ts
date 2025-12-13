import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/ai/recommendationEngine';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { canvasJSON, format, brandGuidelines } = body;

        // Validate required fields
        if (!canvasJSON || !format) {
            return errorResponse('Missing required fields: canvasJSON and format', 400);
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
        return errorResponse(error.message || 'Failed to generate recommendations', 500);
    }
}
