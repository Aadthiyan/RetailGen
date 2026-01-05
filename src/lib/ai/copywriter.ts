/**
 * AI Copywriting Assistant - Generates professional ad copy using Meta LLaMA-3
 * Free via Hugging Face Inference API
 */

export interface CopywritingRequest {
    productName: string;
    campaignType: 'new_product' | 'sale' | 'holiday' | 'promotion' | 'brand_awareness' | 'seasonal';
    targetAudience?: string;
    keyFeatures?: string[];
    tone?: 'professional' | 'casual' | 'urgent' | 'friendly' | 'luxury' | 'playful';
    brandVoice?: string;
    additionalContext?: string;
}

export interface CopywritingResult {
    headlines: string[];
    bodyCopy: string[];
    ctas: string[];
    taglines: string[];
    metadata: {
        tone: string;
        wordCount: {
            headlines: number[];
            bodyCopy: number[];
        };
        characterCount: {
            headlines: number[];
            bodyCopy: number[];
        };
    };
}

// Available LLaMA models on Hugging Face
const LLAMA_MODELS = {
    LLAMA_3_8B: 'meta-llama/Meta-Llama-3-8B-Instruct', // Fast, good quality
    LLAMA_3_70B: 'meta-llama/Meta-Llama-3-70B-Instruct', // Better quality, slower
};

// Use 8B for speed, can switch to 70B for better quality
const DEFAULT_MODEL = LLAMA_MODELS.LLAMA_3_8B;

export class AICopywriter {
    private apiKey: string;
    private model: string;
    private useOpenAI: boolean;

    constructor(apiKey?: string) {
        // Check which API to use
        this.useOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.HUGGINGFACE_API_KEY;

        if (this.useOpenAI) {
            this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
            this.model = 'gpt-4';
        } else {
            this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';
            this.model = DEFAULT_MODEL;
        }
    }

    /**
     * Generate complete copy package (headlines, body, CTAs, taglines)
     */
    async generateCopy(request: CopywritingRequest): Promise<CopywritingResult> {
        const prompt = this.buildPrompt(request);

        try {
            let content: string;

            if (this.useOpenAI) {
                content = await this.callOpenAI(prompt);
            } else {
                content = await this.callHuggingFace(prompt);
            }

            return this.parseCopyResponse(content, request.tone || 'professional');
        } catch (error) {
            console.error('Copywriting generation failed:', error);
            throw error;
        }
    }

    /**
     * Call Hugging Face Inference API with LLaMA-3
     */
    private async callHuggingFace(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Hugging Face API key not found. Set HUGGINGFACE_API_KEY in .env.local');
        }

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${this.model}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1500,
                        temperature: 0.8,
                        top_p: 0.9,
                        do_sample: true,
                        return_full_text: false,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API Error:', errorText);

