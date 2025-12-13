'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { useAssetUpload } from '../hooks/useAssetUpload';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssetUploadPanel() {
    const { uploadFile, isUploading, progress, error } = useAssetUpload();
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        // Upload files sequentially for now
        for (const file of files) {
            try {
                await uploadFile(file);
                setUploadStatus('success');
                setTimeout(() => setUploadStatus('idle'), 3000);
            } catch (e) {
                setUploadStatus('error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upload Assets</h2>
            </div>

            <FileUpload
                onUpload={handleUpload}
                disabled={isUploading}
                accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                }}
            />

            {/* Progress Indicator */}
            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {uploadStatus === 'success' && (
                <div className="flex items-center p-4 bg-success-50 text-success-700 rounded-lg animate-fade-in">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Asset uploaded successfully!</span>
                </div>
            )}

            {(error || uploadStatus === 'error') && (
                <div className="flex items-center p-4 bg-error-50 text-error-700 rounded-lg animate-fade-in">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error || 'Failed to upload asset. Please try again.'}</span>
                </div>
            )}
        </div>
    );
}
