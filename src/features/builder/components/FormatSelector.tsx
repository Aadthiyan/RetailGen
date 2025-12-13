'use client';

import { useBuilderStore } from '../store/builderStore';
import { AD_FORMATS } from '../config/formats';
import { Monitor, Smartphone, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function FormatSelector() {
    const { currentFormat, setFormat } = useBuilderStore();
    const [isOpen, setIsOpen] = useState(false);

    const getIcon = (platform: string) => {
        switch (platform) {
            case 'facebook':
            case 'linkedin':
            case 'google':
                return <Monitor className="w-4 h-4" />;
            case 'instagram':
                return <Smartphone className="w-4 h-4" />;
            default:
                return <Layout className="w-4 h-4" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
                {getIcon(currentFormat.platform)}
                <span>{currentFormat.name}</span>
                <span className="text-xs text-gray-400">
                    {currentFormat.width}x{currentFormat.height}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 max-h-96 overflow-y-auto">
                        {AD_FORMATS.map((format) => (
                            <button
                                key={format.id}
                                onClick={() => {
                                    setFormat(format.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                                    currentFormat.id === format.id && "bg-primary-50 text-primary-700"
                                )}
                            >
                                <div className="text-gray-400">
                                    {getIcon(format.platform)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{format.name}</div>
                                    <div className="text-xs text-gray-400">
                                        {format.width} x {format.height}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
