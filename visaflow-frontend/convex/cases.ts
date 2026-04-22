import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const caseStatusValidator = v.union(
  v.literal("In Progress"),
  v.literal("Documents Pending"),
  v.literal("Application Filed"),
  v.literal("Decision Pending"),
  v.literal("Closed"),
  v.literal("Escalated"),
);

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cases").order("desc").take(500);
  },
});

export const getById = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("cases").order("desc").paginate(args.paginationOpts);
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .take(50);
  },
});

export const listByCounsellor = query({
  args: {
    counsellorId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_counsellorId", (q) =>
        q.eq("counsellorId", args.counsellorId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: { status: caseStatusValidator, paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByBranch = query({
  args: { branch: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_branch", (q) => q.eq("branch", args.branch))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCaseNumber = query({
  args: { caseNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_caseNumber", (q) => q.eq("caseNumber", args.caseNumber))
      .unique();
  },
});

export const create = mutation({
  args: {
    caseNumber: v.string(),
    leadId: v.optional(v.id("leads")),
    applicantName: v.string(),
    visaType: v.string(),
    nationality: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(caseStatusValidator),
    counsellorId: v.optional(v.id("users")),
    documentExecutiveId: v.optional(v.id("users")),
    branch: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cases", {
      ...args,
      status: args.status ?? "In Progress",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("cases"),
    caseNumber: v.optional(v.string()),
    leadId: v.optional(v.id("leads")),
    applicantName: v.optional(v.string()),
    visaType: v.optional(v.string()),
    nationality: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(caseStatusValidator),
    counsellorId: v.optional(v.id("users")),
    documentExecutiveId: v.optional(v.id("users")),
    branch: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("cases"), status: caseStatusValidator },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
