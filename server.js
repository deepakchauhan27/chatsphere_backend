const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const socketHandler = require("./socket/socketHandler");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ── Allowed Origins ──────────────────────────────────
const allowedOrigins = [
  "https://chatsphere-sepia.vercel.app",
  "http://localhost:5173",
];

const io = new Server(server, {
  cors: {
    origin:      allowedOrigins,
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/chats",    require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/groups",   require("./routes/groupRoutes"));
app.use("/api/calls",    require("./routes/callRoutes"));
app.use("/api/media",    require("./routes/mediaRoutes"));

// ── Socket.io ────────────────────────────────────────
socketHandler(io);

// ── Health Check ─────────────────────────────────────
app.get("/", (req, res) => res.send("ChatSphere API Running"));

// ── Error Handler ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));