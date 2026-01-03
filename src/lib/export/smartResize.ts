import { ExportFormat } from './formats';

/**
 * Smartly resize a canvas JSON to a new format
 */
export async function smartResizeJSON(
    originalJson: any,
    originalWidth: number,
    originalHeight: number,
    targetFormat: ExportFormat
): Promise<any> {
    // Deep copy to avoid mutating original
    const json = JSON.parse(JSON.stringify(originalJson));
    const targetWidth = targetFormat.width;
    const targetHeight = targetFormat.height;

    // Calculate scale factors
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;

    // Use uniform scaling to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);

    // Calculate centering offsets if aspect ratios don't match
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;
    const offsetX = (targetWidth - scaledWidth) / 2;
    const offsetY = (targetHeight - scaledHeight) / 2;

    // Process background image - use cover scaling
    if (json.backgroundImage) {
        const bgScale = Math.max(scaleX, scaleY); // Cover instead of contain
        json.backgroundImage.scaleX = (json.backgroundImage.scaleX || 1) * bgScale;
        json.backgroundImage.scaleY = (json.backgroundImage.scaleY || 1) * bgScale;

        // Center the background
        const bgWidth = (json.backgroundImage.width || originalWidth) * json.backgroundImage.scaleX;
        const bgHeight = (json.backgroundImage.height || originalHeight) * json.backgroundImage.scaleY;
        json.backgroundImage.left = (targetWidth - bgWidth) / 2;
        json.backgroundImage.top = (targetHeight - bgHeight) / 2;
    }

    // Process all objects with proportional scaling
    if (json.objects && Array.isArray(json.objects)) {
        json.objects.forEach((obj: any) => {
            // Scale the object
            obj.scaleX = (obj.scaleX || 1) * scale;
            obj.scaleY = (obj.scaleY || 1) * scale;

            // Scale position proportionally and add centering offset
            obj.left = (obj.left || 0) * scale + offsetX;
            obj.top = (obj.top || 0) * scale + offsetY;

            // Scale font size for text objects
            if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
                obj.fontSize = (obj.fontSize || 12) * scale;
            }
        });
    }

    return json;
}
