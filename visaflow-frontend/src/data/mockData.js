// Shared mock data – used as fallback when Convex is not yet connected.

export const mockLeads = [
  { _id: "l1", name: "Arjun Mehta", phone: "+91 98765 43210", email: "arjun@email.com", visaType: "H-1B", country: "United States", budget: 85000, source: "metaAds", status: "qualified", aiScore: 87, ieltsScore: 7.5, assignedTo: "u1", tags: ["high-budget", "h-1b"], createdAt: Date.now() - 86400000 * 3 },
  { _id: "l2", name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@email.com", visaType: "Student", country: "Canada", budget: 45000, source: "whatsapp", status: "newLead", aiScore: 62, tags: ["student", "canada"], createdAt: Date.now() - 86400000 * 1 },
  { _id: "l3", name: "Rahul Verma", phone: "+91 76543 21098", email: "rahul@email.com", visaType: "PR", country: "Australia", budget: 120000, source: "manual", status: "documentsPending", aiScore: 91, ieltsScore: 8, assignedTo: "u2", tags: ["pr", "high-budget"], createdAt: Date.now() - 86400000 * 7 },
  { _id: "l4", name: "Sneha Patel", phone: "+91 65432 10987", email: "sneha@email.com", visaType: "Family", country: "UK", budget: 65000, source: "metaAds", status: "contacted", aiScore: 74, assignedTo: "u1", tags: ["family", "uk"], createdAt: Date.now() - 86400000 * 2 },
  { _id: "l5", name: "Vikram Singh", phone: "+91 54321 09876", email: "vikram@email.com", visaType: "Business", country: "UAE", budget: 200000, source: "manual", status: "applicationFiled", aiScore: 95, assignedTo: "u3", tags: ["business", "high-budget"], createdAt: Date.now() - 86400000 * 14 },
  { _id: "l6", name: "Anita Joshi", phone: "+91 43210 98765", email: "anita@email.com", visaType: "H-1B", country: "United States", budget: 75000, source: "csv", status: "decisionPending", aiScore: 83, assignedTo: "u2", tags: ["h-1b"], createdAt: Date.now() - 86400000 * 21 },
  { _id: "l7", name: "Deepak Kumar", phone: "+91 32109 87654", email: "deepak@email.com", visaType: "Student", country: "Germany", budget: 30000, source: "whatsapp", status: "closed", aiScore: 55, tags: ["student", "europe"], createdAt: Date.now() - 86400000 * 30 },
];

export const mockCases = [
  { _id: "c1", caseNumber: "VF-2024-001", leadId: "l1", applicantName: "Arjun Mehta", visaType: "H-1B", nationality: "Indian", status: "In Progress", counsellorId: "u1", branch: "Mumbai", email: "arjun@email.com", phone: "+91 98765 43210", createdAt: Date.now() - 86400000 * 10 },
  { _id: "c2", caseNumber: "VF-2024-002", leadId: "l3", applicantName: "Rahul Verma", visaType: "PR", nationality: "Indian", status: "Documents Pending", counsellorId: "u2", branch: "Delhi", email: "rahul@email.com", phone: "+91 76543 21098", createdAt: Date.now() - 86400000 * 7 },
  { _id: "c3", caseNumber: "VF-2024-003", leadId: "l5", applicantName: "Vikram Singh", visaType: "Business", nationality: "Indian", status: "Application Filed", counsellorId: "u3", branch: "Mumbai", email: "vikram@email.com", phone: "+91 54321 09876", createdAt: Date.now() - 86400000 * 14 },
  { _id: "c4", caseNumber: "VF-2024-004", leadId: "l6", applicantName: "Anita Joshi", visaType: "H-1B", nationality: "Indian", status: "Decision Pending", counsellorId: "u2", branch: "Bangalore", email: "anita@email.com", phone: "+91 43210 98765", createdAt: Date.now() - 86400000 * 21 },
  { _id: "c5", caseNumber: "VF-2024-005", leadId: "l4", applicantName: "Sneha Patel", visaType: "Family Visa", nationality: "Indian", status: "In Progress", counsellorId: "u1", branch: "Mumbai", email: "sneha@email.com", phone: "+91 65432 10987", createdAt: Date.now() - 86400000 * 5 },
];

export const mockDocuments = [
  { _id: "d1", caseId: "c1", name: "Passport Copy", type: "Identity", status: "verified", uploadedAt: Date.now() - 86400000 * 5, fileUrl: null },
  { _id: "d2", caseId: "c1", name: "IELTS Scorecard", type: "Language", status: "uploaded", uploadedAt: Date.now() - 86400000 * 3, fileUrl: null },
  { _id: "d3", caseId: "c1", name: "Employment Letter", type: "Work", status: "pending", fileUrl: null },
  { _id: "d4", caseId: "c1", name: "Bank Statements (6 months)", type: "Financial", status: "pending", fileUrl: null },
  { _id: "d5", caseId: "c1", name: "Educational Certificates", type: "Education", status: "rejected", notes: "Low resolution scan, please reupload", uploadedAt: Date.now() - 86400000 * 2, fileUrl: null },
  { _id: "d6", caseId: "c2", name: "Passport Copy", type: "Identity", status: "verified", uploadedAt: Date.now() - 86400000 * 6, fileUrl: null },
  { _id: "d7", caseId: "c2", name: "Skills Assessment", type: "Professional", status: "pending", fileUrl: null },
];

export const mockPayments = [
  { _id: "p1", caseId: "c1", totalAmount: 85000, paidAmount: 42500, pendingAmount: 42500, method: "upi", status: "partial", createdAt: Date.now() - 86400000 * 8 },
  { _id: "p2", caseId: "c3", totalAmount: 200000, paidAmount: 200000, pendingAmount: 0, method: "bankTransfer", status: "paid", createdAt: Date.now() - 86400000 * 12 },
  { _id: "p3", caseId: "c2", totalAmount: 120000, paidAmount: 0, pendingAmount: 120000, status: "pending", createdAt: Date.now() - 86400000 * 7 },
];

export const mockActivities = [
  { _id: "a1", caseId: "c1", type: "stageChange", description: "Case created and assigned to counsellor Riya Desai", createdAt: Date.now() - 86400000 * 10 },
  { _id: "a2", caseId: "c1", type: "whatsappMessage", description: "WhatsApp sent: Welcome to VisaFlow! Your H-1B case has been opened.", createdAt: Date.now() - 86400000 * 9 },
  { _id: "a3", caseId: "c1", type: "documentUpload", description: "Passport Copy uploaded and verified by AI", createdAt: Date.now() - 86400000 * 5 },
  { _id: "a4", caseId: "c1", type: "payment", description: "First installment of ₹42,500 received via UPI", createdAt: Date.now() - 86400000 * 4 },
  { _id: "a5", caseId: "c1", type: "voiceCall", description: "AI call completed. Duration: 4m 32s. Applicant confirmed IELTS score 7.5.", createdAt: Date.now() - 86400000 * 2 },
  { _id: "a6", caseId: "c1", type: "note", description: "Employment letter requested from Infosys HR department", createdAt: Date.now() - 86400000 * 1 },
];

export const mockMessages = [
  { _id: "m1", leadId: "l1", channel: "whatsapp", content: "Hi, I saw your ad about H-1B visa. Can you help?", direction: "inbound", createdAt: Date.now() - 3600000 * 26 },
  { _id: "m2", leadId: "l1", channel: "whatsapp", content: "Hello Arjun! Yes, we specialize in H-1B visas. I'm Riya, your counsellor. Can we schedule a call?", direction: "outbound", createdAt: Date.now() - 3600000 * 25 },
  { _id: "m3", leadId: "l1", channel: "whatsapp", content: "Sure, I'm available tomorrow afternoon.", direction: "inbound", createdAt: Date.now() - 3600000 * 24, aiInsight: "Positive intent – high conversion likelihood" },
  { _id: "m4", leadId: "l1", channel: "whatsapp", content: "Great! I've scheduled a call for 3pm tomorrow. Meanwhile, could you share your current employment details?", direction: "outbound", createdAt: Date.now() - 3600000 * 20 },
  { _id: "m5", leadId: "l1", channel: "whatsapp", content: "I work at Infosys as a Senior Developer. 5 years experience.", direction: "inbound", createdAt: Date.now() - 3600000 * 18 },
  { _id: "m6", leadId: "l2", channel: "whatsapp", content: "Hello, I want to apply for Canadian student visa", direction: "inbound", createdAt: Date.now() - 3600000 * 5 },
  { _id: "m7", leadId: "l4", channel: "sms", content: "Reminder: Your IELTS exam is on Friday. Best of luck!", direction: "outbound", createdAt: Date.now() - 3600000 * 2 },
];

export const mockUsers = [
  { _id: "u1", name: "Riya Desai", email: "riya@visaflow.com", role: "counsellor", branch: "Mumbai", avatar: null },
  { _id: "u2", name: "Karan Shah", email: "karan@visaflow.com", role: "counsellor", branch: "Delhi", avatar: null },
  { _id: "u3", name: "Neha Gupta", email: "neha@visaflow.com", role: "manager", branch: "Mumbai", avatar: null },
];

export const mockMonthlyData = [
  { month: "Jan", organic: 24, ads: 18 },
  { month: "Feb", organic: 30, ads: 25 },
  { month: "Mar", organic: 28, ads: 32 },
  { month: "Apr", organic: 35, ads: 28 },
  { month: "May", organic: 42, ads: 38 },
];

export const mockRegions = [
  { region: "North America", successRate: 72, totalLeads: 148 },
  { region: "Europe", successRate: 65, totalLeads: 92 },
  { region: "Southeast Asia", successRate: 81, totalLeads: 73 },
  { region: "Middle East", successRate: 58, totalLeads: 54 },
];

export const mockAgents = [
  { _id: "u1", name: "Riya Desai", totalLeads: 38, closedLeads: 27, conversionRate: 71, branch: "Mumbai" },
  { _id: "u2", name: "Karan Shah", totalLeads: 31, closedLeads: 20, conversionRate: 65, branch: "Delhi" },
  { _id: "u3", name: "Neha Gupta", totalLeads: 29, closedLeads: 17, conversionRate: 59, branch: "Mumbai" },
  { _id: "u4", name: "Amit Tiwari", totalLeads: 22, closedLeads: 12, conversionRate: 55, branch: "Bangalore" },
];

export const mockAutomations = [
  { _id: "a1", name: "IELTS Reminder Flow", trigger: "lead:qualified", channel: "whatsapp", isActive: true, steps: [{ order: 1, action: "send_whatsapp", delay: 0 }, { order: 2, action: "create_task", delay: 259200000 }, { order: 3, action: "send_whatsapp", delay: 604800000 }] },
  { _id: "a2", name: "Document Follow-Up", trigger: "case:documentsPending", channel: "both", isActive: true, steps: [{ order: 1, action: "send_whatsapp", delay: 0 }, { order: 2, action: "send_whatsapp", delay: 259200000 }, { order: 3, action: "create_task", delay: 432000000 }] },
  { _id: "a3", name: "Payment Due Alert", trigger: "payment:pending", channel: "whatsapp", isActive: false, steps: [{ order: 1, action: "send_whatsapp", delay: 0 }, { order: 2, action: "log_note", delay: 0 }, { order: 3, action: "create_task", delay: 432000000 }] },
];

export const mockWorkflows = [
  { _id: "w1", name: "New Lead Onboarding", trigger: "lead:newLead", isActive: true, successRate: 84, lastRun: Date.now() - 3600000 },
  { _id: "w2", name: "Document Follow-up", trigger: "case:documentsPending", isActive: true, successRate: 76, lastRun: Date.now() - 7200000 },
  { _id: "w3", name: "Payment Reminder", trigger: "payment:pending", isActive: false, successRate: 91, lastRun: Date.now() - 86400000 },
];
