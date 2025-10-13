import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("https://backend-vauju-1.onrender.com/api/auth/register", {
        name,
        email,
        password,
      });

      toast.success(data.message || "🎉 Registered successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "⚠️ Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Toast Container */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Account
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Join HeartConnect and start connecting today!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block text-gray-700 mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center bg-indigo-600 text-white py-3 rounded-lg transition font-semibold hover:bg-indigo-700 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : null}
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
