import { NextRequest, NextResponse } from 'next/server';
import { generateComplianceGuidance, generateBatchGuidance } from '@/lib/compliance/copilot';
import { successResponse, errorResponse } from '@/lib/api-response';

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
            return errorResponse('Missing required field: violation or violations', 400);
        }
    } catch (error: any) {
        console.error('Copilot API error:', error);
        return errorResponse(error.message || 'Failed to generate guidance', 500);
    }
}
