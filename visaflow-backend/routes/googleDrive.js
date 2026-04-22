/**
 * Google Drive document routes
 * UI 5  – Document Queue
 * FR26  – Store documents in Google Drive
 * FR29  – AI document verification
 */
const express = require("express");
const multer = require("multer");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const {
  uploadFile,
  getFile,
  deleteFile,
  verifyDocument,
  rejectDocument,
} = require("../controllers/googleDriveController");

// multer stores file in memory before streaming to Google Drive
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/drive/upload  – upload a document to Google Drive (FR26)
router.post("/upload", verifyToken, upload.single("file"), uploadFile);

// GET  /api/drive/file/:fileId  – get signed URL for a file
router.get("/file/:fileId", verifyToken, getFile);

// DELETE /api/drive/file/:fileId  – remove a document (admin/manager only)
router.delete(
  "/file/:fileId",
  verifyToken,
  checkRole("admin", "manager"),
  deleteFile,
);

// POST /api/drive/verify  – AI-verify document & mark verified in Convex (FR29)
router.post(
  "/verify",
  verifyToken,
  checkRole("admin", "manager", "documentExecutive"),
  verifyDocument,
);

// POST /api/drive/reject  – mark document rejected with reason (UI 5)
router.post(
  "/reject",
  verifyToken,
  checkRole("admin", "manager", "documentExecutive"),
  rejectDocument,
);

module.exports = router;
