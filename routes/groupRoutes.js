const express = require("express");
const router  = express.Router();
const {
  createGroup,
  getGroup,
  updateGroup,
  addMember,
  removeMember,
  makeAdmin,
  leaveGroup,
  deleteGroup,
} = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");
const { upload }  = require("../config/cloudinary");

router.post("/",                  protect, upload.single("avatar"), createGroup);
router.get("/:id",                protect, getGroup);
router.put("/:id",                protect, upload.single("avatar"), updateGroup);
router.put("/:id/add-member",     protect, addMember);
router.put("/:id/remove-member",  protect, removeMember);
router.put("/:id/make-admin",     protect, makeAdmin);
router.put("/:id/leave",          protect, leaveGroup);
router.delete("/:id",             protect, deleteGroup);

module.exports = router;