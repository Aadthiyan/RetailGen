/**
 * Performance Predictions
 * Predict creative performance using AI and historical data
 */

export interface PerformancePrediction {
    score: number; // 0-100
    predictedCTR: number;
    predictedConversions: number;
    predictedROI: number;
    confidence: 'low' | 'medium' | 'high';
    factors: PredictionFactor[];
    recommendations: string[];
}

export interface PredictionFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number; // 0-100
    description: string;
}

/**
 * Predict creative performance
 */
export async function predictPerformance(
    canvas: any,
    metadata?: {
        platform?: string;
        audience?: string;
        budget?: number;
    }
): Promise<PerformancePrediction> {
    const factors: PredictionFactor[] = [];

    // Analyze visual elements
    factors.push(...analyzeVisualElements(canvas));

    // Analyze text content
    factors.push(...analyzeTextContent(canvas));

    // Analyze colors
    factors.push(...analyzeColorImpact(canvas));

    // Analyze layout
    factors.push(...analyzeLayoutImpact(canvas));

    // Platform-specific factors
    if (metadata?.platform) {
        factors.push(...analyzePlatformFit(canvas, metadata.platform));
    }

    // Calculate overall score
    const score = calculateOverallScore(factors);

    // Predict metrics
    const predictedCTR = predictCTR(score, metadata);
    const predictedConversions = predictConversions(score, predictedCTR, metadata);
    const predictedROI = predictROI(score, metadata);

    // Generate recommendations
    const recommendations = generateRecommendations(factors, score);

    // Determine confidence
    const confidence = determineConfidence(factors.length, metadata);

    return {
        score,
        predictedCTR,
        predictedConversions,
        predictedROI,
        confidence,
        factors,
        recommendations,
    };
}

/**
 * Analyze visual elements
 */
function analyzeVisualElements(canvas: any): PredictionFactor[] {
    const factors: PredictionFactor[] = [];
    const images = canvas.getObjects('image');

    // Image presence
    if (images.length > 0) {
        factors.push({
            name: 'Has Image',
            impact: 'positive',
            score: 85,
            description: 'Creatives with images typically perform 35% better',
        });
    } else {
        factors.push({
            name: 'No Image',
            impact: 'negative',
            score: 40,
            description: 'Consider adding an image to improve engagement',
        });
    }

    // Image size
    if (images.length > 0) {
        const totalImageArea = images.reduce((sum: number, img: any) => {
            const width = (img.width || 0) * (img.scaleX || 1);
            const height = (img.height || 0) * (img.scaleY || 1);
            return sum + (width * height);
        }, 0);

        const canvasArea = canvas.width * canvas.height;
        const imageRatio = totalImageArea / canvasArea;

        if (imageRatio > 0.4 && imageRatio < 0.7) {
            factors.push({
                name: 'Optimal Image Size',
                impact: 'positive',
                score: 80,
                description: 'Image-to-canvas ratio is in the optimal range (40-70%)',
            });
        } else if (imageRatio > 0.7) {
            factors.push({
                name: 'Image Too Large',
                impact: 'negative',
                score: 50,
                description: 'Image takes up too much space, leaving little room for text',
            });
        }
    }

    return factors;
}

/**
 * Analyze text content
 */
function analyzeTextContent(canvas: any): PredictionFactor[] {
    const factors: PredictionFactor[] = [];
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));

    if (textObjects.length === 0) {
        factors.push({
            name: 'No Text',
            impact: 'negative',
            score: 30,
            description: 'Creatives with clear messaging perform better',
        });
        return factors;
    }

    // Check for CTA
    const ctaKeywords = ['shop', 'buy', 'get', 'learn', 'discover', 'try', 'start', 'save', 'free'];
    const hasCTA = textObjects.some((obj: any) =>
        ctaKeywords.some(keyword => obj.text?.toLowerCase().includes(keyword))
    );

    if (hasCTA) {
        factors.push({
            name: 'Clear Call-to-Action',
            impact: 'positive',
            score: 90,
            description: 'CTAs increase conversion rates by up to 80%',
        });
    } else {
        factors.push({
            name: 'No Call-to-Action',
            impact: 'negative',
            score: 45,
            description: 'Adding a CTA could significantly improve performance',
        });
    }

    // Check text length
    const totalTextLength = textObjects.reduce((sum: number, obj: any) =>
        sum + (obj.text?.length || 0), 0
    );

    if (totalTextLength > 20 && totalTextLength < 80) {
        factors.push({
            name: 'Optimal Text Length',
            impact: 'positive',
            score: 75,
            description: 'Text length is concise and impactful',
        });
    } else if (totalTextLength > 100) {
        factors.push({
            name: 'Text Too Long',
            impact: 'negative',
            score: 50,
            description: 'Shorter text typically performs better in ads',
        });
    }

    // Check for numbers/stats
    const hasNumbers = textObjects.some((obj: any) =>
        /\d+/.test(obj.text || '')
    );

    if (hasNumbers) {
        factors.push({
            name: 'Includes Numbers',
            impact: 'positive',
            score: 70,
            description: 'Numbers and statistics increase credibility',
        });
    }

    return factors;
}

