import { createContext, createElement, useContext, type ReactNode } from "react";

export interface QuranTheme {
  mode: "light";
  density: "dense";
  tint: "default";
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    info: string;
    infoForeground: string;
    border: string;
    input: string;
    ring: string;
    surface: string;
    surfaceRaised: string;
    surfaceMuted: string;
    tint: string;
    tintForeground: string;
    focusRing: string;
    focusHalo: string;
  };
  status: {
    success: QuranStatusTone;
    warning: QuranStatusTone;
    danger: QuranStatusTone;
    info: QuranStatusTone;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
  };
  sizes: {
    controlHeight: {
      sm: number;
      md: number;
      lg: number;
    };
    rowHeight: number;
    paddingX: {
      sm: number;
      md: number;
      lg: number;
    };
  };
  typography: {
    mono: string;
    weights: {
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    sizes: {
      caption: number;
      body: number;
      label: number;
      subtitle: number;
      title: number;
      display: number;
    };
  };
}

interface QuranStatusTone {
  background: string;
  border: string;
  color: string;
  foreground: string;
}

export const quranTheme: QuranTheme = {
  mode: "light",
  density: "dense",
  tint: "default",
  colors: {
    background: "#FFFFFF",
    foreground: "#0A0A0A",
    card: "#F7F7F7",
    cardForeground: "#0A0A0A",
    popover: "#FAFAFA",
    popoverForeground: "#0A0A0A",
    primary: "#2563EB",
    primaryForeground: "#ffffff",
    secondary: "#F7F7F7",
    secondaryForeground: "#0A0A0A",
    muted: "#F0F0F0",
    mutedForeground: "#6B7280",
    accent: "rgba(37, 99, 235, 0.12)",
    accentForeground: "#0A0A0A",
    destructive: "#DC2626",
    destructiveForeground: "#ffffff",
    success: "#16A34A",
    successForeground: "#ffffff",
    warning: "#D97706",
    warningForeground: "#ffffff",
    info: "#0EA5E9",
    infoForeground: "#ffffff",
    border: "#E5E5E5",
    input: "#E5E5E5",
    ring: "#2563EB",
    surface: "#FAFAFA",
    surfaceRaised: "#FAFAFA",
    surfaceMuted: "#F0F0F0",
    tint: "#2563EB",
    tintForeground: "#ffffff",
    focusRing: "#2563EB",
    focusHalo: "rgba(37, 99, 235, 0.22)",
  },
  status: {
    success: {
      background: "#ecfdf5",
      border: "#a7f3d0",
      color: "#16A34A",
      foreground: "#ffffff",
    },
    warning: {
      background: "#fffbeb",
      border: "#fcd34d",
      color: "#D97706",
      foreground: "#ffffff",
    },
    danger: {
      background: "#fef2f2",
      border: "#fecaca",
      color: "#DC2626",
      foreground: "#ffffff",
    },
    info: {
      background: "#eff6ff",
      border: "#bfdbfe",
      color: "#0EA5E9",
      foreground: "#ffffff",
    },
  },
  radii: {
    sm: 6,
    md: 6,
    lg: 10,
    xl: 12,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
  sizes: {
    controlHeight: {
      sm: 24,
      md: 30,
      lg: 36,
    },
    rowHeight: 32,
    paddingX: {
      sm: 8,
      md: 10,
      lg: 14,
    },
  },
  typography: {
    mono: "Menlo",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      caption: 12,
      body: 15,
      label: 14,
      subtitle: 13,
      title: 24,
      display: 48,
    },
  },
};

export const quranColors = {
  ...quranTheme.colors,
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#f7f7f7",
  cardForeground: "#0a0a0a",
  surface: "#fafafa",
  surfaceMuted: "#f0f0f0",
  mutedForeground: "#4b4b4b",
  border: "#e5e5e5",
  primary: "#2563eb",
  primaryForeground: "#ffffff",
  accent: "#eff6ff",
  accentForeground: "#1e40af",
  ring: "#2563eb",
} as const;

export const quranTint = "#2563eb";

const QuranThemeContext = createContext<QuranTheme>(quranTheme);

export function QuranThemeProvider({ children }: { children: ReactNode }) {
  return createElement(QuranThemeContext.Provider, { value: quranTheme }, children);
}

export function useQuranTheme() {
  return useContext(QuranThemeContext);
}
