import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new asset record
export const create = mutation({
    args: {
        type: v.string(),
        url: v.string(),
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
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const assetId = await ctx.db.insert("assets", {
            userId: identity.tokenIdentifier,
            ...args,
            createdAt: Date.now(),
        });

        return assetId;
    },
});

// List assets for the current user
export const list = query({
    args: {
        type: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        let q = ctx.db
            .query("assets")
            .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier));

        if (args.type) {
            q = q.filter((q) => q.eq(q.field("type"), args.type));
        }

        return await q.order("desc").collect();
    },
});

// Delete an asset
export const deleteAsset = mutation({
    args: { id: v.id("assets") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const asset = await ctx.db.get(args.id);
        if (!asset) {
            throw new Error("Asset not found");
        }

        if (asset.userId !== identity.tokenIdentifier) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
