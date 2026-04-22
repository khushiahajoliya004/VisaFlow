/**
 * Google Drive Controller
 * UI 5  – Document Queue
 * FR26  – Store and retrieve documents in Google Drive
 * FR29  – AI-powered document authenticity verification
 *
 * Install: npm install googleapis openai
 */
const { runMutation, runQuery } = require("../config/convex");

function getDriveClient() {
  const { google } = require("googleapis");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

function getOpenAI() {
  const OpenAI = require("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// ── POST /api/drive/upload ───────────────────────────────────────────────────
// FR26 – Upload a file buffer (from multer) to Google Drive and save URL to Convex
async function uploadFile(req, res, next) {
  try {
    const { caseId, documentId, name, type } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!caseId) return res.status(400).json({ error: "caseId is required" });

    const drive = getDriveClient();
    const { Readable } = require("stream");

    const fileStream = Readable.from(req.file.buffer);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        parents: FOLDER_ID ? [FOLDER_ID] : [],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fileStream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    const fileId = driveResponse.data.id;
    const fileUrl = driveResponse.data.webViewLink;

    // Make file readable by anyone with the link
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    // Update Convex document record with Drive URL (FR26)
    if (documentId) {
      await runMutation("documents:updateStatus", {
        id: documentId,
        status: "uploaded",
      });
      await runMutation("documents:update", {
        id: documentId,
        fileUrl,
      });
    } else {
      // Create new document record
      await runMutation("documents:create", {
        caseId,
        name: name || req.file.originalname,
        type: type || "other",
        status: "uploaded",
        fileUrl,
      });
    }

    await runMutation("activities:create", {
      caseId,
      type: "documentUpload",
      description: `Document uploaded: ${name || req.file.originalname}`,
    });

    res.json({ success: true, fileId, fileUrl });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/drive/file/:fileId ──────────────────────────────────────────────
// Get Drive file metadata and view link
async function getFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const drive = getDriveClient();

    const { data } = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink, size, createdTime",
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/drive/file/:fileId ───────────────────────────────────────────
// Remove a file from Google Drive
async function deleteFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/drive/verify ───────────────────────────────────────────────────
// FR29 – AI-verify document authenticity; update Convex status to verified
async function verifyDocument(req, res, next) {
  try {
    const { documentId, fileUrl, documentType } = req.body;
    if (!documentId) return res.status(400).json({ error: "documentId is required" });

    // Ask GPT-4o Vision to check the document (FR29)
    const aiResult = await runAIVerification(fileUrl, documentType);

    if (aiResult.verified) {
      await runMutation("documents:updateStatus", {
        id: documentId,
        status: "verified",
        notes: aiResult.notes,
      });
    } else {
      await runMutation("documents:updateStatus", {
        id: documentId,
        status: "rejected",
        notes: aiResult.notes,
      });
    }

    res.json({
      verified: aiResult.verified,
      confidence: aiResult.confidence,
      notes: aiResult.notes,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/drive/reject ───────────────────────────────────────────────────
// UI 5 – Manually reject a document with a reason note
async function rejectDocument(req, res, next) {
  try {
    const { documentId, reason, caseId } = req.body;
    if (!documentId) return res.status(400).json({ error: "documentId is required" });

    await runMutation("documents:updateStatus", {
      id: documentId,
      status: "rejected",
      notes: reason || "Rejected by reviewer",
    });

    if (caseId) {
      await runMutation("activities:create", {
        caseId,
        type: "documentUpload",
        description: `Document rejected: ${reason || "No reason provided"}`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ── AI verification helper ───────────────────────────────────────────────────
// FR29 – Uses GPT-4o Vision to assess document authenticity
async function runAIVerification(fileUrl, documentType) {
  try {
    if (!process.env.OPENAI_API_KEY || !fileUrl) {
      return { verified: true, confidence: 0.5, notes: "AI verification skipped – no key or URL" };
    }

    const openai = getOpenAI();
    const prompt =
      `You are a visa document verification expert. ` +
      `Examine this ${documentType || "document"} and determine if it appears authentic. ` +
      `Check for: proper formatting, official seals/watermarks, no signs of tampering. ` +
      `Respond with JSON: { "verified": true/false, "confidence": 0.0-1.0, "notes": "..." }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: fileUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch {
    return { verified: false, confidence: 0, notes: "AI verification error – manual review required" };
  }
}

module.exports = { uploadFile, getFile, deleteFile, verifyDocument, rejectDocument };
