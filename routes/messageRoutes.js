const express = require("express");
const router  = express.Router();
const {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} = require("../controllers/messageController");
const { protect }  = require("../middleware/authMiddleware");
const { upload }   = require("../config/cloudinary");

router.post("/",              protect, upload.single("media"), sendMessage);
router.get("/:chatId",        protect, getMessages);
router.put("/read/:chatId",   protect, markAsRead);
router.delete("/:id",         protect, deleteMessage);

module.exports = router;