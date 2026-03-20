import { useState, useCallback, useRef, useEffect } from 'react';

const PAGE_WIDTH_PX = 816; // 8.5in * 96dpi
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function usePreviewZoom() {
  const [zoom, setZoomRaw] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const setZoom = useCallback((value: number) => {
    setZoomRaw(clamp(value, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomRaw((z) => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomRaw((z) => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const fitToWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    // Subtract padding (24px each side = 48px total from p-6)
    const available = container.clientWidth - 48;
    const fit = available / PAGE_WIDTH_PX;
    setZoomRaw(clamp(fit, MIN_ZOOM, MAX_ZOOM));
  }, []);

  // Fit-to-width on resize only (mount starts at 100%)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(fitToWidth, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [fitToWidth]);

  const zoomPercent = Math.round(zoom * 100);
  const canZoomIn = zoom < MAX_ZOOM - 0.001;
  const canZoomOut = zoom > MIN_ZOOM + 0.001;

  return {
    zoom,
    zoomPercent,
    zoomIn,
    zoomOut,
    fitToWidth,
    setZoom,
    canZoomIn,
    canZoomOut,
    containerRef,
  };
}
