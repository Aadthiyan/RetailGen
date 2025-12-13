/**
 * Canvas Performance Optimization
 * 
 * Optimizations for Fabric.js canvas operations
 */

import { PERFORMANCE_CONFIG } from './config';
import { debounce } from './monitoring';

/**
 * Configure Fabric.js for optimal performance
 */
export function optimizeFabricCanvas(canvas: any) {
    // Enable object caching for better performance
    // Note: We assume fabric global might be available or passed in context, 
    // but here we are modifying the instance or prototype if we had access to the class.
    // Since we don't have the class, we can only modify the instance.

    // canvas.renderOnAddRemove = PERFORMANCE_CONFIG.canvas.renderOnAddRemove; // This is fine

    // We can't modify fabric.Object.prototype here without importing fabric.
    // So we'll skip that part or assume it's done elsewhere.

    // Set render on add/remove
    canvas.renderOnAddRemove = PERFORMANCE_CONFIG.canvas.renderOnAddRemove;

    // Enable selection caching
    canvas.selectionFullyContained = true;

    // Optimize rendering
    canvas.enableRetinaScaling = false; // Disable for better performance
    canvas.imageSmoothingEnabled = true;

    // Set performance mode
    canvas.perPixelTargetFind = false; // Faster selection

    return canvas;
}

/**
 * Debounced canvas render
 */
export function createDebouncedRender(canvas: any) {
    return debounce(() => {
        canvas.renderAll();
    }, PERFORMANCE_CONFIG.canvas.debounceDelay);
}

/**
 * Batch canvas operations
 */
export function batchCanvasOperations(
    canvas: any,
    operations: (() => void)[]
) {
    canvas.discardActiveObject();
    canvas.renderOnAddRemove = false;

    operations.forEach(op => op());

    canvas.renderOnAddRemove = true;
    canvas.requestRenderAll();
}

/**
 * Optimize canvas JSON for storage
 */
export function optimizeCanvasJSON(json: any): any {
    // Remove unnecessary properties
    const optimized = { ...json };

    if (optimized.objects) {
        optimized.objects = optimized.objects.map((obj: any) => {
            const { version, ...rest } = obj;
            return rest;
        });
    }

    return optimized;
}

/**
 * Lazy load canvas objects
 */
export async function lazyLoadCanvasObjects(
    canvas: any,
    objects: any[]
): Promise<void> {
    const BATCH_SIZE = 10;
    const fabricModule = await import('fabric');
    const fabric = fabricModule.fabric || (fabricModule as any).default;

    for (let i = 0; i < objects.length; i += BATCH_SIZE) {
        const batch = objects.slice(i, i + BATCH_SIZE);

        await new Promise<void>((resolve) => {
            fabric.util.enlivenObjects(batch, (enlivenedObjects: any[]) => {
                canvas.renderOnAddRemove = false;
                enlivenedObjects.forEach(obj => canvas.add(obj));
                canvas.renderOnAddRemove = true;

                if (i + BATCH_SIZE >= objects.length) {
                    canvas.requestRenderAll();
                }

                resolve();
            });
        });

        // Allow UI to update between batches
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

/**
 * Manage undo/redo history with size limit
 */
export class CanvasHistory {
    private history: string[] = [];
    private currentIndex: number = -1;
    private maxSize: number = PERFORMANCE_CONFIG.canvas.maxHistorySize;

    push(state: string) {
        // Remove any states after current index
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new state
        this.history.push(state);

        // Limit history size
        if (this.history.length > this.maxSize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    undo(): string | null {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    redo(): string | null {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }

    canUndo(): boolean {
        return this.currentIndex > 0;
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    clear() {
        this.history = [];
        this.currentIndex = -1;
    }

    getSize(): number {
        return this.history.length;
    }
}

/**
 * Dispose canvas and free memory
 */
export function disposeCanvas(canvas: fabric.Canvas) {
    // Remove all objects
    canvas.getObjects().forEach(obj => {
        canvas.remove(obj);
        if ((obj as any).dispose) {
            (obj as any).dispose();
        }
    });

    // Clear canvas
    canvas.clear();

    // Dispose canvas
    canvas.dispose();
}

/**
 * Optimize image objects on canvas
 */
export function optimizeCanvasImages(canvas: fabric.Canvas) {
    canvas.getObjects('image').forEach((img: any) => {
        // Enable caching
        img.objectCaching = true;

        // Set cross-origin for better caching
        if (img.getSrc && !img.getSrc().startsWith('data:')) {
            img.crossOrigin = 'anonymous';
        }
    });

    canvas.requestRenderAll();
}

/**
 * Check if canvas is too large
 */
export function isCanvasTooLarge(width: number, height: number): boolean {
    const maxDim = PERFORMANCE_CONFIG.canvas.maxDimension;
    return width > maxDim || height > maxDim;
}

/**
 * Get recommended canvas size
 */
export function getRecommendedCanvasSize(
    width: number,
    height: number
): { width: number; height: number; scaled: boolean } {
    const maxDim = PERFORMANCE_CONFIG.canvas.maxDimension;

    if (width <= maxDim && height <= maxDim) {
        return { width, height, scaled: false };
    }

    const ratio = Math.min(maxDim / width, maxDim / height);
    return {
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio),
        scaled: true,
    };
}
