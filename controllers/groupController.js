const Group = require("../models/Group");
const Chat  = require("../models/Chat");

// @desc Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name || !members || members.length < 2) {
      return res.status(400).json({
        message: "Group name and at least 2 members required",
      });
    }

    const chat = await Chat.create({
      isGroup:      true,
      groupName:    name,
      participants: [...members, req.user._id],
      groupAdmin:   req.user._id,
      groupAvatar:  req.file ? req.file.path : "",
    });

    const group = await Group.create({
      name,
      description,
      avatar: req.file ? req.file.path : "",
      admin:  req.user._id,
      chat:   chat._id,
      members: [
        { user: req.user._id, role: "admin" },
        ...members.map((id) => ({ user: id, role: "member" })),
      ],
    });

    const populated = await Group.findById(group._id)
      .populate("members.user", "name avatar email")
      .populate("admin",        "name avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get group by ID
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members.user", "name avatar email isOnline lastSeen")
      .populate("admin",        "name avatar");

    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update group info
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can update group" });
    }

    group.name        = req.body.name        || group.name;
    group.description = req.body.description || group.description;
    if (req.file) group.avatar = req.file.path;

    await Chat.findByIdAndUpdate(group.chat, {
      groupName:   group.name,
      groupAvatar: group.avatar,
    });

    const updated = await group.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add member to group
const addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const alreadyMember = group.members.some(
      (m) => m.user.toString() === req.body.userId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push({ user: req.body.userId, role: "member" });
    await group.save();

    await Chat.findByIdAndUpdate(group.chat, {
      $addToSet: { participants: req.body.userId },
    });

    const updated = await Group.findById(group._id)
      .populate("members.user", "name avatar email");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove member from group
const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== req.body.userId
    );
    await group.save();

    await Chat.findByIdAndUpdate(group.chat, {
      $pull: { participants: req.body.userId },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Make member admin
const makeAdmin = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can promote members" });
    }

    const member = group.members.find(
      (m) => m.user.toString() === req.body.userId
    );
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.role = "admin";
    group.admin = req.body.userId;
    await group.save();

    res.json({ message: "Member promoted to admin successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Leave group
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    await group.save();

    await Chat.findByIdAndUpdate(group.chat, {
      $pull: { participants: req.user._id },
    });

    res.json({ message: "Left group successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete group (admin only)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can delete group" });
    }

    await Chat.findByIdAndDelete(group.chat);
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroup,
  updateGroup,
  addMember,
  removeMember,
  makeAdmin,
  leaveGroup,
  deleteGroup,
};