import openAIClient from '../ai/openaiClient';
import { ValidationResult } from '../compliance/rules';

export interface CopilotSuggestion {
    explanation: string;
    businessContext: string;
    fixAction: {
        type: string;
        params: any;
        label: string;
    };
    learningTip: string;
}

/**
 * Generate AI-powered explanations and fixes for compliance violations
 */
export async function generateComplianceGuidance(
    violation: ValidationResult,
    retailer: string = 'Tesco'
): Promise<CopilotSuggestion> {
    try {
        const prompt = `
You are a helpful compliance copilot for a retail advertising platform.
A user has violated a brand guideline for ${retailer}.

Violation Details:
- Rule: ${violation.ruleName}
- Category: ${violation.category}
- Message: ${violation.message}
- Details: ${JSON.stringify(violation.details || {})}

Provide a helpful response with:
1. A clear, friendly explanation of what's wrong (max 1 sentence)
2. The business reason why this rule exists (max 1 sentence)
3. A specific, actionable fix suggestion
4. A brief learning tip for future reference

Format as JSON.
    `.trim();

        const response = await openAIClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful compliance assistant. Always respond with valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 400,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No response from AI');

        const parsed = JSON.parse(content);

        return {
            explanation: parsed.explanation || violation.message,
            businessContext: parsed.businessContext || 'This rule ensures brand consistency.',
            fixAction: {
                type: 'manual_fix', // Default, can be refined based on rule type
                params: {},
                label: parsed.fixSuggestion || 'Fix Issue',
            },
            learningTip: parsed.learningTip || 'Check guidelines before finalizing.',
        };
    } catch (error) {
        console.error('Copilot guidance error:', error);
        // Fallback to basic info
        return {
            explanation: violation.message,
            businessContext: 'Adhering to guidelines builds brand trust.',
            fixAction: {
                type: 'manual',
                params: {},
                label: 'Fix Manually',
            },
            learningTip: 'Review the brand guidelines document.',
        };
    }
}

/**
 * Batch process multiple violations
 */
export async function generateBatchGuidance(
    violations: ValidationResult[]
): Promise<Record<string, CopilotSuggestion>> {
    // Process in parallel, but limit concurrency if needed
    const results: Record<string, CopilotSuggestion> = {};

    await Promise.all(
        violations.map(async (violation) => {
            if (!violation.passed) {
                results[violation.ruleId] = await generateComplianceGuidance(violation);
            }
        })
    );

    return results;
}
