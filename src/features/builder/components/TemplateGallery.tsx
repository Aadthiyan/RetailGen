'use client';

import { useState } from 'react';
import { TEMPLATES, Template, getTemplatesByCategory } from '@/lib/templates/templates';
import { useBuilderStore } from '../store/builderStore';
import { X, Sparkles, Image as ImageIcon, Monitor, Printer, Mail } from 'lucide-react';

interface TemplateGalleryProps {
    onClose: () => void;
}

export function TemplateGallery({ onClose }: TemplateGalleryProps) {
    const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'all'>('all');
    const { canvas } = useBuilderStore();

    const categories = [
        { id: 'all' as const, name: 'All Templates', icon: Sparkles },
        { id: 'social' as const, name: 'Social Media', icon: ImageIcon },
        { id: 'display' as const, name: 'Display Ads', icon: Monitor },
        { id: 'print' as const, name: 'Print', icon: Printer },
        { id: 'email' as const, name: 'Email', icon: Mail },
    ];

    const filteredTemplates = selectedCategory === 'all'
        ? TEMPLATES
        : getTemplatesByCategory(selectedCategory);

    const applyTemplate = async (template: Template) => {
        if (!canvas) return;

        try {
            // Clear canvas
            canvas.clear();

            // Set canvas dimensions
            canvas.setDimensions({
                width: template.format.width,
                height: template.format.height,
            });

            // Load template
            canvas.loadFromJSON(template.canvasJSON, () => {
                canvas.renderAll();
            });

            onClose();
        } catch (error) {
            console.error('Failed to apply template:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            Choose a Template
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Start with a professionally designed template
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Categories */}
                <div className="px-6 py-4 border-b border-gray-200 flex gap-2 overflow-x-auto">
                    {categories.map(category => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {category.name}
                            </button>
                        );
                    })}
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Sparkles className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-lg font-medium">No templates in this category yet</p>
                            <p className="text-sm mt-1">Check back soon for more templates!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onApply={() => applyTemplate(template)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                    <p className="text-xs text-gray-500">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>
        </div>
    );
}

function TemplateCard({ template, onApply }: { template: Template; onApply: () => void }) {
    return (
        <div className="group relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer">
            {/* Thumbnail */}
            <div
                className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
                onClick={onApply}
            >
                {/* Placeholder - in production, use actual thumbnails */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-300 mb-2">
                            {template.format.width} × {template.format.height}
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider">
                            {template.category}
                        </div>
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/90 transition-all flex items-center justify-center">
                    <button
                        onClick={onApply}
                        className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold shadow-lg"
                    >
                        Use This Template
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{template.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
