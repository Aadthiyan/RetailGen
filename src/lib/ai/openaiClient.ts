import OpenAI from 'openai';
import { ApiError } from '../api-error';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: false, // Server-side only
});

export type CompletionOptions = {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
};

/**
 * Generate text completion using OpenAI GPT models
 */
export async function generateCompletion(
    prompt: string,
    options: CompletionOptions = {}
): Promise<string> {
    try {
        const {
            model = 'gpt-4o-mini', // Cost-effective model for production
            temperature = 0.7,
            maxTokens = 1000,
            jsonMode = false,
        } = options;

        const response = await openai.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
            response_format: jsonMode ? { type: 'json_object' } : undefined,
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        return content;
    } catch (error) {
        console.error('OpenAI API Error:', error);

        if (error instanceof OpenAI.APIError) {
            throw new ApiError(
                `OpenAI Error: ${error.message}`,
                error.status || 500,
                'OPENAI_API_ERROR'
            );
        }

        throw new ApiError('Failed to generate completion', 500, 'AI_GENERATION_FAILED');
    }
}

/**
 * Generate structured data using function calling (simplified wrapper)
 */
export async function generateStructuredData<T>(
    prompt: string,
    schema: any,
    options: CompletionOptions = {}
): Promise<T> {
    try {
        const content = await generateCompletion(
            `${prompt}\n\nRespond with valid JSON matching this schema: ${JSON.stringify(schema)}`,
            { ...options, jsonMode: true }
        );

        return JSON.parse(content) as T;
    } catch (error) {
        console.error('Structured Data Generation Error:', error);
        throw new ApiError('Failed to generate structured data', 500, 'AI_STRUCTURED_DATA_FAILED');
    }
}

export default openai;
