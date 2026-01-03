/**
 * Bulk Creative Generation Engine
 * Generates multiple creatives from CSV data
 */

import { fabric } from 'fabric';

export interface BulkCreativeData {
    productName: string;
    price?: string;
    imageUrl?: string;
    campaignType?: string;
    headline?: string;
    bodyCopy?: string;
    cta?: string;
    backgroundColor?: string;
    textColor?: string;
}

export interface BulkGenerationOptions {
    templateId?: string;
    format?: string; // '1080x1080', '1080x1920', etc.
    autoCompliance?: boolean;
    exportFormats?: string[]; // ['facebook', 'instagram', 'linkedin']
}

export interface BulkGenerationProgress {
    total: number;
    completed: number;
    current: string;
    status: 'processing' | 'complete' | 'error';
    errors: string[];
}

export interface BulkGenerationResult {
    success: boolean;
    totalGenerated: number;
    totalFailed: number;
    creatives: GeneratedCreative[];
    errors: { row: number; error: string }[];
    zipUrl?: string;
}

export interface GeneratedCreative {
    productName: string;
    canvasJSON: any;
    thumbnail?: string;
    formats?: { [key: string]: string }; // format name -> data URL
}

export class BulkCreativeGenerator {
    private canvas: fabric.Canvas | null = null;
    private progressCallback?: (progress: BulkGenerationProgress) => void;

    constructor(progressCallback?: (progress: BulkGenerationProgress) => void) {
        this.progressCallback = progressCallback;
    }

    /**
     * Parse CSV file to data array
     */
    async parseCSV(file: File): Promise<BulkCreativeData[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split('\n').filter(line => line.trim());

                    if (lines.length < 2) {
                        throw new Error('CSV must have at least a header row and one data row');
                    }

                    // Parse header
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                    // Parse data rows
                    const data: BulkCreativeData[] = [];
                    for (let i = 1; i < lines.length; i++) {
                        const values = this.parseCSVLine(lines[i]);
                        const row: any = {};

                        headers.forEach((header, index) => {
                            const value = values[index]?.trim();
                            if (value) {
                                // Map common header variations
                                const normalizedHeader = this.normalizeHeader(header);
                                row[normalizedHeader] = value;
                            }
                        });

                        if (row.productName) {
                            data.push(row as BulkCreativeData);
                        }
                    }

                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read CSV file'));
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV line handling quoted values
     */
    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    /**
     * Normalize header names
     */
    private normalizeHeader(header: string): string {
        const mappings: Record<string, string> = {
            'product': 'productName',
            'product name': 'productName',
            'name': 'productName',
            'title': 'productName',
            'price': 'price',
            'cost': 'price',
            'amount': 'price',
            'image': 'imageUrl',
            'image url': 'imageUrl',
            'photo': 'imageUrl',
            'campaign': 'campaignType',
            'campaign type': 'campaignType',
            'type': 'campaignType',
            'headline': 'headline',
            'title text': 'headline',
            'body': 'bodyCopy',
            'body copy': 'bodyCopy',
            'description': 'bodyCopy',
            'cta': 'cta',
            'call to action': 'cta',
            'button': 'cta',
            'background': 'backgroundColor',
            'bg color': 'backgroundColor',
            'text color': 'textColor',
            'color': 'textColor',
        };

        return mappings[header] || header;
    }

    /**
     * Generate creatives from data array
     */
    async generateBulk(
        data: BulkCreativeData[],
        options: BulkGenerationOptions = {}
    ): Promise<BulkGenerationResult> {
        const results: GeneratedCreative[] = [];
        const errors: { row: number; error: string }[] = [];

        // Create temporary canvas
        this.canvas = new fabric.Canvas(null, {
            width: 1080,
            height: 1080,
        });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            this.updateProgress({
                total: data.length,
                completed: i,
                current: row.productName,
                status: 'processing',
                errors: errors.map(e => e.error),
            });

            try {
                const creative = await this.generateSingleCreative(row, options);
                results.push(creative);
            } catch (error) {
                errors.push({
                    row: i + 2, // +2 because row 1 is header, array is 0-indexed
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }

            // Small delay to prevent overwhelming the browser
            await this.delay(100);
        }

        this.updateProgress({
            total: data.length,
            completed: data.length,
            current: 'Complete',
            status: 'complete',
            errors: errors.map(e => e.error),
        });

        return {
            success: errors.length === 0,
            totalGenerated: results.length,
            totalFailed: errors.length,
            creatives: results,
            errors,
        };
    }

    /**
     * Generate single creative from data
     */
    private async generateSingleCreative(
        data: BulkCreativeData,
        options: BulkGenerationOptions
    ): Promise<GeneratedCreative> {
        if (!this.canvas) {
            throw new Error('Canvas not initialized');
        }

        // Clear canvas
        this.canvas.clear();

        // Set background color
        if (data.backgroundColor) {
            this.canvas.backgroundColor = data.backgroundColor;
        } else {
            this.canvas.backgroundColor = '#FFFFFF';
        }

        const textColor = data.textColor || '#000000';

        // Add product image if provided
        if (data.imageUrl) {
            await this.addImage(data.imageUrl, 540, 400, 600, 600);
        }

        // Add headline
        const headline = data.headline || data.productName;
        this.addText(headline, 540, 150, {
            fontSize: 48,
            fontWeight: 'bold',
            fill: textColor,
            name: 'headline',
        });

        // Add price if provided
        if (data.price) {
            this.addText(data.price, 540, 850, {
                fontSize: 64,
                fontWeight: 'bold',
                fill: '#EE1C25',
                name: 'price',
            });
        }

        // Add body copy if provided
        if (data.bodyCopy) {
            this.addText(data.bodyCopy, 540, 950, {
                fontSize: 18,
                fill: textColor,
                name: 'body',
                textAlign: 'center',
                width: 900,
            });
        }

        // Add CTA if provided
        if (data.cta) {
            this.addText(data.cta, 540, 1000, {
                fontSize: 24,
                fontWeight: 'bold',
                fill: '#FFFFFF',
                backgroundColor: '#00539F',
                name: 'cta',
            });
        }

        // Get canvas JSON
        const canvasJSON = this.canvas.toJSON(['name']);

        // Generate thumbnail
        const thumbnail = this.canvas.toDataURL({
            format: 'png',
            quality: 0.8,
            multiplier: 0.3, // Small thumbnail
        });

        return {
            productName: data.productName,
            canvasJSON,
            thumbnail,
        };
    }

    /**
     * Add image to canvas
     */
    private async addImage(
        url: string,
        left: number,
        top: number,
        width: number,
        height: number
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(
                url,
                (img) => {
                    if (!img || !this.canvas) {
                        reject(new Error('Failed to load image'));
                        return;
                    }

                    img.set({
                        left,
                        top,
                        originX: 'center',
                        originY: 'center',
                        name: 'product-image',
                    });

                    // Scale to fit
                    const scaleX = width / (img.width || 1);
                    const scaleY = height / (img.height || 1);
                    const scale = Math.min(scaleX, scaleY);

                    img.scale(scale);

                    this.canvas.add(img);
                    resolve();
                },
                { crossOrigin: 'anonymous' }
            );
        });
    }