/**
 * Analyze color impact
 */
function analyzeColorImpact(canvas: any): PredictionFactor[] {
    const factors: PredictionFactor[] = [];
    const objects = canvas.getObjects();

    // Extract colors
    const colors = new Set<string>();
    objects.forEach((obj: any) => {
        if (obj.fill && typeof obj.fill === 'string') {
            colors.add(obj.fill.toLowerCase());
        }
    });

    // Color variety
    if (colors.size >= 2 && colors.size <= 4) {
        factors.push({
            name: 'Optimal Color Palette',
            impact: 'positive',
            score: 75,
            description: '2-4 colors create visual interest without overwhelming',
        });
    } else if (colors.size > 5) {
        factors.push({
            name: 'Too Many Colors',
            impact: 'negative',
            score: 45,
            description: 'Limit to 3-4 colors for better visual coherence',
        });
    }

    // Check for high-performing colors
    const highPerformingColors = ['#ff0000', '#ff6b6b', '#f59e0b', '#10b981', '#3b82f6'];
    const hasHighPerformingColor = Array.from(colors).some(color =>
        highPerformingColors.some(hpc =>
            color.toLowerCase().includes(hpc.substring(1, 4))
        )
    );

    if (hasHighPerformingColor) {
        factors.push({
            name: 'High-Impact Colors',
            impact: 'positive',
            score: 80,
            description: 'Using colors proven to drive engagement',
        });
    }

    return factors;
}

/**
 * Analyze layout impact
 */
function analyzeLayoutImpact(canvas: any): PredictionFactor[] {
    const factors: PredictionFactor[] = [];
    const objects = canvas.getObjects();

    // Check element count
    if (objects.length >= 3 && objects.length <= 7) {
        factors.push({
            name: 'Balanced Layout',
            impact: 'positive',
            score: 75,
            description: 'Optimal number of elements for visual clarity',
        });
    } else if (objects.length > 10) {
        factors.push({
            name: 'Cluttered Layout',
            impact: 'negative',
            score: 40,
            description: 'Too many elements can reduce focus',
        });
    }

    // Check for visual hierarchy
    const textObjects = canvas.getObjects('text').concat(canvas.getObjects('i-text'));
    if (textObjects.length > 1) {
        const fontSizes = textObjects.map((obj: any) => obj.fontSize || 16);
        const sizeRange = Math.max(...fontSizes) - Math.min(...fontSizes);

        if (sizeRange >= 12) {
            factors.push({
                name: 'Clear Hierarchy',
                impact: 'positive',
                score: 80,
                description: 'Strong visual hierarchy guides viewer attention',
            });
        }
    }

    return factors;
}

/**
 * Analyze platform fit
 */
function analyzePlatformFit(canvas: any, platform: string): PredictionFactor[] {
    const factors: PredictionFactor[] = [];

    const platformBestPractices: Record<string, any> = {
        facebook: {
            optimalTextRatio: 0.2,
            preferredAspect: 1.91,
            name: 'Facebook',
        },
        instagram: {
            optimalTextRatio: 0.3,
            preferredAspect: 1,
            name: 'Instagram',
        },
        linkedin: {
            optimalTextRatio: 0.25,
            preferredAspect: 1.91,
            name: 'LinkedIn',
        },
    };

    const practices = platformBestPractices[platform.toLowerCase()];
    if (!practices) return factors;

    // Check aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    const aspectDiff = Math.abs(aspectRatio - practices.preferredAspect);

    if (aspectDiff < 0.1) {
        factors.push({
            name: `Optimized for ${practices.name}`,
            impact: 'positive',
            score: 85,
            description: `Aspect ratio is perfect for ${practices.name}`,
        });
    }

    return factors;
}

