const Message = require("../models/Message");
const Chat    = require("../models/Chat");

// @desc Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, type } = req.body;

    let mediaUrl  = "";
    let mediaName = "";
    if (req.file) {
      mediaUrl  = req.file.path;
      mediaName = req.file.originalname;
    }

    const message = await Message.create({
      chat:     chatId,
      sender:   req.user._id,
      content:  content || "",
      type:     type    || "text",
      mediaUrl,
      mediaName,
      readBy:   [req.user._id],
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: Date.now() });

    const populated = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("chat");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all messages in a chat
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name avatar email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark messages as read
const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        chat:   req.params.chatId,
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, markAsRead, deleteMessage };