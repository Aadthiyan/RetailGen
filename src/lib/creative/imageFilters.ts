/**
 * Image Filters
 * Apply Instagram-style filters to images
 */

export interface ImageFilter {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    apply: (canvas: HTMLCanvasElement) => void;
}

/**
 * Available filters
 */
export const IMAGE_FILTERS: ImageFilter[] = [
    {
        id: 'none',
        name: 'Original',
        description: 'No filter',
        apply: () => { }, // No-op
    },
    {
        id: 'grayscale',
        name: 'Grayscale',
        description: 'Black and white',
        apply: applyGrayscale,
    },
    {
        id: 'sepia',
        name: 'Sepia',
        description: 'Vintage brown tone',
        apply: applySepia,
    },
    {
        id: 'invert',
        name: 'Invert',
        description: 'Inverted colors',
        apply: applyInvert,
    },
    {
        id: 'brightness',
        name: 'Brighten',
        description: 'Increase brightness',
        apply: (canvas) => applyBrightness(canvas, 30),
    },
    {
        id: 'darken',
        name: 'Darken',
        description: 'Decrease brightness',
        apply: (canvas) => applyBrightness(canvas, -30),
    },
    {
        id: 'contrast',
        name: 'High Contrast',
        description: 'Increase contrast',
        apply: (canvas) => applyContrast(canvas, 40),
    },
    {
        id: 'saturate',
        name: 'Vibrant',
        description: 'Boost saturation',
        apply: (canvas) => applySaturation(canvas, 50),
    },
    {
        id: 'desaturate',
        name: 'Muted',
        description: 'Reduce saturation',
        apply: (canvas) => applySaturation(canvas, -30),
    },
    {
        id: 'vintage',
        name: 'Vintage',
        description: 'Retro film look',
        apply: applyVintage,
    },
    {
        id: 'cool',
        name: 'Cool',
        description: 'Blue tint',
        apply: applyCool,
    },
    {
        id: 'warm',
        name: 'Warm',
        description: 'Orange tint',
        apply: applyWarm,
    },
];

/**
 * Apply grayscale filter
 */
function applyGrayscale(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply sepia filter
 */
function applySepia(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply invert filter
 */
function applyInvert(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply brightness adjustment
 */
function applyBrightness(canvas: HTMLCanvasElement, amount: number): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + amount);
        data[i + 1] = clamp(data[i + 1] + amount);
        data[i + 2] = clamp(data[i + 2] + amount);
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply contrast adjustment
 */
function applyContrast(canvas: HTMLCanvasElement, amount: number): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const factor = (259 * (amount + 255)) / (255 * (259 - amount));

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128);
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply saturation adjustment
 */
function applySaturation(canvas: HTMLCanvasElement, amount: number): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const factor = (amount + 100) / 100;

    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

        data[i] = clamp(gray + factor * (data[i] - gray));
        data[i + 1] = clamp(gray + factor * (data[i + 1] - gray));
        data[i + 2] = clamp(gray + factor * (data[i + 2] - gray));
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply vintage filter
 */
function applyVintage(canvas: HTMLCanvasElement): void {
    // Sepia + slight desaturation + vignette effect
    applySepia(canvas);
    applySaturation(canvas, -20);
    applyBrightness(canvas, -10);
}

/**
 * Apply cool filter (blue tint)
 */
function applyCool(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] - 10); // Reduce red
        data[i + 2] = clamp(data[i + 2] + 20); // Increase blue
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply warm filter (orange tint)
 */
function applyWarm(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + 20); // Increase red
        data[i + 1] = clamp(data[i + 1] + 10); // Slight green
        data[i + 2] = clamp(data[i + 2] - 10); // Reduce blue
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Clamp value between 0 and 255
 */
function clamp(value: number): number {
    return Math.max(0, Math.min(255, value));
}

/**
 * Apply filter to Fabric.js image object
 */
export function applyFilterToFabricImage(
    fabricImage: any,
    filterId: string
): void {
    const filter = IMAGE_FILTERS.find(f => f.id === filterId);
    if (!filter || filterId === 'none') {
        fabricImage.filters = [];
        fabricImage.applyFilters();
        return;
    }

    // Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = fabricImage.width;
    tempCanvas.height = fabricImage.height;

    const ctx = tempCanvas.getContext('2d')!;
    ctx.drawImage(fabricImage.getElement(), 0, 0);

    // Apply filter
    filter.apply(tempCanvas);

    // Update fabric image
    const newImg = new Image();
    newImg.onload = () => {
        fabricImage.setElement(newImg);
        fabricImage.canvas?.renderAll();
    };
    newImg.src = tempCanvas.toDataURL();
}

/**
 * Get filter preview
 */
export function getFilterPreview(imageUrl: string, filterId: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 100; // Preview size
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, size, size);

            const filter = IMAGE_FILTERS.find(f => f.id === filterId);
            if (filter && filterId !== 'none') {
                filter.apply(canvas);
            }

            resolve(canvas.toDataURL());
        };

        img.onerror = () => {
            resolve('');
        };

        img.src = imageUrl;
    });
}
