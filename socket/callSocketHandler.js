const roomManager = require("./roomManager");
const EVENTS      = require("./events");

const callSocketHandler = (io, socket) => {

  // ── Initiate Call ─────────────────────────────────
  socket.on(EVENTS.CALL_INITIATE, ({ receiverId, callType, callerId, callerName, callerAvatar }) => {
    const receiverSocketId = roomManager.getSocketId(receiverId);

    if (!receiverSocketId) {
      // Receiver is offline
      socket.emit(EVENTS.CALL_ENDED, { reason: "User is offline" });
      return;
    }

    // Check if receiver is already in a call
    if (roomManager.isInCall(receiverId)) {
      socket.emit(EVENTS.CALL_BUSY, { receiverId });
      return;
    }

    // Register active call
    const callId = `${callerId}_${receiverId}_${Date.now()}`;
    roomManager.addCall(callId, {
      caller:   callerId,
      receiver: receiverId,
      type:     callType,
      callId,
    });

    // Notify receiver of incoming call
    io.to(receiverSocketId).emit(EVENTS.CALL_INCOMING, {
      callId,
      callType,
      callerId,
      callerName,
      callerAvatar,
    });

    // Send callId back to caller
    socket.emit("call:callId", { callId });
  });

  // ── Accept Call ───────────────────────────────────
  socket.on(EVENTS.CALL_ACCEPTED, ({ callId, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.CALL_ACCEPTED, { callId });
    }
  });

  // ── Reject Call ───────────────────────────────────
  socket.on(EVENTS.CALL_REJECTED, ({ callId, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.CALL_REJECTED, { callId });
    }
    roomManager.removeCall(callId);
  });

  // ── End Call ──────────────────────────────────────
  socket.on(EVENTS.CALL_ENDED, ({ callId, receiverId, callerId }) => {
    const otherUserId    = receiverId || callerId;
    const otherSocketId  = roomManager.getSocketId(otherUserId);

    if (otherSocketId) {
      io.to(otherSocketId).emit(EVENTS.CALL_ENDED, { callId });
    }
    roomManager.removeCall(callId);
  });

  // ── WebRTC: Offer ─────────────────────────────────
  socket.on(EVENTS.WEBRTC_OFFER, ({ offer, receiverId }) => {
    const receiverSocketId = roomManager.getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(EVENTS.WEBRTC_OFFER, { offer });
    }
  });

  // ── WebRTC: Answer ────────────────────────────────
  socket.on(EVENTS.WEBRTC_ANSWER, ({ answer, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.WEBRTC_ANSWER, { answer });
    }
  });

  // ── WebRTC: ICE Candidate ─────────────────────────
  socket.on(EVENTS.WEBRTC_ICE, ({ candidate, targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.WEBRTC_ICE, { candidate });
    }
  });
};

module.exports = callSocketHandler;