import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const channelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("email"),
  v.literal("both"),
);

const stepValidator = v.object({
  order: v.number(),
  action: v.string(),
  delay: v.optional(v.number()),
  config: v.optional(v.string()),
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("automations").order("desc").take(200);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("automations")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("automations")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(100);
  },
});

export const listByChannel = query({
  args: { channel: channelValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("automations")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("automations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    trigger: v.string(),
    channel: channelValidator,
    isActive: v.optional(v.boolean()),
    steps: v.array(stepValidator),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("automations", {
      ...args,
      isActive: args.isActive ?? true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("automations"),
    name: v.optional(v.string()),
    trigger: v.optional(v.string()),
    channel: v.optional(channelValidator),
    isActive: v.optional(v.boolean()),
    steps: v.optional(v.array(stepValidator)),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const toggle = mutation({
  args: { id: v.id("automations") },
  handler: async (ctx, args) => {
    const automation = await ctx.db.get(args.id);
    if (!automation) throw new Error("Automation not found");
    await ctx.db.patch(args.id, { isActive: !automation.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("automations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
