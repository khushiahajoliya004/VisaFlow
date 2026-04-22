import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const stepValidator = v.object({
  order: v.number(),
  action: v.string(),
  config: v.optional(v.string()),
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workflows").order("desc").take(200);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("workflows").order("desc").paginate(args.paginationOpts);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    trigger: v.string(),
    steps: v.array(stepValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workflows", {
      ...args,
      isActive: args.isActive ?? true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("workflows"),
    name: v.optional(v.string()),
    trigger: v.optional(v.string()),
    steps: v.optional(v.array(stepValidator)),
    isActive: v.optional(v.boolean()),
    successRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const toggle = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.id);
    if (!workflow) throw new Error("Workflow not found");
    await ctx.db.patch(args.id, { isActive: !workflow.isActive });
  },
});

export const updateLastRun = mutation({
  args: {
    id: v.id("workflows"),
    successRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastRun: Date.now(),
      ...(args.successRate !== undefined && { successRate: args.successRate }),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
