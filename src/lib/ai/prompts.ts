export const PROMPTS = {
    // Creative Generation Prompts
    LAYOUT_GENERATION: (productName: string, brandStyle: string, format: string) => `
    Generate a professional advertising layout description for ${productName}.
    Brand Style: ${brandStyle}
    Target Format: ${format}
    
    Provide a JSON response with:
    - background_color (hex)
    - text_placement (top, bottom, center)
    - image_style (minimal, lifestyle, studio)
    - headline_suggestion
    - cta_text
  `,

    // Copywriting Prompts
    COPY_GENERATION: (productName: string, tone: string, platform: string) => `
    Write 3 variations of ad copy for ${productName}.
    Tone: ${tone}
    Platform: ${platform}
    
    Include:
    - Headline (max 40 chars)
    - Body text (max 125 chars)
    - Call to action
  `,

    // Compliance Explanations
    COMPLIANCE_EXPLANATION: (ruleName: string, violationDetails: string) => `
    Explain why this creative violates the "${ruleName}" rule.
    Details: ${violationDetails}
    
    Provide a friendly, educational explanation suitable for a non-designer.
    Suggest a specific fix.
  `,
};
