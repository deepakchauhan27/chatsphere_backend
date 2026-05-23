const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    avatar:      { type: String, default: "" },
    admin:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role:     { type: String, enum: ["admin", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    chat:        { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);