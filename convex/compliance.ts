import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update compliance rule
export const upsertRule = mutation({
    args: {
        id: v.string(),
        name: v.string(),
        description: v.string(),
        category: v.string(),
        severity: v.string(),
        retailer: v.string(),
        version: v.string(),
        enabled: v.boolean(),
        validator: v.object({
            type: v.string(),
            params: v.any(),
        }),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Check if rule exists
        const existing = await ctx.db
            .query("complianceRules")
            .filter((q) => q.eq(q.field("ruleId"), args.id))
            .first();

        const ruleData = {
            ruleId: args.id,
            name: args.name,
            description: args.description,
            category: args.category,
            severity: args.severity,
            retailer: args.retailer,
            version: args.version,
            enabled: args.enabled,
            validator: args.validator,
            tags: args.tags || [],
            updatedAt: Date.now(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, ruleData);
            return existing._id;
        } else {
            return await ctx.db.insert("complianceRules", {
                ...ruleData,
                createdAt: Date.now(),
            });
        }
    },
});

// Get all rules for a retailer
export const getRulesByRetailer = query({
    args: { retailer: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("complianceRules")
            .filter((q) => q.eq(q.field("retailer"), args.retailer))
            .filter((q) => q.eq(q.field("enabled"), true))
            .collect();
    },
});

// Get all enabled rules
export const getAllRules = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("complianceRules")
            .filter((q) => q.eq(q.field("enabled"), true))
            .collect();
    },
});

// Get rule by ID
export const getRule = query({
    args: { ruleId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("complianceRules")
            .filter((q) => q.eq(q.field("ruleId"), args.ruleId))
            .first();
    },
});

// Disable a rule
export const disableRule = mutation({
    args: { ruleId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const rule = await ctx.db
            .query("complianceRules")
            .filter((q) => q.eq(q.field("ruleId"), args.ruleId))
            .first();

        if (!rule) throw new Error("Rule not found");

        await ctx.db.patch(rule._id, {
            enabled: false,
            updatedAt: Date.now(),
        });
    },
});

// Store compliance result
export const storeComplianceResult = mutation({
    args: {
        creativeId: v.id("creatives"),
        status: v.string(),
        score: v.number(),
        violations: v.array(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        return await ctx.db.insert("complianceResults", {
            creativeId: args.creativeId,
            status: args.status,
            score: args.score,
            violations: args.violations,
            checkedAt: Date.now(),
        });
    },
});

// Get latest compliance result for creative
export const getLatestResult = query({
    args: { creativeId: v.id("creatives") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("complianceResults")
            .filter((q) => q.eq(q.field("creativeId"), args.creativeId))
            .order("desc")
            .first();
    },
});

// Log audit entry
export const logAuditEntry = mutation({
    args: {
        creativeId: v.id("creatives"),
        action: v.string(),
        details: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        await ctx.db.insert("complianceAudit", {
            creativeId: args.creativeId,
            userId: identity.tokenIdentifier,
            action: args.action,
            details: args.details,
            timestamp: Date.now(),
        });
    },
});

// Issue certificate
export const issueCertificate = mutation({
    args: {
        certificateId: v.string(),
        creativeId: v.id("creatives"),
        score: v.number(),
        retailer: v.string(),
        snapshot: v.string(),
        signature: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        await ctx.db.insert("complianceCertificates", {
            certificateId: args.certificateId,
            creativeId: args.creativeId,
            userId: identity.tokenIdentifier,
            score: args.score,
            retailer: args.retailer,
            snapshot: args.snapshot,
            signature: args.signature,
            issuedAt: Date.now(),
        });
    },
});

// Get audit trail
export const getAuditTrail = query({
    args: { creativeId: v.id("creatives") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("complianceAudit")
            .filter((q) => q.eq(q.field("creativeId"), args.creativeId))
            .order("desc")
            .collect();
    },
});

// Get certificate
export const getCertificate = query({
    args: { creativeId: v.id("creatives") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("complianceCertificates")
            .filter((q) => q.eq(q.field("creativeId"), args.creativeId))
            .order("desc")
            .first();
    },
});
