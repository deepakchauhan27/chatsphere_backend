// STUN servers - free to use (Google)
// TURN servers - needed for users behind strict NAT/firewalls
// For production replace with your own TURN server (coturn / Twilio / Xirsys)

const iceConfig = {
  iceServers: [
    // Google STUN servers
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },

    // Free TURN server (for development only)
    // Replace with your own in production
    {
      urls:       "turn:openrelay.metered.ca:80",
      username:   "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls:       "turn:openrelay.metered.ca:443",
      username:   "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls:       "turn:openrelay.metered.ca:443?transport=tcp",
      username:   "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

module.exports = iceConfig;