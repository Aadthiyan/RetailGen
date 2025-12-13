import { NextRequest, NextResponse } from 'next/server';
import {
    analyzeCreativeImage,
    detectLogo,
    analyzeTextCompliance,
    analyzeColorCompliance,
    analyzeLayoutCompliance,
} from '@/lib/compliance/imageAnalysis';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageUrl, analysisType, options } = body;

        if (!imageUrl) {
            return errorResponse(ApiError.badRequest('Missing required field: imageUrl'));
        }

        let result;

        switch (analysisType) {
            case 'full':
                result = await analyzeCreativeImage(imageUrl, options);
                break;

            case 'logo':
                result = await detectLogo(imageUrl);
                break;

            case 'text':
                result = await analyzeTextCompliance(imageUrl);
                break;

            case 'color':
                const brandColors = options?.brandColors || [];
                result = await analyzeColorCompliance(imageUrl, brandColors);
                break;

            case 'layout':
                const safeZoneMargin = options?.safeZoneMargin || 5;
                result = await analyzeLayoutCompliance(imageUrl, safeZoneMargin);
                break;

            default:
                // Default to full analysis
                result = await analyzeCreativeImage(imageUrl, options);
        }

        return successResponse({
            analysisType: analysisType || 'full',
            result,
        });
    } catch (error: any) {
        console.error('Image analysis error:', error);
        return errorResponse(
            error instanceof Error
                ? ApiError.internal(error.message)
                : ApiError.internal('Failed to analyze image')
        );
    }
}
