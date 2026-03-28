export const darkColors = {
  ink: "#0B0F14",
  glass: "rgba(255, 255, 255, 0.06)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
  mint: "#44E0C9",
  lilac: "#B794F6",
  peach: "#FFC6A8",
  text: "#E8EEF2",
  textMuted: "#A7B1B8",
  
  gradient: {
    start: "#44E0C9",
    end: "#B794F6",
  },
  
  shadow: "rgba(0, 0, 0, 0.18)",
} as const;

export const lightColors = {
  ink: "#F5F7FA",
  glass: "rgba(0, 0, 0, 0.04)",
  glassBorder: "rgba(0, 0, 0, 0.08)",
  mint: "#2DB89E",
  lilac: "#9370DB",
  peach: "#FF9966",
  text: "#1A1F25",
  textMuted: "#5A6570",
  
  gradient: {
    start: "#2DB89E",
    end: "#9370DB",
  },
  
  shadow: "rgba(0, 0, 0, 0.08)",
} as const;

export const colors = darkColors;

export const typography = {
  headline: {
    fontWeight: "600" as const,
  },
  body: {
    fontWeight: "400" as const,
  },
  caption: {
    fontWeight: "500" as const,
    letterSpacing: 0.01,
  },
} as const;

export const spacing = {
  borderRadius: {
    card: 24,
    button: 16,
    chip: 999,
  },
  shadow: {
    y: 24,
    blur: 60,
  },
} as const;

export const animation = {
  duration: 250,
  easing: [0.2, 0.8, 0.2, 1] as const,
} as const;

export type Theme = 'dark' | 'light';

export function getThemeColors(theme: Theme) {
  return theme === 'dark' ? darkColors : lightColors;
}
