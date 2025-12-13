import { NextRequest, NextResponse } from 'next/server';
import { generateComplianceReport, generateCertificate } from '@/lib/compliance/reporting';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report, creativeName, creativeId, action } = body;

        if (!report) {
            return errorResponse(ApiError.badRequest('Missing required field: report'));
        }

        if (action === 'certify') {
            // Generate certificate
            try {
                const certificate = generateCertificate(report, creativeId, creativeName);
                return successResponse({ certificate });
            } catch (error: any) {
                return errorResponse(ApiError.badRequest(error.message));
            }
        } else {
            // Generate report (default)
            const markdown = generateComplianceReport(
                report,
                creativeName || 'Untitled Creative',
                [] // Audit log would be fetched here in a real implementation
            );

            return successResponse({
                report: markdown,
                filename: `compliance-report-${Date.now()}.md`
            });
        }
    } catch (error: any) {
        console.error('Reporting error:', error);
        return errorResponse(
            error instanceof Error
                ? ApiError.internal(error.message)
                : ApiError.internal('Failed to generate report')
        );
    }
}