            if (response.status === 503) {
                throw new Error('Model is loading, please try again in 30 seconds');
            }

            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data)) {
            return data[0]?.generated_text || '';
        }

        return data.generated_text || '';
    }

    /**
     * Call OpenAI API (fallback if OpenAI key is set)
     */
    private async callOpenAI(prompt: string): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert advertising copywriter specializing in retail marketing. You create compelling, conversion-focused copy that follows best practices and brand guidelines.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Generate only headlines
     */
    async generateHeadlines(request: CopywritingRequest, count: number = 10): Promise<string[]> {
        const prompt = `Generate ${count} compelling advertising headlines for:

Product: ${request.productName}
Campaign Type: ${request.campaignType.replace('_', ' ')}
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}
${request.keyFeatures ? `Key Features: ${request.keyFeatures.join(', ')}` : ''}
Tone: ${request.tone || 'professional'}

Requirements:
- Keep headlines under 10 words
- Make them attention-grabbing and benefit-focused
- Use power words and emotional triggers
- Vary the approach (question, statement, command, etc.)
- Ensure they're suitable for ${request.campaignType.replace('_', ' ')} campaigns

Return ONLY the headlines, one per line, numbered.`;

        try {
            const response = await this.callLLM(prompt);
            return this.parseListResponse(response);
        } catch (error) {
            console.error('Headline generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate only CTAs
     */
    async generateCTAs(request: CopywritingRequest, count: number = 8): Promise<string[]> {
        const prompt = `Generate ${count} compelling call-to-action (CTA) phrases for:

Product: ${request.productName}
Campaign Type: ${request.campaignType.replace('_', ' ')}
Tone: ${request.tone || 'professional'}

Requirements:
- Keep CTAs under 4 words
- Make them action-oriented and urgent
- Vary between soft and hard CTAs
- Include time-sensitive language where appropriate
- Ensure they drive conversions

Return ONLY the CTAs, one per line, numbered.`;

        try {
            const response = await this.callLLM(prompt);
            return this.parseListResponse(response);
        } catch (error) {
            console.error('CTA generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate body copy
     */
    async generateBodyCopy(request: CopywritingRequest, count: number = 5): Promise<string[]> {
        const prompt = `Generate ${count} versions of compelling body copy for:

Product: ${request.productName}
Campaign Type: ${request.campaignType.replace('_', ' ')}
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}
${request.keyFeatures ? `Key Features: ${request.keyFeatures.join(', ')}` : ''}
Tone: ${request.tone || 'professional'}

Requirements:
- Keep each version under 50 words
- Focus on benefits, not just features
- Use persuasive language and social proof
- Include emotional triggers
- Vary the approach (storytelling, problem-solution, feature-benefit, etc.)

Return ONLY the body copy versions, separated by "---", numbered.`;

        try {
            const response = await this.callLLM(prompt);
            return this.parseBodyCopyResponse(response);
        } catch (error) {
            console.error('Body copy generation failed:', error);
            throw error;
        }
    }

    /**
     * Build comprehensive prompt for full copy generation
     */
    private buildPrompt(request: CopywritingRequest): string {
        return `Generate a complete advertising copy package for:

**Product:** ${request.productName}
**Campaign Type:** ${request.campaignType.replace('_', ' ')}
**Target Audience:** ${request.targetAudience || 'General consumers'}
**Key Features:** ${request.keyFeatures?.join(', ') || 'Not specified'}
**Tone:** ${request.tone || 'professional'}
${request.brandVoice ? `**Brand Voice:** ${request.brandVoice}` : ''}
${request.additionalContext ? `**Additional Context:** ${request.additionalContext}` : ''}

Please provide:

1. **HEADLINES** (10 variations):
   - Under 10 words each
   - Attention-grabbing and benefit-focused
   - Varied approaches (questions, statements, commands)
   - Suitable for ${request.campaignType.replace('_', ' ')} campaigns

2. **BODY COPY** (5 variations):
   - Under 50 words each
   - Focus on benefits and emotional triggers
   - Use persuasive language
   - Varied approaches (storytelling, problem-solution, etc.)

3. **CALL-TO-ACTIONS** (8 variations):
   - Under 4 words each
   - Action-oriented and urgent
   - Mix of soft and hard CTAs
   - Time-sensitive where appropriate

4. **TAGLINES** (5 variations):
   - Under 6 words each
   - Memorable and brand-focused
   - Capture product essence

Format your response EXACTLY as follows:

HEADLINES:
1. [Headline 1]
2. [Headline 2]
...

BODY COPY:
1. [Body copy 1]
---
2. [Body copy 2]
...

CTAS:
1. [CTA 1]
2. [CTA 2]
...

TAGLINES:
1. [Tagline 1]
2. [Tagline 2]
...`;
    }

    /**
     * Parse GPT-4 response into structured format
     */
    private parseCopyResponse(content: string, tone: string): CopywritingResult {
        const sections = {
            headlines: this.extractSection(content, 'HEADLINES'),
            bodyCopy: this.extractSection(content, 'BODY COPY'),
            ctas: this.extractSection(content, 'CTAS'),
            taglines: this.extractSection(content, 'TAGLINES'),
        };

        return {
            headlines: sections.headlines,
            bodyCopy: sections.bodyCopy,
            ctas: sections.ctas,
            taglines: sections.taglines,
            metadata: {
                tone,
                wordCount: {
                    headlines: sections.headlines.map(h => h.split(' ').length),
                    bodyCopy: sections.bodyCopy.map(b => b.split(' ').length),
                },
                characterCount: {
                    headlines: sections.headlines.map(h => h.length),
                    bodyCopy: sections.bodyCopy.map(b => b.length),
                },
            },
        };
    }

    /**
     * Extract section from GPT response
     */
    private extractSection(content: string, sectionName: string): string[] {
        const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n\\n[A-Z]+:|$)`, 'i');
        const match = content.match(regex);

        if (!match) return [];

        const lines = match[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
            .filter(line => line.length > 0);

        // For body copy, split by "---"
        if (sectionName === 'BODY COPY') {
            return lines.join('\n').split('---').map(s => s.trim()).filter(s => s.length > 0);
        }

        return lines;
    }

    /**
     * Parse list response (for headlines/CTAs)
     */
    private parseListResponse(content: string): string[] {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
            .filter(line => line.length > 0);
    }

    /**
     * Parse body copy response
     */
    private parseBodyCopyResponse(content: string): string[] {
        return content
            .split('---')
            .map(section => section.trim())
            .filter(section => section.length > 0)
            .map(section => section.replace(/^\d+\.\s*/, '').trim());
    }

    /**
     * Call the appropriate LLM API (Hugging Face or OpenAI)
     */
    private async callLLM(prompt: string): Promise<string> {
        if (this.useOpenAI) {
            return this.callOpenAI(prompt);
        } else {
            return this.callHuggingFace(prompt);
        }
    }
}

/**
 * Utility: Get campaign type display name
 */
export function getCampaignTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        new_product: 'New Product Launch',
        sale: 'Sale/Discount',
        holiday: 'Holiday Campaign',
        promotion: 'Special Promotion',
        brand_awareness: 'Brand Awareness',
        seasonal: 'Seasonal Campaign',
    };
    return labels[type] || type;
}

/**
 * Utility: Get tone display name
 */
export function getToneLabel(tone: string): string {
    const labels: Record<string, string> = {
        professional: 'Professional',
        casual: 'Casual & Friendly',
        urgent: 'Urgent & Action-Driven',
        friendly: 'Warm & Friendly',
        luxury: 'Luxury & Premium',
        playful: 'Playful & Fun',
    };
    return labels[tone] || tone;
}
