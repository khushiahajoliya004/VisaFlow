import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const channelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("sms"),
  v.literal("voiceCall"),
);

export const listByLead = query({
  args: { leadId: v.id("leads"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByLeadAndChannel = query({
  args: { leadId: v.id("leads"), channel: channelValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_leadId_and_channel", (q) =>
        q.eq("leadId", args.leadId).eq("channel", args.channel),
      )
      .order("desc")
      .take(100);
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByChannel = query({
  args: { channel: channelValidator, paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const get = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    leadId: v.optional(v.id("leads")),
    caseId: v.optional(v.id("cases")),
    channel: channelValidator,
    content: v.string(),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    aiInsight: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateAiInsight = mutation({
  args: { id: v.id("messages"), aiInsight: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { aiInsight: args.aiInsight });
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
