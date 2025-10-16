import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://backend-vauju-1.onrender.com"
    : "";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ pendingApproval: false, suspended: false });
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token?._id) {
      setLoading(false);
      setError("User not logged in");
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
        setMatches(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const token = JSON.parse(localStorage.getItem("token"));
  const meId = token?._id;

  const SkeletonCard = () => (
    <div className="flex flex-col p-4 rounded-lg shadow-sm animate-pulse bg-gray-50 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  );

  const containerClasses = "p-4 max-w-3xl mx-auto";

  if (loading)
    return (
      <div className={`${containerClasses} grid grid-cols-1 sm:grid-cols-2 gap-3`}>
        {Array(6).fill(0).map((_, idx) => <SkeletonCard key={idx} />)}
      </div>
    );

  if (error)
    return (
      <div className={`${containerClasses} p-4 text-center text-red-600 font-medium`}>
        ⚠️ {error}
      </div>
    );

  if (matches.length === 0)
    return (
      <div className={`${containerClasses} p-4 text-center text-gray-600 font-medium`}>
        No matches available
      </div>
    );

  return (
    <div className={containerClasses}>
      {(status.pendingApproval || status.suspended) && (
        <div
          className={`mb-3 p-2 rounded-lg text-sm text-center ${
            status.suspended
              ? "bg-yellow-50 border border-yellow-300 text-yellow-800"
              : "bg-blue-50 border border-blue-300 text-blue-800"
          }`}
        >
          {status.suspended
            ? "Your account is suspended."
            : "Visibility pending admin approval."}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {matches.map((u) => {
          const isMe = String(u._id) === String(meId);
          return (
            <div
              key={u._id}
              className="flex flex-col justify-between p-4 rounded-lg shadow hover:shadow-md transition bg-white border border-gray-100"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{u.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{u.age ? `${u.age} yrs` : "Age N/A"}</p>
                {u.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {u.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!isMe ? (
                <button
                  type="button"
                  onClick={() => navigate(`/messages/${u._id}`)}
                  className="mt-3 w-full text-center bg-black hover:bg-gray-800 cursor-pointer text-white text-sm font-medium py-2 rounded-full transition"
                >
                  Message
                </button>
              ) : (
                <span className="mt-3 text-xs sm:text-sm text-gray-400 text-center">You</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Matches;
