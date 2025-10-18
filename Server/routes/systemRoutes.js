import express from "express";

const router = express.Router();

// Get presence statistics
router.get("/presence/stats", (req, res) => {
  try {
    const presenceStore = req.app.locals.presenceStore || {};
    const now = Date.now();
    const stats = Object.entries(presenceStore).map(([userId, lastSeen]) => ({
      userId,
      lastSeen,
      online: now - lastSeen <= 60000 // 60s TTL
    }));
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get presence stats",
      error: error.message
    });
  }
});

// Get online users list
router.get("/presence/online", (req, res) => {
  try {
    const presenceStore = req.app.locals.presenceStore || {};
    const now = Date.now();
    const onlineUsers = Object.entries(presenceStore)
      .filter(([_, ts]) => now - ts <= 60000)
      .map(([userId]) => userId);

    res.json({
      success: true,
      data: {
        count: onlineUsers.length,
        users: onlineUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get online users",
      error: error.message
    });
  }
});

// Check if specific user is online
router.get("/presence/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const presenceStore = req.app.locals.presenceStore || {};
    const lastSeen = presenceStore[userId] || null;
    const isOnline = lastSeen ? (Date.now() - lastSeen <= 60000) : false;

    res.json({
      success: true,
      data: {
        userId,
        isOnline,
        lastSeen
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check user presence",
      error: error.message
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  try {
    const presenceStore = req.app.locals.presenceStore || {};
    const io = req.app.locals.io;
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        presence: presenceStore ? "active" : "inactive",
        socketIO: io ? "active" : "inactive"
      }
    };
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      services: {
        presence: "error",
        socketIO: "error"
      }
    });
  }
});

export default router;
