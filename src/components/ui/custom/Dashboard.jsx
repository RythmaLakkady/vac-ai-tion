import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, Sun, Sparkles, Sliders, MapPinned, Route, ArrowRight, Clock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '@/components/ui/custom/AuthModal';
import InteractiveGlobe from './InteractiveGlobe';
import { HoverLetters, RotatingWord } from './InteractiveHeadline';
import '/src/index.css';

const featuredTrips = [
  {
    destination: "Kyoto, Japan",
    subtitle: "Ancient Temples, Bamboo Groves & Zen Sanctuaries",
    duration: "7 Days",
    vibe: "Cultural Heritage",
    estimatedCost: "$1,450",
    image: "/japan.jpg",
    tags: ["Temples", "Bullet Train", "Gardens"]
  },
  {
    destination: "Paris, France",
    subtitle: "Artistry, River Bistros & Iconic Architecture",
    duration: "5 Days",
    vibe: "Art & Romance",
    estimatedCost: "$1,200",
    image: "/paris.jpg",
    tags: ["Louvre", "Café Culture", "Seine"]
  },
  {
    destination: "Maldives",
    subtitle: "Overwater Villas, Sunset Lagoons & Coral Reefs",
    duration: "4 Days",
    vibe: "Island Leisure",
    estimatedCost: "$2,100",
    image: "/maldives.jpg",
    tags: ["Marine Life", "Villas", "Reefs"]
  },
  {
    destination: "Interlaken, Switzerland",
    subtitle: "Glacial Valleys, Alpine Passes & Mountain Railways",
    duration: "6 Days",
    vibe: "Alpine Escapes",
    estimatedCost: "$1,850",
    image: "/nature.jpg",
    tags: ["Scenic Rail", "Alps", "Hiking"]
  }
];

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
      className="group rounded-3xl p-8 text-left border border-border/70 bg-card shadow-sm transition-all duration-300 hover:border-amber/50 hover:shadow-md cursor-default"
    >
      <div 
        className="mb-8 inline-flex size-14 items-center justify-center rounded-2xl bg-amber/10 text-orange-600 transition-transform duration-300 group-hover:scale-105"
      >
        {feature.icon}
      </div>
      <h3 
        className="mb-3 text-xl font-bold text-ink tracking-tight"
      >
        {feature.title}
      </h3>
      <p 
        className="text-muted-foreground leading-relaxed"
      >
        {feature.description}
      </p>
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28 relative">
      <div className="mb-16 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink tracking-tight">Why use an AI Architect?</h2>
        <p className="mt-4 text-xl text-muted-foreground font-medium max-w-2xl mx-auto">We handle the heavy lifting, you handle the packing.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
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
  const [pendingDestination, setPendingDestination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user && pendingAction === 'createTrip') {
        navigate('/createTrip', {
          state: pendingDestination ? { prefillDestination: pendingDestination } : undefined
        });
        setPendingAction(null);
        setPendingDestination(null);
      }
    });
    return () => unsubscribe();
  }, [pendingAction, pendingDestination, navigate]);

  const handleStartExploring = (e, targetDestination = null) => {
    if (e) e.preventDefault();
    if (!isLoggedIn) {
      setPendingAction('createTrip');
      if (targetDestination) setPendingDestination(targetDestination);
      setIsModalOpen(true);
    } else {
      navigate('/createTrip', {
        state: targetDestination ? { prefillDestination: targetDestination } : undefined
      });
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
                onClick={(e) => handleStartExploring(e)}
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

        {/* FEATURED DESTINATIONS */}
        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber">Inspiration</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-ink mt-2">Curated Escapes</h2>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Ready-to-generate trip archetypes calibrated by our AI agents for optimal flow and memorable pacing.
              </p>
            </div>
            <button
              onClick={(e) => handleStartExploring(e)}
              className="inline-flex items-center gap-2 font-bold text-amber hover:text-orange-600 transition-colors self-start md:self-auto"
            >
              Explore all destinations <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTrips.map((trip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-ink shadow-sm flex items-center gap-1">
                    <Clock className="size-3 text-amber" /> {trip.duration}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif text-xl font-bold leading-snug">{trip.destination}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {trip.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {trip.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-semibold bg-amber/10 text-orange-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Wallet className="size-3.5 text-gray-400" />
                      <span className="font-semibold text-ink">{trip.estimatedCost}</span>
                    </div>
                    <button
                      onClick={(e) => handleStartExploring(e, trip.destination)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber group-hover:text-orange-600 transition-colors"
                    >
                      Plan this trip <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <FeaturesSection />

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-28">
          <div className="bg-dawn relative overflow-hidden rounded-4xl px-8 py-16 text-center shadow-warm">
            <Sparkles className="mx-auto size-8 text-primary-foreground" />
            <h2 className="mt-4 font-serif text-4xl font-semibold text-primary-foreground md:text-5xl">
              Your next adventure is waiting.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Tell us what you're looking for, and our AI agents will craft the perfect itinerary.
            </p>
            <a
              href="/createTrip"
              onClick={(e) => handleStartExploring(e)}
              className="mt-8 inline-flex rounded-full bg-card px-9 py-4 text-lg font-bold text-foreground transition-transform hover:-translate-y-1 shadow-sm"
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
