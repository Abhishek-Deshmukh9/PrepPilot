import React, { createContext, useContext, useEffect } from "react";

/**
 * ThemeContext — PrepPilot is permanently dark (cockpit theme).
 * darkMode is always true. toggleTheme is a no-op stub so existing
 * call-sites don't crash.
 */
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Ensure the dark class is always present
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode: true, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
