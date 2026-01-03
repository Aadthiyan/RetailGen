/**
 * Version History System
 * Track and restore previous versions of creatives
 */

export interface Version {
    id: string;
    creativeId: string;
    versionNumber: number;
    content: any; // Canvas JSON
    thumbnail?: string;
    message?: string;
    createdBy?: string;
    createdAt: number;
    size: number; // Size in bytes
}

export interface VersionComparison {
    version1: Version;
    version2: Version;
    differences: string[];
}

/**
 * Create a new version
 */
export function createVersion(
    creativeId: string,
    content: any,
    versionNumber: number,
    message?: string,
    thumbnail?: string
): Version {
    const contentString = JSON.stringify(content);

    return {
        id: generateVersionId(),
        creativeId,
        versionNumber,
        content,
        thumbnail,
        message: message || `Version ${versionNumber}`,
        createdAt: Date.now(),
        size: new Blob([contentString]).size,
    };
}

/**
 * Generate version ID
 */
function generateVersionId(): string {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get version history for a creative
 */
export function getVersionHistory(
    versions: Version[],
    creativeId: string
): Version[] {
    return versions
        .filter(v => v.creativeId === creativeId)
        .sort((a, b) => b.versionNumber - a.versionNumber);
}

/**
 * Get latest version
 */
export function getLatestVersion(versions: Version[]): Version | null {
    if (versions.length === 0) return null;
    return versions.reduce((latest, current) =>
        current.versionNumber > latest.versionNumber ? current : latest
    );
}

/**
 * Restore version
 */
export function restoreVersion(version: Version): any {
    return version.content;
}

/**
 * Compare two versions
 */
export function compareVersions(
    version1: Version,
    version2: Version
): VersionComparison {
    const differences: string[] = [];

    // Compare object counts
    const objects1 = version1.content.objects || [];
    const objects2 = version2.content.objects || [];

    if (objects1.length !== objects2.length) {
        differences.push(
            `Object count changed: ${objects1.length} → ${objects2.length}`
        );
    }

    // Compare object types
    const types1 = objects1.map((obj: any) => obj.type);
    const types2 = objects2.map((obj: any) => obj.type);

    const addedTypes = types2.filter((t: string) => !types1.includes(t));
    const removedTypes = types1.filter((t: string) => !types2.includes(t));

    if (addedTypes.length > 0) {
        differences.push(`Added: ${addedTypes.join(', ')}`);
    }

    if (removedTypes.length > 0) {
        differences.push(`Removed: ${removedTypes.join(', ')}`);
    }

    // Compare background
    if (version1.content.background !== version2.content.background) {
        differences.push('Background changed');
    }

    return {
        version1,
        version2,
        differences,
    };
}

/**
 * Get version size in human-readable format
 */
export function formatVersionSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get version age in human-readable format
 */
export function formatVersionAge(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

/**
 * Delete old versions (keep only last N)
 */
export function pruneVersions(
    versions: Version[],
    keepCount: number = 10
): Version[] {
    const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
    return sorted.slice(0, keepCount);
}

/**
 * Get version statistics
 */
export function getVersionStats(versions: Version[]) {
    if (versions.length === 0) {
        return {
            totalVersions: 0,
            totalSize: 0,
            averageSize: 0,
            oldestVersion: null,
            newestVersion: null,
        };
    }

    const totalSize = versions.reduce((sum, v) => sum + v.size, 0);
    const sorted = [...versions].sort((a, b) => a.createdAt - b.createdAt);

    return {
        totalVersions: versions.length,
        totalSize,
        averageSize: totalSize / versions.length,
        oldestVersion: sorted[0],
        newestVersion: sorted[sorted.length - 1],
    };
}

/**
 * Auto-save version (creates version if significant changes)
 */
export function shouldCreateVersion(
    lastVersion: Version | null,
    currentContent: any,
    minTimeDiff: number = 5 * 60 * 1000 // 5 minutes
): boolean {
    if (!lastVersion) return true;

    // Check time difference
    const timeDiff = Date.now() - lastVersion.createdAt;
    if (timeDiff < minTimeDiff) return false;

    // Check content difference
    const lastObjects = lastVersion.content.objects || [];
    const currentObjects = currentContent.objects || [];

    // Significant change if object count changed
    if (Math.abs(lastObjects.length - currentObjects.length) > 0) {
        return true;
    }

    // Significant change if background changed
    if (lastVersion.content.background !== currentContent.background) {
        return true;
    }

    return false;
}

/**
 * Create version from canvas
 */
export function createVersionFromCanvas(
    canvas: any,
    creativeId: string,
    versionNumber: number,
    message?: string
): Version {
    const content = canvas.toJSON(['name', 'selectable', 'evented']);
    const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.5, multiplier: 0.2 });

    return createVersion(creativeId, content, versionNumber, message, thumbnail);
}

/**
 * Get version diff summary
 */
export function getVersionDiffSummary(comparison: VersionComparison): string {
    if (comparison.differences.length === 0) {
        return 'No changes detected';
    }

    return comparison.differences.join(' • ');
}
