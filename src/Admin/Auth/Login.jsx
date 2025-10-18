import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin"); // redirect if token exists
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://backend-vauju-1.onrender.com/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON:", jsonErr);
        toast.error("Invalid server response");
        return;
      }

      console.log("Server response:", data);

      if (res.ok && data.token) {
        localStorage.setItem("adminToken", data.token);
        toast.success("Login successful 🎉");
        setTimeout(() => navigate("/admin"), 1000); // small delay for toast
      } else {
        toast.error(data.message || `Login failed ❌ (status ${res.status})`);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-sm mx-auto mt-20 border rounded-xl shadow-md">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded cursor-pointer ${
            loading && "opacity-70"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Demo: username: <b>admin</b>, password: <b>admin123</b>
      </p>
    </div>
  );
}

export default AdminLogin;
