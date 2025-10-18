import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

// Components
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import MobileNavbar from "./components/MobileNavbar";
import InstallPrompt from "./components/InstallPrompt";
import PopUpModel from "./components/PopUpModel";

// Pages
import Home from "./pages/Home";
import Register from "./AUTH/Register";
import Login from "./AUTH/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Messages from "./Message/Messages";
import Matches from "./pages/Matches";
import Admin from "./Admin/Admin";
import AdminLogin from "./Admin/Auth/Login";
import SuspendUsers from "./Admin/SuspendUsers";
import ManageUser from "./Admin/ManageUsers";
import Support from "./pages/Support";
import PageNotFound from "./pages/PageNotFound";

import "./App.css";

function AppContent() {
  const location = useLocation();

  const hideLayout =
    ["/login", "/register", "/messages", "/admin/login"].includes(location.pathname) ||
    location.pathname.startsWith("/messages/");


  return (
    <div className="App flex flex-col min-h-screen relative text-black bg-white">
      {!hideLayout && (
        <>
          <div className="block md:hidden">
            <Header />
          </div>
          <div className="hidden md:block">
            <Navbar />
          </div>
        </>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:userId" element={<Messages />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/support" element={<Support />} />
          <Route path="/@:username" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/suspend" element={<SuspendUsers />} />
          <Route path="/admin/manage-users" element={<ManageUser />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>

      {!hideLayout && (
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      )}

      <InstallPrompt />

 
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
