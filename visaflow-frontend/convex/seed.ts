import { mutation } from "./_generated/server";

/**
 * Seed the database with realistic test data matching the SRS.
 * Run: npx convex run seed:run
 *
 * Covers all 10 tables:
 *   users, leads, cases, documents, tasks, payments,
 *   activities, messages, workflows, automations
 */
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // ── 1. Wipe existing data ─────────────────────────────────────────────
    const TABLES = [
      "automations", "workflows", "messages", "activities",
      "payments", "tasks", "documents", "cases", "leads", "users",
    ] as const;
    for (const table of TABLES) {
      const rows = await ctx.db.query(table as any).take(2000);
      for (const row of rows) await ctx.db.delete(row._id);
    }

    const NOW = Date.now();
    const DAY = 86_400_000;
    const HR  = 3_600_000;

    // ── 2. Users (all 4 SRS roles) ────────────────────────────────────────
    const admin = await ctx.db.insert("users", {
      name: "Marcus Chen",
      email: "admin@visaflow.com",
      password: "hashed_admin_pw",
      role: "admin",
      branch: "Mumbai",
      phone: "+91 99000 00001",
      isActive: true,
      createdAt: NOW - DAY * 90,
    });

    const manager = await ctx.db.insert("users", {
      name: "Neha Gupta",
      email: "neha@visaflow.com",
      password: "hashed_pw",
      role: "manager",
      branch: "Mumbai",
      phone: "+91 99000 00002",
      isActive: true,
      createdAt: NOW - DAY * 80,
    });

    const c1 = await ctx.db.insert("users", {
      name: "Riya Desai",
      email: "riya@visaflow.com",
      password: "hashed_pw",
      role: "counsellor",
      branch: "Mumbai",
      phone: "+91 99000 00003",
      isActive: true,
      createdAt: NOW - DAY * 70,
    });

    const c2 = await ctx.db.insert("users", {
      name: "Karan Shah",
      email: "karan@visaflow.com",
      password: "hashed_pw",
      role: "counsellor",
      branch: "Delhi",
      phone: "+91 99000 00004",
      isActive: true,
      createdAt: NOW - DAY * 60,
    });

    const c3 = await ctx.db.insert("users", {
      name: "Preet Malhotra",
      email: "preet@visaflow.com",
      password: "hashed_pw",
      role: "counsellor",
      branch: "Bangalore",
      phone: "+91 99000 00005",
      isActive: true,
      createdAt: NOW - DAY * 55,
    });

    const docExec = await ctx.db.insert("users", {
      name: "Sunita Rao",
      email: "sunita@visaflow.com",
      password: "hashed_pw",
      role: "documentExecutive",
      branch: "Mumbai",
      phone: "+91 99000 00006",
      isActive: true,
      createdAt: NOW - DAY * 50,
    });

    // ── 3. Leads (all 7 pipeline stages, all 4 sources) ───────────────────
    // newLead
    const l1 = await ctx.db.insert("leads", {
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya.sharma@email.com",
      visaType: "Student",
      country: "Canada",
      budget: 45000,
      source: "whatsapp",
      status: "newLead",
      aiScore: 62,
      tags: ["student", "canada", "ielts-pending"],
      notes: "Interested in UBC or University of Toronto. IELTS scheduled next month.",
      createdAt: NOW - DAY * 1,
    });

    const l2 = await ctx.db.insert("leads", {
      name: "Rohit Nair",
      phone: "+91 76543 21000",
      email: "rohit.nair@email.com",
      visaType: "H-1B",
      country: "United States",
      budget: 90000,
      source: "metaAds",
      status: "newLead",
      aiScore: 71,
      tags: ["h-1b", "tech"],
      createdAt: NOW - DAY * 2,
    });

    // contacted
    const l3 = await ctx.db.insert("leads", {
      name: "Sneha Patel",
      phone: "+91 65432 10987",
      email: "sneha.patel@email.com",
      visaType: "Family",
      country: "UK",
      budget: 65000,
      source: "metaAds",
      status: "contacted",
      assignedTo: c1,
      aiScore: 74,
      tags: ["family", "uk"],
      notes: "Husband already in UK on work permit. Joining spouse visa.",
      createdAt: NOW - DAY * 5,
    });

    const l4 = await ctx.db.insert("leads", {
      name: "Deepak Kumar",
      phone: "+91 32109 87654",
      email: "deepak.kumar@email.com",
      visaType: "Student",
      country: "Germany",
      budget: 30000,
      source: "whatsapp",
      status: "contacted",
      assignedTo: c2,
      aiScore: 55,
      tags: ["student", "europe"],
      createdAt: NOW - DAY * 4,
    });

    // qualified
    const l5 = await ctx.db.insert("leads", {
      name: "Arjun Mehta",
      phone: "+91 98765 43210",
      email: "arjun.mehta@email.com",
      visaType: "H-1B",
      country: "United States",
      budget: 85000,
      source: "metaAds",
      status: "qualified",
      assignedTo: c1,
      aiScore: 87,
      ieltsScore: 7.5,
      financialReadiness: 80,
      tags: ["high-budget", "h-1b", "priority"],
      notes: "Senior Developer at Infosys. Strong profile. AI call completed.",
      createdAt: NOW - DAY * 10,
    });

    const l6 = await ctx.db.insert("leads", {
      name: "Meera Iyer",
      phone: "+91 91234 56789",
      email: "meera.iyer@email.com",
      visaType: "PR",
      country: "Canada",
      budget: 95000,
      source: "manual",
      status: "qualified",
      assignedTo: c3,
      aiScore: 80,
      ieltsScore: 7.0,
      tags: ["pr", "canada"],
      createdAt: NOW - DAY * 8,
    });

    // documentsPending
    const l7 = await ctx.db.insert("leads", {
      name: "Rahul Verma",
      phone: "+91 76543 21098",
      email: "rahul.verma@email.com",
      visaType: "PR",
      country: "Australia",
      budget: 120000,
      source: "manual",
      status: "documentsPending",
      assignedTo: c2,
      aiScore: 91,
      ieltsScore: 8.0,
      financialReadiness: 90,
      tags: ["pr", "high-budget", "australia"],
      createdAt: NOW - DAY * 15,
    });

    const l8 = await ctx.db.insert("leads", {
      name: "Pooja Agarwal",
      phone: "+91 88765 43219",
      email: "pooja.agarwal@email.com",
      visaType: "Student",
      country: "Australia",
      budget: 55000,
      source: "csv",
      status: "documentsPending",
      assignedTo: c1,
      aiScore: 68,
      ieltsScore: 6.5,
      tags: ["student", "australia"],
      createdAt: NOW - DAY * 12,
    });

    // applicationFiled
    const l9 = await ctx.db.insert("leads", {
      name: "Vikram Singh",
      phone: "+91 54321 09876",
      email: "vikram.singh@email.com",
      visaType: "Business",
      country: "UAE",
      budget: 200000,
      source: "manual",
      status: "applicationFiled",
      assignedTo: c1,
      aiScore: 95,
      financialReadiness: 95,
      tags: ["business", "high-budget", "uae", "priority"],
      createdAt: NOW - DAY * 20,
    });

    const l10 = await ctx.db.insert("leads", {
      name: "Kavya Reddy",
      phone: "+91 77654 32190",
      email: "kavya.reddy@email.com",
      visaType: "H-1B",
      country: "United States",
      budget: 80000,
      source: "metaAds",
      status: "applicationFiled",
      assignedTo: c3,
      aiScore: 83,
      ieltsScore: 7.5,
      tags: ["h-1b"],
      createdAt: NOW - DAY * 18,
    });

    // decisionPending
    const l11 = await ctx.db.insert("leads", {
      name: "Anita Joshi",
      phone: "+91 43210 98765",
      email: "anita.joshi@email.com",
      visaType: "H-1B",
      country: "United States",
      budget: 75000,
      source: "manual",
      status: "decisionPending",
      assignedTo: c2,
      aiScore: 83,
      ieltsScore: 7.0,
      tags: ["h-1b"],
      createdAt: NOW - DAY * 30,
    });

    const l12 = await ctx.db.insert("leads", {
      name: "Suresh Babu",
      phone: "+91 55123 45678",
      email: "suresh.babu@email.com",
      visaType: "PR",
      country: "New Zealand",
      budget: 110000,
      source: "csv",
      status: "decisionPending",
      assignedTo: c2,
      aiScore: 78,
      ieltsScore: 7.5,
      tags: ["pr", "new-zealand"],
      createdAt: NOW - DAY * 25,
    });

    // closed (won)
    const l13 = await ctx.db.insert("leads", {
      name: "Nisha Menon",
      phone: "+91 66234 56780",
      email: "nisha.menon@email.com",
      visaType: "Student",
      country: "Canada",
      budget: 50000,
      source: "whatsapp",
      status: "closed",
      assignedTo: c1,
      aiScore: 88,
      ieltsScore: 8.0,
      tags: ["student", "closed-won"],
      createdAt: NOW - DAY * 45,
    });

    const l14 = await ctx.db.insert("leads", {
      name: "Rajan Pillai",
      phone: "+91 44567 89012",
      email: "rajan.pillai@email.com",
      visaType: "Business",
      country: "Singapore",
      budget: 150000,
      source: "manual",
      status: "closed",
      assignedTo: c3,
      aiScore: 92,
      financialReadiness: 88,
      tags: ["business", "closed-won", "singapore"],
      createdAt: NOW - DAY * 40,
    });

    const l15 = await ctx.db.insert("leads", {
      name: "Farah Khan",
      phone: "+91 33456 78901",
      email: "farah.khan@email.com",
      visaType: "Family",
      country: "UK",
      budget: 60000,
      source: "metaAds",
      status: "closed",
      assignedTo: c2,
      aiScore: 66,
      tags: ["family", "uk", "closed-lost"],
      notes: "Closed – lead went with a competitor.",
      createdAt: NOW - DAY * 35,
    });

    // ── 4. Cases (8 active cases with proper typed statuses) ──────────────
    const case1 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-001",
      leadId: l5,
      applicantName: "Arjun Mehta",
      visaType: "H-1B",
      nationality: "Indian",
      status: "In Progress",
      counsellorId: c1,
      documentExecutiveId: docExec,
      branch: "Mumbai",
      email: "arjun.mehta@email.com",
      phone: "+91 98765 43210",
      notes: "Strong candidate. IELTS 7.5. Employer sponsor confirmed.",
      createdAt: NOW - DAY * 10,
    });

    const case2 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-002",
      leadId: l7,
      applicantName: "Rahul Verma",
      visaType: "PR",
      nationality: "Indian",
      status: "Documents Pending",
      counsellorId: c2,
      documentExecutiveId: docExec,
      branch: "Delhi",
      email: "rahul.verma@email.com",
      phone: "+91 76543 21098",
      notes: "Skills Assessment report pending from ACS.",
      createdAt: NOW - DAY * 15,
    });

    const case3 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-003",
      leadId: l9,
      applicantName: "Vikram Singh",
      visaType: "Business",
      nationality: "Indian",
      status: "Application Filed",
      counsellorId: c1,
      branch: "Mumbai",
      email: "vikram.singh@email.com",
      phone: "+91 54321 09876",
      notes: "Business plan submitted. Awaiting embassy processing.",
      createdAt: NOW - DAY * 20,
    });

    const case4 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-004",
      leadId: l11,
      applicantName: "Anita Joshi",
      visaType: "H-1B",
      nationality: "Indian",
      status: "Decision Pending",
      counsellorId: c2,
      branch: "Bangalore",
      email: "anita.joshi@email.com",
      phone: "+91 43210 98765",
      createdAt: NOW - DAY * 30,
    });

    const case5 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-005",
      leadId: l3,
      applicantName: "Sneha Patel",
      visaType: "Family Visa",
      nationality: "Indian",
      status: "In Progress",
      counsellorId: c1,
      branch: "Mumbai",
      email: "sneha.patel@email.com",
      phone: "+91 65432 10987",
      createdAt: NOW - DAY * 5,
    });

    const case6 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-006",
      leadId: l13,
      applicantName: "Nisha Menon",
      visaType: "Student",
      nationality: "Indian",
      status: "Closed",
      counsellorId: c1,
      branch: "Mumbai",
      email: "nisha.menon@email.com",
      phone: "+91 66234 56780",
      notes: "Visa approved. Student enrolled at UBC.",
      createdAt: NOW - DAY * 45,
    });

    const case7 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-007",
      leadId: l8,
      applicantName: "Pooja Agarwal",
      visaType: "Student",
      nationality: "Indian",
      status: "Documents Pending",
      counsellorId: c1,
      documentExecutiveId: docExec,
      branch: "Mumbai",
      email: "pooja.agarwal@email.com",
      phone: "+91 88765 43219",
      createdAt: NOW - DAY * 12,
    });

    const case8 = await ctx.db.insert("cases", {
      caseNumber: "VF-2024-008",
      leadId: l10,
      applicantName: "Kavya Reddy",
      visaType: "H-1B",
      nationality: "Indian",
      status: "Application Filed",
      counsellorId: c3,
      branch: "Bangalore",
      email: "kavya.reddy@email.com",
      phone: "+91 77654 32190",
      createdAt: NOW - DAY * 18,
    });

    // ── 5. Documents (all 4 statuses, auto-checklist per visa type) ────────
    // Case 1 – H-1B (Arjun)
    await ctx.db.insert("documents", { caseId: case1, name: "Passport Copy",              type: "Identity",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 8,  verifiedAt: NOW - DAY * 7 });
    await ctx.db.insert("documents", { caseId: case1, name: "IELTS Scorecard",            type: "Language",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 7,  verifiedAt: NOW - DAY * 6 });
    await ctx.db.insert("documents", { caseId: case1, name: "Employment Letter",          type: "Work",       status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 3 });
    await ctx.db.insert("documents", { caseId: case1, name: "Bank Statements (6 months)", type: "Financial",  status: "pending",   isRequired: true });
    await ctx.db.insert("documents", { caseId: case1, name: "Educational Certificates",   type: "Education",  status: "rejected",  isRequired: true,  notes: "Low resolution scan — please re-upload at 300 DPI", uploadedAt: NOW - DAY * 5 });
    await ctx.db.insert("documents", { caseId: case1, name: "LCA Approval Notice",        type: "Legal",      status: "pending",   isRequired: true });

    // Case 2 – PR Australia (Rahul)
    await ctx.db.insert("documents", { caseId: case2, name: "Passport Copy",              type: "Identity",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 13, verifiedAt: NOW - DAY * 12 });
    await ctx.db.insert("documents", { caseId: case2, name: "Skills Assessment (ACS)",    type: "Professional", status: "pending", isRequired: true,  reminderSentAt: NOW - DAY * 3 });
    await ctx.db.insert("documents", { caseId: case2, name: "IELTS Scorecard",            type: "Language",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 12, verifiedAt: NOW - DAY * 11 });
    await ctx.db.insert("documents", { caseId: case2, name: "Employment Reference Letters", type: "Work",     status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 5 });
    await ctx.db.insert("documents", { caseId: case2, name: "Police Clearance Certificate", type: "Legal",    status: "pending",   isRequired: true });
    await ctx.db.insert("documents", { caseId: case2, name: "Medical Examination Report",  type: "Medical",   status: "pending",   isRequired: true });

    // Case 3 – Business UAE (Vikram)
    await ctx.db.insert("documents", { caseId: case3, name: "Business Registration Certificate", type: "Business", status: "verified", isRequired: true, uploadedAt: NOW - DAY * 18, verifiedAt: NOW - DAY * 17 });
    await ctx.db.insert("documents", { caseId: case3, name: "Audited Financial Statements",      type: "Financial", status: "verified", isRequired: true, uploadedAt: NOW - DAY * 17, verifiedAt: NOW - DAY * 16 });
    await ctx.db.insert("documents", { caseId: case3, name: "Business Plan",                     type: "Business", status: "verified", isRequired: true, uploadedAt: NOW - DAY * 15, verifiedAt: NOW - DAY * 14 });
    await ctx.db.insert("documents", { caseId: case3, name: "Passport Copy",                     type: "Identity", status: "verified", isRequired: true, uploadedAt: NOW - DAY * 18, verifiedAt: NOW - DAY * 17 });
    await ctx.db.insert("documents", { caseId: case3, name: "Personal Bank Statements",          type: "Financial", status: "uploaded", isRequired: true, uploadedAt: NOW - DAY * 5 });

    // Case 4 – H-1B (Anita)
    await ctx.db.insert("documents", { caseId: case4, name: "Passport Copy",              type: "Identity",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 28, verifiedAt: NOW - DAY * 27 });
    await ctx.db.insert("documents", { caseId: case4, name: "IELTS Scorecard",            type: "Language",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 27, verifiedAt: NOW - DAY * 26 });
    await ctx.db.insert("documents", { caseId: case4, name: "I-129 Petition",             type: "Legal",      status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 10 });
    await ctx.db.insert("documents", { caseId: case4, name: "Employment Contract",        type: "Work",       status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 25, verifiedAt: NOW - DAY * 24 });

    // Case 5 – Family Visa (Sneha)
    await ctx.db.insert("documents", { caseId: case5, name: "Passport Copy",              type: "Identity",   status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 3 });
    await ctx.db.insert("documents", { caseId: case5, name: "Marriage Certificate",       type: "Personal",   status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 3 });
    await ctx.db.insert("documents", { caseId: case5, name: "Sponsor's UK Visa/BRP",      type: "Legal",      status: "pending",   isRequired: true });
    await ctx.db.insert("documents", { caseId: case5, name: "Financial Sponsorship Proof", type: "Financial", status: "pending",   isRequired: true });

    // Case 7 – Student Australia (Pooja)
    await ctx.db.insert("documents", { caseId: case7, name: "Passport Copy",              type: "Identity",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 10, verifiedAt: NOW - DAY * 9 });
    await ctx.db.insert("documents", { caseId: case7, name: "IELTS Scorecard",            type: "Language",   status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 5 });
    await ctx.db.insert("documents", { caseId: case7, name: "Offer Letter from University", type: "Education", status: "pending",  isRequired: true });
    await ctx.db.insert("documents", { caseId: case7, name: "GTE Statement",              type: "Education",  status: "pending",   isRequired: true });
    await ctx.db.insert("documents", { caseId: case7, name: "Bank Statements (3 months)", type: "Financial",  status: "pending",   isRequired: true });

    // Case 8 – H-1B (Kavya)
    await ctx.db.insert("documents", { caseId: case8, name: "Passport Copy",              type: "Identity",   status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 16, verifiedAt: NOW - DAY * 15 });
    await ctx.db.insert("documents", { caseId: case8, name: "LCA Approval",               type: "Legal",      status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 14, verifiedAt: NOW - DAY * 13 });
    await ctx.db.insert("documents", { caseId: case8, name: "I-129 Petition Filed",       type: "Legal",      status: "uploaded",  isRequired: true,  uploadedAt: NOW - DAY * 8 });
    await ctx.db.insert("documents", { caseId: case8, name: "Degree Certificate",         type: "Education",  status: "verified",  isRequired: true,  uploadedAt: NOW - DAY * 16, verifiedAt: NOW - DAY * 15 });

    // ── 6. Tasks (FR14-FR16 – this was entirely missing before) ───────────
    // Case 1 tasks
    await ctx.db.insert("tasks", {
      caseId: case1,
      leadId: l5,
      title: "Follow up on Bank Statements submission",
      description: "Arjun has not submitted 6-month bank statements. Call and WhatsApp reminder needed.",
      assignedTo: c1,
      dueDate: NOW + DAY * 2,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 2,
    });
    await ctx.db.insert("tasks", {
      caseId: case1,
      title: "Request re-upload of Educational Certificates (300 DPI)",
      description: "Documents were rejected due to low resolution. Send detailed upload instructions.",
      assignedTo: docExec,
      dueDate: NOW + DAY * 1,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 1,
    });
    await ctx.db.insert("tasks", {
      caseId: case1,
      title: "Schedule pre-filing review call with Arjun",
      assignedTo: c1,
      dueDate: NOW + DAY * 3,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 1,
    });
    await ctx.db.insert("tasks", {
      caseId: case1,
      title: "Verify Employment Letter authenticity",
      assignedTo: docExec,
      dueDate: NOW - DAY * 1,
      status: "completed",
      priority: "medium",
      createdAt: NOW - DAY * 4,
      completedAt: NOW - DAY * 2,
    });

    // Case 2 tasks
    await ctx.db.insert("tasks", {
      caseId: case2,
      leadId: l7,
      title: "Chase ACS Skills Assessment submission",
      description: "Rahul's PR application is blocked on ACS report. Send 3-day escalation reminder.",
      assignedTo: c2,
      dueDate: NOW + DAY * 1,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 3,
    });
    await ctx.db.insert("tasks", {
      caseId: case2,
      title: "Send Police Clearance Certificate instructions",
      assignedTo: c2,
      dueDate: NOW + DAY * 5,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 2,
    });
    await ctx.db.insert("tasks", {
      caseId: case2,
      title: "Schedule Medical Examination – book appointment",
      assignedTo: c2,
      dueDate: NOW + DAY * 7,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 1,
    });

    // Case 3 tasks
    await ctx.db.insert("tasks", {
      caseId: case3,
      title: "Monitor embassy processing status",
      description: "Check UAE embassy portal weekly for application status update.",
      assignedTo: c1,
      dueDate: NOW + DAY * 7,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 5,
    });
    await ctx.db.insert("tasks", {
      caseId: case3,
      title: "Collect remaining Personal Bank Statements",
      assignedTo: docExec,
      dueDate: NOW + DAY * 2,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 2,
    });

    // Case 4 tasks
    await ctx.db.insert("tasks", {
      caseId: case4,
      title: "Weekly status check with USCIS",
      assignedTo: c2,
      dueDate: NOW + DAY * 7,
      status: "pending",
      priority: "low",
      createdAt: NOW - DAY * 7,
    });
    await ctx.db.insert("tasks", {
      caseId: case4,
      title: "Prepare RFE response pack (if received)",
      description: "Draft RFE response template ready for Anita's case.",
      assignedTo: c2,
      dueDate: NOW + DAY * 14,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 5,
    });

    // Case 5 tasks
    await ctx.db.insert("tasks", {
      caseId: case5,
      title: "Collect UK Sponsor BRP copy from Sneha",
      assignedTo: c1,
      dueDate: NOW + DAY * 3,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 1,
    });
    await ctx.db.insert("tasks", {
      caseId: case5,
      title: "Send financial sponsorship document checklist",
      assignedTo: c1,
      dueDate: NOW + DAY * 2,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 1,
    });

    // Case 7 tasks
    await ctx.db.insert("tasks", {
      caseId: case7,
      title: "Request Offer Letter from Pooja's university",
      assignedTo: docExec,
      dueDate: NOW + DAY * 4,
      status: "pending",
      priority: "high",
      createdAt: NOW - DAY * 2,
    });
    await ctx.db.insert("tasks", {
      caseId: case7,
      title: "Guide Pooja on GTE Statement writing",
      description: "Send GTE statement guide PDF and template.",
      assignedTo: c1,
      dueDate: NOW + DAY * 5,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 1,
    });

    // Case 8 tasks
    await ctx.db.insert("tasks", {
      caseId: case8,
      title: "Track I-129 petition receipt from USCIS",
      assignedTo: c3,
      dueDate: NOW + DAY * 3,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 3,
    });
    await ctx.db.insert("tasks", {
      caseId: case8,
      title: "Inform Kavya about H-1B lottery result timeline",
      assignedTo: c3,
      dueDate: NOW + DAY * 1,
      status: "completed",
      priority: "low",
      createdAt: NOW - DAY * 5,
      completedAt: NOW - DAY * 4,
    });

    // Lead-level tasks (pre-case, FR14)
    await ctx.db.insert("tasks", {
      leadId: l1,
      title: "Send IELTS preparation resources to Priya",
      assignedTo: c1,
      dueDate: NOW + DAY * 1,
      status: "pending",
      priority: "medium",
      createdAt: NOW - HR * 2,
    });
    await ctx.db.insert("tasks", {
      leadId: l2,
      title: "Schedule intro call with Rohit Nair",
      assignedTo: c2,
      dueDate: NOW + DAY * 1,
      status: "pending",
      priority: "high",
      createdAt: NOW - HR * 5,
    });
    await ctx.db.insert("tasks", {
      leadId: l4,
      title: "Send Germany student visa requirements to Deepak",
      assignedTo: c2,
      dueDate: NOW + DAY * 2,
      status: "pending",
      priority: "medium",
      createdAt: NOW - DAY * 2,
    });

    // ── 7. Payments (FR19-FR20 – with installments) ───────────────────────
    await ctx.db.insert("payments", {
      caseId: case1,
      totalAmount: 85000,
      paidAmount: 42500,
      pendingAmount: 42500,
      method: "upi",
      status: "partial",
      installments: [
        { amount: 42500, dueDate: NOW - DAY * 8, paidAt: NOW - DAY * 8, status: "paid", method: "upi" },
        { amount: 42500, dueDate: NOW + DAY * 22, status: "pending" },
      ],
      notes: "First installment paid on case open. Second due before filing.",
      createdAt: NOW - DAY * 10,
    });

    await ctx.db.insert("payments", {
      caseId: case2,
      totalAmount: 120000,
      paidAmount: 0,
      pendingAmount: 120000,
      status: "pending",
      installments: [
        { amount: 60000, dueDate: NOW + DAY * 5, status: "pending" },
        { amount: 60000, dueDate: NOW + DAY * 35, status: "pending" },
      ],
      notes: "Payment link sent via WhatsApp. Client confirmed payment next week.",
      createdAt: NOW - DAY * 15,
    });

    await ctx.db.insert("payments", {
      caseId: case3,
      totalAmount: 200000,
      paidAmount: 200000,
      pendingAmount: 0,
      method: "bankTransfer",
      status: "paid",
      installments: [
        { amount: 100000, dueDate: NOW - DAY * 18, paidAt: NOW - DAY * 18, status: "paid", method: "bankTransfer" },
        { amount: 100000, dueDate: NOW - DAY * 5,  paidAt: NOW - DAY * 5,  status: "paid", method: "bankTransfer" },
      ],
      createdAt: NOW - DAY * 20,
    });

    await ctx.db.insert("payments", {
      caseId: case4,
      totalAmount: 75000,
      paidAmount: 75000,
      pendingAmount: 0,
      method: "upi",
      status: "paid",
      createdAt: NOW - DAY * 30,
    });

    await ctx.db.insert("payments", {
      caseId: case5,
      totalAmount: 65000,
      paidAmount: 20000,
      pendingAmount: 45000,
      method: "cash",
      status: "partial",
      installments: [
        { amount: 20000, dueDate: NOW - DAY * 5, paidAt: NOW - DAY * 5, status: "paid", method: "cash" },
        { amount: 45000, dueDate: NOW + DAY * 25, status: "pending" },
      ],
      createdAt: NOW - DAY * 5,
    });

    await ctx.db.insert("payments", {
      caseId: case6,
      totalAmount: 50000,
      paidAmount: 50000,
      pendingAmount: 0,
      method: "bankTransfer",
      status: "paid",
      createdAt: NOW - DAY * 44,
    });

    await ctx.db.insert("payments", {
      caseId: case7,
      totalAmount: 55000,
      paidAmount: 27500,
      pendingAmount: 27500,
      method: "upi",
      status: "partial",
      installments: [
        { amount: 27500, dueDate: NOW - DAY * 10, paidAt: NOW - DAY * 10, status: "paid", method: "upi" },
        { amount: 27500, dueDate: NOW + DAY * 20, status: "pending" },
      ],
      createdAt: NOW - DAY * 12,
    });

    await ctx.db.insert("payments", {
      caseId: case8,
      totalAmount: 80000,
      paidAmount: 80000,
      pendingAmount: 0,
      method: "bankTransfer",
      status: "paid",
      createdAt: NOW - DAY * 18,
    });

    // ── 8. Activities / Timeline (FR17-FR18) ──────────────────────────────
    // Case 1 – Arjun
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "stageChange",     description: "Case VF-2024-001 created. Assigned to Riya Desai (Mumbai).",                       performedBy: admin, createdAt: NOW - DAY * 10 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "whatsappMessage",  description: "Welcome WhatsApp sent: 'Your H-1B case is now open. Riya will contact you shortly.'", performedBy: c1,    createdAt: NOW - DAY * 10 + HR });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "voiceCall",        description: "AI call completed (4m 32s). Confirmed IELTS 7.5, Infosys employment verified.",        createdAt: NOW - DAY * 9 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "documentUpload",   description: "Passport Copy uploaded and AI-verified.",                                              performedBy: docExec, createdAt: NOW - DAY * 8 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "documentUpload",   description: "IELTS Scorecard (7.5) uploaded and verified.",                                         performedBy: docExec, createdAt: NOW - DAY * 7 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "payment",          description: "First installment ₹42,500 received via UPI.",                                          performedBy: manager, createdAt: NOW - DAY * 8 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "documentUpload",   description: "Educational Certificates uploaded — rejected (low DPI). Re-upload requested.",         performedBy: docExec, createdAt: NOW - DAY * 5 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "documentUpload",   description: "Employment Letter received and uploaded.",                                              performedBy: docExec, createdAt: NOW - DAY * 3 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "note",             description: "Called Arjun — bank statements to be submitted by end of week.",                      performedBy: c1,    createdAt: NOW - DAY * 2 });
    await ctx.db.insert("activities", { caseId: case1, leadId: l5, type: "taskCreated",      description: "Task created: Follow up on Bank Statements (due in 2 days).",                         performedBy: c1,    createdAt: NOW - DAY * 2 });

    // Case 2 – Rahul
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "stageChange",     description: "Case VF-2024-002 created. Assigned to Karan Shah (Delhi).",                          performedBy: admin, createdAt: NOW - DAY * 15 });
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "voiceCall",        description: "AI qualification call: confirmed IELTS 8.0, 5yr IT experience (Wipro).",              createdAt: NOW - DAY * 14 });
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "stageChange",      description: "Lead moved to Documents Pending — initial qualification complete.",                    performedBy: c2,    createdAt: NOW - DAY * 13 });
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "documentUpload",   description: "Passport verified, IELTS scorecard verified.",                                         performedBy: docExec, createdAt: NOW - DAY * 12 });
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "whatsappMessage",  description: "Document checklist sent: Skills Assessment, Police Clearance, Medical.",               performedBy: c2,    createdAt: NOW - DAY * 11 });
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "note",             description: "ACS assessment expected in 4-6 weeks. Following up with Rahul weekly.",               performedBy: c2,    createdAt: NOW - DAY * 5 });
    await ctx.db.insert("activities", { caseId: case2, leadId: l7, type: "whatsappMessage",  description: "Escalation reminder sent: 'ACS report is still pending — please follow up urgently.'", performedBy: c2,    createdAt: NOW - DAY * 3 });

    // Case 3 – Vikram
    await ctx.db.insert("activities", { caseId: case3, leadId: l9, type: "stageChange",     description: "Case VF-2024-003 created for Business Visa (UAE).",                                  performedBy: admin, createdAt: NOW - DAY * 20 });
    await ctx.db.insert("activities", { caseId: case3, leadId: l9, type: "payment",          description: "Full payment ₹2,00,000 received (50% upfront + 50% on filing).",                    performedBy: manager, createdAt: NOW - DAY * 18 });
    await ctx.db.insert("activities", { caseId: case3, leadId: l9, type: "documentUpload",   description: "All business documents verified: Registration, Financials, Business Plan.",            performedBy: docExec, createdAt: NOW - DAY * 15 });
    await ctx.db.insert("activities", { caseId: case3, leadId: l9, type: "stageChange",      description: "Application filed with UAE Embassy. Reference: UAE-2024-88821.",                      performedBy: c1,    createdAt: NOW - DAY * 10 });

    // Case 4 – Anita
    await ctx.db.insert("activities", { caseId: case4, leadId: l11, type: "stageChange",    description: "Case VF-2024-004 created. H-1B visa process initiated.",                              performedBy: admin, createdAt: NOW - DAY * 30 });
    await ctx.db.insert("activities", { caseId: case4, leadId: l11, type: "payment",         description: "Full fee ₹75,000 received via UPI.",                                                  performedBy: manager, createdAt: NOW - DAY * 28 });
    await ctx.db.insert("activities", { caseId: case4, leadId: l11, type: "documentUpload",  description: "All documents verified. I-129 petition filed with USCIS.",                            performedBy: docExec, createdAt: NOW - DAY * 15 });
    await ctx.db.insert("activities", { caseId: case4, leadId: l11, type: "stageChange",     description: "Moved to Decision Pending — USCIS receipt notice received.",                          performedBy: c2,    createdAt: NOW - DAY * 10 });

    // Case 5 – Sneha
    await ctx.db.insert("activities", { caseId: case5, leadId: l3, type: "stageChange",     description: "Case VF-2024-005 created for Family Visa (UK).",                                     performedBy: admin, createdAt: NOW - DAY * 5 });
    await ctx.db.insert("activities", { caseId: case5, leadId: l3, type: "payment",          description: "First installment ₹20,000 received via cash.",                                        performedBy: manager, createdAt: NOW - DAY * 5 });
    await ctx.db.insert("activities", { caseId: case5, leadId: l3, type: "whatsappMessage",  description: "Document checklist sent via WhatsApp. Awaiting Sponsor BRP copy.",                    performedBy: c1,    createdAt: NOW - DAY * 4 });

    // Case 6 – Nisha (closed/won)
    await ctx.db.insert("activities", { caseId: case6, leadId: l13, type: "stageChange",    description: "Case VF-2024-006 closed — Student Visa (Canada) APPROVED!",                          performedBy: manager, createdAt: NOW - DAY * 10 });
    await ctx.db.insert("activities", { caseId: case6, leadId: l13, type: "note",            description: "Nisha enrolled at UBC, Vancouver campus. Great outcome!",                             performedBy: c1,    createdAt: NOW - DAY * 9 });

    // Lead-level activities (pre-case, FR17)
    await ctx.db.insert("activities", { leadId: l1, type: "whatsappMessage",   description: "Auto-response sent to Priya Sharma: 'Thanks for enquiring! We will call you shortly.'",  createdAt: NOW - DAY * 1 });
    await ctx.db.insert("activities", { leadId: l1, type: "voiceCall",          description: "AI call triggered — Priya confirmed Canada student visa interest. IELTS pending.",            createdAt: NOW - DAY * 1 + HR });
    await ctx.db.insert("activities", { leadId: l2, type: "whatsappMessage",   description: "Welcome WhatsApp sent to Rohit Nair from Meta Ads campaign.",                                  createdAt: NOW - DAY * 2 });
    await ctx.db.insert("activities", { leadId: l4, type: "stageChange",        description: "Lead Deepak Kumar moved from New Lead → Contacted by Karan Shah.",                            performedBy: c2, createdAt: NOW - DAY * 3 });

    // ── 9. Messages (FR4-FR8) ─────────────────────────────────────────────
    // Arjun thread
    await ctx.db.insert("messages", { leadId: l5, channel: "whatsapp", content: "Hi, I saw your ad about H-1B visa consultancy. Can you help?",                                                              direction: "inbound",  createdAt: NOW - DAY * 11 });
    await ctx.db.insert("messages", { leadId: l5, channel: "whatsapp", content: "Hello Arjun! Absolutely. I'm Riya, your dedicated counsellor. You have a strong profile for H-1B. Can we schedule a call?", direction: "outbound", createdAt: NOW - DAY * 11 + HR });
    await ctx.db.insert("messages", { leadId: l5, channel: "whatsapp", content: "Sure, I'm free tomorrow at 3pm.",                                                                                            direction: "inbound",  aiInsight: "Positive intent — high conversion likelihood", createdAt: NOW - DAY * 10 - HR });
    await ctx.db.insert("messages", { leadId: l5, channel: "whatsapp", content: "Confirmed! Sending you the document checklist now. Please upload your Passport and IELTS scorecard first.",                 direction: "outbound", createdAt: NOW - DAY * 10 });
    await ctx.db.insert("messages", { leadId: l5, channel: "voiceCall", content: "AI qualification call transcript", transcript: "AI: Hello, this is VisaFlow AI. Am I speaking with Arjun Mehta?\nArjun: Yes speaking.\nAI: Great! I'm calling about your H-1B visa enquiry. You currently work at Infosys as a Senior Developer, is that correct?\nArjun: Yes, 5 years now.\nAI: Excellent profile. Your IELTS 7.5 exceeds requirements. I'll have counsellor Riya reach out within the hour.", callDuration: 272, direction: "outbound", createdAt: NOW - DAY * 9 });
    await ctx.db.insert("messages", { leadId: l5, channel: "whatsapp", content: "Your bank statements are still pending. Please submit within 2 days to avoid delays.",                                      direction: "outbound", createdAt: NOW - DAY * 2 });

    // Rahul thread
    await ctx.db.insert("messages", { leadId: l7, channel: "whatsapp", content: "Hello, I want to apply for Australian PR. I have 6 years IT experience.",                                                  direction: "inbound",  aiInsight: "High intent — experienced professional", createdAt: NOW - DAY * 16 });
    await ctx.db.insert("messages", { leadId: l7, channel: "whatsapp", content: "Hi Rahul! Perfect profile for Australian PR subclass 189. I'm Karan, your counsellor. Let's get started.",                direction: "outbound", createdAt: NOW - DAY * 16 + HR });
    await ctx.db.insert("messages", { leadId: l7, channel: "whatsapp", content: "Your ACS Skills Assessment is the key pending item. Have you submitted it yet?",                                            direction: "outbound", createdAt: NOW - DAY * 3 });
    await ctx.db.insert("messages", { leadId: l7, channel: "whatsapp", content: "I submitted it 3 weeks ago. Still waiting for the result.",                                                                 direction: "inbound",  createdAt: NOW - DAY * 3 + HR });

    // Priya thread (new lead)
    await ctx.db.insert("messages", { leadId: l1, channel: "whatsapp", content: "Hi! I want to study in Canada. Can you help with the student visa?",                                                        direction: "inbound",  createdAt: NOW - DAY * 1 });
    await ctx.db.insert("messages", { leadId: l1, channel: "whatsapp", content: "Hello Priya! Welcome to VisaFlow 🎓 Canada Student Visa is our specialty. What course are you targeting?",                direction: "outbound", createdAt: NOW - DAY * 1 + HR * 0.5 });
    await ctx.db.insert("messages", { leadId: l1, channel: "whatsapp", content: "I'm looking at computer science programs. UBC or U of T preferably.",                                                      direction: "inbound",  aiInsight: "Strong academic intent, high-value target institutions", createdAt: NOW - DAY * 1 + HR });

    // Sneha thread
    await ctx.db.insert("messages", { leadId: l3, channel: "whatsapp", content: "I need family visa for UK. My husband is already there on work permit.",                                                    direction: "inbound",  createdAt: NOW - DAY * 6 });
    await ctx.db.insert("messages", { leadId: l3, channel: "whatsapp", content: "Hi Sneha! This sounds like a UK Family Visa (Spouse route). Riya here — let me explain the process.",                     direction: "outbound", createdAt: NOW - DAY * 6 + HR });
    await ctx.db.insert("messages", { leadId: l3, channel: "sms",      content: "Reminder: Please share your husband's UK BRP copy at the earliest. Case progression depends on this.",                     direction: "outbound", createdAt: NOW - DAY * 2 });

    // Vikram thread
    await ctx.db.insert("messages", { leadId: l9, channel: "whatsapp", content: "Full payment confirmation: ₹2,00,000 received. Thank you Vikram! Application filing begins Monday.",                       direction: "outbound", createdAt: NOW - DAY * 18 });
    await ctx.db.insert("messages", { leadId: l9, channel: "whatsapp", content: "Your UAE Business Visa application has been filed. Reference: UAE-2024-88821. Processing: 15-20 days.",                    direction: "outbound", createdAt: NOW - DAY * 10 });

    // ── 10. Workflows (FR9-FR10, FR14) ────────────────────────────────────
    await ctx.db.insert("workflows", {
      name: "New Lead Onboarding",
      trigger: "lead:newLead",
      isActive: true,
      successRate: 84,
      runCount: 214,
      lastRun: NOW - HR * 2,
      steps: [
        { order: 1, action: "send_whatsapp", config: "Welcome message with VisaFlow intro", delay: 0 },
        { order: 2, action: "trigger_ai_call", config: "Qualification call within 60 seconds", delay: 60000 },
        { order: 3, action: "create_task", config: "Assign to counsellor for follow-up", delay: 3600000 },
        { order: 4, action: "update_lead_status", config: "contacted", delay: 3600000 },
      ],
      createdAt: NOW - DAY * 60,
    });

    await ctx.db.insert("workflows", {
      name: "Document Follow-up Escalation",
      trigger: "case:documentsPending",
      isActive: true,
      successRate: 76,
      runCount: 392,
      lastRun: NOW - HR * 5,
      steps: [
        { order: 1, action: "send_whatsapp", config: "Friendly document reminder", delay: 0 },
        { order: 2, action: "send_whatsapp", config: "Urgent: documents still missing", delay: DAY * 3 },
        { order: 3, action: "create_task",   config: "Counsellor call — escalate", delay: DAY * 5 },
        { order: 4, action: "escalate_case", config: "Notify manager if no response", delay: DAY * 7 },
      ],
      createdAt: NOW - DAY * 50,
    });

    await ctx.db.insert("workflows", {
      name: "Payment Reminder",
      trigger: "payment:pending",
      isActive: true,
      successRate: 91,
      runCount: 156,
      lastRun: NOW - DAY * 1,
      steps: [
        { order: 1, action: "send_whatsapp", config: "Payment due reminder with payment link", delay: 0 },
        { order: 2, action: "send_sms",      config: "SMS payment reminder", delay: DAY * 2 },
        { order: 3, action: "create_task",   config: "Manual follow-up by counsellor", delay: DAY * 5 },
      ],
      createdAt: NOW - DAY * 40,
    });

    await ctx.db.insert("workflows", {
      name: "Stage Change Notification",
      trigger: "lead:stageChange",
      isActive: true,
      successRate: 98,
      runCount: 841,
      lastRun: NOW - HR * 1,
      steps: [
        { order: 1, action: "send_whatsapp", config: "Stage update notification to applicant", delay: 0 },
        { order: 2, action: "log_note",      config: "Log stage change in timeline", delay: 0 },
      ],
      createdAt: NOW - DAY * 45,
    });

    await ctx.db.insert("workflows", {
      name: "Application Filed Celebration",
      trigger: "case:applicationFiled",
      isActive: false,
      successRate: 100,
      runCount: 67,
      lastRun: NOW - DAY * 5,
      steps: [
        { order: 1, action: "send_whatsapp", config: "Congratulations — application filed! Expected timeline included.", delay: 0 },
        { order: 2, action: "create_task",   config: "Schedule check-in call in 2 weeks", delay: DAY * 14 },
      ],
      createdAt: NOW - DAY * 30,
    });

    // ── 11. Automations (FR4, FR12, FR30) ─────────────────────────────────
    await ctx.db.insert("automations", {
      name: "IELTS Reminder Flow",
      trigger: "lead:qualified",
      channel: "whatsapp",
      isActive: true,
      runCount: 87,
      lastTriggeredAt: NOW - DAY * 2,
      steps: [
        { order: 1, action: "send_whatsapp", delay: 0,          config: "Day 0: Share IELTS study guide PDF" },
        { order: 2, action: "send_whatsapp", delay: DAY * 3,    config: "Day 3: Check IELTS prep progress" },
        { order: 3, action: "create_task",   delay: DAY * 7,    config: "Day 7: Counsellor to confirm exam booking" },
        { order: 4, action: "send_whatsapp", delay: DAY * 14,   config: "Day 14: Final motivation message before exam" },
      ],
      createdAt: NOW - DAY * 45,
    });

    await ctx.db.insert("automations", {
      name: "Document Collection Follow-Up",
      trigger: "case:documentsPending",
      channel: "both",
      isActive: true,
      runCount: 143,
      lastTriggeredAt: NOW - HR * 3,
      steps: [
        { order: 1, action: "send_whatsapp", delay: 0,          config: "Send auto-generated document checklist" },
        { order: 2, action: "send_email",    delay: DAY * 1,    config: "Email checklist with upload portal link" },
        { order: 3, action: "send_whatsapp", delay: DAY * 3,    config: "3-day follow-up: which docs are missing?" },
        { order: 4, action: "create_task",   delay: DAY * 5,    config: "Create escalation task for counsellor" },
      ],
      createdAt: NOW - DAY * 40,
    });

    await ctx.db.insert("automations", {
      name: "Payment Due Alert",
      trigger: "payment:pending",
      channel: "whatsapp",
      isActive: false,
      runCount: 56,
      lastTriggeredAt: NOW - DAY * 10,
      steps: [
        { order: 1, action: "send_whatsapp", delay: 0,          config: "Payment due reminder with Razorpay link" },
        { order: 2, action: "log_note",      delay: 0,          config: "Log payment reminder in timeline" },
        { order: 3, action: "create_task",   delay: DAY * 5,    config: "Manual payment follow-up task" },
      ],
      createdAt: NOW - DAY * 30,
    });

    await ctx.db.insert("automations", {
      name: "Welcome AI Voice Call",
      trigger: "lead:newLead",
      channel: "whatsapp",
      isActive: true,
      runCount: 214,
      lastTriggeredAt: NOW - HR * 1,
      steps: [
        { order: 1, action: "trigger_ai_call", delay: 60000,   config: "AI qualification call within 60 seconds" },
        { order: 2, action: "send_whatsapp",   delay: HR,      config: "Post-call WhatsApp summary + next steps" },
        { order: 3, action: "create_task",     delay: HR * 2,  config: "Assign lead to available counsellor" },
      ],
      createdAt: NOW - DAY * 60,
    });

    await ctx.db.insert("automations", {
      name: "Stage Change Notification",
      trigger: "lead:stageChange",
      channel: "both",
      isActive: true,
      runCount: 502,
      lastTriggeredAt: NOW - HR * 0.5,
      steps: [
        { order: 1, action: "send_whatsapp", delay: 0,         config: "Notify applicant of stage progress" },
        { order: 2, action: "send_email",    delay: HR,        config: "Email with updated case status summary" },
      ],
      createdAt: NOW - DAY * 55,
    });

    return {
      success: true,
      summary: {
        users: 6,
        leads: 15,
        cases: 8,
        documents: 35,
        tasks: 22,
        payments: 8,
        activities: 32,
        messages: 18,
        workflows: 5,
        automations: 5,
      },
      message: "✅ Database seeded successfully with full SRS-aligned test data!",
    };
  },
});
