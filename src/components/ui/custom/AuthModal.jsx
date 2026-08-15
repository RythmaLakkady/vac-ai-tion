import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaneTakeoff, Mail, Lock, X } from 'lucide-react';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from 'sonner';

function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
        onClose();
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters long!");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!");
        onClose();
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already in use. Try logging in!");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-holiday-teal/10 rounded-2xl flex items-center justify-center">
                  <PlaneTakeoff className="w-7 h-7 text-holiday-teal" />
                </div>
              </div>

              <div className="flex bg-gray-100/80 p-1 rounded-xl mb-6">
                <button
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-holiday-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'signup' ? 'bg-white text-holiday-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sign Up
                </button>
              </div>

              <div className="text-center mb-6">
                <h2 className='text-2xl font-bold text-slate-800 mb-1'>
                  {activeTab === 'login' ? 'Welcome Back' : 'Join the Journey'}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeTab === 'login' ? 'Log in to continue planning' : 'Create an account to save your trips'}
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-lg mb-6 border border-red-100">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className='text-sm font-medium text-slate-700 ml-1'> Email </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className='w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-holiday-teal/50 focus:border-holiday-teal transition-all'
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className='text-sm font-medium text-slate-700 ml-1'> Password </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className='w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-holiday-teal/50 focus:border-holiday-teal transition-all'
                      type="password"
                      placeholder={activeTab === 'login' ? "Enter your password" : "Create a password (min 6 chars)"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-holiday-teal text-white rounded-xl hover:bg-holiday-teal/90 shadow-lg shadow-holiday-teal/20 transition-all text-lg font-medium disabled:opacity-70 flex items-center justify-center gap-2" 
                  type="submit"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default AuthModal;
