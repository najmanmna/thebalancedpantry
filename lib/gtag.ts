// lib/gtag.ts
export const GA_TRACKING_ID = "G-QLGJ5THRC9";

// Declare gtag as a global window property
declare global {
  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      params?: Record<string, any>
    ) => void;
  }
}

// Universal function to send events
export const sendGAEvent = (eventName: string, params: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};