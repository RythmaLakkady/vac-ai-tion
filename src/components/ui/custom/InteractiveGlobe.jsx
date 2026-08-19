import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CITIES = [
  { name: "Paris", country: "France", blurb: "Morning croissants & river walks", location: [48.8566, 2.3522], size: 0.08 },
  { name: "Tokyo", country: "Japan", blurb: "Neon alleys and 6am fish markets", location: [35.6762, 139.6503], size: 0.08 },
  { name: "Bali", country: "Indonesia", blurb: "Rice terraces, warm rain, slow mornings", location: [-8.4095, 115.1889], size: 0.07 },
  { name: "Reykjavik", country: "Iceland", blurb: "Aurora chasing with hot springs breaks", location: [64.1466, -21.9426], size: 0.06 },
  { name: "Marrakech", country: "Morocco", blurb: "Spice souks and rooftop sunsets", location: [31.6295, -7.9811], size: 0.07 },
  { name: "Rio", country: "Brazil", blurb: "Beach days that turn into samba nights", location: [-22.9068, -43.1729], size: 0.07 },
  { name: "Cape Town", country: "South Africa", blurb: "Table Mountain to penguin beaches", location: [-33.9249, 18.4241], size: 0.07 },
  { name: "New York", country: "USA", blurb: "Bagels, galleries, skyline picnics", location: [40.7128, -74.006], size: 0.08 },
  { name: "Rome", country: "Italy", blurb: "Ancient ruins and sunset pasta", location: [41.9028, 12.4964], size: 0.08 },
  { name: "Sydney", country: "Australia", blurb: "Harbour views and surf culture", location: [-33.8688, 151.2093], size: 0.08 },
  { name: "Dubai", country: "UAE", blurb: "Desert dunes and futuristic skylines", location: [25.2048, 55.2708], size: 0.07 },
  { name: "London", country: "UK", blurb: "Historic pubs and modern art", location: [51.5074, -0.1278], size: 0.08 },
  { name: "Bangkok", country: "Thailand", blurb: "Street food and grand temples", location: [13.7563, 100.5018], size: 0.07 },
  { name: "Cusco", country: "Peru", blurb: "Gateway to ruins in the clouds", location: [-13.5226, -71.9673], size: 0.06 },
  { name: "Santorini", country: "Greece", blurb: "White cliffs and blue domes", location: [36.3932, 25.4615], size: 0.06 },
  { name: "Cairo", country: "Egypt", blurb: "Pyramids and bustling bazaars", location: [30.0444, 31.2357], size: 0.07 },
];

const toPhi = (lng) => (Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2)) % (2 * Math.PI);
const toTheta = (lat) => (lat * Math.PI) / 180;

export default function InteractiveGlobe() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pointerStart = useRef(null);
  const drag = useRef(0);
  const phi = useRef(0);
  const theta = useRef(0.28);
  const target = useRef(null);
  const width = useRef(0);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const focusCity = useCallback((city) => {
    setActive(city);
    target.current = { phi: toPhi(city.location[1]), theta: toTheta(city.location[0]) * 0.6 };
  }, []);

  useEffect(() => {
    let globe;
    let frame = 0;
    let cancelled = false;

    const onResize = () => {
      width.current = containerRef.current?.offsetWidth ?? 0;
    };
    window.addEventListener("resize", onResize);
    onResize();

    import("cobe").then(({ default: createGlobe }) => {
      if (cancelled || !canvasRef.current) return;
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width.current * 2,
        height: width.current * 2,
        phi: 0,
        theta: 0.28,
        dark: 0,
        diffuse: 1.4,
        mapSamples: 22000,
        mapBrightness: 4.2,
        baseColor: [1, 0.78, 0.52],
        markerColor: [1, 0.38, 0.22],
        glowColor: [1, 0.78, 0.52],
        markers: CITIES.map((c) => ({ location: c.location, size: c.size })),
      });

      const tick = () => {
        if (cancelled || !globe) return;
        if (target.current) {
          const dp = target.current.phi - phi.current;
          const dt = target.current.theta - theta.current;
          phi.current += dp * 0.07;
          theta.current += dt * 0.07;
          if (Math.abs(dp) < 0.002 && Math.abs(dt) < 0.002) target.current = null;
        } else if (pointerStart.current === null) {
          phi.current += 0.0032;
        }
        globe.update({
          phi: phi.current + drag.current,
          theta: theta.current,
          width: width.current * 2,
          height: width.current * 2,
        });
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      globe?.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const endDrag = (e) => {
    if (pointerStart.current === null) return;
    const wasClick = Math.abs(drag.current) < 0.01;

    phi.current += drag.current;
    drag.current = 0;
    pointerStart.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";

    if (wasClick && e.clientX) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const nx = (x / rect.width) * 2 - 1;
      const ny = -((y / rect.height) * 2 - 1);

      let closest = null;
      let minDist = 0.2;

      CITIES.forEach(city => {
        const [lat, lng] = city.location;
        const latR = lat * Math.PI / 180;
        const lngR = lng * Math.PI / 180;

        const cx = Math.cos(latR) * Math.sin(lngR + phi.current - 1.5 * Math.PI);
        const cz = Math.cos(latR) * Math.cos(lngR + phi.current - 1.5 * Math.PI);
        const cy = Math.sin(latR);

        const sy = cy * Math.cos(theta.current) - cz * Math.sin(theta.current);
        const sz = cy * Math.sin(theta.current) + cz * Math.cos(theta.current);

        if (sz > 0) {
          const dist = Math.sqrt((cx - nx)**2 + (sy - ny)**2);
          if (dist < minDist) {
            minDist = dist;
            closest = city;
          }
        }
      });

      if (closest) {
        focusCity(closest);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[520px]">
        <div className="pointer-events-none absolute inset-6 rounded-full bg-dawn opacity-25 blur-3xl" />
        <canvas
          ref={canvasRef}
          aria-label="Interactive globe of featured destinations"
          className="relative h-full w-full cursor-grab opacity-0 transition-opacity duration-1000 [touch-action:pan-y] [contain:layout_paint_size]"
          onPointerDown={(e) => {
            pointerStart.current = e.clientX - drag.current * 180;
            target.current = null;
            e.currentTarget.style.cursor = "grabbing";
          }}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerMove={(e) => {
            if (pointerStart.current !== null) drag.current = (e.clientX - pointerStart.current) / 180;
          }}
        />
        {active && (
          <div className="glass-card absolute bottom-2 left-1/2 w-[min(320px,90%)] -translate-x-1/2 rounded-2xl px-5 py-3 text-left">
            <p className="font-serif text-lg font-semibold">
              {active.name}
              <span className="text-muted-foreground text-sm font-sans font-normal"> · {active.country}</span>
            </p>
            <p className="text-muted-foreground text-sm">{active.blurb}</p>
            <button 
              onClick={() => navigate('/createTrip', { state: { destination: active.name } })}
              className="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform"
            >
              Plan this trip
            </button>
          </div>
        )}
      </div>

      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => focusCity(city)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
              active?.name === city.name
                ? "bg-sunset border-transparent text-primary-foreground shadow-warm"
                : "border-border bg-card/70 text-foreground hover:border-primary/50"
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">Drag the globe · tap a city to fly there</p>
    </div>
  );
}
