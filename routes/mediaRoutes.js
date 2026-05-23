const express = require("express");
const router  = express.Router();
const {
  uploadMedia,
  getChatMedia,
  deleteMedia,
  uploadAvatar,
  uploadGroupAvatar,
} = require("../controllers/mediaController");
const { protect }        = require("../middleware/authMiddleware");
const { upload }         = require("../config/cloudinary");

// ── Upload media as message ──────────────────────────
router.post(
  "/upload",
  protect,
  upload.single("media"),
  uploadMedia
);

// ── Get all media for a chat ─────────────────────────
router.get(
  "/chat/:chatId",
  protect,
  getChatMedia
);

// ── Delete media message ─────────────────────────────
router.delete(
  "/:id",
  protect,
  deleteMedia
);

// ── Upload profile avatar ────────────────────────────
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

// ── Upload group avatar ──────────────────────────────
router.post(
  "/group-avatar",
  protect,
  upload.single("avatar"),
  uploadGroupAvatar
);

module.exports = router;