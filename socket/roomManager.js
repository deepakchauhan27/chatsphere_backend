// Tracks userId -> socketId mapping
const onlineUsers = new Map();

// Tracks callId -> { caller, receiver, type } mapping
const activeCalls = new Map();

const roomManager = {
  // ── Users ──────────────────────────────────────────
  addUser(userId, socketId) {
    onlineUsers.set(userId, socketId);
  },

  removeUser(userId) {
    onlineUsers.delete(userId);
  },

  getSocketId(userId) {
    return onlineUsers.get(userId);
  },

  getOnlineUsers() {
    return Array.from(onlineUsers.keys());
  },

  isOnline(userId) {
    return onlineUsers.has(userId);
  },

  // ── Calls ──────────────────────────────────────────
  addCall(callId, callData) {
    activeCalls.set(callId, callData);
  },

  getCall(callId) {
    return activeCalls.get(callId);
  },

  removeCall(callId) {
    activeCalls.delete(callId);
  },

  isInCall(userId) {
    for (const [, call] of activeCalls) {
      if (call.caller === userId || call.receiver === userId) {
        return true;
      }
    }
    return false;
  },
};

module.exports = roomManager;