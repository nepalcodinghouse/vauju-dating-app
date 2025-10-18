import express from "express";
import Post from "../models/Post.js";
import seedPost from "../seedPosts.js"

const router = express.Router();

// -------------------------------
// ✅ Get all posts
// -------------------------------
router.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ _id: -1 });
    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (err) {
    console.error("❌ Error fetching posts:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------------
// ❤️ Like / Unlike a post
// -------------------------------
router.post("/:id/like", async (req, res) => {
  try {
    const { deviceId } = req.body || {};

    if (!deviceId)
      return res.status(400).json({
        success: false,
        message: "Device ID required in request body",
      });

    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    const alreadyLiked = post.likes.includes(deviceId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id !== deviceId);
      await post.save();
      return res.json({
        success: true,
        liked: false,
        likes: post.likes.length,
        message: "Unliked!",
      });
    } else {
      // Like
      post.likes.push(deviceId);
      await post.save();
      return res.json({
        success: true,
        liked: true,
        likes: post.likes.length,
        message: "Liked!",
      });
    }
  } catch (err) {
    console.error("❌ Error liking post:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------
// 💬 Comment on a post
// -------------------------------
router.post("/:id/comment", async (req, res) => {
  try {
    const { user, text } = req.body || {};

    if (!text || !user)
      return res
        .status(400)
        .json({ success: false, message: "Missing user or text field" });

    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    post.comments.push({ user, text });
    await post.save();

    res.json({
      success: true,
      comments: post.comments,
      message: "Comment added successfully",
    });
  } catch (err) {
    console.error("❌ Error adding comment:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------
// ✏️ Create a new post (optional but useful for testing)
// -------------------------------
router.post("/", async (req, res) => {
  try {
    const { name, content, time } = req.body || {};

    if (!name || !content)
      return res
        .status(400)
        .json({ success: false, message: "Name and content required" });

    const post = new Post({ name, content, time });
    await post.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    console.error("❌ Error creating post:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
