/**
 * Compliance Rules Engine - Type Definitions
 */

export type RuleSeverity = 'error' | 'warning' | 'info';
export type RuleCategory = 'logo' | 'text' | 'color' | 'layout' | 'disclaimer' | 'general';

export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    category: RuleCategory;
    severity: RuleSeverity;
    retailer: string; // e.g., "tesco", "sainsburys", "general"
    version: string;
    enabled: boolean;

    // Validation configuration
    validator: {
        type: string; // e.g., "logo_size", "text_minimum", "color_restriction"
        params: Record<string, any>;
    };

    // Metadata
    createdAt: number;
    updatedAt: number;
    tags?: string[];
}

export interface ValidationResult {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    severity: RuleSeverity;
    category: RuleCategory;
    message: string;
    suggestion?: string;
    affectedElements?: string[]; // IDs of canvas objects
    details?: Record<string, any>;
}

export interface ComplianceReport {
    creativeId: string;
    timestamp: number;
    overallStatus: 'pass' | 'fail' | 'warning';
    score: number; // 0-100
    results: ValidationResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
    };
}

/**
 * Tesco-specific compliance rules based on specification
 */
export const TESCO_RULES: Partial<ComplianceRule>[] = [
    {
        id: 'tesco-logo-size',
        name: 'Logo Minimum Size',
        description: 'Tesco logo must be at least 15mm wide',
        category: 'logo',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'logo_minimum_size',
            params: {
                minWidth: 15, // mm
                logoIdentifier: 'tesco-logo',
            },
        },
    },
    {
        id: 'tesco-logo-clearspace',
        name: 'Logo Clear Space',
        description: 'Minimum clear space around logo must be maintained',
        category: 'logo',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'logo_clearspace',
            params: {
                minClearSpace: 5, // mm
                logoIdentifier: 'tesco-logo',
            },
        },
    },
    {
        id: 'tesco-text-minimum',
        name: 'Minimum Text Size',
        description: 'Body text must be at least 6pt',
        category: 'text',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'text_minimum_size',
            params: {
                minSize: 6, // pt
                excludeTypes: ['headline', 'disclaimer'],
            },
        },
    },
    {
        id: 'tesco-headline-minimum',
        name: 'Headline Minimum Size',
        description: 'Headlines must be at least 12pt',
        category: 'text',
        severity: 'warning',
        retailer: 'tesco',
        validator: {
            type: 'text_minimum_size',
            params: {
                minSize: 12, // pt
                onlyTypes: ['headline'],
            },
        },
    },
    {
        id: 'tesco-disclaimer-size',
        name: 'Disclaimer Text Size',
        description: 'Disclaimer text must be at least 4pt',
        category: 'disclaimer',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'text_minimum_size',
            params: {
                minSize: 4, // pt
                onlyTypes: ['disclaimer'],
            },
        },
    },
    {
        id: 'tesco-color-brand',
        name: 'Brand Color Usage',
        description: 'Must use approved Tesco brand colors',
        category: 'color',
        severity: 'warning',
        retailer: 'tesco',
        validator: {
            type: 'color_restriction',
            params: {
                approvedColors: ['#00539F', '#EE1C2E', '#FFFFFF', '#000000'], // Tesco blue, red, white, black
                tolerance: 10, // Color difference tolerance
            },
        },
    },
    {
        id: 'tesco-safe-zone',
        name: 'Safe Zone Compliance',
        description: 'Critical elements must be within safe zone',
        category: 'layout',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'safe_zone',
            params: {
                margin: 5, // mm from edge
                criticalElements: ['logo', 'headline', 'price'],
            },
        },
    },
    {
        id: 'tesco-disclaimer-position',
        name: 'Disclaimer Placement',
        description: 'Disclaimer must be at bottom of creative',
        category: 'disclaimer',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'element_position',
            params: {
                elementType: 'disclaimer',
                position: 'bottom',
                maxDistanceFromEdge: 10, // mm
            },
        },
    },
    {
        id: 'tesco-price-prominence',
        name: 'Price Prominence',
        description: 'Price must be clearly visible and prominent',
        category: 'text',
        severity: 'warning',
        retailer: 'tesco',
        validator: {
            type: 'text_prominence',
            params: {
                elementType: 'price',
                minSize: 18, // pt
                minContrast: 4.5, // WCAG AA
            },
        },
    },
    {
        id: 'tesco-logo-placement',
        name: 'Logo Placement',
        description: 'Logo should be in top-left or top-right corner',
        category: 'logo',
        severity: 'warning',
        retailer: 'tesco',
        validator: {
            type: 'logo_placement',
            params: {
                preferredPositions: ['top-left', 'top-right'],
                maxDistanceFromCorner: 20, // mm
            },
        },
    },
    {
        id: 'tesco-contrast-ratio',
        name: 'Text Contrast Ratio',
        description: 'Text must have sufficient contrast with background',
        category: 'text',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'contrast_ratio',
            params: {
                minRatio: 4.5, // WCAG AA
                applyToAll: true,
            },
        },
    },
    {
        id: 'tesco-max-fonts',
        name: 'Font Limit',
        description: 'Maximum of 2 font families allowed',
        category: 'text',
        severity: 'warning',
        retailer: 'tesco',
        validator: {
            type: 'font_limit',
            params: {
                maxFonts: 2,
            },
        },
    },
    {
        id: 'tesco-image-quality',
        name: 'Image Resolution',
        description: 'Images must be at least 150 DPI',
        category: 'general',
        severity: 'warning',
        retailer: 'tesco',
        validator: {
            type: 'image_quality',
            params: {
                minDPI: 150,
            },
        },
    },
    {
        id: 'tesco-mandatory-elements',
        name: 'Mandatory Elements',
        description: 'Creative must include logo, price, and disclaimer',
        category: 'general',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'mandatory_elements',
            params: {
                required: ['logo', 'price', 'disclaimer'],
            },
        },
    },
    {
        id: 'tesco-aspect-ratio',
        name: 'Aspect Ratio',
        description: 'Creative must match approved aspect ratios',
        category: 'layout',
        severity: 'error',
        retailer: 'tesco',
        validator: {
            type: 'aspect_ratio',
            params: {
                approved: ['1:1', '16:9', '4:5', '9:16'],
                tolerance: 0.05,
            },
        },
    },
];
