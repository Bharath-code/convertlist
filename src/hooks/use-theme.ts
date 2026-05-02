"use client";

import * as React from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: "light",
      setTheme,
      resolvedTheme: "light",
    };
  }

  return {
    theme: theme === "system" ? resolvedTheme : theme,
    setTheme,
    resolvedTheme: resolvedTheme || theme,
  };
}
