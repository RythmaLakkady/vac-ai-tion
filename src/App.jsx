import { StrictMode } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/ui/custom/Header';
import { Toaster } from './components/ui/sonner';
import Cursor from './components/ui/custom/Cursor';
import Footer from './components/ui/custom/Footer';

function App() {
  const location = useLocation();

  return (
    <div>
      <Cursor />
      <Header />
      <Toaster />
      <AnimatePresence mode="wait">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;
