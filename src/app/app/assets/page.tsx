'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AssetUploadPanel = dynamic(
    () => import('@/features/assets/components/AssetUploadPanel').then(mod => mod.AssetUploadPanel),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
        )
    }
);

const AssetLibraryGrid = dynamic(
    () => import('@/features/assets/components/AssetLibraryGrid').then(mod => mod.AssetLibraryGrid),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }
);

export default function AssetsPage() {
    return (
        <ErrorBoundary>
            <div className="container mx-auto p-8 space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">Asset Library</h1>
                    <p className="text-gray-500">Manage your brand assets, product images, and logos.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                                <AssetUploadPanel />
                            </Suspense>
                        </div>
                    </div>

                    {/* Library Grid */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Your Assets</h2>
                            </div>
                            <Suspense fallback={<div className="animate-pulse">Loading assets...</div>}>
                                <AssetLibraryGrid />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
