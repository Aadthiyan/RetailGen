import openAIClient from './openaiClient';

interface CopyGenerationParams {
    productName: string;
    productDescription?: string;
    targetAudience?: string;
    brandVoice?: 'professional' | 'casual' | 'urgent' | 'friendly' | 'luxury';
    copyType: 'headline' | 'tagline' | 'body' | 'cta';
    format?: string; // e.g., "Instagram Story", "Facebook Feed"
    maxLength?: number;
    brandGuidelines?: string;
}

interface GeneratedCopy {
    text: string;
    tone: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    characterCount: number;
}

/**
 * Generate ad copy using GPT-4
 */
export async function generateAdCopy(
    params: CopyGenerationParams,
    count: number = 3
): Promise<GeneratedCopy[]> {
    const prompt = buildCopyPrompt(params);

    try {
        const response = await openAIClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert advertising copywriter. Generate compelling, concise ad copy that drives engagement and conversions. Always consider the target audience and brand voice.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.8, // Higher creativity
            max_tokens: 500,
            n: count, // Generate multiple variations
        });

        const results: GeneratedCopy[] = [];

        for (const choice of response.choices) {
            const text = choice.message?.content?.trim() || '';

            if (text) {
                results.push({
                    text,
                    tone: params.brandVoice || 'professional',
                    sentiment: analyzeSentiment(text),
                    characterCount: text.length,
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Copy generation error:', error);
        throw new Error('Failed to generate copy');
    }
}

/**
 * Build optimized prompt for copy generation
 */
function buildCopyPrompt(params: CopyGenerationParams): string {
    const {
        productName,
        productDescription,
        targetAudience,
        brandVoice,
        copyType,
        format,
        maxLength,
        brandGuidelines,
    } = params;

    const voiceDescriptions = {
        professional: 'professional, authoritative, and trustworthy',
        casual: 'casual, conversational, and relatable',
        urgent: 'urgent, action-oriented, and compelling',
        friendly: 'friendly, warm, and approachable',
        luxury: 'sophisticated, elegant, and aspirational',
    };

    const copyTypeInstructions = {
        headline: 'Create a powerful, attention-grabbing headline that makes people stop scrolling.',
        tagline: 'Create a memorable tagline that captures the essence of the product.',
        body: 'Write engaging body copy that explains benefits and drives action.',
        cta: 'Create a compelling call-to-action that motivates immediate response.',
    };

    let prompt = `Generate ${copyType} for an advertisement.\n\n`;
    prompt += `Product: ${productName}\n`;

    if (productDescription) {
        prompt += `Description: ${productDescription}\n`;
    }

    if (targetAudience) {
        prompt += `Target Audience: ${targetAudience}\n`;
    }

    if (brandVoice) {
        prompt += `Brand Voice: ${voiceDescriptions[brandVoice]}\n`;
    }

    if (format) {
        prompt += `Format: ${format}\n`;
    }

    if (maxLength) {
        prompt += `Maximum Length: ${maxLength} characters\n`;
    }

    if (brandGuidelines) {
        prompt += `Brand Guidelines: ${brandGuidelines}\n`;
    }

    prompt += `\nInstructions: ${copyTypeInstructions[copyType]}\n`;
    prompt += `\nProvide ONLY the copy text, without any explanations or quotation marks.`;

    return prompt;
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['amazing', 'great', 'excellent', 'best', 'love', 'perfect', 'wonderful', 'fantastic', 'incredible', 'awesome'];
    const negativeWords = ['bad', 'worst', 'terrible', 'awful', 'hate', 'poor', 'disappointing'];

    const lowerText = text.toLowerCase();

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

/**
 * Refine existing copy based on feedback
 */
export async function refineCopy(
    originalCopy: string,
    feedback: string,
    params: Partial<CopyGenerationParams>
): Promise<string> {
    const prompt = `
Original copy: "${originalCopy}"

User feedback: ${feedback}

Please revise the copy based on this feedback while maintaining the ${params.brandVoice || 'professional'} tone.
Provide ONLY the revised copy text.
  `.trim();

    try {
        const response = await openAIClient.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert advertising copywriter who excels at refining copy based on feedback.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        return response.choices[0]?.message?.content?.trim() || originalCopy;
    } catch (error) {
        console.error('Copy refinement error:', error);
        throw new Error('Failed to refine copy');
    }
}