    /**
     * Add text to canvas
     */
    private addText(
        text: string,
        left: number,
        top: number,
        options: any = {}
    ): void {
        if (!this.canvas) return;

        const textObj = new fabric.IText(text, {
            left,
            top,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Inter',
            fontSize: 24,
            fill: '#000000',
            ...options,
        });

        this.canvas.add(textObj);
    }

    /**
     * Update progress
     */
    private updateProgress(progress: BulkGenerationProgress): void {
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Export all creatives as ZIP
     */
    async exportAsZip(creatives: GeneratedCreative[]): Promise<Blob> {
        // This would use JSZip library
        // For now, return a placeholder
        throw new Error('ZIP export not yet implemented. Use individual exports.');
    }

    /**
     * Cleanup
     */
    dispose(): void {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
    }
}

/**
 * Utility: Generate sample CSV template
 */
export function generateSampleCSV(): string {
    return `Product Name,Price,Image URL,Campaign Type,Headline,Body Copy,CTA,Background Color,Text Color
Premium Coffee Maker,$49.99,https://example.com/coffee.jpg,sale,Wake Up to Perfection,Brew barista-quality coffee at home,Shop Now,#FFFFFF,#000000
Smart Watch,$199.99,https://example.com/watch.jpg,new_product,Time Reimagined,Track your fitness and stay connected,Get Yours,#000000,#FFFFFF
Wireless Headphones,$79.99,https://example.com/headphones.jpg,promotion,Sound Like Never Before,Premium audio quality meets comfort,Buy Now,#00539F,#FFFFFF`;
}

/**
 * Utility: Validate CSV data
 */
export function validateCSVData(data: BulkCreativeData[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (data.length === 0) {
        errors.push('No data rows found');
    }

    data.forEach((row, index) => {
        if (!row.productName || row.productName.trim() === '') {
            errors.push(`Row ${index + 2}: Product Name is required`);
        }

        if (row.imageUrl && !isValidUrl(row.imageUrl)) {
            errors.push(`Row ${index + 2}: Invalid image URL`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
