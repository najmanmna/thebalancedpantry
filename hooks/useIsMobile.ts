"use client";
import { useState, useEffect } from "react";

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check screen width
    const checkScreen = () => setIsMobile(window.innerWidth < breakpoint);

    checkScreen(); // run on mount
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, [breakpoint]);

  return isMobile;
}
