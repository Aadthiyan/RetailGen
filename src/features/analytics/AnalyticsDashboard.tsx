'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, MousePointerClick, Users, BarChart3, LineChart as LineChartIcon, Award, Lightbulb, X } from 'lucide-react';
import { AnalyticsEngine, AnalyticsData, PerformanceMetrics, formatNumber, formatCurrency, formatPercentage } from '../../lib/analytics/analyticsEngine';

export function AnalyticsDashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

    useEffect(() => {
        // Generate sample data for demo
        // In production, fetch from API
        const sampleData = AnalyticsEngine.generateSampleData(
            ['creative-1', 'creative-2', 'creative-3', 'creative-4', 'creative-5'],
            'Sample Creative'
        );
        setAnalyticsData(sampleData);

        const calculatedMetrics = AnalyticsEngine.calculateMetrics(sampleData);
        setMetrics(calculatedMetrics);
    }, []);

    const topPerformers = analyticsData.length > 0 ? AnalyticsEngine.getTopPerformers(analyticsData, 5) : [];
    const insights = metrics ? AnalyticsEngine.generateInsights(analyticsData, metrics) : [];
    const trendData = analyticsData.length > 0 ? AnalyticsEngine.getTrendData(analyticsData, timeRange) : [];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-[150px] right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
            >
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold">Analytics</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col my-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-6 h-6" />
                            <div>
                                <h2 className="text-2xl font-bold">Performance Analytics</h2>
                                <p className="text-purple-100 text-sm">Track your creative performance across platforms</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Time Range Selector */}
                    <div className="mt-4 flex gap-2">
                        {[7, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days as 7 | 30 | 90)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === days
                                    ? 'bg-white text-purple-600'
                                    : 'bg-purple-500 bg-opacity-30 text-white hover:bg-opacity-50'
                                    }`}
                            >
                                Last {days} Days
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {metrics ? (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <KPICard
                                    icon={<Users className="w-5 h-5" />}
                                    title="Total Impressions"
                                    value={formatNumber(metrics.totalImpressions)}
                                    color="blue"
                                />
                                <KPICard
                                    icon={<MousePointerClick className="w-5 h-5" />}
                                    title="Average CTR"
                                    value={formatPercentage(metrics.averageCTR)}
                                    color="green"
                                />
                                <KPICard
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    title="Total Conversions"
                                    value={formatNumber(metrics.totalConversions)}
                                    color="purple"
                                />
                                <KPICard
                                    icon={<DollarSign className="w-5 h-5" />}
                                    title="ROI"
                                    value={formatPercentage(metrics.roi)}
                                    color={metrics.roi > 0 ? 'green' : 'red'}
                                />
                            </div>

                            {/* Additional Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MetricCard
                                    title="Total Clicks"
                                    value={formatNumber(metrics.totalClicks)}
                                />
                                <MetricCard
                                    title="Total Spend"
                                    value={formatCurrency(metrics.totalSpend)}
                                />
                                <MetricCard
                                    title="Avg. CPC"
                                    value={formatCurrency(metrics.averageCPC)}
                                />
                            </div>

                            {/* CTR Trend Chart */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <LineChartIcon className="w-5 h-5 text-purple-600" />
                                    CTR Trend
                                </h3>
                                <SimpleTrendChart data={trendData} />
                            </div>

                            {/* Top Performers */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    Top Performing Creatives
                                </h3>
                                <div className="space-y-3">
                                    {topPerformers.map((performer, index) => (
                                        <div key={performer.creativeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                    index === 1 ? 'bg-gray-400' :
                                                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{performer.creativeName}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{performer.platform}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">{formatPercentage(performer.ctr)} CTR</p>
                                                <p className="text-sm text-gray-500">{performer.conversions} conversions</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Insights */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    AI Insights & Recommendations
                                </h3>
                                <div className="space-y-3">
                                    {insights.map((insight, index) => (
                                        <InsightCard key={index} insight={insight} />
                                    ))}
                                    {insights.length === 0 && (
                                        <p className="text-gray-500 text-center py-4">
                                            Not enough data to generate insights yet. Keep running campaigns!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500">Loading analytics...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface KPICardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: 'blue' | 'green' | 'purple' | 'red';
}

function KPICard({ icon, title, value, color }: KPICardProps) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
}

function MetricCard({ title, value }: MetricCardProps) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
    );
}

interface SimpleTrendChartProps {
    data: Array<{ date: string; ctr: number; conversions: number }>;
}

function SimpleTrendChart({ data }: SimpleTrendChartProps) {
    if (data.length === 0) {
        return <p className="text-gray-500 text-center py-8">No trend data available</p>;
    }

    const maxCTR = Math.max(...data.map(d => d.ctr));
    const maxConversions = Math.max(...data.map(d => d.conversions));

    return (
        <div className="space-y-4">
            <div className="h-48 flex items-end gap-1">
                {data.slice(-14).map((point, index) => {
                    const height = (point.ctr / maxCTR) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer"
                                style={{ height: `${height}%` }}
                                title={`${point.date}: ${formatPercentage(point.ctr)} CTR`}
                            />
                            <span className="text-xs text-gray-500 rotate-45 origin-left mt-2">
                                {new Date(point.date).getDate()}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-gray-600">Click-Through Rate</span>
                </div>
            </div>
        </div>
    );
}

interface InsightCardProps {
    insight: {
        type: 'success' | 'warning' | 'info';
        title: string;
        description: string;
        recommendation: string;
    };
}

function InsightCard({ insight }: InsightCardProps) {
    const styles = {
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    const icons = {
        success: '✓',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className={`border rounded-lg p-4 ${styles[insight.type]}`}>
            <div className="flex items-start gap-3">
                <span className="text-2xl">{icons[insight.type]}</span>
                <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm mb-2 opacity-90">{insight.description}</p>
                    <p className="text-sm font-medium">
                        💡 Recommendation: {insight.recommendation}
                    </p>
                </div>
            </div>
        </div>
    );
}
