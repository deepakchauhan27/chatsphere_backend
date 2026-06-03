const roomManager = require("./roomManager");
const EVENTS      = require("./events");

const callSocketHandler = (io, socket) => {

  // ── Initiate Call ─────────────────────────────────
  socket.on(EVENTS.CALL_INITIATE, (data) => {
    const { receiverId, callType, callerId, callerName, callerAvatar } = data;
    const receiverSocketId = roomManager.getSocketId(receiverId);

    console.log(`Call from ${callerId} to ${receiverId}`);

    if (!receiverSocketId) {
      socket.emit(EVENTS.CALL_ENDED, { reason: "User is offline" });
      return;
    }

    if (roomManager.isInCall(receiverId)) {
      socket.emit(EVENTS.CALL_BUSY, { receiverId });
      return;
    }

    const callId = `call_${callerId}_${receiverId}_${Date.now()}`;
    roomManager.addCall(callId, {
      caller:   callerId,
      receiver: receiverId,
      type:     callType,
      callId,
    });

    // Store callId on socket for cleanup
    socket.currentCallId = callId;

    // Notify receiver
    io.to(receiverSocketId).emit(EVENTS.CALL_INCOMING, {
      callId,
      callType,
      callerId,
      callerName,
      callerAvatar,
    });

    // Send callId back to caller
    socket.emit("call:callId", { callId });

    console.log(`Call ${callId} initiated`);
  });

  // ── Accept Call ────────────────────────────────────
  socket.on(EVENTS.CALL_ACCEPTED, ({ callId, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);
    console.log(`Call ${callId} accepted`);
    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.CALL_ACCEPTED, { callId });
    }
  });

  // ── Reject Call ────────────────────────────────────
  socket.on(EVENTS.CALL_REJECTED, ({ callId, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);
    console.log(`Call ${callId} rejected`);
    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.CALL_REJECTED, { callId });
    }
    roomManager.removeCall(callId);
  });

  // ── End Call ───────────────────────────────────────
  socket.on(EVENTS.CALL_ENDED, ({ callId, receiverId, callerId }) => {
    console.log(`Call ${callId} ended`);
    const otherUserId   = receiverId || callerId;
    const otherSocketId = roomManager.getSocketId(otherUserId);
    if (otherSocketId) {
      io.to(otherSocketId).emit(EVENTS.CALL_ENDED, { callId });
    }
    roomManager.removeCall(callId);
  });

  // ── WebRTC Offer ───────────────────────────────────
  socket.on("webrtc:offer", ({ offer, receiverId }) => {
    const receiverSocketId = roomManager.getSocketId(receiverId);
    console.log(`WebRTC offer to ${receiverId}`);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc:offer", { offer });
    }
  });

  // ── WebRTC Answer ──────────────────────────────────
  socket.on("webrtc:answer", ({ answer, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);
    console.log(`WebRTC answer to ${callerId}`);
    if (callerSocketId) {
      io.to(callerSocketId).emit("webrtc:answer", { answer });
    }
  });

  // ── ICE Candidate ──────────────────────────────────
  socket.on("webrtc:ice", ({ candidate, targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:ice", { candidate });
    }
  });
};

module.exports = callSocketHandler;