import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").order("desc").take(500);
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .take(200);
  },
});

export const listByCaseAndStatus = query({
  args: {
    caseId: v.id("cases"),
    status: v.union(
      v.literal("pending"),
      v.literal("uploaded"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_caseId_and_status", (q) =>
        q.eq("caseId", args.caseId).eq("status", args.status),
      )
      .take(200);
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    name: v.string(),
    type: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("uploaded"),
        v.literal("verified"),
        v.literal("rejected"),
      ),
    ),
    fileUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ...args,
      status: args.status ?? "pending",
      uploadedAt: args.fileUrl ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("uploaded"),
        v.literal("verified"),
        v.literal("rejected"),
      ),
    ),
    fileUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("uploaded"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: {
      status: "pending" | "uploaded" | "verified" | "rejected";
      notes?: string;
      verifiedAt?: number;
      uploadedAt?: number;
    } = { status: args.status };
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.status === "verified") patch.verifiedAt = Date.now();
    if (args.status === "uploaded") patch.uploadedAt = Date.now();
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
