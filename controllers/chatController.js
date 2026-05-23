const Chat = require("../models/Chat");

// @desc Access or create one-to-one chat
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    let chat = await Chat.findOne({
      isGroup:      false,
      participants: { $all: [req.user._id, userId] },
    })
      .populate("participants", "-password")
      .populate({
        path:     "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, userId],
        isGroup:      false,
      });
      chat = await Chat.findById(chat._id).populate("participants", "-password");
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all chats for logged in user
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "-password")
      .populate({
        path:     "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        message: "Group name and at least 2 participants required",
      });
    }

    const allParticipants = [...participants, req.user._id];

    const chat = await Chat.create({
      isGroup:     true,
      groupName:   name,
      participants: allParticipants,
      groupAdmin:  req.user._id,
      groupAvatar: req.file ? req.file.path : "",
    });

    const fullChat = await Chat.findById(chat._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update group name / avatar
const updateGroup = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can update group" });
    }

    chat.groupName = req.body.name || chat.groupName;
    if (req.file) chat.groupAvatar = req.file.path;

    const updated = await chat.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add member to group
const addToGroup = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: req.body.userId } },
      { new: true }
    ).populate("participants", "-password");

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove member from group
const removeFromGroup = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { $pull: { participants: req.body.userId } },
      { new: true }
    ).populate("participants", "-password");

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single chat by ID
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "-password")
      .populate({
        path:     "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  getMyChats,
  createGroupChat,
  updateGroup,
  addToGroup,
  removeFromGroup,
  getChatById,
};