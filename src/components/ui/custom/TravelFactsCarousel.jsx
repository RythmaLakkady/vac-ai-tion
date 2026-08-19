import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Compass, Camera, Coffee, Palmtree } from "lucide-react";

const DEFAULT_FACTS = [
  { icon: <MapPin className="w-8 h-8 text-amber" />, text: "Did you know? The shortest commercial flight in the world lasts just 57 seconds!" },
  { icon: <Compass className="w-8 h-8 text-coral" />, text: "Navigating the globe? There are 24 different time zones across the world." },
  { icon: <Camera className="w-8 h-8 text-amber" />, text: "Over 80% of all tourist photos are taken in just 10% of the world's most famous locations." },
  { icon: <Coffee className="w-8 h-8 text-coral" />, text: "Local cuisine is considered the #1 driving factor for choosing a travel destination." },
  { icon: <Palmtree className="w-8 h-8 text-emerald-500" />, text: "Taking a vacation reduces stress and strongly improves heart health according to multiple studies!" },
];

export default function TravelFactsCarousel({ destination }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If we had an API, we could fetch destination-specific facts here.
  // For now, we will mix generic facts with a destination-specific intro.
  const facts = [
    { icon: <Sparkles className="w-8 h-8 text-amber" />, text: `Our AI Swarm is currently scanning millions of data points to build your perfect trip to ${destination}...` },
    ...DEFAULT_FACTS
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(timer);
  }, [facts.length]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-card/50 backdrop-blur-3xl rounded-3xl border border-border shadow-2xl">
      {/* Animated Background Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-coral/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center max-w-md z-10"
        >
          <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 mb-6">
            {facts[currentIndex].icon}
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ink leading-relaxed">
            {facts[currentIndex].text}
          </h3>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 flex gap-2 z-10">
        {facts.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-8 bg-amber" : "w-2 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
