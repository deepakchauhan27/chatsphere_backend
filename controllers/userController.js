const User = require("../models/User");

// @desc Search users by email
const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query required" });
    }

    const users = await User.find({
      email: { $regex: email, $options: "i" },
      _id:   { $ne: req.user._id },
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update logged in user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.bio  = req.body.bio  || user.bio;
    if (req.file)         user.avatar   = req.file.path;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();

    res.json({
      _id:    updated._id,
      name:   updated.name,
      email:  updated.email,
      avatar: updated.avatar,
      bio:    updated.bio,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all users (except self)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchUsers, getUserProfile, updateUserProfile, getAllUsers };