// WebRTC specific event constants
module.exports = {
  // Signaling
  OFFER:              "webrtc:offer",
  ANSWER:             "webrtc:answer",
  ICE_CANDIDATE:      "webrtc:ice",

  // Call lifecycle
  CALL_INITIATE:      "call:initiate",
  CALL_INCOMING:      "call:incoming",
  CALL_ACCEPTED:      "call:accepted",
  CALL_REJECTED:      "call:rejected",
  CALL_ENDED:         "call:ended",
  CALL_BUSY:          "call:busy",
  CALL_TIMEOUT:       "call:timeout",

  // Media controls (communicated via socket)
  MEDIA_MUTE_AUDIO:   "media:muteAudio",
  MEDIA_UNMUTE_AUDIO: "media:unmuteAudio",
  MEDIA_MUTE_VIDEO:   "media:muteVideo",
  MEDIA_UNMUTE_VIDEO: "media:unmuteVideo",
  MEDIA_SCREEN_SHARE: "media:screenShare",
  MEDIA_SCREEN_STOP:  "media:screenStop",
};