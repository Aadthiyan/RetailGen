import { NextRequest, NextResponse } from 'next/server';
import { TESCO_RULES } from '@/lib/compliance/rules';
import { createVisionValidator } from '@/lib/compliance/visionValidator';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { canvasJSON, imageUrl, retailer, metadata } = body;

        if (!canvasJSON) {
            return errorResponse(ApiError.badRequest('Missing required field: canvasJSON'));
        }

        // Get rules for retailer (default to Tesco)
        const rules = TESCO_RULES.map(rule => ({
            ...rule,
            enabled: true,
            version: '1.0',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: [],
        })) as any[];

        // Create validator
        const validator = createVisionValidator(rules);

        // Validate with or without vision
        const report = imageUrl
            ? await validator.validateWithVision(canvasJSON, imageUrl, metadata)
            : await validator.validate(canvasJSON, metadata);

        return successResponse({
            report,
            visionEnhanced: !!imageUrl,
        });
    } catch (error: any) {
        console.error('Compliance validation error:', error);
        return errorResponse(
            error instanceof Error
                ? ApiError.internal(error.message)
                : ApiError.internal('Failed to validate compliance')
        );
    }
}
