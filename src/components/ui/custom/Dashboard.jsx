import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlaneTakeoff, Star, Sun, Sparkles, Compass, Quote, Sliders, MapPinned, Route } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '@/components/ui/custom/AuthModal';
import InteractiveGlobe from './InteractiveGlobe';
import { HoverLetters, RotatingWord } from './InteractiveHeadline';
import '/src/index.css';

const features = [
  {
    title: "Hyper-Personalized",
    description: "Your budget, your pace, your vibe. We don't do cookie-cutter itineraries.",
    icon: <Sliders className="size-6 text-orange-500" />
  },
  {
    title: "Hidden Gems",
    description: "Our AI cross-references millions of data points to find spots locals actually love.",
    icon: <MapPinned className="size-6 text-orange-500" />
  },
  {
    title: "Smart Logistics",
    description: "We optimize the routes so you spend more time exploring and less time in transit.",
    icon: <Route className="size-6 text-orange-500" />
  }
];

function FeatureCard({ feature, i }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative rounded-[2rem] p-8 text-left border border-white/60 bg-card/80 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300 hover:border-amber/40 hover:bg-card/90 cursor-default"
    >
      <div 
        className="mb-8 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber/20 to-orange-500/20 text-orange-600 shadow-inner border border-orange-500/10 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2"
        style={{ transform: "translateZ(40px)" }}
      >
        {feature.icon}
      </div>
      <h3 
        className="mb-4 text-2xl font-bold text-ink tracking-tight"
        style={{ transform: "translateZ(30px)" }}
      >
        {feature.title}
      </h3>
      <p 
        className="text-muted-foreground leading-relaxed text-[1.05rem]"
        style={{ transform: "translateZ(20px)" }}
      >
        {feature.description}
      </p>
      
      {/* Dynamic Glow */}
      <motion.div 
        className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useTransform(
            () => `radial-gradient(800px circle at ${(x.get() + 0.5) * 100}% ${(y.get() + 0.5) * 100}%, rgba(251,146,60,0.06), transparent 40%)`
          )
        }}
      />
      <div className="absolute inset-0 -z-20 rounded-[2rem] bg-gradient-to-br from-white/40 to-transparent opacity-50" />
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-32 relative">
      <div className="mb-20 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink tracking-tight">Why use an AI Architect?</h2>
        <p className="mt-5 text-xl text-muted-foreground font-medium max-w-2xl mx-auto">We handle the heavy lifting, you handle the packing.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3" style={{ perspective: "1000px" }}>
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} i={i} />
        ))}
      </div>
    </section>
  );
}

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

  return (
    <div className="flex flex-col items-center text-center font-sans overflow-hidden">
      <main className="w-full">
        {/* HERO */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-16 pt-16 lg:grid-cols-2 lg:pt-24 text-left">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur">
              <Sun className="size-4 animate-pulse" /> Your personal trip architect
            </p>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.03] tracking-tight md:text-6xl lg:text-7xl">
              <HoverLetters text="Relax, tell us your" />{" "}
              <span className="animate-shimmer-text">preferences</span>
              <br />
              <HoverLetters text="and let us do the work." />
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Skip the 47 open tabs. Our AI agents craft{" "}
              <RotatingWord
                className="font-bold text-amber"
                words={["tailored", "wander-ready", "budget-honest", "gloriously slow"]}
              />{" "}
              itineraries tuned to your budget, your pace, and your kind of adventure.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="/createTrip"
                onClick={handleStartExploring}
                className="bg-sunset group inline-flex items-center gap-2 rounded-full px-9 py-4 text-lg font-bold text-primary-foreground shadow-warm transition-transform hover:-translate-y-1"
              >
                Start exploring
                <PlaneTakeoff className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="animate-float">
            <InteractiveGlobe />
          </div>
        </section>

        <FeaturesSection />

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pt-24 pb-32">
          <div className="bg-dawn relative overflow-hidden rounded-4xl px-8 py-16 text-center shadow-warm">
            <Sparkles className="mx-auto size-8 text-primary-foreground" />
            <h2 className="mt-4 font-serif text-4xl font-semibold text-primary-foreground md:text-5xl">
              Your next adventure is waiting.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Tell us what you're looking for, and we'll craft the perfect itinerary.
            </p>
            <a
              href="/createTrip"
              onClick={handleStartExploring}
              className="mt-8 inline-flex rounded-full bg-card px-9 py-4 text-lg font-bold text-foreground transition-transform hover:-translate-y-1"
            >
              Plan my escape
            </a>
          </div>
        </section>
      </main>
      
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Dashboard;
