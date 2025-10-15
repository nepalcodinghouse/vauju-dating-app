// src/pages/EditProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const BASE_URL = "https://backend-vauju-1.onrender.com";

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    name: "",
    bio: "",
    age: "",
    gender: "other",
    interests: "",
    location: "",
    visible: false,
    profilePic: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return navigate("/login");

    fetch(`${BASE_URL}/api/profile`, { headers: { "x-user-id": user._id } })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) =>
        setForm({
          username: data.username || "",
          name: data.name || "",
          bio: data.bio || "",
          age: data.age || "",
          gender: data.gender || "other",
          interests: (data.interests && data.interests.join(", ")) || "",
          location: data.location || "",
          visible: data.visible || false,
          profilePic:
            data.profilePic ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        })
      )
      .catch((err) => toast.error("Failed to load profile: " + err.message));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return;

    if (Number(form.age) < 13) {
      toast.error("You must be at least 13 years old.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },
        body: JSON.stringify({
          ...form,
          interests: form.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      localStorage.setItem("token", JSON.stringify({ ...user, ...result }));
      window.dispatchEvent(new Event("authChange"));
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={form.profilePic}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
          />
          <label
            htmlFor="profilePic"
            className="text-sm text-blue-600 font-medium mt-2 cursor-pointer"
          >
            Change profile photo
          </label>
          <input
            id="profilePic"
            name="profilePic"
            type="text"
            value={form.profilePic}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="hidden"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <label className="sm:w-32 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-gray-400 outline-none"
              placeholder="Username"
              required
            />
          </div>

          {/* Name */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <label className="sm:w-32 text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-gray-400 outline-none"
              placeholder="Full name"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
            <label className="sm:w-32 text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 h-20 resize-none focus:ring-1 focus:ring-gray-400 outline-none"
              placeholder="Tell something about yourself"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              min="13"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-gray-400 outline-none"
              placeholder="Age (13+)"
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-gray-400 outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Interests */}
          <input
            name="interests"
            value={form.interests}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-gray-400 outline-none"
            placeholder="Interests (comma separated)"
          />

          {/* Location */}
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-gray-400 outline-none"
            placeholder="Location"
          />

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium text-gray-700">
              Show me in matches
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="visible"
                checked={form.visible}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-all"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-lg text-white font-medium transition ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
