const express = require("express");
const router  = express.Router();
const {
  accessChat,
  getMyChats,
  createGroupChat,
  updateGroup,
  addToGroup,
  removeFromGroup,
  getChatById,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { upload }  = require("../config/cloudinary");

router.post("/",                    protect, accessChat);
router.get("/",                     protect, getMyChats);
router.get("/:id",                  protect, getChatById);
router.post("/group",               protect, upload.single("groupAvatar"), createGroupChat);
router.put("/group/:id",            protect, upload.single("groupAvatar"), updateGroup);
router.put("/group/:id/add",        protect, addToGroup);
router.put("/group/:id/remove",     protect, removeFromGroup);

module.exports = router;