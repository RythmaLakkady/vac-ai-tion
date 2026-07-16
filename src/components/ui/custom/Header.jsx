import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../../../firebase";  
<<<<<<< HEAD
=======
import { motion } from 'framer-motion';
>>>>>>> c46005a (Initialize WanderGen trip planner)

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
<<<<<<< HEAD
    <div className="p-3 shadow-sm flex justify-between items-center px-5">
      <Link to={'/'}>
        <img src="/logo.svg" alt="WanderGen Logo" className="h-16 w-16" />
      </Link>

      <div className='flex flex-row gap-3 items-center'>
        {user ? (
          <>
            <Button 
              onClick={handleSignOut} 
              className="text-sm px-4 py-2 bg-[#fd9c7e] text-white hover:bg-[#dd8267]"
            >
              Sign Out
            </Button>

            <Link to={'/profile'} className='flex items-center'>
              <img src="/profile.svg" alt="Profile Icon" className="h-16 w-16 rounded-full hover:shadow-lg shadow-[#7AB9B3]" />
            </Link>
          </>
        ) : (
          <Link to={'/signIn'} className='flex items-center'>
            <Button className="text-sm px-4 py-2 bg-[#7AB9B3] text-white hover:bg-[#66a19b]">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
=======
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to={'/'}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img 
              src="/logo.svg" 
              alt="vac-ai-tion Logo" 
              className="h-12 w-12" 
            />
            <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">vac-ai-tion</span>
          </motion.div>
        </Link>

        <div className='flex flex-row gap-8 items-center'>
          <Link to={'/compare-prices'}>
            <span className="text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-pointer">
              Compare Prices
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              <Link to={'/profile'} className='flex items-center'>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center shadow-md cursor-pointer" 
                >
                  <span className="font-bold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                </motion.div>
              </Link>
              <button 
                onClick={handleSignOut} 
                className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to={'/signIn'}>
              <button className="text-sm px-5 py-2 bg-black text-white hover:bg-gray-800 rounded-full shadow-sm transition-all font-medium">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
>>>>>>> c46005a (Initialize WanderGen trip planner)
  );
}

export default Header;
