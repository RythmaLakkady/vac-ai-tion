import React from 'react';
import { Button } from '../button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Compass, MapPin, Globe2 } from 'lucide-react';
import '/src/index.css';

function Dashboard() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="flex flex-col items-center text-center font-serif overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-8 pt-32 pb-16"
      >
        {/* Animated Background blobs */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-holiday-teal/20 rounded-full blur-[100px] -z-10"
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-holiday-coral/10 rounded-full blur-[120px] -z-10"
        />

        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/50 shadow-sm mb-8">
          <Globe2 className="w-4 h-4 text-holiday-teal" />
          <span className="text-sm font-semibold text-holiday-dark tracking-wide uppercase">vac-ai-tion 2.0 is Live</span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-semibold text-[60px] md:text-[80px] leading-[1.1] drop-shadow-sm max-w-5xl">
          <span className="text-holiday-dark">Design your dream </span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-holiday-teal to-holiday-coral">vacation in seconds.</span>
        </motion.h1>
        
        <motion.p variants={fadeUp} className="text-xl md:text-2xl text-holiday-dark opacity-80 mt-6 max-w-3xl mx-auto leading-relaxed">
          Skip the endless research. Our intelligent AI agents craft perfectly tailored, cinematic itineraries that match your unique travel style.
        </motion.p>
        
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center font-sans">
          <Link to="/createTrip">
            <Button className="group relative text-lg px-10 py-7 w-full sm:w-auto bg-holiday-teal text-white hover:bg-[#5aa196] shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full border-none overflow-hidden">
              <span className="relative z-10 flex items-center gap-2 font-bold">
                Start Exploring <PlaneTakeoff className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <Link to="/compare-prices">
            <Button className="text-lg px-10 py-7 w-full sm:w-auto bg-white/60 text-holiday-dark hover:bg-white backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 rounded-full border border-white/50 font-bold">
              Compare Prices
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Showcase */}
      <div className="w-full max-w-7xl mx-auto mt-10 px-8 space-y-40 pb-32">
        {/* Section 1 */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="flex flex-col lg:flex-row items-center lg:items-center gap-16"
        >
          <motion.div variants={fadeUp} className="relative lg:w-1/2">
            <div className="absolute inset-0 bg-gradient-to-tr from-holiday-teal/20 to-transparent rounded-3xl transform -rotate-3 scale-105 -z-10 blur-xl"></div>
            <img src="/public/paris.jpg" alt="Paris" className="w-full h-[500px] object-cover rounded-[40px] shadow-2xl border-4 border-white/60" />
            <div className="absolute -bottom-10 -right-10 glass p-6 rounded-3xl shadow-xl hidden md:block animate-bounce-slow">
              <p className="font-bold text-holiday-dark flex items-center gap-2 font-sans"><MapPin className="text-holiday-coral"/> Montmartre, Paris</p>
              <p className="text-sm opacity-80 mt-1 font-sans">Added to your itinerary</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:w-1/2 text-left">
            <h2 className="text-5xl font-semibold text-holiday-dark leading-tight">Magical itineraries, crafted just for you.</h2>
            <p className="text-xl text-holiday-dark opacity-80 mt-6 leading-relaxed">
              vac-ai-tion’s Agent Swarm analyzes your unique interests, travel dates, and exact budget to architect a journey that feels handcrafted. From historic landmarks to hidden local cafes, we build it all.
            </p>
          </motion.div>
        </motion.div>

        {/* Section 2 */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="flex flex-col lg:flex-row-reverse items-center lg:items-center gap-16"
        >
          <motion.div variants={fadeUp} className="relative lg:w-1/2">
            <div className="absolute inset-0 bg-gradient-to-tl from-holiday-coral/20 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10 blur-xl"></div>
            <img src="/public/maldives.jpg" alt="Maldives" className="w-full h-[500px] object-cover rounded-[40px] shadow-2xl border-4 border-white/60" />
          </motion.div>
          <motion.div variants={fadeUp} className="lg:w-1/2 text-left">
            <h2 className="text-5xl font-semibold text-holiday-dark leading-tight">Hidden gems over tourist traps.</h2>
            <p className="text-xl text-holiday-dark opacity-80 mt-6 leading-relaxed">
              Step completely off the beaten path. Our advanced AI constantly discovers local hotspots, lesser-known coastal towns, and immersive cultural experiences you won't find in standard guidebooks.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Final Call to Action */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full px-8 pb-32"
      >
        <div className="text-center bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg p-16 md:p-24 rounded-[60px] max-w-6xl mx-auto shadow-2xl border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-holiday-coral/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-holiday-teal/10 rounded-full blur-3xl -z-10"></div>
          
          <Compass className="w-16 h-16 mx-auto text-holiday-teal mb-6 animate-pulse" />
          <h2 className="text-5xl md:text-6xl font-semibold text-holiday-dark drop-shadow-sm mb-6">
            Ready for your next chapter?
          </h2>
          <p className="text-xl text-holiday-dark opacity-80 max-w-2xl mx-auto mb-10 font-sans">
            Join thousands of travelers planning their dream vacations with vac-ai-tion's next-generation AI.
          </p>
          <Link to="/createTrip">
            <Button className="text-xl px-14 py-8 bg-holiday-dark text-white hover:bg-black shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 rounded-full border-none font-sans font-bold">
              Start Planning Free
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
