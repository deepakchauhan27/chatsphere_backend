const CallLog = require("../models/CallLog");

// @desc Save call log
const saveCallLog = async (req, res) => {
  try {
    const { receiverId, type, status, duration, startedAt, endedAt } = req.body;

    const log = await CallLog.create({
      caller:    req.user._id,
      receiver:  receiverId,
      type,
      status,
      duration,
      startedAt,
      endedAt,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get call history for logged in user
const getCallHistory = async (req, res) => {
  try {
    const logs = await CallLog.find({
      $or: [{ caller: req.user._id }, { receiver: req.user._id }],
    })
      .populate("caller",   "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update call status (missed, received, rejected)
const updateCallStatus = async (req, res) => {
  try {
    const log = await CallLog.findByIdAndUpdate(
      req.params.id,
      {
        status:   req.body.status,
        duration: req.body.duration,
        endedAt:  req.body.endedAt,
      },
      { new: true }
    );

    if (!log) return res.status(404).json({ message: "Call log not found" });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete call log
const deleteCallLog = async (req, res) => {
  try {
    await CallLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Call log deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveCallLog, getCallHistory, updateCallStatus, deleteCallLog };