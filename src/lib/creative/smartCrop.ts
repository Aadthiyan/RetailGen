/**
 * Smart Crop
 * Intelligently crop images to focus on important areas
 */

export interface CropRegion {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number; // Importance score
}

export interface SmartCropResult {
    region: CropRegion;
    croppedDataUrl: string;
}

/**
 * Smart crop image to target aspect ratio
 */
export async function smartCrop(
    imageUrl: string,
    targetWidth: number,
    targetHeight: number
): Promise<SmartCropResult> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const region = findBestCropRegion(img, targetWidth, targetHeight);
            const croppedDataUrl = cropImage(img, region);

            resolve({
                region,
                croppedDataUrl,
            });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
}

/**
 * Find best crop region using attention detection
 */
function findBestCropRegion(
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
): CropRegion {
    const targetAspect = targetWidth / targetHeight;
    const imageAspect = img.width / img.height;

    let cropWidth: number;
    let cropHeight: number;

    if (imageAspect > targetAspect) {
        // Image is wider - crop width
        cropHeight = img.height;
        cropWidth = cropHeight * targetAspect;
    } else {
        // Image is taller - crop height
        cropWidth = img.width;
        cropHeight = cropWidth / targetAspect;
    }

    // Find best position using attention map
    const attentionMap = generateAttentionMap(img);
    const bestPosition = findBestPosition(
        attentionMap,
        img.width,
        img.height,
        cropWidth,
        cropHeight
    );

    return {
        x: bestPosition.x,
        y: bestPosition.y,
        width: cropWidth,
        height: cropHeight,
        score: bestPosition.score,
    };
}

/**
 * Generate attention map (simplified - detects edges and contrast)
 */
function generateAttentionMap(img: HTMLImageElement): number[][] {
    const canvas = document.createElement('canvas');
    const size = 50; // Low resolution for performance
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    const attentionMap: number[][] = [];

    for (let y = 0; y < size; y++) {
        attentionMap[y] = [];
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;

            // Calculate attention score based on:
            // 1. Edge detection (high contrast)
            // 2. Brightness (avoid too dark/bright)
            // 3. Center bias

            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const edgeScore = calculateEdgeScore(data, x, y, size);
            const centerBias = calculateCenterBias(x, y, size);

            const brightnessScore = 1 - Math.abs(brightness - 128) / 128;

            attentionMap[y][x] = edgeScore * 0.5 + brightnessScore * 0.3 + centerBias * 0.2;
        }
    }

    return attentionMap;
}

/**
 * Calculate edge score (simplified Sobel)
 */
function calculateEdgeScore(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    size: number
): number {
    if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        return 0;
    }

    const getPixel = (px: number, py: number) => {
        const i = (py * size + px) * 4;
        return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };

    const gx = -getPixel(x - 1, y - 1) + getPixel(x + 1, y - 1) +
        -2 * getPixel(x - 1, y) + 2 * getPixel(x + 1, y) +
        -getPixel(x - 1, y + 1) + getPixel(x + 1, y + 1);

    const gy = -getPixel(x - 1, y - 1) - 2 * getPixel(x, y - 1) - getPixel(x + 1, y - 1) +
        getPixel(x - 1, y + 1) + 2 * getPixel(x, y + 1) + getPixel(x + 1, y + 1);

    return Math.min(1, Math.sqrt(gx * gx + gy * gy) / 255);
}

/**
 * Calculate center bias
 */
function calculateCenterBias(x: number, y: number, size: number): number {
    const centerX = size / 2;
    const centerY = size / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    return 1 - (dist / maxDist);
}

/**
 * Find best position for crop region
 */
function findBestPosition(
    attentionMap: number[][],
    imgWidth: number,
    imgHeight: number,
    cropWidth: number,
    cropHeight: number
): { x: number; y: number; score: number } {
    const mapHeight = attentionMap.length;
    const mapWidth = attentionMap[0].length;

    const scaleX = imgWidth / mapWidth;
    const scaleY = imgHeight / mapHeight;

    const cropMapWidth = Math.floor(cropWidth / scaleX);
    const cropMapHeight = Math.floor(cropHeight / scaleY);

    let bestX = 0;
    let bestY = 0;
    let bestScore = 0;

    // Try different positions
    for (let y = 0; y <= mapHeight - cropMapHeight; y++) {
        for (let x = 0; x <= mapWidth - cropMapWidth; x++) {
            let score = 0;

            // Calculate average attention in this region
            for (let cy = y; cy < y + cropMapHeight; cy++) {
                for (let cx = x; cx < x + cropMapWidth; cx++) {
                    score += attentionMap[cy][cx];
                }
            }

            score /= (cropMapWidth * cropMapHeight);

            if (score > bestScore) {
                bestScore = score;
                bestX = Math.floor(x * scaleX);
                bestY = Math.floor(y * scaleY);
            }
        }
    }

    return { x: bestX, y: bestY, score: bestScore };
}

