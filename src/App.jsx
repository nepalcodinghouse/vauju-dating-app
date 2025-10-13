import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Register from "./AUTH/Register";
import Login from "./AUTH/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Messages from "./pages/Messages";
import Matches from "./pages/Matches";
import Admin from "./Admin/Admin";
import AdminLogin from "./Admin/Auth/Login";
import SuspendUsers from "./Admin/SuspendUsers";
import ManageUser from "./Admin/ManageUsers";
import "./App.css";

// ✅ Wrapped layout logic inside Router Context properly
function AppContent() {
  const location = useLocation();

  // Paths where we don't want Navbar
  const hideLayout =
    ["/login", "/register", "/messages", "/admin/login"].includes(location.pathname) ||
    location.pathname.startsWith("/messages/");

  return (
    <div className="App">
      {!hideLayout && <Navbar />}

      <Routes>
        {/* Main user routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/matches" element={<Matches />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/suspend" element={<SuspendUsers />} />
        <Route path="/admin/manage-users" element={<ManageUser />} />

        {/* Fallback 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
