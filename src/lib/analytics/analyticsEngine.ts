/**
 * Analytics Engine - Track creative performance
 */

export interface AnalyticsData {
    creativeId: string;
    creativeName: string;
    platform: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'other';
    impressions: number;
    clicks: number;
    ctr: number; // Click-through rate
    conversions: number;
    cost: number;
    cpc: number; // Cost per click
    date: number;
}

export interface PerformanceMetrics {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    totalConversions: number;
    totalSpend: number;
    averageCPC: number;
    roi: number;
}

export interface TopPerformer {
    creativeId: string;
    creativeName: string;
    ctr: number;
    conversions: number;
    platform: string;
}

export interface AIInsight {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    recommendation: string;
}

export class AnalyticsEngine {
    /**
     * Calculate overall performance metrics
     */
    static calculateMetrics(data: AnalyticsData[]): PerformanceMetrics {
        if (data.length === 0) {
            return {
                totalImpressions: 0,
                totalClicks: 0,
                averageCTR: 0,
                totalConversions: 0,
                totalSpend: 0,
                averageCPC: 0,
                roi: 0,
            };
        }

        const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
        const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
        const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
        const totalSpend = data.reduce((sum, d) => sum + d.cost, 0);

        const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;

        // Simplified ROI calculation (assuming $50 per conversion)
        const revenue = totalConversions * 50;
        const roi = totalSpend > 0 ? ((revenue - totalSpend) / totalSpend) * 100 : 0;

        return {
            totalImpressions,
            totalClicks,
            averageCTR,
            totalConversions,
            totalSpend,
            averageCPC,
            roi,
        };
    }

    /**
     * Get top performing creatives
     */
    static getTopPerformers(data: AnalyticsData[], limit: number = 5): TopPerformer[] {
        const creativeMap = new Map<string, AnalyticsData[]>();

        // Group by creative
        data.forEach(d => {
            const existing = creativeMap.get(d.creativeId) || [];
            existing.push(d);
            creativeMap.set(d.creativeId, existing);
        });

        // Calculate aggregate metrics per creative
        const performers: TopPerformer[] = [];
        creativeMap.forEach((creativeData, creativeId) => {
            const totalImpressions = creativeData.reduce((sum, d) => sum + d.impressions, 0);
            const totalClicks = creativeData.reduce((sum, d) => sum + d.clicks, 0);
            const totalConversions = creativeData.reduce((sum, d) => sum + d.conversions, 0);
            const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

            performers.push({
                creativeId,
                creativeName: creativeData[0].creativeName,
                ctr,
                conversions: totalConversions,
                platform: creativeData[0].platform,
            });
        });

        // Sort by CTR and return top N
        return performers
            .sort((a, b) => b.ctr - a.ctr)
            .slice(0, limit);
    }

    /**
     * Generate AI insights from analytics data
     */
    static generateInsights(data: AnalyticsData[], metrics: PerformanceMetrics): AIInsight[] {
        const insights: AIInsight[] = [];

        // CTR Analysis
        if (metrics.averageCTR > 3) {
            insights.push({
                type: 'success',
                title: 'Excellent Click-Through Rate',
                description: `Your average CTR of ${metrics.averageCTR.toFixed(2)}% is above industry average (2-3%).`,
                recommendation: 'Continue using similar creative styles and messaging.',
            });
        } else if (metrics.averageCTR < 1) {
            insights.push({
                type: 'warning',
                title: 'Low Click-Through Rate',
                description: `Your average CTR of ${metrics.averageCTR.toFixed(2)}% is below industry average.`,
                recommendation: 'Try more compelling headlines, stronger CTAs, or different visual styles.',
            });
        }

        // ROI Analysis
        if (metrics.roi > 100) {
            insights.push({
                type: 'success',
                title: 'Strong Return on Investment',
                description: `Your ROI of ${metrics.roi.toFixed(0)}% indicates profitable campaigns.`,
                recommendation: 'Scale up your ad spend to maximize returns.',
            });
        } else if (metrics.roi < 0) {
            insights.push({
                type: 'warning',
                title: 'Negative ROI',
                description: `Your campaigns are currently unprofitable (ROI: ${metrics.roi.toFixed(0)}%).`,
                recommendation: 'Review targeting, creative quality, and landing pages. Consider pausing underperforming campaigns.',
            });
        }

        // Platform Analysis
        const platformPerformance = this.analyzePlatformPerformance(data);
        const bestPlatform = platformPerformance[0];
        if (bestPlatform) {
            insights.push({
                type: 'info',
                title: 'Best Performing Platform',
                description: `${bestPlatform.platform} has the highest CTR at ${bestPlatform.ctr.toFixed(2)}%.`,
                recommendation: `Allocate more budget to ${bestPlatform.platform} campaigns.`,
            });
        }

        // Conversion Analysis
        if (metrics.totalConversions > 100) {
            insights.push({
                type: 'success',
                title: 'High Conversion Volume',
                description: `You've generated ${metrics.totalConversions} conversions.`,
                recommendation: 'Analyze your top converting creatives and create similar variations.',
            });
        }

        return insights;
    }

