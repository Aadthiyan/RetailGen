'use client';

import { X } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';
import { useEffect, useState } from 'react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
    const { canvas } = useBuilderStore();
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && canvas) {
            // Generate high-quality preview
            const url = canvas.toDataURL({
                format: 'png',
                multiplier: 2, // Higher resolution
            });
            setImageUrl(url);
        }
    }, [isOpen, canvas]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="relative max-w-full max-h-full overflow-auto flex items-center justify-center">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Creative Preview"
                        className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
                    />
                ) : (
                    <div className="text-white">Generating preview...</div>
                )}
            </div>
        </div>
    );
}
