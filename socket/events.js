module.exports = {
  // Connection
  CONNECTION:       "connection",
  DISCONNECT:       "disconnect",

  // User
  USER_ONLINE:      "user:online",
  USER_OFFLINE:     "user:offline",
  USER_TYPING:      "user:typing",
  USER_STOP_TYPING: "user:stopTyping",

  // Messages
  MESSAGE_SEND:     "message:send",
  MESSAGE_RECEIVE:  "message:receive",
  MESSAGE_READ:     "message:read",
  MESSAGE_DELETED:  "message:deleted",

  // Chat
  CHAT_JOIN:        "chat:join",
  CHAT_LEAVE:       "chat:leave",

  // Calls
  CALL_INITIATE:    "call:initiate",
  CALL_INCOMING:    "call:incoming",
  CALL_ACCEPTED:    "call:accepted",
  CALL_REJECTED:    "call:rejected",
  CALL_ENDED:       "call:ended",
  CALL_BUSY:        "call:busy",

  // WebRTC Signaling
  WEBRTC_OFFER:     "webrtc:offer",
  WEBRTC_ANSWER:    "webrtc:answer",
  WEBRTC_ICE:       "webrtc:ice",

  // Group
  GROUP_CREATED:    "group:created",
  GROUP_UPDATED:    "group:updated",
  GROUP_MEMBER_ADD: "group:memberAdded",
  GROUP_MEMBER_REM: "group:memberRemoved",
};