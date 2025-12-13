import { SECURITY_CONFIG, MAX_FILE_SIZES, ALLOWED_EXTENSIONS } from './config';
import { sanitizeFilename, isValidFileExtension, isValidMimeType } from './validation';

export interface FileValidationResult {
    valid: boolean;
    error?: string;
    sanitizedFilename?: string;
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > SECURITY_CONFIG.fileUpload.maxSize) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${SECURITY_CONFIG.fileUpload.maxSize / 1024 / 1024}MB`,
        };
    }

    // Check MIME type
    if (!isValidMimeType(file.type, SECURITY_CONFIG.fileUpload.allowedMimeTypes)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${SECURITY_CONFIG.fileUpload.allowedMimeTypes.join(', ')}`,
        };
    }

    // Check file extension
    if (!isValidFileExtension(file.name, SECURITY_CONFIG.fileUpload.allowedExtensions)) {
        return {
            valid: false,
            error: `File extension is not allowed. Allowed extensions: ${SECURITY_CONFIG.fileUpload.allowedExtensions.join(', ')}`,
        };
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);

    if (!sanitizedFilename) {
        return {
            valid: false,
            error: 'Invalid filename',
        };
    }

    return {
        valid: true,
        sanitizedFilename,
    };
}

/**
 * Validate file buffer (for server-side validation)
 */
export async function validateFileBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string
): Promise<FileValidationResult> {
    // Check file size
    if (buffer.length > SECURITY_CONFIG.fileUpload.maxSize) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size`,
        };
    }

    // Verify MIME type matches file signature
    const actualMimeType = detectMimeType(buffer);
    if (actualMimeType && actualMimeType !== mimeType) {
        return {
            valid: false,
            error: 'File type mismatch. The file content does not match the declared type.',
        };
    }

    // Check for malicious content
    if (containsMaliciousContent(buffer)) {
        return {
            valid: false,
            error: 'File contains potentially malicious content',
        };
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);

    return {
        valid: true,
        sanitizedFilename,
    };
}

/**
 * Detect MIME type from file signature (magic numbers)
 */
function detectMimeType(buffer: Buffer): string | null {
    const signatures: Record<string, { offset: number; signature: number[] }> = {
        'image/jpeg': { offset: 0, signature: [0xff, 0xd8, 0xff] },
        'image/png': { offset: 0, signature: [0x89, 0x50, 0x4e, 0x47] },
        'image/webp': { offset: 8, signature: [0x57, 0x45, 0x42, 0x50] },
    };

    for (const [mimeType, { offset, signature }] of Object.entries(signatures)) {
        let match = true;
        for (let i = 0; i < signature.length; i++) {
            if (buffer[offset + i] !== signature[i]) {
                match = false;
                break;
            }
        }
        if (match) return mimeType;
    }

    return null;
}

/**
 * Check for malicious content in file
 */
function containsMaliciousContent(buffer: Buffer): boolean {
    const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000));

    // Check for script tags
    if (/<script/i.test(content)) return true;

    // Check for PHP tags
    if (/<\?php/i.test(content)) return true;

    // Check for executable signatures
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) return true; // MZ (Windows executable)

    return false;
}

/**
 * Generate secure random filename
 */
export function generateSecureFilename(originalFilename: string): string {
    const ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}${ext}`;
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
    file: File,
    maxWidth: number = 4096,
    maxHeight: number = 4096
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            if (img.width > maxWidth || img.height > maxHeight) {
                resolve({
                    valid: false,
                    error: `Image dimensions exceed maximum allowed size of ${maxWidth}x${maxHeight}`,
                });
            } else {
                resolve({
                    valid: true,
                    width: img.width,
                    height: img.height,
                });
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                valid: false,
                error: 'Failed to load image',
            });
        };

        img.src = url;
    });
}
