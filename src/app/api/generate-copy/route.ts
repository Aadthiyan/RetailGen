import { NextRequest, NextResponse } from 'next/server';
import { generateAdCopy, refineCopy } from '@/lib/ai/copyGenerator';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            productName,
            productDescription,
            targetAudience,
            brandVoice,
            copyType,
            format,
            maxLength,
            brandGuidelines,
            count,
            // For refinement
            originalCopy,
            feedback,
        } = body;

        // Handle refinement request
        if (originalCopy && feedback) {
            const refined = await refineCopy(originalCopy, feedback, {
                brandVoice,
                copyType,
            });

            return successResponse({ refined });
        }

        // Validate required fields for generation
        if (!productName || !copyType) {
            return errorResponse('Missing required fields: productName and copyType', 400);
        }

        // Generate copy
        const results = await generateAdCopy(
            {
                productName,
                productDescription,
                targetAudience,
                brandVoice: brandVoice || 'professional',
                copyType,
                format,
                maxLength,
                brandGuidelines,
            },
            count || 3
        );

        return successResponse({
            results,
            count: results.length,
        });
    } catch (error: any) {
        console.error('Copy generation error:', error);
        return errorResponse(error.message || 'Failed to generate copy', 500);
    }
}
