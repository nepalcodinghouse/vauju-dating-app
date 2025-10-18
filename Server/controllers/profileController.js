import User from "../models/User.js";
import mongoose from "mongoose";
import { isDbConnected } from "../config/db.js";
import { _exported_messageStore } from "./messageController.js";

// In-memory fallback store
const devStore = { users: [] };

// Middleware: require auth
export const requireAuth = async (req, res, next) => {
  const userId = req.headers["x-user-id"] || req.query.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });

  if (isDbConnected() && mongoose.connection.readyState === 1) {
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(401).json({ message: "Invalid user id" });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
  } else {
    // dev fallback
    let u = devStore.users.find(x => x._id === userId);
    if (!u) {
      u = { _id: userId, name: `DevUser-${userId}`, email: `dev${userId}@test.com`, visible: false };
      devStore.users.push(u);
    }
    req.user = u;
  }
  next();
};

// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    if (isDbConnected() && mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id).select("-password");
      return res.json(user);
    }

    const u = devStore.users.find(x => x._id === req.user._id) || req.user;
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.interests && typeof updates.interests === "string") {
      updates.interests = updates.interests.split(",").map(s => s.trim()).filter(Boolean);
    }

    if (updates.age !== undefined) {
      const n = Number(updates.age);
      if (!Number.isNaN(n)) updates.age = n;
      else delete updates.age;
    }

    const allowed = ["name", "bio", "age", "gender", "interests", "location", "visible"];
    const sanitized = {};
    for (const k of allowed) if (updates[k] !== undefined) sanitized[k] = updates[k];

    if (Object.prototype.hasOwnProperty.call(sanitized, "visible")) {
      if (sanitized.visible === true) {
        sanitized.visible = false;
        sanitized.visibilityRequested = true;
        sanitized.visibilityApproved = false;
      } else {
        sanitized.visible = false;
        sanitized.visibilityRequested = false;
        sanitized.visibilityApproved = false;
      }
    }

    if (isDbConnected() && mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        sanitized,
        { new: true, runValidators: true }
      ).select("-password");
      return res.json(user);
    }

    let u = devStore.users.find(x => x._id === req.user._id);
    if (!u) { u = { ...req.user }; devStore.users.push(u); }
    Object.assign(u, sanitized);
    res.json(u);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/profile/matches
export const getMatches = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;

    if (!isDbConnected() || mongoose.connection.readyState !== 1) {
      const storeMatches = devStore.users
        .filter(u => u._id !== req.user._id && u.visible && u.visibilityApproved)
        .slice(skip, skip + limit);
      return res.json(storeMatches);
    }

    const filter = { visible: true, visibilityApproved: true, _id: { $ne: req.user._id } };
    const users = await User.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/profile/messages-users
export const getMessagesUsers = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;

    if (!isDbConnected() || mongoose.connection.readyState !== 1) {
      const storeMatches = devStore.users
        .filter(u => u._id !== req.user._id)
        .slice(skip, skip + limit);

      const usersWithOnlineStatus = storeMatches.map(u => ({
        ...u,
        isOnline: Boolean(_exported_messageStore.presence[String(u._id)] && (Date.now() - _exported_messageStore.presence[String(u._id)]) <= 60_000)
      }));

      return res.json(usersWithOnlineStatus);
    }

    const filter = { _id: { $ne: req.user._id } };
    const users = await User.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).select("-password");

    const usersWithOnlineStatus = users.map(u => ({
      ...u.toObject(),
      isOnline: Boolean(_exported_messageStore.presence[String(u._id)] && (Date.now() - _exported_messageStore.presence[String(u._id)]) <= 60_000)
    }));

    res.json(usersWithOnlineStatus);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
