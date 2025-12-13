import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // User profile and preferences
    users: defineTable({
        tokenIdentifier: v.string(), // Clerk ID
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        preferences: v.optional(
            v.object({
                theme: v.optional(v.string()),
                defaultBrandColors: v.optional(v.array(v.string())),
            })
        ),
        subscription: v.optional(
            v.object({
                plan: v.string(),
                status: v.string(),
                validUntil: v.optional(v.number()),
            })
        ),
    }).index("by_token", ["tokenIdentifier"]),

    // Uploaded assets (images, logos)
    assets: defineTable({
        userId: v.string(), // Clerk ID or reference to users table
        type: v.string(), // "image", "logo", "font", etc.
        url: v.string(), // Cloudinary URL
        thumbnailUrl: v.optional(v.string()),
        name: v.string(),
        size: v.number(),
        dimensions: v.optional(
            v.object({
                width: v.number(),
                height: v.number(),
            })
        ),
        metadata: v.optional(
            v.object({
                colors: v.optional(v.array(v.string())),
                format: v.optional(v.string()),
                hasTransparentBackground: v.optional(v.boolean()),
            })
        ),
        tags: v.optional(v.array(v.string())),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Creative projects
    creatives: defineTable({
        userId: v.string(),
        name: v.string(),
        status: v.string(), // "draft", "completed", "archived"
        dimensions: v.object({
            width: v.number(),
            height: v.number(),
        }),
        format: v.string(), // "instagram-story", "facebook-feed", etc.
        content: v.any(), // Fabric.js JSON object or similar
        thumbnailUrl: v.optional(v.string()),
        version: v.number(),
        lastModified: v.number(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Compliance validation results
    complianceResults: defineTable({
        creativeId: v.id("creatives"),
        status: v.string(), // "pass", "fail", "warning"
        score: v.number(),
        violations: v.array(
            v.object({
                ruleId: v.string(),
                severity: v.string(), // "error", "warning"
                message: v.string(),
                elementId: v.optional(v.string()),
                suggestion: v.optional(v.string()),
            })
        ),
        checkedAt: v.number(),
    }).index("by_creative", ["creativeId"]),

    // Templates for quick creation
    templates: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        thumbnailUrl: v.string(),
        content: v.any(), // Fabric.js JSON
        category: v.string(),
        tags: v.array(v.string()),
        isPublic: v.boolean(),
        creatorId: v.optional(v.string()),
    }),

    // Background export jobs
    exportJobs: defineTable({
        userId: v.string(),
        creativeId: v.id("creatives"),
        status: v.string(), // "pending", "processing", "completed", "failed"
        formats: v.array(v.string()),
        resultUrls: v.optional(v.array(v.string())),
        error: v.optional(v.string()),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

    // AI generation jobs
    generationJobs: defineTable({
        userId: v.string(),
        creativeId: v.id("creatives"),
        type: v.string(), // "layout", "copy", "variation"
        status: v.string(), // "pending", "processing", "completed", "failed"
        params: v.any(), // Generation parameters
        results: v.array(v.any()), // Generated results
        progress: v.number(), // 0-100
        error: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_creative", ["creativeId"]),

    // Compliance rules
    complianceRules: defineTable({
        ruleId: v.string(), // Unique rule identifier
        name: v.string(),
        description: v.string(),
        category: v.string(), // "logo", "text", "color", "layout", "disclaimer", "general"
        severity: v.string(), // "error", "warning", "info"
        retailer: v.string(), // "tesco", "sainsburys", "general"
        version: v.string(),
        enabled: v.boolean(),
        validator: v.object({
            type: v.string(),
            params: v.any(),
        }),
        tags: v.array(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_retailer", ["retailer"]).index("by_rule_id", ["ruleId"]),

    // Compliance audit log
    complianceAudit: defineTable({
        creativeId: v.id("creatives"),
        userId: v.string(),
        action: v.string(), // "check", "fix", "certify", "override"
        details: v.any(),
        timestamp: v.number(),
    }).index("by_creative", ["creativeId"]),

    // Compliance certificates
    complianceCertificates: defineTable({
        certificateId: v.string(),
        creativeId: v.id("creatives"),
        userId: v.string(),
        score: v.number(),
        retailer: v.string(),
        snapshot: v.string(), // JSON string of creative state at certification
        signature: v.string(),
        issuedAt: v.number(),
    }).index("by_creative", ["creativeId"]),

    // Export history
    exportHistory: defineTable({
        creativeId: v.id("creatives"),
        userId: v.string(),
        formats: v.array(v.string()), // List of format IDs (e.g., "fb-feed")
        fileCount: v.number(),
        totalSize: v.number(), // in bytes
        status: v.string(), // "completed", "failed"
        timestamp: v.number(),
    }).index("by_creative", ["creativeId"]),
});
