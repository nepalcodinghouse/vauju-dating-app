// src/components/AdminLayout.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Home, LogOut, ShieldCheck } from "lucide-react";

function AdminLayout({ children }) {
  const location = useLocation();

  const links = [
    { to: "/admin", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/admin/users", label: "Manage Users", icon: <Users size={20} /> },
    { to: "/admin/reports", label: "Reports", icon: <ShieldCheck size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-white border-r shadow-sm fixed left-0 top-0 bottom-0">
        <div className="py-5 border-b text-center">
          <Link to="/admin" className="text-2xl font-bold text-indigo-600">
            Admin Panel
          </Link>
        </div>

        <nav className="flex-1 mt-6 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition ${
                location.pathname === link.to
                  ? "bg-indigo-100 text-indigo-600"
                  : ""
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