/**
 * Crop image to region
 */
function cropImage(img: HTMLImageElement, region: CropRegion): string {
    const canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
        img,
        region.x,
        region.y,
        region.width,
        region.height,
        0,
        0,
        region.width,
        region.height
    );

    return canvas.toDataURL();
}

/**
 * Crop to common aspect ratios
 */
export const ASPECT_RATIOS = [
    { name: 'Square (1:1)', width: 1, height: 1 },
    { name: 'Instagram Portrait (4:5)', width: 4, height: 5 },
    { name: 'Instagram Story (9:16)', width: 9, height: 16 },
    { name: 'Facebook Post (1.91:1)', width: 1.91, height: 1 },
    { name: 'Twitter Post (2:1)', width: 2, height: 1 },
    { name: 'LinkedIn Post (1.91:1)', width: 1.91, height: 1 },
    { name: 'YouTube Thumbnail (16:9)', width: 16, height: 9 },
    { name: 'Pinterest Pin (2:3)', width: 2, height: 3 },
];

/**
 * Smart crop to aspect ratio
 */
export async function smartCropToAspectRatio(
    imageUrl: string,
    aspectRatio: { width: number; height: number },
    targetSize: number = 1080
): Promise<SmartCropResult> {
    const targetWidth = targetSize;
    const targetHeight = Math.round(targetSize * (aspectRatio.height / aspectRatio.width));

    return smartCrop(imageUrl, targetWidth, targetHeight);
}

/**
 * Detect faces (simplified - uses center bias)
 * In production, use a face detection API
 */
export async function detectFaces(imageUrl: string): Promise<CropRegion[]> {
    // Simplified: return center region
    // In production: use face detection API like face-api.js
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const centerX = img.width / 2;
            const centerY = img.height / 2;
            const size = Math.min(img.width, img.height) * 0.3;

            resolve([{
                x: centerX - size / 2,
                y: centerY - size / 2,
                width: size,
                height: size,
                score: 0.8,
            }]);
        };

        img.onerror = () => {
            resolve([]);
        };

        img.src = imageUrl;
    });
}

/**
 * Crop with face detection
 */
export async function smartCropWithFaces(
    imageUrl: string,
    targetWidth: number,
    targetHeight: number
): Promise<SmartCropResult> {
    const faces = await detectFaces(imageUrl);

    if (faces.length === 0) {
        return smartCrop(imageUrl, targetWidth, targetHeight);
    }

    // Crop to include all faces
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            // Find bounding box of all faces
            const minX = Math.min(...faces.map(f => f.x));
            const minY = Math.min(...faces.map(f => f.y));
            const maxX = Math.max(...faces.map(f => f.x + f.width));
            const maxY = Math.max(...faces.map(f => f.y + f.height));

            const facesWidth = maxX - minX;
            const facesHeight = maxY - minY;
            const facesCenterX = minX + facesWidth / 2;
            const facesCenterY = minY + facesHeight / 2;

            // Calculate crop region
            const targetAspect = targetWidth / targetHeight;
            let cropWidth = Math.max(facesWidth * 1.5, img.width * 0.5);
            let cropHeight = cropWidth / targetAspect;

            if (cropHeight > img.height) {
                cropHeight = img.height;
                cropWidth = cropHeight * targetAspect;
            }

            const cropX = Math.max(0, Math.min(img.width - cropWidth, facesCenterX - cropWidth / 2));
            const cropY = Math.max(0, Math.min(img.height - cropHeight, facesCenterY - cropHeight / 2));

            const region: CropRegion = {
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight,
                score: 0.9,
            };

            const croppedDataUrl = cropImage(img, region);

            resolve({ region, croppedDataUrl });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
}
