const express = require("express");
const router  = express.Router();
const {
  saveCallLog,
  getCallHistory,
  updateCallStatus,
  deleteCallLog,
} = require("../controllers/callController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",           protect, saveCallLog);
router.get("/history",     protect, getCallHistory);
router.put("/:id",         protect, updateCallStatus);
router.delete("/:id",      protect, deleteCallLog);

module.exports = router;