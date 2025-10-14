import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Backend base URL
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://backend-vauju-1.onrender.com"
    : "";

function EditProfile() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    age: "",
    gender: "other",
    interests: "",
    location: "",
    visible: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return navigate("/login");

    fetch(`${BASE_URL}/api/profile`, { headers: { "x-user-id": user._id } })
      .then(res => res.json())
      .then(data =>
        setForm({
          name: data.name || "",
          username: data.username || "",
          bio: data.bio || "",
          age: data.age || "",
          gender: data.gender || "other",
          interests: (data.interests && data.interests.join(", ")) || "",
          location: data.location || "",
          visible: data.visible || false,
        })
      )
      .catch(() => toast.error("Failed to load profile"));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[a-z0-9._]+$/.test(form.username)) {
      return toast.error("Username can only contain letters, numbers, dots, underscores");
    }

    setLoading(true);
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return;

    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": user._id },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      localStorage.setItem("token", JSON.stringify({ ...user, ...result }));
      window.dispatchEvent(new Event("authChange"));

      toast.success(form.visible
        ? "Request sent. Admin approval required to appear in Matches."
        : "Profile updated successfully!"
      );
      navigate(`/@${form.username}`);
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-10 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/40">
        <h2 className="text-3xl font-bold text-center text-black mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-xl px-4 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="e.g., abhayabikram" className="w-full border rounded-xl px-4 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border rounded-xl px-4 py-2" rows="3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Age</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded-xl px-4 py-2">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Interests</label>
            <input name="interests" value={form.interests} onChange={handleChange} className="w-full border rounded-xl px-4 py-2" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded-xl px-4 py-2" />
          </div>
          <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Show me in Matches</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, visible: !f.visible }))} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${form.visible ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`block w-4 h-4 bg-white rounded-full transform transition ${form.visible ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
