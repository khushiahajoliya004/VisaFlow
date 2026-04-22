import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reusable validators
const leadStatusValidator = v.union(
  v.literal("newLead"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("documentsPending"),
  v.literal("applicationFiled"),
  v.literal("decisionPending"),
  v.literal("closed"),
);

// Cases use title-case status values (matches Cases.jsx STATUS_STYLE)
const caseStatusValidator = v.union(
  v.literal("In Progress"),
  v.literal("Documents Pending"),
  v.literal("Application Filed"),
  v.literal("Decision Pending"),
  v.literal("Closed"),
  v.literal("Escalated"),
);

const taskStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("escalated"),
);

const taskPriorityValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

const documentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("uploaded"),
  v.literal("verified"),
  v.literal("rejected"),
);

const paymentStatusValidator = v.union(
  v.literal("paid"),
  v.literal("partial"),
  v.literal("pending"),
);

const paymentMethodValidator = v.union(
  v.literal("upi"),
  v.literal("bankTransfer"),
  v.literal("cash"),
  v.literal("cheque"),
);

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

const messageChannelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("sms"),
  v.literal("voiceCall"),
  v.literal("email"),
);

const automationChannelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("email"),
  v.literal("both"),
);

export default defineSchema({
  // ── Users ────────────────────────────────────────────────────────────────
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("counsellor"),
      v.literal("documentExecutive"),
    ),
    avatar: v.optional(v.string()),
    branch: v.optional(v.string()),
    phone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_branch", ["branch"]),

  // ── Leads ─────────────────────────────────────────────────────────────────
  // FR1-FR3, FR28-FR30: Lead capture, AI scoring, tagging
  leads: defineTable({
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
    status: leadStatusValidator,
    assignedTo: v.optional(v.id("users")),
    aiScore: v.optional(v.number()),
    ieltsScore: v.optional(v.number()),
    financialReadiness: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_visaType", ["visaType"])
    .index("by_assignedTo_and_status", ["assignedTo", "status"]),

  // ── Cases (Applications) ─────────────────────────────────────────────────
  // FR9-FR10: Pipeline management; FR16: escalation
  cases: defineTable({
    caseNumber: v.string(),
    leadId: v.optional(v.id("leads")),
    applicantName: v.string(),
    visaType: v.string(),
    nationality: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: caseStatusValidator,
    counsellorId: v.optional(v.id("users")),
    documentExecutiveId: v.optional(v.id("users")),
    branch: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_caseNumber", ["caseNumber"])
    .index("by_leadId", ["leadId"])
    .index("by_counsellorId", ["counsellorId"])
    .index("by_status", ["status"])
    .index("by_branch", ["branch"]),

  // ── Documents ─────────────────────────────────────────────────────────────
  // FR11-FR13: Document lifecycle management
  documents: defineTable({
    caseId: v.id("cases"),
    name: v.string(),
    type: v.string(),
    status: documentStatusValidator,
    fileUrl: v.optional(v.string()),
    uploadedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    isRequired: v.optional(v.boolean()),
    reminderSentAt: v.optional(v.number()),
  })
    .index("by_caseId", ["caseId"])
    .index("by_caseId_and_status", ["caseId", "status"]),

  // ── Tasks ─────────────────────────────────────────────────────────────────
  // FR14-FR16: Task assignment, reminders, escalation
  tasks: defineTable({
    caseId: v.optional(v.id("cases")),
    leadId: v.optional(v.id("leads")),
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    status: taskStatusValidator,
    priority: v.optional(taskPriorityValidator),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_caseId", ["caseId"])
    .index("by_leadId", ["leadId"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_assignedTo_and_status", ["assignedTo", "status"]),

  // ── Payments ──────────────────────────────────────────────────────────────
  // FR19-FR20: Payment tracking with installments
  payments: defineTable({
    caseId: v.id("cases"),
    totalAmount: v.number(),
    paidAmount: v.number(),
    pendingAmount: v.number(),
    method: v.optional(paymentMethodValidator),
    status: paymentStatusValidator,
    installments: v.optional(
      v.array(
        v.object({
          amount: v.number(),
          dueDate: v.number(),
          paidAt: v.optional(v.number()),
          status: v.union(v.literal("paid"), v.literal("pending")),
          method: v.optional(paymentMethodValidator),
        }),
      ),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_caseId", ["caseId"])
    .index("by_status", ["status"])
    .index("by_caseId_and_status", ["caseId", "status"]),

  // ── Activities (Timeline) ─────────────────────────────────────────────────
  // FR17-FR18: Full event history / chronological timeline
  activities: defineTable({
    caseId: v.optional(v.id("cases")),
    leadId: v.optional(v.id("leads")),
    type: activityTypeValidator,
    description: v.string(),
    performedBy: v.optional(v.id("users")),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_caseId", ["caseId"])
    .index("by_leadId", ["leadId"])
    .index("by_type", ["type"])
    .index("by_caseId_and_type", ["caseId", "type"]),

  // ── Messages (WhatsApp / Voice / SMS / Email) ──────────────────────────────
  // FR4-FR8: AI communication module
  messages: defineTable({
    leadId: v.optional(v.id("leads")),
    caseId: v.optional(v.id("cases")),
    channel: messageChannelValidator,
    content: v.string(),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    aiInsight: v.optional(v.string()),
    transcript: v.optional(v.string()),
    callDuration: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_leadId", ["leadId"])
    .index("by_caseId", ["caseId"])
    .index("by_channel", ["channel"])
    .index("by_leadId_and_channel", ["leadId", "channel"]),

  // ── Workflows ─────────────────────────────────────────────────────────────
  // FR9-FR10, FR14: Automated stage-triggered sequences
  workflows: defineTable({
    name: v.string(),
    trigger: v.string(),
    steps: v.array(
      v.object({
        order: v.number(),
        action: v.string(),
        config: v.optional(v.string()),
        delay: v.optional(v.number()),
      }),
    ),
    isActive: v.boolean(),
    successRate: v.optional(v.number()),
    lastRun: v.optional(v.number()),
    runCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  // ── Automations ───────────────────────────────────────────────────────────
  // FR4, FR12, FR30: Auto WhatsApp/email flows
  automations: defineTable({
    name: v.string(),
    trigger: v.string(),
    channel: automationChannelValidator,
    isActive: v.boolean(),
    steps: v.array(
      v.object({
        order: v.number(),
        action: v.string(),
        delay: v.optional(v.number()),
        config: v.optional(v.string()),
      }),
    ),
    runCount: v.optional(v.number()),
    lastTriggeredAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_channel", ["channel"]),
});
