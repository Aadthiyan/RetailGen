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

    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;

    // "Cover" scale for background (max of scales)
    const coverScale = Math.max(scaleX, scaleY);

    // "Contain" scale for content (min of scales) to ensure it fits
    const containScale = Math.min(scaleX, scaleY);

    // Process background
    if (json.backgroundImage) {
        // Reset scale
        json.backgroundImage.scaleX = (json.backgroundImage.scaleX || 1) * coverScale;
        json.backgroundImage.scaleY = (json.backgroundImage.scaleY || 1) * coverScale;

        // Re-center
        json.backgroundImage.left = targetWidth / 2;
        json.backgroundImage.top = targetHeight / 2;
        json.backgroundImage.originX = 'center';
        json.backgroundImage.originY = 'center';
    }

    // Process objects
    if (json.objects && Array.isArray(json.objects)) {
        json.objects.forEach((obj: any) => {
            // Skip if it's a guide or locked element (optional logic)

            // Calculate relative position in original
            const relX = (obj.left + (obj.width * obj.scaleX * (0.5 - (obj.originX === 'center' ? 0.5 : 0)))) / originalWidth;
            const relY = (obj.top + (obj.height * obj.scaleY * (0.5 - (obj.originY === 'center' ? 0.5 : 0)))) / originalHeight;

            // Apply scale
            // We use a slightly dampened scale for text to avoid it becoming huge on banners
            // or tiny on skyscrapers. We blend 'containScale' with 1.0 slightly if needed.
            // For now, straight containScale is usually best for consistency.
            obj.scaleX = (obj.scaleX || 1) * containScale;
            obj.scaleY = (obj.scaleY || 1) * containScale;

            // Reposition
            // We map the relative position to the new dimensions
            let newLeft = relX * targetWidth;
            let newTop = relY * targetHeight;

            // Adjust for origin
            if (obj.originX !== 'center') {
                newLeft -= (obj.width * obj.scaleX) / 2;
            }
            if (obj.originY !== 'center') {
                newTop -= (obj.height * obj.scaleY) / 2;
            }

            // Safe Zone Enforcement
            const safeMarginX = targetWidth * targetFormat.safeZone;
            const safeMarginY = targetHeight * targetFormat.safeZone;

            const objWidth = obj.width * obj.scaleX;
            const objHeight = obj.height * obj.scaleY;

            // Clamp to safe zone
            // Left edge
            if (newLeft < safeMarginX) newLeft = safeMarginX;
            // Right edge
            if (newLeft + objWidth > targetWidth - safeMarginX) newLeft = targetWidth - safeMarginX - objWidth;
            // Top edge
            if (newTop < safeMarginY) newTop = safeMarginY;
            // Bottom edge
            if (newTop + objHeight > targetHeight - safeMarginY) newTop = targetHeight - safeMarginY - objHeight;

            obj.left = newLeft;
            obj.top = newTop;
        });
    }

    return json;
}
