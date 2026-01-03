'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, X, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { AICopywriter, CopywritingRequest, CopywritingResult, getCampaignTypeLabel, getToneLabel } from '../../../lib/ai/copywriter';
import { useBuilderStore } from '../../builder/store/builderStore';

export function CopywritingPanel() {
    const { canvas } = useBuilderStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<CopywritingResult | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<{ type: string; index: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'headlines' | 'body' | 'ctas' | 'taglines'>('headlines');

    // Form state
    const [productName, setProductName] = useState('');
    const [campaignType, setCampaignType] = useState<CopywritingRequest['campaignType']>('new_product');
    const [targetAudience, setTargetAudience] = useState('');
    const [keyFeatures, setKeyFeatures] = useState('');
    const [tone, setTone] = useState<CopywritingRequest['tone']>('professional');

    const generateCopy = async () => {
        if (!productName.trim()) {
            alert('Please enter a product name');
            return;
        }

        setIsGenerating(true);
        try {
            const copywriter = new AICopywriter();
            const request: CopywritingRequest = {
                productName: productName.trim(),
                campaignType,
                targetAudience: targetAudience.trim() || undefined,
                keyFeatures: keyFeatures.trim() ? keyFeatures.split(',').map(f => f.trim()) : undefined,
                tone,
            };

            const generatedCopy = await copywriter.generateCopy(request);
            setResult(generatedCopy);
            setActiveTab('headlines');
        } catch (error) {
            console.error('Copy generation failed:', error);
            alert('Failed to generate copy. Please check your OpenAI API key and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text: string, type: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex({ type, index });
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const insertToCanvas = (text: string, type: string) => {
        if (!canvas) {
            alert('Canvas not available');
            return;
        }

        // Determine font size based on type
        const fontSize = type === 'headlines' ? 32 : type === 'taglines' ? 24 : type === 'ctas' ? 28 : 16;
        const fontWeight = type === 'headlines' || type === 'ctas' ? 'bold' : 'normal';

        // Create text object
        const fabricText = new (window as any).fabric.IText(text, {
            left: 100,
            top: 100,
            fontSize,
            fontWeight,
            fill: '#000000',
            fontFamily: 'Inter',
            name: type === 'headlines' ? 'headline' : type === 'ctas' ? 'cta' : type === 'taglines' ? 'tagline' : 'body',
        });

        canvas.add(fabricText);
        canvas.setActiveObject(fabricText);
        canvas.renderAll();

        alert(`✨ ${type.charAt(0).toUpperCase() + type.slice(1)} added to canvas!`);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
            >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">AI Copywriter</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wand2 className="w-6 h-6" />
                            <div>
                                <h2 className="text-2xl font-bold">AI Copywriting Assistant</h2>
                                <p className="text-blue-100 text-sm">Generate professional ad copy in seconds</p>
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
                        /* Input Form */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="e.g., Premium Coffee Maker"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Type
                                    </label>
                                    <select
                                        value={campaignType}
                                        onChange={(e) => setCampaignType(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="new_product">New Product Launch</option>
                                        <option value="sale">Sale/Discount</option>
                                        <option value="holiday">Holiday Campaign</option>
                                        <option value="promotion">Special Promotion</option>
                                        <option value="brand_awareness">Brand Awareness</option>
                                        <option value="seasonal">Seasonal Campaign</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tone
                                    </label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual & Friendly</option>
                                        <option value="urgent">Urgent & Action-Driven</option>
                                        <option value="friendly">Warm & Friendly</option>
                                        <option value="luxury">Luxury & Premium</option>
                                        <option value="playful">Playful & Fun</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Audience (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g., Coffee enthusiasts aged 25-45"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Key Features (Optional, comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={keyFeatures}
                                    onChange={(e) => setKeyFeatures(e.target.value)}
                                    placeholder="e.g., Programmable, 12-cup capacity, Auto-shutoff"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={generateCopy}
                                disabled={isGenerating || !productName.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Amazing Copy...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Copy
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Results Display */
                        <div className="space-y-4">
                            {/* Tabs */}
                            <div className="flex gap-2 border-b border-gray-200">
                                {[
                                    { key: 'headlines', label: 'Headlines', count: result.headlines.length },
                                    { key: 'body', label: 'Body Copy', count: result.bodyCopy.length },
                                    { key: 'ctas', label: 'CTAs', count: result.ctas.length },
                                    { key: 'taglines', label: 'Taglines', count: result.taglines.length },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.key
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab.label} ({tab.count})
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {activeTab === 'headlines' && result.headlines.map((headline, index) => (
                                    <CopyItem
                                        key={index}
                                        text={headline}
                                        type="headlines"
                                        index={index}
                                        isCopied={copiedIndex?.type === 'headlines' && copiedIndex?.index === index}
                                        onCopy={() => copyToClipboard(headline, 'headlines', index)}
                                        onInsert={() => insertToCanvas(headline, 'headlines')}
                                        metadata={`${result.metadata.wordCount.headlines[index]} words, ${result.metadata.characterCount.headlines[index]} chars`}
                                    />
                                ))}

                                {activeTab === 'body' && result.bodyCopy.map((body, index) => (
                                    <CopyItem
                                        key={index}
                                        text={body}
                                        type="body"
                                        index={index}
                                        isCopied={copiedIndex?.type === 'body' && copiedIndex?.index === index}
                                        onCopy={() => copyToClipboard(body, 'body', index)}
                                        onInsert={() => insertToCanvas(body, 'body')}
                                        metadata={`${result.metadata.wordCount.bodyCopy[index]} words, ${result.metadata.characterCount.bodyCopy[index]} chars`}
                                    />
                                ))}

                                {activeTab === 'ctas' && result.ctas.map((cta, index) => (
                                    <CopyItem
                                        key={index}
                                        text={cta}
                                        type="ctas"
                                        index={index}
                                        isCopied={copiedIndex?.type === 'ctas' && copiedIndex?.index === index}
                                        onCopy={() => copyToClipboard(cta, 'ctas', index)}
                                        onInsert={() => insertToCanvas(cta, 'ctas')}
                                    />
                                ))}

                                {activeTab === 'taglines' && result.taglines.map((tagline, index) => (
                                    <CopyItem
                                        key={index}
                                        text={tagline}
                                        type="taglines"
                                        index={index}
                                        isCopied={copiedIndex?.type === 'taglines' && copiedIndex?.index === index}
                                        onCopy={() => copyToClipboard(tagline, 'taglines', index)}
                                        onInsert={() => insertToCanvas(tagline, 'taglines')}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setResult(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Generate New Copy
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CopyItemProps {
    text: string;
    type: string;
    index: number;
    isCopied: boolean;
    onCopy: () => void;
    onInsert: () => void;
    metadata?: string;
}

function CopyItem({ text, type, index, isCopied, onCopy, onInsert, metadata }: CopyItemProps) {
    return (
        <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all bg-white">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className={`text-gray-900 ${type === 'headlines' ? 'font-semibold text-lg' : type === 'ctas' ? 'font-bold text-base' : 'text-sm'}`}>
                        {text}
                    </p>
                    {metadata && (
                        <p className="text-xs text-gray-500 mt-1">{metadata}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onCopy}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onInsert}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        title="Insert to canvas"
                    >
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
}
