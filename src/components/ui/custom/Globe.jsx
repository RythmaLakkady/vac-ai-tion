import React, { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

/**
 * Interactive golden-hour globe.
 * - Auto-rotates continuously.
 * - Drag with a pointer to spin it manually (with inertia-like easing back to auto-spin).
 * - Warm sunset base color with glowing coral destination markers.
 */

// A spread of iconic destinations [latitude, longitude]
const MARKERS = [
  { location: [48.8566, 2.3522], size: 0.08 },   // Paris
  { location: [35.6762, 139.6503], size: 0.08 }, // Tokyo
  { location: [40.7128, -74.006], size: 0.08 },  // New York
  { location: [-33.8688, 151.2093], size: 0.07 },// Sydney
  { location: [1.3521, 103.8198], size: 0.06 },  // Singapore
  { location: [55.7558, 37.6173], size: 0.05 },  // Moscow
  { location: [-22.9068, -43.1729], size: 0.07 },// Rio
  { location: [25.2048, 55.2708], size: 0.07 },  // Dubai
  { location: [19.4326, -99.1332], size: 0.06 }, // Mexico City
  { location: [28.6139, 77.209], size: 0.07 },   // New Delhi
  { location: [-1.2921, 36.8219], size: 0.06 },  // Nairobi
  { location: [64.1466, -21.9426], size: 0.05 }, // Reykjavik
];

export default function Globe() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerMovement = useRef(0);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    let globe;
    let frame;

    const onResize = () => {
      if (containerRef.current) {
        widthRef.current = containerRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.28,
      dark: 1.1,
      diffuse: 1.35,
      mapSamples: 20000,
      mapBrightness: 2.4,
      baseColor: [0.35, 0.9, 0.82],    // bright teal landmasses
      markerColor: [1, 0.42, 0.26],    // sunset coral markers
      glowColor: [1, 0.66, 0.36],      // golden-hour atmospheric glow
      markers: MARKERS,
      onRender: (state) => {
        // Auto-rotate unless the user is actively dragging
        if (pointerInteracting.current === null && !reduced) {
          phiRef.current += 0.0035;
        }
        state.phi = phiRef.current + pointerMovement.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    // Fade the canvas in once it has painted
    frame = requestAnimationFrame(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    });

    return () => {
      globe?.destroy();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const updateMovement = (clientX) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerMovement.current = delta / 160;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full max-w-[560px] mx-auto"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerMovement.current * 160;
          canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          // Bake the manual rotation into the base phi so it doesn't snap back
          phiRef.current += pointerMovement.current;
          pointerMovement.current = 0;
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          if (pointerInteracting.current !== null) {
            phiRef.current += pointerMovement.current;
            pointerMovement.current = 0;
          }
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
          contain: 'layout paint size',
          opacity: 0,
          transition: 'opacity 1s ease',
        }}
        aria-label="Interactive 3D globe highlighting travel destinations around the world"
      />
    </div>
  );
}
