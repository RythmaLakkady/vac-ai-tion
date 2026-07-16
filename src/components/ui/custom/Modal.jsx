import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X } from "lucide-react";

function Modal({ isOpen, onClose, onLogin }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-holiday-teal/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-[90%] max-w-md"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-holiday-teal/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <LogIn className="w-6 h-6 text-holiday-teal" />
            </div>

            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome Back!</h2>
            <p className="text-center text-slate-500 mb-8">Please log in to generate and save your AI travel itineraries.</p>
            
            <div className="flex flex-col gap-3">
              <Link to={'/login'} className="w-full">
                <button
                  onClick={onLogin}
                  className="w-full bg-holiday-teal text-white py-3 px-6 rounded-xl font-medium hover:bg-holiday-teal/90 transition-all hover:shadow-lg hover:shadow-holiday-teal/20"
                >
                  Sign In
                </button>
              </Link>
              <button
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-600 py-3 px-6 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
