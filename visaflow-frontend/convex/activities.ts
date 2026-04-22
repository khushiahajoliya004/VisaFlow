import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const activityTypeValidator = v.union(
  v.literal("whatsappMessage"),
  v.literal("voiceCall"),
  v.literal("stageChange"),
  v.literal("documentUpload"),
  v.literal("payment"),
  v.literal("note"),
  v.literal("taskCreated"),
  v.literal("taskCompleted"),
);

export const listByCase = query({
  args: { caseId: v.id("cases"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByCaseFull = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .take(200);
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .take(100);
  },
});

export const listByCaseAndType = query({
  args: {
    caseId: v.id("cases"),
    type: activityTypeValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_caseId_and_type", (q) =>
        q.eq("caseId", args.caseId).eq("type", args.type),
      )
      .order("desc")
      .take(100);
  },
});

export const listByType = query({
  args: { type: activityTypeValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    caseId: v.optional(v.id("cases")),
    leadId: v.optional(v.id("leads")),
    type: activityTypeValidator,
    description: v.string(),
    performedBy: v.optional(v.id("users")),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
