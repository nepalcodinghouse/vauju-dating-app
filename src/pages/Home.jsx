import React from "react";

function Home() {
  return (
    <section className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-pink-100 to-purple-200 text-center px-4">
      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
        Welcome to AuraMeet
      </h1>

      {/* Subheadline */}
      <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-xl">
        Connect with amazing people near you, find your perfect match, and start your journey of love today.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/register"
          className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="px-6 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition"
        >
          Login
        </a>
      </div>
    </section>
  );
}

export default Home;
