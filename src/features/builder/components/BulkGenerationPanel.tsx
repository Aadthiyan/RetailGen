'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle, XCircle, AlertCircle, Zap, X } from 'lucide-react';
import { BulkCreativeGenerator, BulkCreativeData, BulkGenerationProgress, BulkGenerationResult, generateSampleCSV, validateCSVData } from '../../../lib/bulk/bulkGenerator';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export function BulkGenerationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<BulkCreativeData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<BulkGenerationProgress | null>(null);
    const [result, setResult] = useState<BulkGenerationResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const createCreative = useMutation(api.creatives.create);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        setCsvFile(file);
        setResult(null);

        try {
            const generator = new BulkCreativeGenerator();
            const data = await generator.parseCSV(file);

            // Validate data
            const validation = validateCSVData(data);
            if (!validation.valid) {
                alert(`CSV validation errors:\n${validation.errors.join('\n')}`);
                return;
            }

            setCsvData(data);
        } catch (error) {
            console.error('CSV parsing failed:', error);
            alert('Failed to parse CSV file. Please check the format.');
        }
    };

    const handleGenerate = async () => {
        if (csvData.length === 0) {
            alert('Please upload a CSV file first');
            return;
        }

        setIsProcessing(true);
        setProgress({
            total: csvData.length,
            completed: 0,
            current: 'Starting...',
            status: 'processing',
            errors: [],
        });

        try {
            const generator = new BulkCreativeGenerator((prog) => {
                setProgress(prog);
            });

            const generationResult = await generator.generateBulk(csvData, {
                format: '1080x1080',
                autoCompliance: false,
            });

            setResult(generationResult);

            // Save creatives to database
            for (const creative of generationResult.creatives) {
                try {
                    await createCreative({
                        name: creative.productName,
                        format: '1080x1080',
                        dimensions: {
                            width: 1080,
                            height: 1080,
                        },
                        content: creative.canvasJSON,
                    });
                } catch (error) {
                    console.error('Failed to save creative:', error);
                }
            }

            generator.dispose();
        } catch (error) {
            console.error('Bulk generation failed:', error);
            alert('Bulk generation failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadSampleCSV = () => {
        const csv = generateSampleCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-creative-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setCsvFile(null);
        setCsvData([]);
        setProgress(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
            >
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Bulk Generate</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6" />
                            <div>
                                <h2 className="text-2xl font-bold">Bulk Creative Generation</h2>
                                <p className="text-green-100 text-sm">Generate 100+ creatives from CSV in minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {!result ? (
                        /* Upload & Generate Section */
                        <div className="space-y-6">
                            {/* Download Template */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-blue-900 mb-1">First time? Download our template</h3>
                                        <p className="text-sm text-blue-700 mb-3">
                                            Use our CSV template to ensure your data is formatted correctly
                                        </p>
                                        <button
                                            onClick={downloadSampleCSV}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Template CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CSV Format Guide */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">CSV Format</h3>
                                <p className="text-sm text-gray-600 mb-3">Your CSV should include these columns:</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Product Name</span> (required)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Price</span> (optional)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Image URL</span> (optional)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Headline</span> (optional)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Body Copy</span> (optional)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">CTA</span> (optional)
                                    </div>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload CSV File
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        className="cursor-pointer flex flex-col items-center gap-3"
                                    >
                                        <Upload className="w-12 h-12 text-gray-400" />
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">
                                                {csvFile ? csvFile.name : 'Click to upload CSV'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {csvFile ? `${csvData.length} products found` : 'or drag and drop'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Preview */}
                            {csvData.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Preview ({csvData.length} products)</h3>
                                    <div className="max-h-48 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Product</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Image</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvData.slice(0, 10).map((row, index) => (
                                                    <tr key={index} className="border-t border-gray-100">
                                                        <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                                                        <td className="px-3 py-2 font-medium">{row.productName}</td>
                                                        <td className="px-3 py-2 text-gray-600">{row.price || '-'}</td>
                                                        <td className="px-3 py-2 text-gray-600">
                                                            {row.imageUrl ? '✓' : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {csvData.length > 10 && (
                                            <p className="text-xs text-gray-500 text-center py-2">
                                                ... and {csvData.length - 10} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Progress */}
                            {isProcessing && progress && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-green-900">
                                                    Generating creatives...
                                                </span>
                                                <span className="text-sm text-green-700">
                                                    {progress.completed} / {progress.total}
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-700">
                                                Current: {progress.current}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-green-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={csvData.length === 0 || isProcessing}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating {csvData.length} Creatives...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Generate {csvData.length} Creatives
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Results Section */
                        <div className="space-y-6">
                            {/* Success Summary */}
                            <div className={`border rounded-lg p-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {result.success ? (
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {result.success ? 'Generation Complete!' : 'Generation Completed with Errors'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {result.totalGenerated} creatives generated successfully
                                            {result.totalFailed > 0 && `, ${result.totalFailed} failed`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="text-3xl font-bold text-green-600">{result.totalGenerated}</div>
                                        <div className="text-sm text-gray-600">Successful</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="text-3xl font-bold text-red-600">{result.totalFailed}</div>
                                        <div className="text-sm text-gray-600">Failed</div>
                                    </div>
                                </div>
                            </div>

                            {/* Errors */}
                            {result.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        Errors ({result.errors.length})
                                    </h4>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {result.errors.map((error, index) => (
                                            <p key={index} className="text-sm text-red-700">
                                                Row {error.row}: {error.error}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Generate More
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        window.location.href = '/app/creatives';
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    View Creatives
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
