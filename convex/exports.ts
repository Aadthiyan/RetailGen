import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Log export event
export const logExport = mutation({
    args: {
        creativeId: v.id("creatives"),
        formats: v.array(v.string()),
        fileCount: v.number(),
        totalSize: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        await ctx.db.insert("exportHistory", {
            creativeId: args.creativeId,
            userId: identity.tokenIdentifier,
            formats: args.formats,
            fileCount: args.fileCount,
            totalSize: args.totalSize,
            status: args.status,
            timestamp: Date.now(),
        });
    },
});

// Get export history for a creative
export const getExportHistory = query({
    args: { creativeId: v.id("creatives") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("exportHistory")
            .filter((q) => q.eq(q.field("creativeId"), args.creativeId))
            .order("desc")
            .collect();
    },
});
