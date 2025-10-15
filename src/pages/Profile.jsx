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
          toast.error("Your account is suspended. Logging out…");
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-500 text-lg">Profile not found.</div>
      </div>
    );
  }

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-500 text-lg animate-pulse">
          Loading profile...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <Toaster position="top-center" />
      {suspended && (
        <div className="max-w-5xl mx-auto mb-4 p-3 rounded border text-center bg-yellow-50 border-yellow-200 text-yellow-700">
          Your account is suspended. You are being logged out.
        </div>
      )}

      <div className="bg-white p-6 w-full max-w-4xl mx-auto rounded-2xl shadow-sm border border-gray-100">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-6">
          {/* Profile Pic */}
          <div className="relative w-32 h-32">
            <img
              src={
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border border-gray-300"
            />
            {user.isBlueTick && (
              <CheckCircle
                size={22}
                className="absolute bottom-1 right-1 text-blue-500 bg-white rounded-full"
              />
            )}
          </div>

          {/* Name, username, and stats */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">
                {user.name}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/editprofile")}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.dispatchEvent(new Event("authChange"));
                    navigate("/login");
                  }}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
            <p className="text-gray-500 text-sm">@{user.username}</p>

            {/* Follower Stats */}
            <div className="flex gap-6 mt-3 text-sm text-gray-800">
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
              <p className="mt-3 text-gray-700 leading-snug">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-6 space-y-2 text-gray-700 text-sm">
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

        {/* Posts Section (Mock Instagram Grid) */}
        <div className="mt-10">
          <h3 className="text-gray-800 font-semibold mb-4">Posts</h3>
          <div className="grid grid-cols-3 gap-2">
            {user.posts && user.posts.length > 0 ? (
              user.posts.map((p, i) => (
                <img
                  key={i}
                  src={p.image || "https://via.placeholder.com/300"}
                  alt="post"
                  className="aspect-square object-cover rounded-md hover:opacity-80 cursor-pointer transition"
                />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-400 py-8">
                No posts yet 😶 (Post system are on construction)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
