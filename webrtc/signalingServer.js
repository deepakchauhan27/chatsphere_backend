const roomHandler  = require("./roomHandler");
const roomManager  = require("../socket/roomManager");
const EVENTS       = require("./callEvents");

const signalingServer = (io, socket) => {

  // ── Initiate Call ──────────────────────────────────
  socket.on(EVENTS.CALL_INITIATE, ({ receiverId, callType, callerId, callerName, callerAvatar }) => {
    const receiverSocketId = roomManager.getSocketId(receiverId);

    if (!receiverSocketId) {
      socket.emit(EVENTS.CALL_ENDED, { reason: "User is offline" });
      return;
    }

    // Check if receiver is already in a call
    if (roomHandler.isUserInCall(receiverId)) {
      socket.emit(EVENTS.CALL_BUSY, { receiverId });
      return;
    }

    // Create call room
    const callId = `call_${callerId}_${receiverId}_${Date.now()}`;
    roomHandler.createRoom(callId, {
      caller:   callerId,
      receiver: receiverId,
      type:     callType,
    });

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

    // Auto timeout after 30 seconds if not answered
    setTimeout(() => {
      const room = roomHandler.getRoom(callId);
      if (room && !room.active) {
        socket.emit(EVENTS.CALL_TIMEOUT, { callId });
        io.to(receiverSocketId).emit(EVENTS.CALL_TIMEOUT, { callId });
        roomHandler.deleteRoom(callId);
      }
    }, 30000);
  });

  // ── Accept Call ────────────────────────────────────
  socket.on(EVENTS.CALL_ACCEPTED, ({ callId, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);

    // Activate room
    roomHandler.activateRoom(callId);

    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.CALL_ACCEPTED, { callId });
    }
  });

  // ── Reject Call ────────────────────────────────────
  socket.on(EVENTS.CALL_REJECTED, ({ callId, callerId }) => {
    const callerSocketId = roomManager.getSocketId(callerId);

    if (callerSocketId) {
      io.to(callerSocketId).emit(EVENTS.CALL_REJECTED, { callId });
    }

    roomHandler.deleteRoom(callId);
  });

  // ── End Call ───────────────────────────────────────
  socket.on(EVENTS.CALL_ENDED, ({ callId, receiverId, callerId }) => {
    const duration      = roomHandler.deleteRoom(callId);
    const otherUserId   = receiverId || callerId;
    const otherSocketId = roomManager.getSocketId(otherUserId);

    if (otherSocketId) {
      io.to(otherSocketId).emit(EVENTS.CALL_ENDED, { callId, duration });
    }

    // Emit duration back to caller for saving call log
    socket.emit("call:duration", { callId, duration });
  });

  // ── WebRTC Offer ───────────────────────────────────
  socket.on(EVENTS.OFFER, ({ offer, receiverId }) => {
    const receiverSocketId = roomManager.getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(EVENTS.OFFER, { offer });
    }
  });

  // ── WebRTC Answer ──────────────────────────────────
 socket.on(EVENTS.ANSWER, ({ answer, callerId }) => {
  console.log("ANSWER RECEIVED FOR:", callerId);

  const callerSocketId = roomManager.getSocketId(callerId);

  console.log("CALLER SOCKET:", callerSocketId);

  if (callerSocketId) {
    io.to(callerSocketId).emit(EVENTS.ANSWER, { answer });
  }
});

  // ── ICE Candidate ──────────────────────────────────
  socket.on(EVENTS.ICE_CANDIDATE, ({ candidate, targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.ICE_CANDIDATE, { candidate });
    }
  });

  // ── Mute / Unmute Audio ────────────────────────────
  socket.on(EVENTS.MEDIA_MUTE_AUDIO, ({ targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.MEDIA_MUTE_AUDIO);
    }
  });

  socket.on(EVENTS.MEDIA_UNMUTE_AUDIO, ({ targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.MEDIA_UNMUTE_AUDIO);
    }
  });

  // ── Mute / Unmute Video ────────────────────────────
  socket.on(EVENTS.MEDIA_MUTE_VIDEO, ({ targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.MEDIA_MUTE_VIDEO);
    }
  });

  socket.on(EVENTS.MEDIA_UNMUTE_VIDEO, ({ targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.MEDIA_UNMUTE_VIDEO);
    }
  });

  // ── Screen Share ───────────────────────────────────
  socket.on(EVENTS.MEDIA_SCREEN_SHARE, ({ targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.MEDIA_SCREEN_SHARE);
    }
  });

  socket.on(EVENTS.MEDIA_SCREEN_STOP, ({ targetId }) => {
    const targetSocketId = roomManager.getSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(EVENTS.MEDIA_SCREEN_STOP);
    }
  });
};

module.exports = signalingServer;