'use client';

import { useEffect, useRef, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    let lastTrailTime = 0;
    const trailInterval = 50; // ms between trail particles

    const updateCursor = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setPosition(newPosition);

      // Create trail particles
      const now = Date.now();
      if (now - lastTrailTime > trailInterval) {
        const newTrail = {
          id: trailIdRef.current++,
          x: e.clientX,
          y: e.clientY,
        };
        setTrails((prev) => [...prev.slice(-8), newTrail]);
        lastTrailTime = now;
      }

      // Update cursor position with smooth animation
      if (cursorRef.current && cursorDotRef.current) {
        animationFrameId = requestAnimationFrame(() => {
          if (cursorRef.current && cursorDotRef.current) {
            cursorRef.current.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
            cursorDotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
          }
        });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer');

      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Clean up old trails
  useEffect(() => {
    if (trails.length > 0) {
      const timer = setTimeout(() => {
        setTrails((prev) => prev.slice(1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [trails]);

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'cursor-hover' : ''} ${
          isClicking ? 'cursor-click' : ''
        }`}
        style={{
          left: 0,
          top: 0,
        }}
      />

      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className="custom-cursor-dot"
        style={{
          left: 0,
          top: 0,
        }}
      />

      {/* Trail particles */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="custom-cursor-trail"
          style={{
            left: trail.x - 2,
            top: trail.y - 2,
          }}
        />
      ))}
    </>
  );
}

// Made with Bob
