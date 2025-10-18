// seedPosts.js
import Post from "./models/Post.js";

const seedPosts = async () => {
  try {
    const count = await Post.countDocuments();
    if (count > 0) {
      console.log("⚠️ Posts already exist. Skipping seeding.");
      return;
    }

    const dummyPosts = [
      {
        name: "Abhaya Bikram",
        content: "Just built my first fullstack project with React + Express 🚀",
        likes: [],
        comments: [{ user: "TechLover", text: "That’s awesome!" }],
        time: new Date().toLocaleString(),
      },
      {
        name: "Mountain Driftz",
        content: "New drop coming soon 🔥 stay tuned for exclusive jackets.",
        likes: [],
        comments: [{ user: "StyleKing", text: "Can’t wait!" }],
        time: new Date().toLocaleString(),
      },
      {
        name: "Saga Service",
        content: "Working on an AI-powered app — more updates soon 🤖",
        likes: [],
        comments: [{ user: "CoderNepal", text: "Go big bro 💪" }],
        time: new Date().toLocaleString(),
      },
    ];

    await Post.insertMany(dummyPosts);
    console.log("✅ Seed data added successfully.");
  } catch (err) {
    console.error("❌ Error seeding posts:", err.message);
  }
};

export default seedPosts;
