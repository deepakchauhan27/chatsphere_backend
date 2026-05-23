const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat:      { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:   { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    mediaUrl:  { type: String, default: "" },
    mediaName: { type: String, default: "" },
    readBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);