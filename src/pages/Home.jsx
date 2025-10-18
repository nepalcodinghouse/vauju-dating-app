// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Circle, MessageSquare, Users } from "lucide-react";
import Layout from "../components/Layout";
import NepaliCouple from "../assets/nepali-couple.png"; // Culturally relevant image
import NamasteIcon from "../assets/namaste-icon.png"; // Icon for community section

function Home() {
  const [topUsers, setTopUsers] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token._id) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Fetch top matches
  useEffect(() => {
    const loadTop = async () => {
      try {
        setLoadingTop(true);
        setError(null);
        const token = JSON.parse(localStorage.getItem("token")) || {};
        const me = token?._id;

        // Fetch matches
        let matches = [];
        try {
          const res = await fetch(
            "https://backend-vauju-1.onrender.com/api/profile/matches",
            {
              headers: me ? { "x-user-id": me } : {},
            }
          );
          if (!res.ok) throw new Error("Failed to fetch matches");
          matches = await res.json();
        } catch (e) {
          console.error("Matches fetch error:", e);
        }

        if (!Array.isArray(matches)) matches = [];

        // Fetch online users
        let onlineIds = [];
        try {
          const ores = await fetch(
            "https://backend-vauju-1.onrender.com/api/messages/online-users",
            {
              headers: me ? { "x-user-id": me } : {},
            }
          );
          if (!ores.ok) throw new Error("Failed to fetch online users");
          onlineIds = await ores.json();
        } catch (e) {
          console.error("Online users fetch error:", e);
        }

        const onlineSet = new Set((onlineIds || []).map(String));
        const withOnline = matches
          .filter((u) => u && u._id && String(u._id) !== String(me))
          .map((u) => ({
            ...u,
            isOnline: onlineSet.has(String(u._id)),
            location: u.location || "Nepal", // Add default location
          }));

        withOnline.sort(
          (a, b) =>
            Number(b.isOnline) - Number(a.isOnline) ||
            String(a.name || "").localeCompare(String(b.name || ""))
        );

        setTopUsers(withOnline.slice(0, 4));
      } catch (err) {
        setError("Unable to load top matches. Please try again later.");
      } finally {
        setLoadingTop(false);
      }
    };

    loadTop();
  }, []);

  // Sample testimonials (replace with API data in production)
  const testimonials = [
    {
      name: "Abhaya Bikram Shahi",
      quote: "I meet my soulmate through this platform. Our shared culture made our bond stronger.",
      location: "Online...",
    },
 
  ];

  return (
    <Layout>
      <div className="pt-20 px-6 pb-10 font-sans bg-gradient-to-b from-red-50 to-white min-h-screen">
        {/* Hero Section */}
        <section className="py-24 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Find Your Soulmate in Nepal 💖
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Discover meaningful connections with people who share your values and culture. Join Nepal's premier dating community and start your journey to love today.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/explore")}
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Start exploring profiles"
            >
              Start Exploring
            </button>
            <button
              onClick={() => navigate("/events")}
              className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold shadow-md hover:bg-amber-600 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Join local events"
            >
              Join Events
            </button>
          </div>
          {/* <img
            src={NepaliCouple}
            alt="Nepali couple in traditional attire"
            className="absolute opacity-70 bottom-0 right-6 md:right-10 w-40 md:w-48 select-none pointer-events-none"
          /> */}
        </section>

        {/* Top Matches Section */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ❤️ Top Matches Near You
          </h2>
          {error && (
            <p className="text-red-500 text-center mb-4" role="alert">
              {error}
            </p>
          )}
          <div className="grid md:grid-cols-4 gap-6">
            {loadingTop
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto" />
                  </div>
                ))
              : (topUsers.length > 0 ? topUsers : []).map((u) => (
                  <div
                    key={u._id}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 text-center transform hover:-translate-y-1"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/profile/${u._id}`)}
                  >
                    <div className="relative w-24 h-24 mx-auto rounded-full bg-gray-200 mb-4 flex items-center justify-center text-gray-500">
                      <span className="text-2xl font-medium">
                        {String(u.name || "?").charAt(0).toUpperCase()}
                      </span>
                      <Circle
                        className={`w-3 h-3 absolute right-1 bottom-1 ${
                          u.isOnline ? "text-green-500" : "text-gray-400"
                        }`}
                        aria-label={u.isOnline ? "User is online" : "User is offline"}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {u.name || "Unknown"}
                    </h3>
                    {u.age && (
                      <p className="text-gray-500 text-sm">Age: {u.age}</p>
                    )}
                    {u.location && (
                      <p className="text-gray-500 text-sm">{u.location}</p>
                    )}
                    <div className="mt-3 flex justify-center gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => navigate(`/messages/${u._id}`)}
                        aria-label={`Message ${u.name || "user"}`}
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => navigate(`/profile/${u._id}`)}
                        aria-label={`View ${u.name || "user"}'s profile`}
                      >
                        <Heart className="w-4 h-4" /> View Profile
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="px-4 py-20 max-w-6xl mx-auto bg-amber-50 rounded-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🌸 Success Stories
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Hear from couples who found love and connection through our platform.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md text-center"
              >
                <p className="text-gray-600 italic mb-4">"{t.quote}"</p>
                <h3 className="font-semibold text-gray-800">{t.name}</h3>
                <p className="text-gray-500 text-sm">{t.location}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/stories")}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Read more success stories"
            >
              Read More Stories
            </button>
          </div>
        </section>

        {/* Community Events Section */}
        <section className="px-4 py-20 max-w-6xl mx-auto text-center">
          <img
            src={NamasteIcon}
            alt="Namaste icon"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Join Our Community
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Participate in local events, virtual meetups, and cultural gatherings to connect with others in Nepal. From Dashain celebrations to coffee meetups in Kathmandu, find your vibe!
          </p>
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold shadow-md hover:bg-amber-600 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Explore community events"
          >
            Explore Events
          </button>
        </section>
      </div>
    </Layout>
  );
}

export default Home;