const { cloudinary } = require("../config/cloudinary");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// @desc Upload media and send as message
const uploadMedia = async (req, res) => {
  try {
    const { chatId, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    const message = await Message.create({
      chat:      chatId,
      sender:    req.user._id,
      content:   req.file.originalname,
      type:      type || detectFileType(req.file.mimetype),
      mediaUrl:  req.file.path,
      mediaName: req.file.originalname,
      readBy:    [req.user._id],
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt:   Date.now(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("chat");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all media (images/videos) for a chat
const getChatMedia = async (req, res) => {
  try {
    const { chatId } = req.params;

    const media = await Message.find({
      chat: chatId,
      type: { $in: ["image", "video", "audio", "file"] },
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete media from cloudinary + message
const deleteMedia = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this media" });
    }

    // Delete from Cloudinary if mediaUrl exists
    if (message.mediaUrl) {
      const publicId = extractPublicId(message.mediaUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      }
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Upload profile avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      url:      req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Upload group avatar
const uploadGroupAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      url:      req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- Helpers ----

// Detect file type from mimetype
const detectFileType = (mimetype) => {
  if (mimetype.startsWith("image/"))  return "image";
  if (mimetype.startsWith("video/"))  return "video";
  if (mimetype.startsWith("audio/"))  return "audio";
  return "file";
};

// Extract Cloudinary public_id from URL
const extractPublicId = (url) => {
  try {
    const parts    = url.split("/");
    const filename = parts[parts.length - 1];
    const folder   = parts[parts.length - 2];
    const publicId = `${folder}/${filename.split(".")[0]}`;
    return publicId;
  } catch {
    return null;
  }
};

module.exports = {
  uploadMedia,
  getChatMedia,
  deleteMedia,
  uploadAvatar,
  uploadGroupAvatar,
};