import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").take(500);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("leads").order("desc").paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("newLead"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("documentsPending"),
      v.literal("applicationFiled"),
      v.literal("decisionPending"),
      v.literal("closed"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listBySource = query({
  args: {
    source: v.union(
      v.literal("metaAds"),
      v.literal("manual"),
      v.literal("csv"),
      v.literal("whatsapp"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByAssignedTo = query({
  args: { assignedTo: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByAssignedToAndStatus = query({
  args: {
    assignedTo: v.id("users"),
    status: v.union(
      v.literal("newLead"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("documentsPending"),
      v.literal("applicationFiled"),
      v.literal("decisionPending"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_assignedTo_and_status", (q) =>
        q.eq("assignedTo", args.assignedTo).eq("status", args.status),
      )
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    visaType: v.optional(v.string()),
    country: v.optional(v.string()),
    budget: v.optional(v.number()),
    source: v.union(
      v.literal("metaAds"),
      v.literal("manual"),
      v.literal("csv"),
      v.literal("whatsapp"),
    ),
    status: v.optional(
      v.union(
        v.literal("newLead"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("documentsPending"),
        v.literal("applicationFiled"),
        v.literal("decisionPending"),
        v.literal("closed"),
      ),
    ),
    assignedTo: v.optional(v.id("users")),
    aiScore: v.optional(v.number()),
    ieltsScore: v.optional(v.number()),
    financialReadiness: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,
      status: args.status ?? "newLead",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    visaType: v.optional(v.string()),
    country: v.optional(v.string()),
    budget: v.optional(v.number()),
    source: v.optional(
      v.union(
        v.literal("metaAds"),
        v.literal("manual"),
        v.literal("csv"),
        v.literal("whatsapp"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("newLead"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("documentsPending"),
        v.literal("applicationFiled"),
        v.literal("decisionPending"),
        v.literal("closed"),
      ),
    ),
    assignedTo: v.optional(v.id("users")),
    aiScore: v.optional(v.number()),
    ieltsScore: v.optional(v.number()),
    financialReadiness: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("newLead"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("documentsPending"),
      v.literal("applicationFiled"),
      v.literal("decisionPending"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const assign = mutation({
  args: {
    id: v.id("leads"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { assignedTo: args.assignedTo });
  },
});

export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
