// src/pages/Matches.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Heart } from "lucide-react";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://backend-vauju-1.onrender.com"
    : "";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ pendingApproval: false, suspended: false });
  const [filter, setFilter] = useState("all"); // Filter state: all, online, nearby
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token?._id) {
      setLoading(false);
      setError("Please log in to view your matches");
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profRes = await fetch(`${BASE_URL}/api/profile`, {
          headers: { "x-user-id": token._id },
        });
        if (!profRes.ok) throw new Error("Failed to fetch your profile");
        const me = await profRes.json();

        setStatus({
          pendingApproval: !!(me.visibilityRequested && !me.visibilityApproved),
          suspended: !!me.suspended,
        });

        const res = await fetch(`${BASE_URL}/api/profile/matches`, {
          headers: { "x-user-id": token._id },
        });
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();

        // Simulate location data if not provided by API
        const enrichedData = data.map((user) => ({
          ...user,
          location: user.location || "Nepal",
          isOnline: Math.random() > 0.5, // Placeholder: Replace with actual online status API
        }));

        setMatches(enrichedData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Filter matches based on selected filter
  const filteredMatches = matches.filter((u) => {
    if (filter === "online") return u.isOnline;
    if (filter === "nearby") return u.location.toLowerCase().includes("kathmandu"); // Example: Kathmandu-based
    return true; // All matches
  });

  const token = JSON.parse(localStorage.getItem("token"));
  const meId = token?._id;

  const SkeletonCard = () => (
    <div
      className="flex flex-col p-4 rounded-xl shadow-sm animate-pulse bg-gray-50 space-y-3"
      aria-hidden="true"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-200"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  );

  const containerClasses = "p-4 max-w-6xl mx-auto font-sans";

  if (loading) {
    return (
      <div className={`${containerClasses} py-20`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Loading Matches...
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${containerClasses} py-20 text-center text-red-600 font-medium bg-red-50 rounded-xl p-6`}
        role="alert"
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className={`${containerClasses} py-20 bg-gradient-to-b from-red-50 to-white min-h-screen`}>
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        Your Matches 💖
      </h1>

      {/* Status Message */}
      {(status.pendingApproval || status.suspended) && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm text-center ${
            status.suspended
              ? "bg-yellow-50 border border-yellow-300 text-yellow-800"
              : "bg-blue-50 border border-blue-300 text-blue-800"
          }`}
          role="alert"
        >
          {status.suspended
            ? "Your account is suspended. Please contact support."
            : "Your profile is pending admin approval. You'll see matches once approved."}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full font-medium text-sm ${
            filter === "all"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } transition focus:outline-none focus:ring-2 focus:ring-red-500`}
          aria-label="Show all matches"
        >
          All
        </button>
        <button
          onClick={() => setFilter("online")}
          className={`px-4 py-2 rounded-full font-medium text-sm ${
            filter === "online"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } transition focus:outline-none focus:ring-2 focus:ring-red-500`}
          aria-label="Show online matches"
        >
          Online
        </button>
        <button
          onClick={() => setFilter("nearby")}
          className={`px-4 py-2 rounded-full font-medium text-sm ${
            filter === "nearby"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } transition focus:outline-none focus:ring-2 focus:ring-red-500`}
          aria-label="Show nearby matches"
        >
          Nearby
        </button>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="p-6 text-center text-gray-600 font-medium bg-white rounded-xl shadow">
          No matches available for the selected filter
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMatches.map((u) => {
            const isMe = String(u._id) === String(meId);
            return (
              <div
                key={u._id}
                className="flex flex-col justify-between p-4 rounded-xl shadow-md bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/profile/${u._id}`)}
              >
                <div className="space-y-2 text-center">
                  <div className="relative w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <span className="text-xl font-medium">
                      {String(u.name || "?").charAt(0).toUpperCase()}
                    </span>
                    {u.isOnline && (
                      <span
                        className="w-3 h-3 absolute right-1 bottom-1 bg-green-500 rounded-full"
                        aria-label="User is online"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                    {u.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {u.age ? `${u.age} yrs` : "Age N/A"}
                    {u.location && ` • ${u.location}`}
                  </p>
                  {u.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {u.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isMe ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/messages/${u._id}`)}
                      className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Message ${u.name || "user"}`}
                    >
                      <MessageSquare className="w-4 h-4 inline-block mr-1" />
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${u._id}`)}
                      className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-amber-400"
                      aria-label={`View ${u.name || "user"}'s profile`}
                    >
                      <Heart className="w-4 h-4 inline-block mr-1" />
                      View Profile
                    </button>
                  </div>
                ) : (
                  <span className="mt-4 text-sm text-gray-400 text-center">
                    This is you
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Matches;