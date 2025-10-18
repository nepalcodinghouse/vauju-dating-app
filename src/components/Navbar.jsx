// src/components/XSidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Assets
import SupportIcon from "../assets/support.png";
import Logo from "../assets/logo.png";

// Icons
import {
  Home,
  MessageSquare,
  Users,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

function XSidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = JSON.parse(localStorage.getItem("token") || "null");
      setIsLoggedIn(!!token);
    };
    checkAuth();

    const onStorage = (e) => {
      if (!e || e.key === "token") checkAuth();
    };
    const onAuthChange = () => checkAuth();

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChange", onAuthChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChange", onAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    try {
      window.dispatchEvent(new Event("authChange"));
      localStorage.setItem("__auth_change_ts", Date.now());
    } catch {}
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: <Home size={22} /> },
    { path: "/matches", icon: <Users size={22} /> },
    { path: "/messages", icon: <MessageSquare size={22} /> },
    { path: "/support", icon: <img src={SupportIcon} alt="Support" className="w-6 h-6" /> },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-white border-r border-gray-200 shadow-sm flex flex-col justify-between z-50">
      {/* Top Nav */}
      <div className="flex flex-col items-center mt-6 space-y-2">
        <Link
          to="/"
          className="text-2xl font-bold text-black flex items-center justify-center py-6 border-b border-gray-100 w-full"
        >
          <img src={Logo} alt="Logo" className="w-10 h-10" />
        </Link>

        <nav className="flex flex-col mt-6 space-y-2">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center justify-center w-full p-3 rounded-xl transition-all hover:bg-gray-100 ${
                isActive(item.path) ? "bg-gray-200 text-black" : "text-gray-700"
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Auth */}
      <div className="flex flex-col items-center mb-6 space-y-3 px-1 border-t border-gray-100 pt-4">
        {isLoggedIn ? (
          <>
            <Link
              to="/profile"
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
            >
              <User size={22} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-red-100 transition text-gray-800 hover:text-red-500"
            >
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white transition"
            >
              <LogIn size={18} />
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center w-12 h-12 rounded-full border border-black text-black transition"
            >
              <UserPlus size={18} />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}

export default XSidebar;
