import express from "express";
const router = express.Router();

// Popup route - Nepali welcome message for Aurameet
router.get("/", (req, res) => {
  res.json({
    showPopup: true,
    title: "स्वागत छ हाम्रो साइटमा!",
    message: "AuraMeet डेटिङ प्लेटफर्ममा तपाईँलाई हार्दिक स्वागत छ ❤️",
  });
});

export default router;
