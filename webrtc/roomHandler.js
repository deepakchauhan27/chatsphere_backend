// Manages WebRTC call rooms on the server side
// Each room = one active call between two or more peers

const callRooms = new Map();

const roomHandler = {

  // ── Create a call room ─────────────────────────────
  createRoom(callId, { caller, receiver, type }) {
    callRooms.set(callId, {
      callId,
      caller,
      receiver,
      type,           // "audio" | "video"
      peers:    [caller, receiver],
      startedAt: null,
      active:   false,
    });
    return callRooms.get(callId);
  },

  // ── Get room by callId ─────────────────────────────
  getRoom(callId) {
    return callRooms.get(callId) || null;
  },

  // ── Mark room as active (call answered) ────────────
  activateRoom(callId) {
    const room = callRooms.get(callId);
    if (room) {
      room.active    = true;
      room.startedAt = Date.now();
      callRooms.set(callId, room);
    }
    return room;
  },

  // ── Add peer to room (for group calls future use) ──
  addPeer(callId, userId) {
    const room = callRooms.get(callId);
    if (room && !room.peers.includes(userId)) {
      room.peers.push(userId);
      callRooms.set(callId, room);
    }
    return room;
  },

  // ── Remove peer from room ──────────────────────────
  removePeer(callId, userId) {
    const room = callRooms.get(callId);
    if (room) {
      room.peers = room.peers.filter((p) => p !== userId);
      callRooms.set(callId, room);
    }
    return room;
  },

  // ── Get call duration in seconds ───────────────────
  getCallDuration(callId) {
    const room = callRooms.get(callId);
    if (room && room.startedAt) {
      return Math.floor((Date.now() - room.startedAt) / 1000);
    }
    return 0;
  },

  // ── Check if user is in any active call ────────────
  isUserInCall(userId) {
    for (const [, room] of callRooms) {
      if (room.peers.includes(userId)) return true;
    }
    return false;
  },

  // ── End and delete room ────────────────────────────
  deleteRoom(callId) {
    const duration = this.getCallDuration(callId);
    callRooms.delete(callId);
    return duration;
  },

  // ── Get all active rooms (for debugging) ───────────
  getAllRooms() {
    return Array.from(callRooms.values());
  },

  // ── Total active calls count ───────────────────────
  getActiveCallsCount() {
    return callRooms.size;
  },
};

module.exports = roomHandler;