'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useBuilderStore } from '../store/builderStore';

interface AssetSelectorPanelProps {
    onClose: () => void;
}

export function AssetSelectorPanel({ onClose }: AssetSelectorPanelProps) {
    const assets = useQuery(api.assets.list, {});
    const { canvas, addObject, currentFormat } = useBuilderStore();

    const handleSelectAsset = async (assetUrl: string) => {
        if (!canvas) return;

        try {
            const fabricModule = await import('fabric');
            const FabricImage = fabricModule.fabric.Image;

            // Load the asset image onto the canvas
            FabricImage.fromURL(assetUrl, (img: any) => {
                // Scale to fit canvas nicely (50% of canvas size)
                const targetWidth = currentFormat.width * 0.5;
                const scale = targetWidth / (img.width || 1);

                img.set({
                    left: currentFormat.width / 4,
                    top: currentFormat.height / 4,
                    scaleX: scale,
                    scaleY: scale,
                });

                addObject(img);
                onClose(); // Close the panel after adding image
            }, { crossOrigin: 'anonymous' });
        } catch (err) {
            console.error('Failed to add image to canvas:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary-500" />
                    Your Assets
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {!assets ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-center">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <p className="text-sm font-medium">No assets found</p>
                        <p className="text-xs mt-1">
                            Upload images in the{' '}
                            <a href="/app/assets" className="text-primary-600 hover:underline">
                                Assets page
                            </a>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {assets.map((asset: any) => (
                            <button
                                key={asset._id}
                                onClick={() => handleSelectAsset(asset.url)}
                                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-all group"
                            >
                                <Image
                                    src={asset.url}
                                    alt={asset.name}
                                    fill
                                    className="object-cover"
                                    sizes="150px"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded">
                                        Add to Canvas
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs truncate">{asset.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
