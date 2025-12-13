import { NextRequest, NextResponse } from 'next/server';
import { generateComplianceGuidance, generateBatchGuidance } from '@/lib/compliance/copilot';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { violation, violations, retailer } = body;

        if (violations && Array.isArray(violations)) {
            // Batch mode
            const guidance = await generateBatchGuidance(violations);
            return successResponse({ guidance });
        } else if (violation) {
            // Single mode
            const guidance = await generateComplianceGuidance(violation, retailer);
            return successResponse({ guidance });
        } else {
            return errorResponse(ApiError.badRequest('Missing required field: violation or violations'));
        }
    } catch (error: any) {
        console.error('Copilot API error:', error);
        return errorResponse(
            error instanceof Error
                ? ApiError.internal(error.message)
                : ApiError.internal('Failed to generate guidance')
        );
    }
}
