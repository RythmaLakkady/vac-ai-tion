import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../../../firebase";  
import { motion } from 'framer-motion';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? currentUser : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 glass-card border-b border-white/30"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to={'/'}>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img 
              src="/logo.svg" 
              alt="vac-ai-tion Logo" 
              className="h-9 w-9 object-contain group-hover:-rotate-6 transition-transform duration-300" 
            />
            <span className="font-serif font-bold text-3xl tracking-tight text-ink hidden sm:block mt-0.5">vac-ai-tion</span>
          </motion.div>
        </Link>

        <div className='flex flex-row gap-8 items-center'>
          <Link to={'/compare-prices'}>
            <span className="text-sm font-bold text-muted-foreground hover:text-ink transition-colors cursor-pointer">
              Compare Prices
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              <Link to={'/profile'} className='flex items-center'>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-full bg-black text-primary-foreground flex items-center justify-center shadow-md cursor-pointer" 
                >
                  <span className="font-bold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                </motion.div>
              </Link>
              <button 
                onClick={handleSignOut} 
                className="text-sm font-medium text-holiday-dark/60 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to={'/signIn'}>
              <button className="text-sm px-6 py-2.5 bg-sunset text-primary-foreground hover:-translate-y-0.5 rounded-full shadow-warm transition-all font-bold">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Header;
