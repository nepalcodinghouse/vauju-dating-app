import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token._id) {
      setLoading(false);
      setError("User not logged in");
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://backend-vauju-1.onrender.com/api/profile/matches`,
          { headers: { 'x-user-id': token._id } }
        );
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

    fetchMatches();
  }, []);

  if (loading)
    return <div className="p-4 text-center text-gray-500">Loading matches...</div>;

  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        ⚠️ Error: {error}
      </div>
    );

  if (matches.length === 0)
    return (
      <div className="p-4 text-center text-gray-600">
        No matches available right now 😔
      </div>
    );

  const token = JSON.parse(localStorage.getItem("token"));
  const meId = token?._id;

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {matches.map((u) => {
        const isMe = String(u._id) === String(meId);
        return (
          <div
            key={u._id}
            className={`border rounded-lg p-4 bg-white shadow hover:shadow-md transition ${isMe ? "ring-2 ring-indigo-300" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{u.name}</h3>
              <div className="flex items-center gap-2">
                {isMe && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">It's you</span>
                )}
                {!isMe && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition"
                    aria-label={`Message ${u.name}`}
                    title={`Message ${u.name}`}
                    onClick={() => navigate(`/messages/${u._id}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="sr-only">Message</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {u.age ? `${u.age} years old` : "Age not available"}
            </p>
            {u.interests?.length > 0 && (
              <p className="text-sm mt-2 text-gray-700">
                Interests: {u.interests.join(", ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Matches;
