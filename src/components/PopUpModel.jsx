import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PopUpModel({ isOpen, onClose, title, children }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal container */}
          <motion.div
            className="bg-[#121212] rounded-2xl shadow-lg border border-neutral-800 p-6 w-[90%] max-w-md text-white relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>

            {/* Title */}
            {title && <h2 className="text-xl font-semibold mb-3">{title}</h2>}

            {/* Content */}
            <div className="text-sm text-gray-300">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
