import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("escalated"),
);

const priorityValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("tasks").order("desc").paginate(args.paginationOpts);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").take(500);
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .take(100);
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .take(100);
  },
});

export const listByAssignedTo = query({
  args: { assignedTo: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: { status: statusValidator, paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByAssignedToAndStatus = query({
  args: {
    assignedTo: v.id("users"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo_and_status", (q) =>
        q.eq("assignedTo", args.assignedTo).eq("status", args.status),
      )
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    caseId: v.optional(v.id("cases")),
    leadId: v.optional(v.id("leads")),
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    status: v.optional(statusValidator),
    priority: v.optional(priorityValidator),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      status: args.status ?? "pending",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    caseId: v.optional(v.id("cases")),
    leadId: v.optional(v.id("leads")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    status: v.optional(statusValidator),
    priority: v.optional(priorityValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("tasks"), status: statusValidator },
  handler: async (ctx, args) => {
    const patch: { status: "pending" | "completed" | "escalated"; completedAt?: number } = {
      status: args.status,
    };
    if (args.status === "completed") patch.completedAt = Date.now();
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