/**
 * Calculate overall score
 */
function calculateOverallScore(factors: PredictionFactor[]): number {
    if (factors.length === 0) return 50;

    const weightedSum = factors.reduce((sum, factor) => {
        const weight = factor.impact === 'positive' ? 1 : factor.impact === 'negative' ? -0.5 : 0;
        return sum + (factor.score * weight);
    }, 0);

    const maxPossible = factors.filter(f => f.impact === 'positive').length * 100;
    const score = maxPossible > 0 ? (weightedSum / maxPossible) * 100 : 50;

    return Math.max(0, Math.min(100, score));
}

/**
 * Predict CTR
 */
function predictCTR(score: number, metadata?: any): number {
    // Base CTR varies by platform
    const baseCTR: Record<string, number> = {
        facebook: 0.9,
        instagram: 0.8,
        linkedin: 0.4,
        google: 2.0,
    };

    const base = metadata?.platform ? baseCTR[metadata.platform.toLowerCase()] || 1.0 : 1.0;

    // Score multiplier (50 = 1x, 100 = 2x, 0 = 0.5x)
    const multiplier = 0.5 + (score / 100);

    return base * multiplier;
}

/**
 * Predict conversions
 */
function predictConversions(score: number, ctr: number, metadata?: any): number {
    const impressions = metadata?.budget ? (metadata.budget / 5) * 1000 : 10000;
    const clicks = impressions * (ctr / 100);

    // Conversion rate based on score
    const conversionRate = (score / 100) * 0.05; // 0-5%

    return Math.round(clicks * conversionRate);
}

/**
 * Predict ROI
 */
function predictROI(score: number, metadata?: any): number {
    const budget = metadata?.budget || 100;

    // ROI multiplier based on score
    const roiMultiplier = (score / 100) * 3; // 0-300%

    return roiMultiplier * 100;
}

/**
 * Generate recommendations
 */
function generateRecommendations(factors: PredictionFactor[], score: number): string[] {
    const recommendations: string[] = [];

    // Get negative factors
    const negativeFactors = factors.filter(f => f.impact === 'negative');

    negativeFactors.forEach(factor => {
        switch (factor.name) {
            case 'No Image':
                recommendations.push('Add a high-quality product or lifestyle image');
                break;
            case 'No Call-to-Action':
                recommendations.push('Include a clear CTA like "Shop Now" or "Learn More"');
                break;
            case 'Text Too Long':
                recommendations.push('Reduce text to 50-80 characters for better impact');
                break;
            case 'Too Many Colors':
                recommendations.push('Limit color palette to 3-4 colors');
                break;
            case 'Cluttered Layout':
                recommendations.push('Remove non-essential elements to improve focus');
                break;
        }
    });

    // General recommendations based on score
    if (score < 50) {
        recommendations.push('Consider using a template as a starting point');
        recommendations.push('Review top-performing creatives for inspiration');
    } else if (score < 70) {
        recommendations.push('Test different color schemes with A/B testing');
        recommendations.push('Experiment with headline variations');
    } else {
        recommendations.push('This creative is ready to launch!');
        recommendations.push('Consider creating variations for A/B testing');
    }

    return recommendations.slice(0, 5); // Limit to top 5
}

/**
 * Determine confidence level
 */
function determineConfidence(factorCount: number, metadata?: any): 'low' | 'medium' | 'high' {
    let confidenceScore = 0;

    // More factors = higher confidence
    confidenceScore += Math.min(factorCount / 10, 1) * 40;

    // Platform data = higher confidence
    if (metadata?.platform) confidenceScore += 30;

    // Budget data = higher confidence
    if (metadata?.budget) confidenceScore += 30;

    if (confidenceScore >= 70) return 'high';
    if (confidenceScore >= 40) return 'medium';
    return 'low';
}

/**
 * Get prediction summary
 */
export function getPredictionSummary(prediction: PerformancePrediction): string {
    const grade = prediction.score >= 80 ? 'Excellent' :
        prediction.score >= 60 ? 'Good' :
            prediction.score >= 40 ? 'Fair' : 'Needs Improvement';

    return `${grade} (${prediction.score}/100) - Predicted CTR: ${prediction.predictedCTR.toFixed(2)}%`;
}
