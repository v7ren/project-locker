"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "pm-floating-ui-hidden";

type ViewerChromeContextValue = {
  floatingUiHidden: boolean;
  setFloatingUiHidden: (hidden: boolean) => void;
  toggleFloatingUiHidden: () => void;
};

const ViewerChromeContext = createContext<ViewerChromeContextValue | null>(null);

export function useViewerChromeOptional(): ViewerChromeContextValue | null {
  return useContext(ViewerChromeContext);
}

export function ViewerChromeProvider({ children }: { children: ReactNode }) {
  const [floatingUiHidden, setFloatingUiHiddenState] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setFloatingUiHiddenState(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const setFloatingUiHidden = useCallback((hidden: boolean) => {
    setFloatingUiHiddenState(hidden);
    try {
      if (hidden) {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const toggleFloatingUiHidden = useCallback(() => {
    setFloatingUiHiddenState((prev) => {
      const next = !prev;
      try {
        if (next) {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // sessionStorage unavailable
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-pm-floating-ui", floatingUiHidden ? "hidden" : "visible");
    return () => {
      document.documentElement.removeAttribute("data-pm-floating-ui");
    };
  }, [floatingUiHidden]);

  const value = useMemo(
    () => ({
      floatingUiHidden,
      setFloatingUiHidden,
      toggleFloatingUiHidden,
    }),
    [floatingUiHidden, setFloatingUiHidden, toggleFloatingUiHidden],
  );

  return <ViewerChromeContext.Provider value={value}>{children}</ViewerChromeContext.Provider>;
}
