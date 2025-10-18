import Message from "../models/Message.js";
import mongoose from "mongoose";
import { isDbConnected } from "../config/db.js";

// Minimal in-memory store for messages/presence
const messageStore = { messages: [], presence: {} };
const PRESENCE_TTL_MS = 60 * 1000; // consider online if heartbeat within last 60s

export const sendMessage = async (req, res) => {
  try {
    const { to, text } = req.body;
    if (!to || !text) return res.status(400).json({ message: "Missing to/text" });

    if (isDbConnected() && mongoose.connection.readyState === 1) {
      let m = await Message.create({ from: req.user._id, to, text });
      
      // auto-mark seen if sender == recipient
      if (String(req.user._id) === String(to)) m.seen = true;
      await m.save();

      // emit socket event to recipient and sender if connected
      try {
        const io = req.app?.locals?.io;
        const userSockets = req.app?.locals?.userSockets;
        if (io && userSockets) {
          const toSockets = userSockets.get(String(to));
          const fromSockets = userSockets.get(String(req.user._id));
          if (toSockets) toSockets.forEach(sid => io.to(sid).emit('message', m));
          if (fromSockets) fromSockets.forEach(sid => io.to(sid).emit('message', m));
        }
      } catch (e) { /* ignore */ }

      return res.json(m);
    }

    const msg = { _id: `m-${Date.now()}`, from: req.user._id, to, text, seen: String(req.user._id) === String(to), createdAt: new Date() };
    messageStore.messages.push(msg);

    try {
      const io = req.app?.locals?.io;
      const userSockets = req.app?.locals?.userSockets;
      if (io && userSockets) {
        const toSockets = userSockets.get(String(to));
        const fromSockets = userSockets.get(String(req.user._id));
        if (toSockets) toSockets.forEach(sid => io.to(sid).emit('message', msg));
        if (fromSockets) fromSockets.forEach(sid => io.to(sid).emit('message', msg));
      }
    } catch (e) { /* ignore */ }

    return res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (!otherId) return res.status(400).json({ message: "No userId" });

    if (isDbConnected() && mongoose.connection.readyState === 1) {
      const raw = await Message.find({ $or: [
        { from: req.user._id, to: otherId },
        { from: otherId, to: req.user._id }
      ]}).sort({ createdAt: 1 });
      const msgs = raw.filter(m => !m.deletedFor?.some(u => String(u) === String(req.user._id)));
      return res.json(msgs);
    }

    const msgs = messageStore.messages.filter(m => (
      (String(m.from) === String(req.user._id) && String(m.to) === String(otherId)) ||
      (String(m.from) === String(otherId) && String(m.to) === String(req.user._id))
    ) && !(Array.isArray(m.deletedFor) && m.deletedFor.map(String).includes(String(req.user._id))));
    msgs.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
    return res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markSeen = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    if (!messageId) return res.status(400).json({ message: "No messageId" });

    if (isDbConnected() && mongoose.connection.readyState === 1) {
      const m = await Message.findByIdAndUpdate(messageId, { seen: true }, { new: true });
      try {
        const io = req.app?.locals?.io;
        const userSockets = req.app?.locals?.userSockets;
        if (io && userSockets && m) {
          const sockets = userSockets.get(String(m.from));
          if (sockets) sockets.forEach(sid => io.to(sid).emit('seen', m));
        }
      } catch (e) {}
      return res.json(m);
    }

    const m = messageStore.messages.find(x => x._id === messageId);
    if (m) {
      m.seen = true;
      try {
        const io = req.app?.locals?.io;
        const userSockets = req.app?.locals?.userSockets;
        if (io && userSockets) {
          const sockets = userSockets.get(String(m.from));
          if (sockets) sockets.forEach(sid => io.to(sid).emit('seen', m));
        }
      } catch (e) {}
      return res.json(m);
    }

    res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const heartbeat = async (req, res) => {
  try {
    const userId = String(req.user._id);
    messageStore.presence[userId] = Date.now();

    try {
      const io = req.app?.locals?.io;
      if (io) io.emit('presence', { userId, online: true });
    } catch (e) {}

    return res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteForMe = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    if (!messageId) return res.status(400).json({ message: "No messageId" });

    if (isDbConnected() && mongoose.connection.readyState === 1) {
      const m = await Message.findById(messageId);
      if (!m) return res.status(404).json({ message: "Not found" });
      const userId = String(req.user._id);
      const updated = await Message.findByIdAndUpdate(messageId, { $addToSet: { deletedFor: userId } }, { new: true });
      return res.json(updated);
    }

    const m = messageStore.messages.find(x => x._id === messageId);
    if (!m) return res.status(404).json({ message: "Not found" });
    const userId = String(req.user._id);
    m.deletedFor = Array.isArray(m.deletedFor) ? m.deletedFor : [];
    if (!m.deletedFor.includes(userId)) m.deletedFor.push(userId);
    return res.json(m);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unsendMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    if (!messageId) return res.status(400).json({ message: "No messageId" });

    if (isDbConnected() && mongoose.connection.readyState === 1) {
      const m = await Message.findById(messageId);
      if (!m) return res.status(404).json({ message: "Not found" });
      if (String(m.from) !== String(req.user._id)) return res.status(403).json({ message: "Not allowed" });
      const updated = await Message.findByIdAndUpdate(messageId, { isUnsent: true, text: "" }, { new: true });
      try {
        const io = req.app?.locals?.io;
        const userSockets = req.app?.locals?.userSockets;
        if (io && userSockets && updated) {
          const socketsFrom = userSockets.get(String(updated.from));
          const socketsTo = userSockets.get(String(updated.to));
          const payload = { ...updated.toObject?.() || updated, isUnsent: true };
          if (socketsFrom) socketsFrom.forEach(sid => io.to(sid).emit('message', payload));
          if (socketsTo) socketsTo.forEach(sid => io.to(sid).emit('message', payload));
        }
      } catch (e) {}
      return res.json(updated);
    }

    const m = messageStore.messages.find(x => x._id === messageId);
    if (!m) return res.status(404).json({ message: "Not found" });
    if (String(m.from) !== String(req.user._id)) return res.status(403).json({ message: "Not allowed" });
    m.isUnsent = true;
    m.text = "";
    try {
      const io = req.app?.locals?.io;
      const userSockets = req.app?.locals?.userSockets;
      if (io && userSockets && m) {
        const socketsFrom = userSockets.get(String(m.from));
        const socketsTo = userSockets.get(String(m.to));
        if (socketsFrom) socketsFrom.forEach(sid => io.to(sid).emit('message', m));
        if (socketsTo) socketsTo.forEach(sid => io.to(sid).emit('message', m));
      }
    } catch (e) {}
    return res.json(m);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const isUserOnline = async (userId) => {
  const ts = messageStore.presence[userId];
  if (!ts) return false;
  return (Date.now() - ts) <= PRESENCE_TTL_MS;
};

export const _exported_messageStore = messageStore;
