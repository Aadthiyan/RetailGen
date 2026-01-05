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
    const { canvas, creativeId, canvasSize } = useBuilderStore();
    const [selectedFormats, setSelectedFormats] = useState<string[]>(['fb-feed', 'ig-post']);
    const [isExporting, setIsExporting] = useState(false);
    const [results, setResults] = useState<ExportResult[]>([]);

    const logExport = useMutation(api.exports.logExport);

    const toggleFormat = (id: string) => {
        setSelectedFormats(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    const handleExport = async () => {
        if (!canvas) return;

        setIsExporting(true);
        setResults([]);

        try {
            const allFormats = [...SOCIAL_FORMATS, ...DISPLAY_FORMATS, ...PRINT_FORMATS];
            const formatsToExport = allFormats.filter(f => selectedFormats.includes(f.id));

            const originalJson = canvas.toJSON();
            // Use canvasSize from store, not canvas.getWidth() which is scaled by zoom
            const originalWidth = canvasSize.width;
            const originalHeight = canvasSize.height;

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

function FormatCheckbox({ format, isSelected, onToggle }: {
    format: ExportFormat,
    isSelected: boolean,
    onToggle: () => void
}) {
    return (
        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
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
