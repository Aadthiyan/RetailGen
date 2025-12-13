import vision from '@google-cloud/vision';
import { createWorker } from 'tesseract.js';
import { ApiError } from '../api-error';

// Initialize Google Vision client (only works server-side with credentials)
const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export type TextExtractionResult = {
    text: string;
    confidence: number;
    blocks: Array<{
        text: string;
        boundingBox: any;
    }>;
};

/**
 * Extract text from image using Google Cloud Vision (Server-side)
 */
export async function extractTextGoogle(imageUrl: string): Promise<TextExtractionResult> {
    try {
        const [result] = await visionClient.textDetection(imageUrl);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return { text: '', confidence: 0, blocks: [] };
        }

        // First element is the full text
        const fullText = detections[0].description || '';

        // Remaining elements are blocks/words
        const blocks = detections.slice(1).map(d => ({
            text: d.description || '',
            boundingBox: d.boundingPoly,
        }));

        return {
            text: fullText,
            confidence: 0.95, // Google Vision doesn't always return confidence for full text
            blocks,
        };
    } catch (error) {
        console.error('Google Vision API Error:', error);
        throw new ApiError('Failed to extract text via Google Vision', 500, 'OCR_FAILED');
    }
}

/**
 * Extract text using Tesseract.js (Client-side or Server-side fallback)
 */
export async function extractTextTesseract(imageUrl: string): Promise<TextExtractionResult> {
    try {
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(imageUrl);
        await worker.terminate();

        // Extract words from the result data
        const blocks = (data as any).words?.map((w: any) => ({
            text: w.text,
            boundingBox: w.bbox,
        })) || [];

        return {
            text: data.text,
            confidence: (data.confidence as number) / 100,
            blocks,
        };
    } catch (error) {
        console.error('Tesseract Error:', error);
        throw new ApiError('Failed to extract text via Tesseract', 500, 'OCR_FAILED');
    }
}

/**
 * Detect logos in image using Google Cloud Vision
 */
export async function detectLogos(imageUrl: string) {
    try {
        const [result] = await visionClient.logoDetection(imageUrl);
        const logos = result.logoAnnotations;

        return logos?.map(logo => ({
            name: logo.description,
            score: logo.score,
            boundingBox: logo.boundingPoly,
        })) || [];
    } catch (error) {
        console.error('Logo Detection Error:', error);
        throw new ApiError('Failed to detect logos', 500, 'LOGO_DETECTION_FAILED');
    }
}
