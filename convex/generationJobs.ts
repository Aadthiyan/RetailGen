import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a generation job
export const createGenerationJob = mutation({
    args: {
        creativeId: v.id("creatives"),
        productName: v.string(),
        style: v.string(),
        count: v.number(),
        format: v.object({
            width: v.number(),
            height: v.number(),
            name: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const jobId = await ctx.db.insert("generationJobs", {
            userId: identity.tokenIdentifier,
            creativeId: args.creativeId,
            type: "layout",
            status: "pending",
            params: {
                productName: args.productName,
                style: args.style,
                count: args.count,
                format: args.format,
            },
            results: [],
            progress: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return jobId;
    },
});

// Update job progress
export const updateJobProgress = mutation({
    args: {
        jobId: v.id("generationJobs"),
        progress: v.number(),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, {
            progress: args.progress,
            status: args.status || "processing",
            updatedAt: Date.now(),
        });
    },
});

// Add result to job
export const addJobResult = mutation({
    args: {
        jobId: v.id("generationJobs"),
        result: v.object({
            imageUrl: v.string(),
            prompt: v.string(),
            seed: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) throw new Error("Job not found");

        const results = [...(job.results || []), args.result];
        const progress = (results.length / (job.params as any).count) * 100;

        await ctx.db.patch(args.jobId, {
            results,
            progress,
            status: progress >= 100 ? "completed" : "processing",
            updatedAt: Date.now(),
        });
    },
});

// Mark job as failed
export const failJob = mutation({
    args: {
        jobId: v.id("generationJobs"),
        error: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, {
            status: "failed",
            error: args.error,
            updatedAt: Date.now(),
        });
    },
});

// Get job status
export const getJob = query({
    args: { jobId: v.id("generationJobs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const job = await ctx.db.get(args.jobId);
        if (!job) return null;

        // Authorization check
        if (job.userId !== identity.tokenIdentifier) return null;

        return job;
    },
});

// List jobs for a creative
export const listJobsForCreative = query({
    args: { creativeId: v.id("creatives") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("generationJobs")
            .filter((q) => q.eq(q.field("creativeId"), args.creativeId))
            .order("desc")
            .take(10);
    },
});
