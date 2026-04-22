import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const installmentValidator = v.object({
  amount: v.number(),
  dueDate: v.number(),
  paidAt: v.optional(v.number()),
  status: v.union(v.literal("paid"), v.literal("pending")),
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .take(50);
  },
});

export const listByCaseAndStatus = query({
  args: {
    caseId: v.id("cases"),
    status: v.union(
      v.literal("paid"),
      v.literal("partial"),
      v.literal("pending"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_caseId_and_status", (q) =>
        q.eq("caseId", args.caseId).eq("status", args.status),
      )
      .take(50);
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("paid"),
      v.literal("partial"),
      v.literal("pending"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    totalAmount: v.number(),
    paidAmount: v.number(),
    pendingAmount: v.number(),
    method: v.optional(
      v.union(
        v.literal("upi"),
        v.literal("bankTransfer"),
        v.literal("cash"),
      ),
    ),
    status: v.union(
      v.literal("paid"),
      v.literal("partial"),
      v.literal("pending"),
    ),
    installments: v.optional(v.array(installmentValidator)),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("payments"),
    totalAmount: v.optional(v.number()),
    paidAmount: v.optional(v.number()),
    pendingAmount: v.optional(v.number()),
    method: v.optional(
      v.union(
        v.literal("upi"),
        v.literal("bankTransfer"),
        v.literal("cash"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("paid"),
        v.literal("partial"),
        v.literal("pending"),
      ),
    ),
    installments: v.optional(v.array(installmentValidator)),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const recordPayment = mutation({
  args: {
    id: v.id("payments"),
    paidAmount: v.number(),
    method: v.union(
      v.literal("upi"),
      v.literal("bankTransfer"),
      v.literal("cash"),
    ),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.id);
    if (!payment) throw new Error("Payment not found");
    const newPaidAmount = payment.paidAmount + args.paidAmount;
    const newPendingAmount = payment.totalAmount - newPaidAmount;
    const newStatus =
      newPaidAmount >= payment.totalAmount
        ? "paid"
        : newPaidAmount > 0
          ? "partial"
          : "pending";
    await ctx.db.patch(args.id, {
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      status: newStatus,
      method: args.method,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("payments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
