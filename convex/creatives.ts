import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new creative
export const create = mutation({
    args: {
        name: v.string(),
        format: v.string(),
        dimensions: v.object({
            width: v.number(),
            height: v.number(),
        }),
        content: v.any(), // Initial empty canvas or template
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const creativeId = await ctx.db.insert("creatives", {
            userId: identity.tokenIdentifier,
            name: args.name,
            status: "draft",
            format: args.format,
            dimensions: args.dimensions,
            content: args.content,
            version: 1,
            lastModified: Date.now(),
            createdAt: Date.now(),
        });

        return creativeId;
    },
});

// Update an existing creative (Autosave)
export const update = mutation({
    args: {
        id: v.id("creatives"),
        content: v.optional(v.any()),
        name: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const creative = await ctx.db.get(args.id);
        if (!creative) throw new Error("Creative not found");
        if (creative.userId !== identity.tokenIdentifier) throw new Error("Unauthorized");

        // Extract id from args to avoid passing it to patch
        const { id, ...updateData } = args;

        await ctx.db.patch(id, {
            ...updateData,
            lastModified: Date.now(),
            version: creative.version + 1,
        });
    },
});

// Get a single creative
export const get = query({
    args: { id: v.id("creatives") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const creative = await ctx.db.get(args.id);
        if (!creative) return null;

        // Simple authorization check
        if (creative.userId !== identity.tokenIdentifier) return null;

        return creative;
    },
});

// List all creatives for the user
export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("creatives")
            .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
            .order("desc")
            .collect();
    },
});

// Delete a creative
export const deleteCreative = mutation({
    args: { id: v.id("creatives") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const creative = await ctx.db.get(args.id);
        if (!creative) throw new Error("Creative not found");
        if (creative.userId !== identity.tokenIdentifier) throw new Error("Unauthorized");

        await ctx.db.delete(args.id);
    },
});
