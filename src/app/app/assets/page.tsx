'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';

export default function AssetsPage() {
    const assets = useQuery(api.assets.list, {});
    const deleteAsset = useMutation(api.assets.deleteAsset);
    const createAsset = useMutation(api.assets.create);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = async (id: any) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            await deleteAsset({ id });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

            if (!cloudName || !apiKey) {
                throw new Error('Missing Cloudinary configuration');
            }

            for (const file of Array.from(files)) {
                // Get signature
                const timestamp = Math.round(new Date().getTime() / 1000);
                const signRes = await fetch('/api/assets/sign-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paramsToSign: { timestamp, folder: 'retailgen-assets' } }),
                });

                if (!signRes.ok) throw new Error('Failed to get upload signature');
                const { signature } = await signRes.json();

                // Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                formData.append('folder', 'retailgen-assets');

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('Upload failed');
                const result = await uploadRes.json();

                // Save to Convex
                await createAsset({
                    name: file.name,
                    type: 'image',
                    url: result.secure_url,
                    thumbnailUrl: result.secure_url,
                    size: result.bytes,
                    dimensions: {
                        width: result.width,
                        height: result.height,
                    },
                    metadata: {
                        format: result.format,
                    },
                    tags: [],
                });
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Asset Library</h1>
                <p className="text-gray-500">Manage your brand assets, product images, and logos.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Assets</h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                disabled={isUploading}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {isUploading ? 'Uploading...' : 'Click to upload files'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    PNG, JPG, GIF (max 5MB)
                                </div>
                            </label>
                        </div>

                        {uploadError && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                {uploadError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Library Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Assets</h2>

                        {!assets ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <p className="font-medium">No assets found</p>
                                <p className="text-sm">Upload images using the panel on the left</p>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
