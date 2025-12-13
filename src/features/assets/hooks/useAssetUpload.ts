import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export function useAssetUpload() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
    });

    const createAsset = useMutation(api.assets.create);

    const uploadFile = async (file: File, tags: string[] = []) => {
        setUploadState({ isUploading: true, progress: 0, error: null });

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

            if (!cloudName || !apiKey) {
                throw new Error('Missing Cloudinary configuration. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY in .env.local');
            }

            // 1. Get signature from API
            const timestamp = Math.round(new Date().getTime() / 1000);
            const paramsToSign = {
                timestamp,
                folder: 'retailgen-assets',
            };

            const signRes = await fetch('/api/assets/sign-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paramsToSign }),
            });

            if (!signRes.ok) {
                const errorData = await signRes.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to get upload signature');
            }
            const { signature } = await signRes.json();

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', 'retailgen-assets');

            // Use XMLHttpRequest for progress tracking (fetch doesn't support it easily)
            const xhr = new XMLHttpRequest();

            const uploadPromise = new Promise<any>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setUploadState((prev) => ({ ...prev, progress }));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        let errorMsg = 'Cloudinary upload failed';
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.error && response.error.message) {
                                errorMsg = `Cloudinary Error: ${response.error.message}`;
                            }
                        } catch (e) {
                            errorMsg = `Cloudinary upload failed (${xhr.status})`;
                        }
                        reject(new Error(errorMsg));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Network error')));
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
                xhr.send(formData);
            });

            const result = await uploadPromise;

            // 3. Save metadata to Convex
            await createAsset({
                name: file.name,
                type: 'image',
                url: result.secure_url,
                thumbnailUrl: result.secure_url, // Cloudinary can generate thumbs, using original for now
                size: result.bytes,
                dimensions: {
                    width: result.width,
                    height: result.height,
                },
                metadata: {
                    format: result.format,
                    colors: result.colors?.map((c: any) => c[0]), // Assuming Cloudinary returns colors if requested
                },
                tags,
            });

            setUploadState({ isUploading: false, progress: 100, error: null });
            return result;
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadState({ isUploading: false, progress: 0, error: error.message });
            throw error;
        }
    };

    return {
        uploadFile,
        ...uploadState,
    };
}
