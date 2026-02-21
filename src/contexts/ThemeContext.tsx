"use client";
import { createContext, useState, useContext, ReactNode } from "react";

// 1️⃣ Define allowed logo display modes
type LogoDisplayMode = "grid" | "carousel";

// 2️⃣ Define the shape of the context
interface ThemeContextType {
  logoDisplayMode: LogoDisplayMode;
  isDarkMode: boolean;
  toggleLogoDisplay: () => void;
  toggleDarkMode: () => void;
}

// 3️⃣ Create typed context (nullable for safety)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 4️⃣ Custom hook
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// 5️⃣ Type the provider props
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [logoDisplayMode, setLogoDisplayMode] =
    useState<LogoDisplayMode>("grid");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleLogoDisplay = () => {
    setLogoDisplayMode((prev) =>
      prev === "grid" ? "carousel" : "grid"
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value: ThemeContextType = {
    logoDisplayMode,
    isDarkMode,
    toggleLogoDisplay,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}