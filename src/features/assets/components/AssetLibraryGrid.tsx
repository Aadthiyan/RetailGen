'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ImageIcon, Trash2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import Image from 'next/image';

export function AssetLibraryGrid() {
    const assets = useQuery(api.assets.list, {});
    const deleteAsset = useMutation(api.assets.deleteAsset);

    const handleDelete = async (id: any) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            await deleteAsset({ id });
        }
    };

    if (!assets) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <ImageIcon className="w-12 h-12 mb-2" />
                <p className="font-medium">No assets found</p>
                <p className="text-sm">Upload images using the panel on the left</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset: any) => (
                <div key={asset._id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-primary-500 transition-colors">
                    {asset.type === 'image' ? (
                        <Image
                            src={asset.url}
                            alt={asset.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                    )}

                    {/* Overlay with asset info and actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleDelete(asset._id)}
                                className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-white text-xs truncate">
                            <p className="font-medium truncate">{asset.name}</p>
                            {asset.dimensions && (
                                <p className="text-gray-300">
                                    {asset.dimensions.width} × {asset.dimensions.height}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
