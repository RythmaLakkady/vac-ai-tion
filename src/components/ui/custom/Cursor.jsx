import React, { useEffect, useState } from 'react';

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailingPosition, setTrailingPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, input, select, [role="button"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Physics-based trailing effect
  useEffect(() => {
    let animationFrameId;
    const updateTrailing = () => {
      setTrailingPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
      animationFrameId = requestAnimationFrame(updateTrailing);
    };
    updateTrailing();
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-4 h-4 bg-holiday-teal rounded-full pointer-events-none z-[9999] mix-blend-multiply transition-transform duration-100 ease-out hidden md:block"
        style={{
          transform: `translate3d(${position.x - 8}px, ${position.y - 8}px, 0) scale(${isHovering ? 0 : 1})`,
        }}
      />
      <div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-holiday-teal rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out hidden md:block"
        style={{
          transform: `translate3d(${trailingPosition.x - 24}px, ${trailingPosition.y - 24}px, 0) scale(${isHovering ? 1.5 : 1})`,
          backgroundColor: isHovering ? 'rgba(109, 186, 175, 0.1)' : 'transparent',
        }}
      />
    </>
  );
}
