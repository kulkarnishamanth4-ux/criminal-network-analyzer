import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to make floating elements freely draggable across the viewport.
 * If not dragged yet, allows elements to position naturally using standard CSS classes (e.g. bottom-6 right-6).
 * Once dragged, records coordinates and persists in localStorage.
 * 
 * @param {string} storageKey - LocalStorage key to persist position
 */
export function useDraggable(storageKey) {
  const [hasCustomPos, setHasCustomPos] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
            return true;
          }
        }
      } catch (e) {}
    }
    return false;
  });

  const [pos, setPos] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
            const maxX = Math.max(10, window.innerWidth - 60);
            const maxY = Math.max(10, window.innerHeight - 60);
            return {
              x: Math.max(10, Math.min(maxX, parsed.x)),
              y: Math.max(10, Math.min(maxY, parsed.y)),
            };
          }
        }
      } catch (e) {}
    }
    return { x: 0, y: 0 };
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0, moved: false });
  const nodeRef = useRef(null);

  // Re-clamp position on window resize if in custom position
  useEffect(() => {
    const handleResize = () => {
      if (!hasCustomPos) return;
      setPos(prev => {
        if (!nodeRef.current) return prev;
        const rect = nodeRef.current.getBoundingClientRect();
        const maxX = Math.max(10, window.innerWidth - (rect.width || 60) - 10);
        const maxY = Math.max(10, window.innerHeight - (rect.height || 60) - 10);
        const clampedX = Math.max(10, Math.min(maxX, prev.x));
        const clampedY = Math.max(10, Math.min(maxY, prev.y));
        if (clampedX !== prev.x || clampedY !== prev.y) {
          return { x: clampedX, y: clampedY };
        }
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasCustomPos]);

  const handlePointerDown = useCallback((e) => {
    // Only primary mouse button / single touch
    if (e.button !== undefined && e.button !== 0) return;

    // Do not trigger drag on interactive elements inside
    const targetTag = e.target.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || targetTag === 'option') {
      return;
    }

    isDraggingRef.current = true;
    
    // Get actual current element position on screen
    const rect = nodeRef.current?.getBoundingClientRect() || { left: pos.x, top: pos.y, width: 60, height: 60 };
    const currentElemX = hasCustomPos ? pos.x : rect.left;
    const currentElemY = hasCustomPos ? pos.y : rect.top;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: currentElemX,
      elemY: currentElemY,
      moved: false,
    };

    const handlePointerMove = (moveEvt) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvt.clientX - dragStartRef.current.mouseX;
      const dy = moveEvt.clientY - dragStartRef.current.mouseY;

      if (!dragStartRef.current.moved && Math.hypot(dx, dy) >= 5) {
        dragStartRef.current.moved = true;
        setHasCustomPos(true);
      }

      if (dragStartRef.current.moved) {
        moveEvt.preventDefault();
        const currentRect = nodeRef.current?.getBoundingClientRect() || { width: 60, height: 60 };
        const maxX = Math.max(10, window.innerWidth - (currentRect.width || 60) - 10);
        const maxY = Math.max(10, window.innerHeight - (currentRect.height || 60) - 10);
        const newX = Math.max(10, Math.min(maxX, dragStartRef.current.elemX + dx));
        const newY = Math.max(10, Math.min(maxY, dragStartRef.current.elemY + dy));

        setPos({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (dragStartRef.current.moved && storageKey) {
          try {
            setPos(currentPos => {
              localStorage.setItem(storageKey, JSON.stringify(currentPos));
              return currentPos;
            });
          } catch (e) {}
        }
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }, [hasCustomPos, pos, storageKey]);

  const wasDragged = useCallback(() => {
    return dragStartRef.current.moved;
  }, []);

  const resetPos = useCallback(() => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }
    setHasCustomPos(false);
    setPos({ x: 0, y: 0 });
  }, [storageKey]);

  return {
    hasCustomPos,
    pos,
    setPos,
    nodeRef,
    handlePointerDown,
    wasDragged,
    resetPos,
    dragStyle: hasCustomPos ? { left: `${pos.x}px`, top: `${pos.y}px` } : undefined,
  };
}
