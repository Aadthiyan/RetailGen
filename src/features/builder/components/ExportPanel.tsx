'use client';

import { useState } from 'react';
import { Download, Check, Loader2, Image as ImageIcon, Share2, Package } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';
import { SOCIAL_FORMATS, DISPLAY_FORMATS, PRINT_FORMATS, ExportFormat } from '@/lib/export/formats';
import { exportManager, ExportResult } from '@/lib/export/exportManager';
import { downloadManager } from '@/lib/export/downloadManager';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ExportHistory } from './ExportHistory';

export function ExportPanel() {
    const { canvas, creativeId } = useBuilderStore();
    const [selectedFormats, setSelectedFormats] = useState<string[]>(['fb-feed', 'ig-post']);
    const [isExporting, setIsExporting] = useState(false);
    const [results, setResults] = useState<ExportResult[]>([]);
    const [showRecommendations, setShowRecommendations] = useState(true);

    const logExport = useMutation(api.exports.logExport);

    // Smart recommendations based on canvas aspect ratio
    const getRecommendedFormats = (): string[] => {
        if (!canvas) return [];

        const width = canvas.getWidth();
        const height = canvas.getHeight();
        const ratio = width / height;

        const recommendations: string[] = [];

        // Square (1:1) - recommend square formats
        if (Math.abs(ratio - 1) < 0.1) {
            recommendations.push('fb-feed', 'ig-post');
        }
        // Vertical (9:16) - recommend stories
        else if (ratio < 0.7) {
            recommendations.push('ig-story', 'fb-story', 'ig-reel', 'tiktok-video');
        }
        // Horizontal (16:9) - recommend landscape
        else if (ratio > 1.5) {
            recommendations.push('yt-thumbnail', 'tw-post', 'leaderboard');
        }
        // Portrait (2:3) - recommend Pinterest
        else if (ratio < 1 && ratio > 0.6) {
            recommendations.push('pinterest-pin');
        }
        // Landscape (1.91:1) - recommend LinkedIn
        else if (ratio > 1.8 && ratio < 2) {
            recommendations.push('li-post');
        }

        return recommendations;
    };

    const recommendedFormats = getRecommendedFormats();

    const toggleFormat = (id: string) => {
        setSelectedFormats(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    const selectRecommended = () => {
        setSelectedFormats(recommendedFormats);
    };

    const handleExport = async () => {
        if (!canvas) return;

        setIsExporting(true);
        setResults([]);

        try {
            const allFormats = [...SOCIAL_FORMATS, ...DISPLAY_FORMATS, ...PRINT_FORMATS];
            const formatsToExport = allFormats.filter(f => selectedFormats.includes(f.id));

            const originalJson = canvas.toJSON();
            const originalWidth = canvas.getWidth();
            const originalHeight = canvas.getHeight();

            const exportResults = await exportManager.generateExports(
                originalJson,
                originalWidth,
                originalHeight,
                formatsToExport
            );

            setResults(exportResults);

            // Package and download
            await downloadManager.createPackage(exportResults, 'creative-assets');

            // Log history
            if (creativeId) {
                const totalSize = exportResults.reduce((acc, r) => acc + r.blob.size, 0);
                await logExport({
                    creativeId: creativeId as any,
                    formats: selectedFormats,
                    fileCount: exportResults.length,
                    totalSize,
                    status: 'completed'
                });
            }

        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-primary-500" />
                    Multi-Format Export
                </h3>
                <p className="text-xs text-gray-500">
                    Select formats to generate and download.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Smart Recommendations */}
                {recommendedFormats.length > 0 && showRecommendations && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-900">Recommended for Your Design</span>
                            </div>
                            <button
                                onClick={() => setShowRecommendations(false)}
                                className="text-blue-400 hover:text-blue-600"
                            >
                                <span className="text-xs">✕</span>
                            </button>
                        </div>
                        <p className="text-xs text-blue-700 mb-2">
                            Based on your {canvas?.getWidth()}×{canvas?.getHeight()} canvas
                        </p>
                        <button
                            onClick={selectRecommended}
                            className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                            Select {recommendedFormats.length} Recommended Formats
                        </button>
                    </div>
                )}

                {/* Social Formats */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Social Media
                    </h4>
                    <div className="space-y-2">
                        {SOCIAL_FORMATS.map(format => (
                            <FormatCheckbox
                                key={format.id}
                                format={format}
                                isSelected={selectedFormats.includes(format.id)}
                                isRecommended={recommendedFormats.includes(format.id)}
                                onToggle={() => toggleFormat(format.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Display Formats */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Display Ads
                    </h4>
                    <div className="space-y-2">
                        {DISPLAY_FORMATS.map(format => (
                            <FormatCheckbox
                                key={format.id}
                                format={format}
                                isSelected={selectedFormats.includes(format.id)}
                                isRecommended={recommendedFormats.includes(format.id)}
                                onToggle={() => toggleFormat(format.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Print Formats */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Print Materials
                    </h4>
                    <div className="space-y-2">
                        {PRINT_FORMATS.map(format => (
                            <FormatCheckbox
                                key={format.id}
                                format={format}
                                isSelected={selectedFormats.includes(format.id)}
                                isRecommended={recommendedFormats.includes(format.id)}
                                onToggle={() => toggleFormat(format.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Export History */}
                {creativeId && (
                    <div className="pt-4 border-t border-gray-200">
                        <ExportHistory creativeId={creativeId} />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{selectedFormats.length} formats selected</span>
                    <span>~{(selectedFormats.length * 0.5).toFixed(1)}MB total</span>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting || selectedFormats.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Packaging...
                        </>
                    ) : (
                        <>
                            <Package className="w-4 h-4" />
                            Download Package
                        </>
                    )}
                </button>

                {results.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Downloaded {results.length} files!
                    </div>
                )}
            </div>
        </div>
    );
}

function FormatCheckbox({ format, isSelected, isRecommended, onToggle }: {
    format: ExportFormat,
    isSelected: boolean,
    isRecommended?: boolean,
    onToggle: () => void
}) {
    return (
        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary-500 bg-primary-50' :
                isRecommended ? 'border-blue-300 bg-blue-50' :
                    'border-gray-200 hover:border-gray-300'
            }`}>
            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-300'
                }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={onToggle}
            />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                            {format.name}
                        </span>
                        {isRecommended && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                ⭐ Recommended
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400">
                        {format.width}x{format.height}
                    </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 capitalize">
                    {format.platform} • {format.width === format.height ? '1:1' : 'Aspect Ratio'}
                </div>
            </div>
        </label>
    );
}
