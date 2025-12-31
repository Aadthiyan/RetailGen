import { ExportFormat } from './formats';
import { smartResizeJSON } from './smartResize';

export interface ExportResult {
    format: ExportFormat;
    blob: Blob;
    url: string;
    filename: string;
}

export class ExportManager {
    private canvas: any = null;

    constructor() {
        // We don't initialize canvas here because we need the DOM element or just use virtual
    }

    /**
     * Generate exports for multiple formats
     */
    async generateExports(
        originalJson: any,
        originalWidth: number,
        originalHeight: number,
        formats: ExportFormat[],
        quality: number = 0.8
    ): Promise<ExportResult[]> {
        const results: ExportResult[] = [];
        const fabricModule = await import('fabric');
        const fabric = fabricModule.fabric || (fabricModule as any).default;

        // Create a temporary canvas element
        const canvasEl = document.createElement('canvas');
        this.canvas = new fabric.StaticCanvas(canvasEl);

        for (const format of formats) {
            try {
                // 1. Smart Resize JSON
                const resizedJson = await smartResizeJSON(
                    originalJson,
                    originalWidth,
                    originalHeight,
                    format
                );

                // 2. Set dimensions
                this.canvas.setDimensions({
                    width: format.width,
                    height: format.height,
                });

                // 3. Load JSON
                await new Promise<void>((resolve) => {
                    this.canvas!.loadFromJSON(resizedJson, () => {
                        // Render all
                        this.canvas!.renderAll();
                        resolve();
                    });
                });

                // 4. Determine format - use PNG for transparency support
                const exportFormat = 'image/png';
                const exportQuality = 1.0; // Max quality

                // 5. Export to Blob with transparency
                const blob = await this.canvasToBlob(canvasEl, exportFormat, exportQuality);

                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const extension = 'png'; // Always PNG for transparency
                    results.push({
                        format,
                        blob,
                        url,
                        filename: `creative-${format.id}-${Date.now()}.${extension}`,
                    });
                }
            } catch (error) {
                console.error(`Failed to export format ${format.name}:`, error);
            }
        }

        // Cleanup
        this.canvas.dispose();
        this.canvas = null;
        canvasEl.remove();

        return results;
    }

    private canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
        return new Promise((resolve) => {
            // For PNG, transparency is automatically preserved
            if (type === 'image/png') {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, type); // PNG doesn't use quality parameter
            } else {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, type, quality);
            }
        });
    }

    /**
     * Export single canvas with transparency
     */
    async exportWithTransparency(canvas: any, filename: string = 'export.png'): Promise<Blob | null> {
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2, // 2x resolution
            enableRetinaScaling: true,
        });

        // Convert data URL to blob
        const response = await fetch(dataURL);
        return await response.blob();
    }

    /**
     * Download a single result
     */
    downloadResult(result: ExportResult) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * Download all results (sequentially for now)
     */
    downloadAll(results: ExportResult[]) {
        results.forEach((result, index) => {
            setTimeout(() => {
                this.downloadResult(result);
            }, index * 500); // Stagger downloads
        });
    }
}

export const exportManager = new ExportManager();
