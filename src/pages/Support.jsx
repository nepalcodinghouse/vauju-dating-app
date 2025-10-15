// src/pages/Support.jsx
import React from "react";
import Layout from "../components/Layout";

function Support() {
  return (
    <Layout>
      <div className="pt-24 px-6 pb-10 font-sans max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Support Center</h1>
          <p className="text-gray-600 text-lg">
            We're here to help! If you have any questions, issues, or feedback, 
            feel free to reach out to us.
          </p>
        </section>

        {/* Support Options */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* FAQ / Help */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500">
              Check out our FAQ section to quickly find answers to common questions.
            </p>
            <button className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition">
              View FAQ
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold mb-3">Contact Support</h2>
            <p className="text-gray-500">
              Need personal help? Send us a message and our support team will assist you.
            </p>
            <button className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition">
              Send a Message
            </button>
          </div>
        </section>

        {/* Optional Contact Info */}
        <section className="mt-12 text-center text-gray-600">
          <p>Email: <a href="mailto:support@example.com" className="text-pink-600">support@example.com</a></p>
          <p>Phone: <a href="tel:+1234567890" className="text-pink-600">+1 234 567 890</a></p>
        </section>
      </div>
      <div className="gap-3">
        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ 
      </div>
    </Layout>
  );
}

export default Support;
