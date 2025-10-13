import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [brand, setBrand] = useState("HeartConnect");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Check login state on mount and listen for changes
  useEffect(() => {
    const checkAuth = () => {
      const t = JSON.parse(localStorage.getItem("token") || "null");
      setIsLoggedIn(!!t);
      const g = (t && t.gender) ? String(t.gender).toLowerCase() : null;
      if (g === "male") setBrand("Vauju Khoj Abhiyan");
      else if (g === "female") setBrand("Vinaju Khoj Abhiyan");
      else setBrand("HeartConnect");
    };

    // initial check
    checkAuth();

    // update when other tabs change localStorage
    const onStorage = (e) => {
      if (!e || e.key === "token") checkAuth();
    };
    window.addEventListener("storage", onStorage);

    // update when same-tab code dispatches a custom event after login/logout
    const onAuthChange = () => checkAuth();
    window.addEventListener("authChange", onAuthChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChange", onAuthChange);
    };
  }, []);

  // 🧠 Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    // notify other components and tabs
    try {
      window.dispatchEvent(new Event("authChange"));
      // also write to localStorage to trigger storage event in other tabs
      localStorage.setItem("__auth_change_ts", Date.now());
    } catch (err) {
      // ignore
    }
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Matches", path: "/matches" },
    { name: "Messages", path: "/messages" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 text-gray-700 border-b border-gray-100 sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight hover:opacity-90 transition">
            {brand}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative inline-flex items-center px-1.5 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-indigo-600 rounded-full" />
                )}
              </Link>
            ))}

            {/* 🔥 Show Profile or Login/Register */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition"
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur px-3 pt-2 pb-4 space-y-1.5 border-t border-gray-100 shadow-sm">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-sm ${
                isActive(item.path)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="flex flex-col space-y-2">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} className="mr-2" /> Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block px-3 py-2 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-sm bg-indigo-600 text-white text-center hover:bg-indigo-700 transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-sm border border-indigo-600 text-indigo-600 text-center hover:bg-indigo-600 hover:text-white transition"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
