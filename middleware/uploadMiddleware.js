const multer = require("multer");
const path   = require("path");

// Allowed file types
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const allowedVideoTypes = ["video/mp4", "video/mkv", "video/webm", "video/avi"];
const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
const allowedDocTypes   = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const allAllowedTypes = [
  ...allowedImageTypes,
  ...allowedVideoTypes,
  ...allowedAudioTypes,
  ...allowedDocTypes,
];

// File filter
const fileFilter = (req, file, cb) => {
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Local storage (used before Cloudinary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Memory storage (for direct Cloudinary stream)
const memoryStorage = multer.memoryStorage();

// Size limits
const limits = {
  image: { fileSize: 5  * 1024 * 1024 }, // 5MB
  video: { fileSize: 50 * 1024 * 1024 }, // 50MB
  audio: { fileSize: 10 * 1024 * 1024 }, // 10MB
  file:  { fileSize: 20 * 1024 * 1024 }, // 20MB
  any:   { fileSize: 50 * 1024 * 1024 }, // 50MB
};

// Upload instances
const uploadImage = multer({
  storage:    memoryStorage,
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
  limits: limits.image,
});

const uploadVideo = multer({
  storage:    memoryStorage,
  fileFilter: (req, file, cb) => {
    if (allowedVideoTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only video files are allowed"), false);
  },
  limits: limits.video,
});

const uploadAudio = multer({
  storage:    memoryStorage,
  fileFilter: (req, file, cb) => {
    if (allowedAudioTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only audio files are allowed"), false);
  },
  limits: limits.audio,
});

const uploadAny = multer({
  storage:    memoryStorage,
  fileFilter,
  limits:     limits.any,
});

// Multer error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size too large" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Unexpected file field" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadAny,
  handleUploadError,
};