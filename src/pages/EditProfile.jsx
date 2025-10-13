import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function EditProfile() {
  const [form, setForm] = useState({ 
    name: "", 
    bio: "", 
    age: "", 
    gender: "other", 
    interests: "", 
    location: "", 
    visible: false // always start as false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current profile (replace with real userId/token logic)
    let mounted = true;
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return;
    fetch(`https://backend-vauju-1.onrender.com/api/profile`, { 
      headers: { 'x-user-id': user._id } 
    })
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          age: data.age || "",
          gender: data.gender || "other",
          interests: (data.interests && data.interests.join(", ")) || "",
          location: data.location || "",
          visible: false // user must manually enable; admin approval required
        });
      })
      .catch(() => toast.error("Failed to load profile"));
    return () => { mounted = false };
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const v = type === 'checkbox' ? checked : value;
    setForm(f => ({ ...f, [name]: v }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("token"));
    if (!user || !user._id) return;
    const payload = {
      name: form.name,
      bio: form.bio,
      age: form.age,
      gender: form.gender,
      interests: form.interests,
      location: form.location,
      visible: form.visible,
    };

    try {
      const res = await fetch(`https://backend-vauju-1.onrender.com/api/profile`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'x-user-id': user._id },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Profile update failed:", res.status, result);
        throw new Error(result.message || `Update failed (${res.status})`);
      }
      const updated = result;
      // update localStorage token with latest user info (shallow)
      try {
        const stored = JSON.parse(localStorage.getItem("token")) || {};
        localStorage.setItem("token", JSON.stringify({ ...stored, ...updated }));
        window.dispatchEvent(new Event("authChange"));
      } catch (err) { }
      if (form.visible) {
        toast.success("Request sent. Admin approval required to appear in Matches.");
      } else {
        toast.success("Profile updated");
      }
      navigate("/matches");
    } catch (err) {
      console.error("EditProfile error:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Interests (comma separated)</label>
          <input name="interests" value={form.interests} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Show me in Matches</label>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
            className={`w-12 h-6 rounded-full p-1 transition ${form.visible ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-pressed={!!form.visible}
          >
            <span
              className={`block w-4 h-4 bg-white rounded-full shadow transform transition ${form.visible ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
        <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}

export default EditProfile;
