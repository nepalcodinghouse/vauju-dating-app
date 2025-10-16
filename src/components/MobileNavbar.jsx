// src/components/MobileNavbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, MessageCircle, User } from "lucide-react";

function MobileNavbar() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Matches", path: "/matches", icon: Heart },
    { name: "Messages", path: "/messages", icon: MessageCircle },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 p-2 shadow-md z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center text-gray-500 ${
                isActive ? "text-" : "hover:text-gray-800 transition-colors duration-200"
              }`}
            >
              <IconComponent size={24} color={isActive ? "#4f46e5" : "#6b7280"} />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNavbar;
