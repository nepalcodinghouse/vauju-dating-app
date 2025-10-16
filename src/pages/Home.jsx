// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Circle, MessageSquare } from "lucide-react";
import Layout from "../components/Layout";
import Couple from "../assets/stick-couple.png";

function Home() {
  const [topUsers, setTopUsers] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token._id) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loadTop = async () => {
      try {
        setLoadingTop(true);
        const token = JSON.parse(localStorage.getItem("token")) || {};
        const me = token?._id;

        // fetch matches
        let matches = [];
        try {
          const res = await fetch(
            "https://backend-vauju-1.onrender.com/api/profile/matches",
            {
              headers: me ? { "x-user-id": me } : {},
            }
          );
          if (res.ok) matches = await res.json();
        } catch (e) {}

        if (!Array.isArray(matches)) matches = [];

        // fetch online users
        let onlineIds = [];
        try {
          const ores = await fetch(
            "https://backend-vauju-1.onrender.com/api/messages/online-users",
            {
              headers: me ? { "x-user-id": me } : {},
            }
          );
          if (ores.ok) onlineIds = await ores.json();
        } catch (e) {}

        const onlineSet = new Set((onlineIds || []).map(String));
        const withOnline = matches
          .filter((u) => u && u._id && String(u._id) !== String(me))
          .map((u) => ({ ...u, isOnline: onlineSet.has(String(u._id)) }));

        withOnline.sort(
          (a, b) =>
            Number(b.isOnline) - Number(a.isOnline) ||
            String(a.name || "").localeCompare(String(b.name || ""))
        );

        setTopUsers(withOnline.slice(0, 4));
      } finally {
        setLoadingTop(false);
      }
    };

    loadTop();
  }, []);

  return (
    <Layout>
      <div className="pt-20 px-6 pb-10 font-sans bg-gradient-to-b from-pink-50 to-white min-h-screen">
        {/* Hero Section */}
        <section className="py-24 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Find Your Perfect Match 💖
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Join our growing community and meet people who share your vibe.
            Whether you’re looking for love, friendship, or just fun — start connecting today.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-8 cursor-pointer py-3 bg-pink-600 text-white rounded-xl font-semibold shadow-md hover:bg-pink-700 transition"
          >
            Start Exploring
          </button>

          <img
            src={Couple}
            alt="Background couple"
            className="absolute opacity-15 bottom-0 right-6 md:right-10 w-40 md:w-48 select-none pointer-events-none"
          />
        </section>

        {/* Top Matches Section */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ❤️ Top Matches
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {loadingTop
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow animate-pulse"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto" />
                  </div>
                ))
              : (topUsers.length > 0 ? topUsers : []).map((u) => (
                  <div
                    key={u._id}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition text-center"
                  >
                    <div className="relative w-24 h-24 mx-auto rounded-full bg-gray-200 mb-4 flex items-center justify-center text-gray-500">
                      <span className="text-xl">
                        {String(u.name || "?").charAt(0).toUpperCase()}
                      </span>
                      <Circle
                        className={`w-3 h-3 absolute right-1 bottom-1 ${
                          u.isOnline ? "text-green-500" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {u.name || "Unknown"}
                    </h3>
                    {u.age && <p className="text-gray-500 text-sm">Age: {u.age}</p>}
                    <div className="mt-3 flex justify-center gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => navigate(`/messages/${u._id}`)}
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Home;
