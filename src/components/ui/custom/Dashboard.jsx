import React, { useState, useEffect } from 'react';
import { Button } from '../button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Compass, MapPin, Sparkles, Sun, Wand2, Route, Star } from 'lucide-react';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '@/components/ui/custom/AuthModal';
import Globe from '@/components/ui/custom/Globe';
import '/src/index.css';

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user && pendingAction === 'createTrip') {
        navigate('/createTrip');
        setPendingAction(null);
      }
    });
    return () => unsubscribe();
  }, [pendingAction, navigate]);

  const handleStartExploring = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setPendingAction('createTrip');
      setIsModalOpen(true);
    } else {
      navigate('/createTrip');
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const floatingPills = [
    { label: 'Paris', className: 'top-[6%] left-[2%]', delay: '0s' },
    { label: 'Tokyo', className: 'top-[22%] right-[-2%]', delay: '1.2s' },
    { label: 'Bali', className: 'bottom-[18%] left-[-4%]', delay: '0.6s' },
    { label: 'Reykjavik', className: 'bottom-[4%] right-[6%]', delay: '1.8s' },
  ];

  const steps = [
    {
      icon: Wand2,
      title: 'Tell us your vibe',
      text: 'Budget, dates, who you travel with, and the moments you love. A sentence is enough.',
    },
    {
      icon: Sparkles,
      title: 'Agents get to work',
      text: 'A swarm of AI specialists scout stays, food, and hidden gems in parallel — in seconds.',
    },
    {
      icon: Route,
      title: 'Wander with a plan',
      text: 'A day-by-day, map-ready itinerary you can tweak, price-check, and take on the road.',
    },
  ];

  return (
    <div className="flex flex-col items-center text-center overflow-hidden">
      {/* ---------- HERO ---------- */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-16 lg:pt-40 lg:pb-24 grid lg:grid-cols-2 gap-12 items-center"
      >
        {/* Copy */}
        <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-holiday-coral/30 bg-holiday-cream/70 backdrop-blur px-4 py-1.5 text-sm font-semibold font-sans text-holiday-coral shadow-sm"
          >
            <Sun className="w-4 h-4" />
            Your golden-hour trip architect
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif font-semibold text-[52px] md:text-[72px] leading-[1.02] tracking-tight mt-6 text-balance"
          >
            <span className="text-holiday-dark">Chase the </span>
            <span className="text-sunset animate-shimmer">good light,</span>
            <br />
            <span className="text-holiday-dark">we&apos;ll plan the rest.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-holiday-dark/75 mt-6 max-w-xl leading-relaxed font-sans"
          >
            Skip the 47 open tabs. vac-ai-tion&apos;s AI agents craft warm, wander-ready itineraries
            tuned to your budget, your pace, and your kind of adventure.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col sm:flex-row gap-4 font-sans">
            <a href="/createTrip" onClick={handleStartExploring}>
              <Button className="group relative text-lg px-9 py-7 w-full sm:w-auto bg-gradient-to-r from-holiday-coral to-holiday-amber text-white hover:shadow-[0_18px_40px_-12px_rgba(249,113,80,0.7)] shadow-xl transition-all duration-300 rounded-full border-none">
                <span className="relative z-10 flex items-center gap-2 font-bold">
                  Start Exploring
                  <PlaneTakeoff className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Button>
            </a>
            <Link to="/compare-prices">
              <Button className="text-lg px-9 py-7 w-full sm:w-auto bg-holiday-cream/70 text-holiday-dark hover:bg-white backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 rounded-full border border-holiday-dark/10 font-bold">
                Compare Prices
              </Button>
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center gap-6 font-sans text-holiday-dark/70"
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-holiday-amber text-holiday-amber" />
              ))}
            </div>
            <span className="text-sm">
              Loved by <span className="font-bold text-holiday-dark">12,000+</span> wanderers
            </span>
          </motion.div>
        </div>

        {/* Globe */}
        <motion.div
          variants={fadeUp}
          className="relative flex items-center justify-center"
        >
          {/* warm halo behind globe */}
          <div className="absolute inset-0 -z-20 flex items-center justify-center">
            <div className="w-[88%] aspect-square rounded-full bg-gradient-to-tr from-holiday-amber/50 via-holiday-coral/35 to-transparent blur-[70px]" />
          </div>
          {/* dark "from space" disc so the globe reads as a golden-hour earth */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div
              className="w-[82%] aspect-square rounded-full shadow-[0_30px_80px_-20px_rgba(58,36,26,0.55)]"
              style={{
                background:
                  'radial-gradient(circle at 32% 28%, #0f3b38 0%, #0a2b29 45%, #06201f 100%)',
                boxShadow:
                  'inset 0 0 60px rgba(255,180,90,0.25), 0 0 60px rgba(249,113,80,0.25)',
              }}
            />
          </div>
          {/* rotating dashed orbit ring */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center animate-spin-slow pointer-events-none">
            <div className="w-[96%] aspect-square rounded-full border border-dashed border-holiday-coral/30" />
          </div>

          <Globe />

          {/* floating destination pills */}
          {floatingPills.map((pill) => (
            <div
              key={pill.label}
              style={{ animationDelay: pill.delay }}
              className={`absolute ${pill.className} animate-float glass rounded-2xl px-4 py-2 flex items-center gap-2 font-sans shadow-lg pointer-events-none`}
            >
              <MapPin className="w-4 h-4 text-holiday-coral" />
              <span className="font-bold text-sm text-holiday-dark">{pill.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ---------- STATS STRIP ---------- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="w-full max-w-6xl mx-auto px-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
          {[
            { n: '190+', l: 'Countries mapped' },
            { n: '30 sec', l: 'To a full plan' },
            { n: '12k+', l: 'Trips crafted' },
            { n: '4.9/5', l: 'Traveler rating' },
          ].map((s) => (
            <motion.div
              key={s.l}
              variants={fadeUp}
              className="glass rounded-3xl px-6 py-7 text-center"
            >
              <p className="text-3xl md:text-4xl font-serif font-semibold text-sunset">{s.n}</p>
              <p className="text-sm text-holiday-dark/65 mt-1 font-medium">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ---------- FEATURE SHOWCASE ---------- */}
      <div className="w-full max-w-7xl mx-auto mt-32 px-6 space-y-36 pb-16">
        {/* Section 1 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="flex flex-col lg:flex-row items-center gap-16"
        >
          <motion.div variants={fadeUp} className="relative lg:w-1/2">
            <div className="absolute inset-0 bg-gradient-to-tr from-holiday-amber/30 to-transparent rounded-3xl transform -rotate-3 scale-105 -z-10 blur-xl" />
            <img
              src="/paris.jpg"
              alt="Golden light over the rooftops of Paris"
              className="w-full h-[500px] object-cover rounded-[40px] shadow-2xl border-4 border-white/60"
            />
            <div className="absolute -bottom-8 -right-6 glass p-5 rounded-3xl shadow-xl hidden md:block animate-bounce-slow">
              <p className="font-bold text-holiday-dark flex items-center gap-2 font-sans">
                <MapPin className="text-holiday-coral" /> Montmartre, Paris
              </p>
              <p className="text-sm text-holiday-dark/70 mt-1 font-sans">Added to your itinerary</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:w-1/2 text-left">
            <span className="inline-flex items-center gap-2 text-holiday-coral font-bold font-sans text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Handcrafted feel
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-holiday-dark leading-tight mt-4 text-balance">
              Itineraries that feel made just for you.
            </h2>
            <p className="text-lg md:text-xl text-holiday-dark/75 mt-6 leading-relaxed font-sans">
              Our Agent Swarm reads your interests, dates, and exact budget to architect a journey
              that feels personal — from headline landmarks to the little café two streets off the
              square.
            </p>
          </motion.div>
        </motion.div>

        {/* Section 2 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="flex flex-col lg:flex-row-reverse items-center gap-16"
        >
          <motion.div variants={fadeUp} className="relative lg:w-1/2">
            <div className="absolute inset-0 bg-gradient-to-tl from-holiday-coral/30 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10 blur-xl" />
            <img
              src="/maldives.jpg"
              alt="Turquoise lagoon in the Maldives at sunset"
              className="w-full h-[500px] object-cover rounded-[40px] shadow-2xl border-4 border-white/60"
            />
            <div className="absolute -bottom-8 -left-6 glass p-5 rounded-3xl shadow-xl hidden md:block animate-float-delayed">
              <p className="font-bold text-holiday-dark flex items-center gap-2 font-sans">
                <Compass className="text-holiday-teal" /> Off the beaten path
              </p>
              <p className="text-sm text-holiday-dark/70 mt-1 font-sans">3 hidden gems found</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:w-1/2 text-left">
            <span className="inline-flex items-center gap-2 text-holiday-teal font-bold font-sans text-sm uppercase tracking-wider">
              <Compass className="w-4 h-4" /> Beyond the guidebook
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-holiday-dark leading-tight mt-4 text-balance">
              Hidden gems over tourist traps.
            </h2>
            <p className="text-lg md:text-xl text-holiday-dark/75 mt-6 leading-relaxed font-sans">
              Step off the beaten path. The AI constantly surfaces local hotspots, lesser-known
              coastal towns, and immersive experiences you won&apos;t find in a standard guidebook.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ---------- HOW IT WORKS ---------- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="w-full max-w-6xl mx-auto px-6 pb-24"
      >
        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-serif font-semibold text-holiday-dark text-balance"
        >
          From daydream to departure in three steps.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6 mt-14 font-sans">
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              className="group bg-holiday-cream/80 backdrop-blur rounded-[32px] p-8 text-left border border-white/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-holiday-coral to-holiday-amber text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <step.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-holiday-dark mt-6">
                {step.title}
              </h3>
              <p className="text-holiday-dark/70 mt-3 leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ---------- FINAL CTA ---------- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full px-6 pb-28"
      >
        <div className="text-center bg-gradient-to-br from-holiday-dark to-[#5a3423] p-16 md:p-24 rounded-[60px] max-w-6xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-holiday-coral/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-0 w-96 h-96 bg-holiday-amber/30 rounded-full blur-3xl" />

          <div className="relative z-10">
            <Compass className="w-16 h-16 mx-auto text-holiday-sun mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-serif font-semibold text-holiday-cream drop-shadow-sm mb-6 text-balance">
              Ready for your next chapter?
            </h2>
            <p className="text-lg md:text-xl text-holiday-cream/80 max-w-2xl mx-auto mb-10 font-sans">
              Join thousands of travelers planning their dream vacations with vac-ai-tion&apos;s
              next-generation AI.
            </p>
            <a href="/createTrip" onClick={handleStartExploring}>
              <Button className="text-xl px-14 py-8 bg-gradient-to-r from-holiday-coral to-holiday-amber text-white hover:shadow-[0_20px_50px_-15px_rgba(245,165,36,0.7)] hover:-translate-y-1 transition-all duration-300 rounded-full border-none font-sans font-bold">
                Start Planning Free
              </Button>
            </a>
          </div>
        </div>
      </motion.div>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Dashboard;
