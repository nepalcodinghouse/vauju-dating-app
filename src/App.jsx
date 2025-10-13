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
import "./App.css";

function AppContent() {
  const location = useLocation();

  // Paths where we don't want Navbar & Footer
  const hideLayout = ["/login", "/register", "/messages"].includes(location.pathname) || location.pathname.startsWith('/messages/');

  return (
    <div className="App">
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/editprofile" element={<EditProfile />} />
  <Route path="/messages" element={<Messages />} />
  <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/matches" element={<Matches />} />
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
