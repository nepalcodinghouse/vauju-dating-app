import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Profile() {
  const [user, setUser] = useState(null);
  const [suspended, setSuspended] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token._id) return navigate("/login");
  fetch(`https://backend-vauju-1.onrender.com/api/profile`, { headers: { 'x-user-id': token._id } })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Profile fetch failed: ${res.status} ${txt}`);
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        if (data && data.suspended) {
          setSuspended(true);
          toast.error("Your account is suspended. Logging out…");
          // Auto-logout shortly after showing the message
          setTimeout(() => {
            try { localStorage.removeItem("token"); } catch {}
            window.dispatchEvent(new Event("authChange"));
            navigate("/login");
          }, 1500);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load profile");
      });
  }, [navigate]);

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-500 text-lg animate-pulse">Loading profile...</div>
      </div>
    );

  const token = JSON.parse(localStorage.getItem("token"));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <Toaster position="top-center" />
      {suspended && (
        <div className="max-w-5xl mx-auto mb-4 p-3 rounded border bg-yellow-50 border-yellow-300 text-yellow-800">
          Your account is suspended. You are being logged out.
          <button
            onClick={() => { try { localStorage.removeItem("token"); } catch {}; window.dispatchEvent(new Event("authChange")); navigate("/login"); }}
            className="ml-3 inline-block bg-yellow-600 text-white px-3 py-1 rounded"
          >
            Logout now
          </button>
        </div>
      )}
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-5xl mx-auto">
        {/* User Info Header */}
        <h2 className="text-4xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-500 text-sm mb-6">@{user.email?.split("@")[0]}</p>

        <div className="text-left space-y-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          {user.bio && (
            <p className="text-gray-700">
              <span className="font-semibold text-pink-500">Bio:</span> {user.bio}
            </p>
          )}
          <p>
            <span className="font-semibold text-pink-500">Age:</span>{" "}
            {user.age || "-"}
          </p>
          <p>
            <span className="font-semibold text-pink-500">Gender:</span>{" "}
            {user.gender || "-"}
          </p>
          <p>
            <span className="font-semibold text-pink-500">Location:</span>{" "}
            {user.location || "-"}
          </p>
          {user.interests?.length > 0 && (
            <p>
              <span className="font-semibold text-pink-500">Interests:</span>{" "}
              {user.interests.join(", ")}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Link to="/editprofile" className="inline-block bg-pink-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-pink-600 transition shadow-md">
            Edit Profile
          </Link>
          <button onClick={() => { localStorage.removeItem("token"); window.dispatchEvent(new Event("authChange")); navigate("/login"); }} className="inline-block bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-full hover:bg-gray-300 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
