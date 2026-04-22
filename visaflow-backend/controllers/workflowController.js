/**
 * Workflow Controller
 * UI 4  – Workflow canvas (drag-and-drop builder)
 * FR10  – Trigger automated actions on lead/case stage changes
 * FR16  – Escalate cases inactive > 7 days
 * FR30  – Automated multi-step follow-up sequences
 */
const { runMutation, runQuery } = require("../config/convex");

// ── POST /api/workflows/trigger ─────────────────────────────────────────────
// FR10 – Fire workflow when a lead or case changes stage
async function triggerOnStageChange(req, res, next) {
  try {
    const { entityType, entityId, oldStatus, newStatus, workflowId } = req.body;
    if (!entityType || !entityId || !newStatus) {
      return res.status(400).json({ error: "entityType, entityId, and newStatus are required" });
    }

    // Find active workflows that match this trigger
    const trigger = `${entityType}:${newStatus}`;
    const activeWorkflows = await runQuery("workflows:listActive", {});
    const matched = workflowId
      ? activeWorkflows.filter((w) => w._id === workflowId)
      : activeWorkflows.filter((w) => w.trigger === trigger);

    const results = [];
    for (const workflow of matched) {
      const result = await runWorkflowSteps(workflow, { entityType, entityId, newStatus });
      results.push({ workflowId: workflow._id, name: workflow.name, result });

      // Update lastRun on the workflow
      await runMutation("workflows:updateLastRun", { id: workflow._id });
    }

    res.json({ triggered: results.length, results });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/workflows/escalate ────────────────────────────────────────────
// FR16 – Find cases with no activity in >7 days and escalate them
async function escalateInactiveCases(req, res, next) {
  try {
    const { thresholdDays = 7 } = req.body;
    const cutoff = Date.now() - thresholdDays * 24 * 60 * 60 * 1000;

    // Fetch open cases (status != closed)
    const openCases = await runQuery("cases:listByStatus", {
      status: "In Progress",
      paginationOpts: { numItems: 100, cursor: null },
    });

    const escalated = [];
    for (const c of openCases?.page || []) {
      // Check most recent activity
      const activities = await runQuery("activities:listByCase", {
        caseId: c._id,
        paginationOpts: { numItems: 1, cursor: null },
      });
      const latest = activities?.page?.[0];
      const lastActivity = latest ? latest.createdAt : c.createdAt;

      if (lastActivity < cutoff) {
        await runMutation("cases:updateStatus", { id: c._id, status: "Escalated" });
        await runMutation("activities:create", {
          caseId: c._id,
          type: "stageChange",
          description: `Auto-escalated: no activity for ${thresholdDays} days`,
        });

        // Create an escalation task for the counsellor (FR16)
        await runMutation("tasks:create", {
          caseId: c._id,
          title: `Escalation: Follow up on case ${c.caseNumber}`,
          description: `This case has had no activity for ${thresholdDays}+ days.`,
          assignedTo: c.counsellorId,
          status: "escalated",
          dueDate: Date.now() + 24 * 60 * 60 * 1000, // due in 24 hours
        });

        escalated.push(c._id);
      }
    }

    res.json({ escalated: escalated.length, caseIds: escalated });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/workflows/followup ────────────────────────────────────────────
// FR30 – Start a multi-step follow-up sequence for a lead
async function triggerFollowUp(req, res, next) {
  try {
    const { leadId, caseId, sequenceType = "standard" } = req.body;
    if (!leadId && !caseId) {
      return res.status(400).json({ error: "leadId or caseId is required" });
    }

    // Standard follow-up: WhatsApp now, call in 24h, task in 48h
    const steps = FOLLOW_UP_SEQUENCES[sequenceType] || FOLLOW_UP_SEQUENCES.standard;

    // Create a task for each delayed step
    for (const step of steps) {
      await runMutation("tasks:create", {
        caseId: caseId || undefined,
        title: step.title,
        description: step.description,
        status: "pending",
        dueDate: Date.now() + step.delayMs,
      });
    }

    res.json({
      success: true,
      sequenceType,
      stepsScheduled: steps.length,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/workflows/blueprints ───────────────────────────────────────────
// UI 4 – Return built-in workflow template blueprints for the canvas
async function getBlueprintTemplates(req, res) {
  res.json(WORKFLOW_BLUEPRINTS);
}

// ── POST /api/workflows/execute/:workflowId ─────────────────────────────────
// UI 4 – Manually run a saved workflow
async function executeWorkflow(req, res, next) {
  try {
    const { workflowId } = req.params;
    const { entityType, entityId } = req.body;

    const workflow = await runQuery("workflows:get", { id: workflowId });
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });
    if (!workflow.isActive) return res.status(400).json({ error: "Workflow is inactive" });

    const result = await runWorkflowSteps(workflow, { entityType, entityId });
    await runMutation("workflows:updateLastRun", { id: workflowId });

    res.json({ success: true, workflowId, result });
  } catch (err) {
    next(err);
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

async function runWorkflowSteps(workflow, context) {
  const results = [];
  for (const step of workflow.steps || []) {
    try {
      const stepResult = await executeStep(step, context, workflow);
      results.push({ step: step.order, action: step.action, status: "ok", stepResult });
    } catch (e) {
      results.push({ step: step.order, action: step.action, status: "error", error: e.message });
    }
  }
  return results;
}

async function executeStep(step, context) {
  switch (step.action) {
    case "send_whatsapp":
      // Would call whatsapp controller – logged as activity for now
      if (context.entityId) {
        await runMutation("activities:create", {
          caseId: context.entityType === "case" ? context.entityId : undefined,
          type: "whatsappMessage",
          description: `Workflow step: send_whatsapp triggered`,
        });
      }
      return { sent: true };

    case "create_task":
      return await runMutation("tasks:create", {
        caseId: context.entityType === "case" ? context.entityId : undefined,
        title: step.config || "Follow-up task from workflow",
        status: "pending",
        dueDate: Date.now() + 24 * 60 * 60 * 1000,
      });

    case "update_status":
      if (context.entityType === "lead") {
        await runMutation("leads:updateStatus", { id: context.entityId, status: step.config });
      } else if (context.entityType === "case") {
        await runMutation("cases:updateStatus", { id: context.entityId, status: step.config });
      }
      return { updated: true };

    case "log_activity":
      return await runMutation("activities:create", {
        caseId: context.entityType === "case" ? context.entityId : undefined,
        type: "note",
        description: step.config || "Workflow activity logged",
      });

    default:
      return { skipped: true, reason: `Unknown action: ${step.action}` };
  }
}

// ── Constants ────────────────────────────────────────────────────────────────

const FOLLOW_UP_SEQUENCES = {
  standard: [
    {
      title: "Send initial WhatsApp follow-up",
      description: "Send welcome message and next steps via WhatsApp",
      delayMs: 0,
    },
    {
      title: "Schedule follow-up call",
      description: "Call the lead to understand visa requirements",
      delayMs: 24 * 60 * 60 * 1000,
    },
    {
      title: "Send document checklist",
      description: "Email or WhatsApp the document checklist",
      delayMs: 48 * 60 * 60 * 1000,
    },
  ],
  urgent: [
    {
      title: "Immediate WhatsApp contact",
      description: "Contact lead within 15 minutes",
      delayMs: 0,
    },
    {
      title: "Follow-up call in 2 hours",
      description: "Second attempt to reach lead",
      delayMs: 2 * 60 * 60 * 1000,
    },
  ],
};

const WORKFLOW_BLUEPRINTS = [
  {
    id: "new-lead-onboarding",
    name: "New Lead Onboarding",
    description: "Welcome message → counsellor assignment → document checklist",
    trigger: "lead:newLead",
    steps: [
      { order: 1, action: "send_whatsapp", config: "Welcome to VisaFlow! We will be in touch shortly." },
      { order: 2, action: "create_task", config: "Initial consultation call" },
      { order: 3, action: "update_status", config: "contacted" },
    ],
  },
  {
    id: "document-follow-up",
    name: "Document Follow-up",
    description: "Remind applicant about pending documents every 3 days",
    trigger: "case:documentsPending",
    steps: [
      { order: 1, action: "send_whatsapp", config: "Please submit your pending documents." },
      { order: 2, action: "create_task", config: "Document follow-up call" },
    ],
  },
  {
    id: "payment-reminder",
    name: "Payment Due Reminder",
    description: "Alert applicant when payment is due and send link",
    trigger: "payment:pending",
    steps: [
      { order: 1, action: "send_whatsapp", config: "Your payment is due. Please complete it via the link." },
      { order: 2, action: "log_activity", config: "Payment reminder sent" },
    ],
  },
  {
    id: "application-filed",
    name: "Application Filed Notification",
    description: "Notify applicant when their visa application is filed",
    trigger: "case:applicationFiled",
    steps: [
      { order: 1, action: "send_whatsapp", config: "Your visa application has been successfully filed!" },
      { order: 2, action: "log_activity", config: "Filing confirmation sent to applicant" },
    ],
  },
];

module.exports = {
  triggerOnStageChange,
  escalateInactiveCases,
  triggerFollowUp,
  getBlueprintTemplates,
  executeWorkflow,
};
