import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// 🔗 Backend URL (Fixed: Remove trailing slash to avoid double-slash in paths)
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
  });
  const [loading, setLoading] = useState(false);

  // Load user profile
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
        })
      )
      .catch((err) => toast.error("Failed to load profile: " + err.message));
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return;

    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },
        body: JSON.stringify({
          ...form,
          interests: form.interests.split(",").map((i) => i.trim()).filter(Boolean),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      // Update local storage token
      localStorage.setItem("token", JSON.stringify({ ...user, ...result }));
      window.dispatchEvent(new Event("authChange"));

      toast.success(
        form.visible
          ? "Request sent. Admin approval required to appear in Matches."
          : "Profile updated successfully!"
      );

      navigate("/profile");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the JSX remains unchanged from the previous version)
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Edit Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
              placeholder="Enter your username"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
              placeholder="Enter your name"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              rows="4"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Your age"
                min="18"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
              Interests (comma-separated)
            </label>
            <input
              id="interests"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="e.g., hiking, reading, music"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Your city or country"
            />
          </div>

          {/* Visible toggle */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <label htmlFor="visible" className="text-sm font-medium text-gray-700">
              Show me in Matches
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                id="visible"
                name="visible"
                type="checkbox"
                checked={form.visible}
                onChange={handleChange}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-4 checked:border-blue-500"
              />
              <label
                htmlFor="visible"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                  form.visible ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-full py-2.5 rounded-lg text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;