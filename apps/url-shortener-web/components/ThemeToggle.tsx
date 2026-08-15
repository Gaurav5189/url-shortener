"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const currentTheme: "light" | "dark" =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    window.localStorage.setItem("theme", newTheme);
  };

  if (!theme) {
    return <div className="theme-toggle" aria-hidden="true"></div>;
  }

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle" 
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
