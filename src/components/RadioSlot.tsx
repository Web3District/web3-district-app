"use client";

import { useState, useEffect } from "react";

/**
 * Renders a div only on the client to avoid SSR/hydration mismatch
 * when GlobalRadio portals content into it.
 */
export default function RadioSlot() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return null;

  return <div id="gc-radio-slot" />;
}
