const User            = require("../models/User");
const roomManager     = require("./roomManager");
const EVENTS          = require("./events");
const signalingServer = require("../webrtc/signalingServer");

const socketHandler = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ── User Comes Online ───────────────────────────
    socket.on(EVENTS.USER_ONLINE, async (userId) => {
      roomManager.addUser(userId, socket.id);
      socket.userId = userId;

      // Update DB
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
      });

      // Broadcast to all users
      io.emit(EVENTS.USER_ONLINE, {
        userId,
        onlineUsers: roomManager.getOnlineUsers(),
      });

      console.log(
  `User ${userId} connected with socket ${socket.id}`
);

console.log(
  "Online users:",
  roomManager.getOnlineUsers()
);
    });

    // ── Join Chat Room ──────────────────────────────
    socket.on(EVENTS.CHAT_JOIN, (chatId) => {
      socket.join(chatId);
      console.log(`${socket.userId} joined chat: ${chatId}`);
    });

    // ── Leave Chat Room ─────────────────────────────
    socket.on(EVENTS.CHAT_LEAVE, (chatId) => {
      socket.leave(chatId);
      console.log(`${socket.userId} left chat: ${chatId}`);
    });

    // ── Send Message ────────────────────────────────
    socket.on(EVENTS.MESSAGE_SEND, (message) => {
      const { chat } = message;

      // Emit to all in the chat room except sender
      socket.to(chat._id || chat).emit(EVENTS.MESSAGE_RECEIVE, message);
    });

    // ── Message Read ────────────────────────────────
    socket.on(EVENTS.MESSAGE_READ, ({ chatId, userId }) => {
      socket.to(chatId).emit(EVENTS.MESSAGE_READ, { chatId, userId });
    });

    // ── Message Deleted ─────────────────────────────
    socket.on(EVENTS.MESSAGE_DELETED, ({ chatId, messageId }) => {
      socket.to(chatId).emit(EVENTS.MESSAGE_DELETED, { chatId, messageId });
    });

    // ── Typing Indicators ───────────────────────────
    socket.on(EVENTS.USER_TYPING, ({ chatId, userId, userName }) => {
      socket.to(chatId).emit(EVENTS.USER_TYPING, { chatId, userId, userName });
    });

    socket.on(EVENTS.USER_STOP_TYPING, ({ chatId, userId }) => {
      socket.to(chatId).emit(EVENTS.USER_STOP_TYPING, { chatId, userId });
    });

    // ── Group Events ────────────────────────────────
    socket.on(EVENTS.GROUP_CREATED, ({ group, members }) => {
      members.forEach((memberId) => {
        const memberSocketId = roomManager.getSocketId(memberId);
        if (memberSocketId) {
          io.to(memberSocketId).emit(EVENTS.GROUP_CREATED, group);
        }
      });
    });

    socket.on(EVENTS.GROUP_MEMBER_ADD, ({ chatId, userId, group }) => {
      const userSocketId = roomManager.getSocketId(userId);
      if (userSocketId) {
        io.to(userSocketId).emit(EVENTS.GROUP_MEMBER_ADD, group);
      }
      socket.to(chatId).emit(EVENTS.GROUP_UPDATED, group);
    });

    socket.on(EVENTS.GROUP_MEMBER_REM, ({ chatId, userId, group }) => {
      const userSocketId = roomManager.getSocketId(userId);
      if (userSocketId) {
        io.to(userSocketId).emit(EVENTS.GROUP_MEMBER_REM, group);
      }
      socket.to(chatId).emit(EVENTS.GROUP_UPDATED, group);
    });

    // ── WebRTC Signaling + Call Events ──────────────
    // Handles: offer, answer, ICE, call initiate,
    //          accept, reject, end, mute, screen share
    console.log("Loading signaling server for socket:", socket.id);
    signalingServer(io, socket);

    // ── Disconnect ──────────────────────────────────
    socket.on(EVENTS.DISCONNECT, async () => {
      const userId = socket.userId;

      if (userId) {
        console.log(
  `User ${userId} disconnected from socket ${socket.id}`
);
        roomManager.removeUser(userId);

        // Update DB
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: Date.now(),
          socketId: "",
        });

        // Broadcast offline status
        io.emit(EVENTS.USER_OFFLINE, {
          userId,
          onlineUsers: roomManager.getOnlineUsers(),
        });

        console.log(`User offline: ${userId}`);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;