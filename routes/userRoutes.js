const express = require("express");
const router  = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { upload }  = require("../config/cloudinary");

router.get("/",          protect, getAllUsers);
router.get("/search",    protect, searchUsers);
router.get("/:id",       protect, getUserProfile);
router.put("/profile",   protect, upload.single("avatar"), updateUserProfile);

module.exports = router;