    /**
     * Analyze performance by platform
     */
    private static analyzePlatformPerformance(data: AnalyticsData[]): Array<{ platform: string; ctr: number }> {
        const platformMap = new Map<string, { impressions: number; clicks: number }>();

        data.forEach(d => {
            const existing = platformMap.get(d.platform) || { impressions: 0, clicks: 0 };
            existing.impressions += d.impressions;
            existing.clicks += d.clicks;
            platformMap.set(d.platform, existing);
        });

        const results: Array<{ platform: string; ctr: number }> = [];
        platformMap.forEach((stats, platform) => {
            const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
            results.push({ platform, ctr });
        });

        return results.sort((a, b) => b.ctr - a.ctr);
    }

    /**
     * Get performance trend data for charts
     */
    static getTrendData(data: AnalyticsData[], days: number = 30): Array<{ date: string; ctr: number; conversions: number }> {
        const now = Date.now();
        const cutoff = now - (days * 24 * 60 * 60 * 1000);

        const filtered = data.filter(d => d.date >= cutoff);
        const dateMap = new Map<string, { impressions: number; clicks: number; conversions: number }>();

        filtered.forEach(d => {
            const dateStr = new Date(d.date).toISOString().split('T')[0];
            const existing = dateMap.get(dateStr) || { impressions: 0, clicks: 0, conversions: 0 };
            existing.impressions += d.impressions;
            existing.clicks += d.clicks;
            existing.conversions += d.conversions;
            dateMap.set(dateStr, existing);
        });

        const results: Array<{ date: string; ctr: number; conversions: number }> = [];
        dateMap.forEach((stats, date) => {
            const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
            results.push({ date, ctr, conversions: stats.conversions });
        });

        return results.sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Generate sample analytics data for demo
     */
    static generateSampleData(creativeIds: string[], creativeName: string = 'Sample Creative'): AnalyticsData[] {
        const platforms: Array<'facebook' | 'instagram' | 'google' | 'linkedin'> = ['facebook', 'instagram', 'google', 'linkedin'];
        const data: AnalyticsData[] = [];

        creativeIds.forEach((id, index) => {
            const platform = platforms[index % platforms.length];
            const impressions = Math.floor(Math.random() * 10000) + 1000;
            const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
            const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02)); // 2-12% conversion rate
            const cpc = Math.random() * 2 + 0.5; // $0.50 - $2.50 CPC
            const cost = clicks * cpc;
            const ctr = (clicks / impressions) * 100;

            // Generate data for last 30 days
            for (let day = 0; day < 30; day++) {
                const date = Date.now() - (day * 24 * 60 * 60 * 1000);
                const dailyImpressions = Math.floor(impressions / 30);
                const dailyClicks = Math.floor(clicks / 30);
                const dailyConversions = Math.floor(conversions / 30);
                const dailyCost = cost / 30;

                data.push({
                    creativeId: id,
                    creativeName: `${creativeName} ${index + 1}`,
                    platform,
                    impressions: dailyImpressions,
                    clicks: dailyClicks,
                    ctr: (dailyClicks / dailyImpressions) * 100,
                    conversions: dailyConversions,
                    cost: dailyCost,
                    cpc,
                    date,
                });
            }
        });

        return data;
    }
}

/**
 * Format numbers for display
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
}

/**
 * Format currency
 */
export function formatCurrency(num: number): string {
    return '$' + num.toFixed(2);
}

/**
 * Format percentage
 */
export function formatPercentage(num: number): string {
    return num.toFixed(2) + '%';
}
