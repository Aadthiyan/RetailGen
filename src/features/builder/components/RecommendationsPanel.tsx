'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Loader2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';

interface Recommendation {
    id: string;
    type: 'color' | 'layout' | 'typography' | 'element' | 'spacing';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    reasoning: string;
    action: {
        type: string;
        params: any;
    };
    impact: number;
}

export function RecommendationsPanel() {
    const { canvas, currentFormat } = useBuilderStore();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());

    const fetchRecommendations = async () => {
        if (!canvas) return;

        setIsLoading(true);
        setError(null);

        try {
            const canvasJSON = canvas.toJSON();

            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    canvasJSON,
                    format: {
                        width: currentFormat.width,
                        height: currentFormat.height,
                        name: currentFormat.name,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get recommendations');
            }

            setRecommendations(data.data.recommendations);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = (rec: Recommendation) => {
        // Mark as applied
        setAppliedRecs(prev => new Set(prev).add(rec.id));

        // In a real implementation, this would apply the recommendation
        // For now, we just mark it as applied
        console.log('Applying recommendation:', rec);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-error-600 bg-error-50 border-error-200';
            case 'medium': return 'text-warning-600 bg-warning-50 border-warning-200';
            case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        // Return appropriate icon based on type
        return <Lightbulb className="w-4 h-4" />;
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary-500" />
                        Recommendations
                    </h3>
                    <button
                        onClick={fetchRecommendations}
                        disabled={isLoading || !canvas}
                        className="text-xs px-2 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : 'Refresh'}
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    AI-powered suggestions to improve your creative
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Analyzing your creative...</p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-error-50 border border-error-200 rounded-md text-sm text-error-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!isLoading && !error && recommendations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center">
                        <Lightbulb className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm mb-2">No recommendations yet</p>
                        <p className="text-xs px-4">
                            Click "Refresh" to analyze your creative and get suggestions
                        </p>
                    </div>
                )}

                {recommendations.map((rec) => {
                    const isApplied = appliedRecs.has(rec.id);

                    return (
                        <div
                            key={rec.id}
                            className={`border rounded-lg p-3 transition-all ${isApplied ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-start gap-2 flex-1">
                                    {getTypeIcon(rec.type)}
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">{rec.description}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                                    {rec.priority}
                                </span>
                            </div>

                            {/* Reasoning */}
                            <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                                <span className="font-medium">Why: </span>
                                {rec.reasoning}
                            </div>

                            {/* Impact & Action */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Impact: {rec.impact}/10</span>
                                </div>

                                {isApplied ? (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Applied
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleApply(rec)}
                                        className="text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Auto-analyze on mount */}
            {canvas && recommendations.length === 0 && !isLoading && !error && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={fetchRecommendations}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                        <Lightbulb className="w-4 h-4" />
                        Get Recommendations
                    </button>
                </div>
            )}
        </div>
    );
}
