'use client';

import { ImageIcon } from 'lucide-react';

export function AssetLibraryGrid() {
    // Hardcoded empty state for now - will integrate with Convex later
    const assets: any[] = [];

    if (!assets || assets.length === 0) {
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
                <div key={asset._id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {/* Asset thumbnail placeholder */}
                </div>
            ))}
        </div>
    );
}
