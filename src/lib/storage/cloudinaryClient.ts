import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export type UploadResult = {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    colors?: string[];
};

/**
 * Upload an image to Cloudinary
 * @param file The file buffer or base64 string
 * @param folder The folder to upload to (default: 'retailgen-assets')
 * @param tags Optional tags for the image
 */
export async function uploadImage(
    file: string,
    folder: string = 'retailgen-assets',
    tags: string[] = []
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            tags,
            resource_type: 'auto',
            colors: true, // Extract dominant colors
            transformation: [
                { quality: 'auto:good' }, // Optimize quality
                { fetch_format: 'auto' }, // Optimize format
            ],
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            colors: result.colors?.map((c: [string, number]) => c[0]),
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Generate an optimized URL for an image
 * @param publicId The public ID of the image
 * @param options Transformation options
 */
export function getOptimizedUrl(
    publicId: string,
    options: { width?: number; height?: number; crop?: string } = {}
): string {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
        ...options,
    });
}

export default cloudinary;
