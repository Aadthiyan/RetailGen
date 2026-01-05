'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useBuilderStore } from '../store/builderStore';

interface GenerationPanelProps {
    creativeId?: string;
}

export function GenerationPanel({ creativeId }: GenerationPanelProps) {
    const { currentFormat, canvas, addObject } = useBuilderStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [productName, setProductName] = useState('');
    const [style, setStyle] = useState<string>('modern');
    const [count, setCount] = useState(3);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!productName.trim()) {
            setError('Please enter a product name');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    style,
                    count,
                    format: {
                        width: currentFormat.width,
                        height: currentFormat.height,
                        name: currentFormat.name,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error?.message || data.error || 'Generation failed';
                throw new Error(errorMessage);
            }

            setResults(data.data.results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectResult = async (result: any) => {
        if (!canvas) return;

        try {
            const fabricModule = await import('fabric');
            const FabricImage = fabricModule.fabric.Image;

            // Load the generated image onto the canvas
            FabricImage.fromURL(result.imageUrl, (img: any) => {
                if (!img || !img.width || !img.height) {
                    console.error('Failed to load image or image has no dimensions');
                    return;
                }

                // Scale to fit canvas
                const scale = Math.min(
                    currentFormat.width / img.width,
                    currentFormat.height / img.height
                );

                img.set({
                    left: 0,
                    top: 0,
                    scaleX: scale,
                    scaleY: scale,
                });

                addObject(img);
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
        } catch (err) {
            console.error('Failed to add image to canvas:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    AI Generation
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Input Form */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Product Name
                        </label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g., Summer Collection"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Style
                        </label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="modern">Modern</option>
                            <option value="minimalist">Minimalist</option>
                            <option value="bold">Bold</option>
                            <option value="elegant">Elegant</option>
                            <option value="playful">Playful</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Variations ({count})
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate
                            </>
                        )}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-error-50 border border-error-200 rounded-md text-sm text-error-700">
                        {error}
                    </div>
                )}

                {/* Results Grid */}
                {results.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-700">Generated Variations</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectResult(result)}
                                    className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors group"
                                >
                                    <Image
                                        src={result.imageUrl}
                                        alt={`Variation ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                                            Use This
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
