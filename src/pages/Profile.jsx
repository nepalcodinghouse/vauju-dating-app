import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { LogOut, Edit2, CheckCircle } from "lucide-react";

function Profile() {
  const [user, setUser] = useState(null);
  const [suspended, setSuspended] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token._id) return navigate("/login");

    const url =
      process.env.NODE_ENV === "production"
        ? `https://backend-vauju-1.onrender.com/api/profile`
        : `/api/profile`;

    fetch(url, { headers: { "x-user-id": token._id } })
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load profile: ${res.status} ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setUser(data);
        if (data?.suspended) {
          setSuspended(true);
          toast.error("Your account is suspended. Logging out...");
          setTimeout(() => {
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("authChange"));
            navigate("/login");
          }, 1500);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load profile");
      });
  }, [navigate]);

  if (notFound) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">Profile not found.</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <Toaster position="top-center" />
      {suspended && (
        <div className="max-w-5xl mx-auto mb-4 p-3 text-center bg-yellow-50 text-yellow-700 text-sm font-medium">
          Your account is suspended. You are being logged out.
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6">
          {/* Profile Pic */}
          <div className="w-20 h-20 sm:w-28 sm:h-28">
            <img
              src={
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* Name, Username, and Stats */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                {user.isBlueTick && (
                  <div className="group relative">
                    <CheckCircle
                      size={18}
                      className="text-blue-500"
                    />
                    <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2">
                      Verified
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => navigate("/editprofile")}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.dispatchEvent(new Event("authChange"));
                    navigate("/login");
                  }}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-1">@{user.username}</p>

            {/* Follower Stats */}
            <div className="flex gap-6 mt-4 text-sm text-gray-800 justify-center sm:justify-start">
              <p>
                <span className="font-semibold">{user.postsCount || 0}</span>{" "}
                posts
              </p>
              <p>
                <span className="font-semibold">{user.followers || 0}</span>{" "}
                followers
              </p>
              <p>
                <span className="font-semibold">{user.following || 0}</span>{" "}
                following
              </p>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-3 text-gray-700 text-sm font-medium leading-snug">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-6 space-y-2 text-gray-700 text-sm font-medium text-center sm:text-left">
          <p>
            <span className="font-semibold">Age:</span> {user.age || "-"}
          </p>
          <p>
            <span className="font-semibold">Gender:</span> {user.gender || "-"}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {user.location || "-"}
          </p>
          {user.interests?.length > 0 && (
            <p>
              <span className="font-semibold">Interests:</span>{" "}
              {user.interests.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
    
  );
}

export default Profile;