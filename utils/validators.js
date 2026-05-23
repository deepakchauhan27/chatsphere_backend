// ── Email Validator ─────────────────────────────────
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ── Password Validator ──────────────────────────────
// Min 6 chars, at least 1 letter and 1 number
const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return regex.test(password);
};

// ── Name Validator ──────────────────────────────────
const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// ── MongoDB ObjectId Validator ──────────────────────
const isValidObjectId = (id) => {
  const regex = /^[a-fA-F0-9]{24}$/;
  return regex.test(id);
};

// ── File Type Validator ─────────────────────────────
const isValidImageType = (mimetype) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  return allowed.includes(mimetype);
};

const isValidVideoType = (mimetype) => {
  const allowed = ["video/mp4", "video/mkv", "video/webm", "video/avi"];
  return allowed.includes(mimetype);
};

const isValidAudioType = (mimetype) => {
  const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
  return allowed.includes(mimetype);
};

const isValidDocType = (mimetype) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  return allowed.includes(mimetype);
};

// ── File Size Validator ─────────────────────────────
const isValidFileSize = (size, maxMB = 5) => {
  const maxBytes = maxMB * 1024 * 1024;
  return size <= maxBytes;
};

// ── URL Validator ───────────────────────────────────
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ── Phone Number Validator ──────────────────────────
const isValidPhone = (phone) => {
  const regex = /^\+?[\d\s\-()]{7,15}$/;
  return regex.test(phone);
};

// ── Sanitize String ─────────────────────────────────
// Removes HTML tags to prevent XSS
const sanitizeString = (str) => {
  return str.replace(/<[^>]*>/g, "").trim();
};

// ── Validate Register Input ─────────────────────────
const validateRegisterInput = (name, email, password) => {
  const errors = [];

  if (!isValidName(name)) {
    errors.push("Name must be between 2 and 50 characters");
  }

  if (!isValidEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!isValidPassword(password)) {
    errors.push("Password must be at least 6 characters with 1 letter and 1 number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ── Validate Login Input ────────────────────────────
const validateLoginInput = (email, password) => {
  const errors = [];

  if (!isValidEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ── Validate Message Input ──────────────────────────
const validateMessageInput = (content, type) => {
  const errors = [];

  if (type === "text" && (!content || content.trim().length === 0)) {
    errors.push("Message content cannot be empty");
  }

  if (content && content.length > 5000) {
    errors.push("Message cannot exceed 5000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidObjectId,
  isValidImageType,
  isValidVideoType,
  isValidAudioType,
  isValidDocType,
  isValidFileSize,
  isValidUrl,
  isValidPhone,
  sanitizeString,
  validateRegisterInput,
  validateLoginInput,
  validateMessageInput,
};