import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  name: String,
  content: String,
  time: String,
  likes: [{ type: String }], // store deviceId or userId
  comments: [commentSchema],
});

const Post = mongoose.model("Post", postSchema);
export default Post;
