"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "mobile" | "tablet" | "desktop";

// Tiers gate the 3D experience:
//   desktop (≥1024) → full R3F, bloom, dpr [1,2]
//   tablet (768–1023) → R3F, no bloom, dpr 1
//   mobile (<768) → no 3D at all (static hero + DOM content)
// Returns null until mounted so server and first client render agree (no 3D on
// the server anyway), avoiding a hydration mismatch.
export function useDeviceTier(): DeviceTier | null {
  const [tier, setTier] = useState<DeviceTier | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const compute = () => {
      if (mobile.matches) setTier("mobile");
      else if (tablet.matches) setTier("tablet");
      else setTier("desktop");
    };
    compute();
    mobile.addEventListener("change", compute);
    tablet.addEventListener("change", compute);
    return () => {
      mobile.removeEventListener("change", compute);
      tablet.removeEventListener("change", compute);
    };
  }, []);

  return tier;
}
