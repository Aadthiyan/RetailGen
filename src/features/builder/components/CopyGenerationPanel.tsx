'use client';

import { useState } from 'react';
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, Copy, Plus } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';

export function CopyGenerationPanel() {
    const { canvas, currentFormat, addObject } = useBuilderStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [brandVoice, setBrandVoice] = useState('professional');
    const [copyType, setCopyType] = useState('headline');
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedCopy, setSelectedCopy] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!productName.trim()) {
            setError('Please enter a product name');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch('/api/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    productDescription,
                    targetAudience,
                    brandVoice,
                    copyType,
                    format: currentFormat.name,
                    count: 3,
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

    const handleAddToCanvas = async (copyText: string) => {
        if (!canvas) return;

        const { IText } = await import('fabric');

        const fontSize = copyType === 'headline' ? 48 : copyType === 'tagline' ? 32 : 24;

        const text = new IText(copyText, {
            left: 50,
            top: 50,
            fontFamily: 'Inter',
            fontSize,
            fill: '#000000',
            fontWeight: copyType === 'headline' ? 'bold' : 'normal',
        });

        addObject(text);
        setSelectedCopy(copyText);
    };

    const copySentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600';
            case 'negative': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    AI Copywriting
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Input Form */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g., Summer Collection 2024"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="Brief product description..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Target Audience (Optional)
                        </label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="e.g., Young professionals"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Copy Type
                        </label>
                        <select
                            value={copyType}
                            onChange={(e) => setCopyType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="headline">Headline</option>
                            <option value="tagline">Tagline</option>
                            <option value="body">Body Copy</option>
                            <option value="cta">Call-to-Action</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                            Brand Voice
                        </label>
                        <select
                            value={brandVoice}
                            onChange={(e) => setBrandVoice(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="urgent">Urgent</option>
                            <option value="friendly">Friendly</option>
                            <option value="luxury">Luxury</option>
                        </select>
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
                                Generate Copy
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

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-700">Generated Options</h4>
                        <div className="space-y-2">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`p-3 border rounded-md transition-colors ${selectedCopy === result.text
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <p className="text-sm text-gray-900 mb-2">{result.text}</p>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${copySentimentColor(result.sentiment)}`}>
                                                {result.sentiment}
                                            </span>
                                            <span className="text-gray-400">
                                                {result.characterCount} chars
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCanvas(result.text)}
                                            className="flex items-center gap-1 px-2 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
