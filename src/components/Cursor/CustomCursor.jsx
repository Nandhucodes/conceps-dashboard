import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const posRef  = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef  = useRef(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden,  setIsHidden]  = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Check element under cursor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const tag = el?.tagName?.toLowerCase();
      const cur = el ? getComputedStyle(el).cursor : 'auto';
      const isPtr = cur === 'pointer' || tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea' || el?.getAttribute('role') === 'button';
      setIsPointer(isPtr);
    };

    const onLeave  = () => setIsHidden(true);
    const onEnter  = () => setIsHidden(false);
    const onDown   = () => setIsClicked(true);
    const onUp     = () => setIsClicked(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    // Laggy ring follow
    const animate = () => {
      const speed = 0.12;
      ringPos.current.x += (posRef.current.x - ringPos.current.x) * speed;
      ringPos.current.y += (posRef.current.y - ringPos.current.y) * speed;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Hide on touch devices
  if ('ontouchstart' in window) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className={`cc-dot${isPointer ? ' cc-dot--pointer' : ''}${isHidden ? ' cc-dot--hidden' : ''}${isClicked ? ' cc-dot--clicked' : ''}`}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className={`cc-ring${isPointer ? ' cc-ring--pointer' : ''}${isHidden ? ' cc-ring--hidden' : ''}${isClicked ? ' cc-ring--clicked' : ''}`}
      />
    </>
  );
}

export default CustomCursor;
