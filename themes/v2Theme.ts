import type { ThemeDefinition } from "vuetify";

export const v2Theme: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#1a1a2e",
    border: "#3a3a5c",
    surface: "#16213e",
    primary: "#F596AA",
    secondary: "#7a7a9e",
    error: "#FF5252",
    info: "#64B5F6",
    success: "#81C784",
    warning: "#FFB74D",
    tagColor: "#CE93D8",
    // Button colors
    "button-submit-bg": "#2d5a3d",
    "button-submit-text": "#81C784",
    "button-management": "#ff6b6b",
    "button-management-hover": "#ff6b6b",
    "button-status-start": "#ef4765",
    "button-status-end": "#ff9a5a",
    "button-disabled": "#555555",
    // Status button colors
    "status-n-start": "#ff5252",
    "status-n-end": "#ff7979",
    "status-p-start": "#64B5F6",
    "status-p-end": "#90CAF9",
    "status-s-start": "#BA68C8",
    "status-s-end": "#CE93D8",
    "status-c-start": "#66BB6A",
    "status-c-end": "#81C784",
    "status-e-start": "#4DD0E1",
    "status-e-end": "#80DEEA",
    "status-d-start": "#424242",
    "status-d-end": "#616161",
    "status-d-hover-start": "#E57373",
    "status-d-hover-end": "#EF5350",
    // Inactive button colors
    "button-inactive-start": "#424242",
    "button-inactive-end": "#616161",
    "button-inactive-text": "#B0B0B0",
    "button-inactive-hover-start": "#616161",
    "button-inactive-hover-end": "#757575",
    "button-inactive-hover-text": "#E0E0E0",
    // Active button colors
    "button-active-n-start": "#E57373",
    "button-active-n-end": "#EF5350",
    "button-active-p-start": "#64B5F6",
    "button-active-p-end": "#90CAF9",
    "button-active-s-start": "#BA68C8",
    "button-active-s-end": "#CE93D8",
    "button-active-c-start": "#66BB6A",
    "button-active-c-end": "#81C784",
    "button-active-e-start": "#4DD0E1",
    "button-active-e-end": "#80DEEA",
    // Text colors
    "text-primary": "#E8E8F0",
    "text-secondary": "#C8C8D8",
    "text-tertiary": "#A0A0B0",
    "text-olive": "#C5D86D",
    "text-orange": "#FFB74D",
    "text-red": "#EF5350",
    "text-blue": "#64B5F6",
    // Loader colors
    "loader-color": "#4DD0E1",
    // Progress colors
    "progress-color": "#FFB74D",
    // Code block colors
    "code-bg": "#1E1E1E",
  },
  variables: {
    "banner-image": 'url("/background.png")',
    // Card background color
    "card-color-1": "#2D2D2D", // Dark card
    // Button shadow colors
    "button-submit-shadow": "rgba(129, 199, 132, 0.3)",
    "button-status-shadow": "rgba(239, 71, 101, 0.6)",
    "button-simple-shadow": "rgba(245, 150, 170, 0.5)",
    // Text RGB values for rgb() function usage
    "text-orange-rgb": "255, 183, 77",
    "text-red-rgb": "239, 83, 80",
    // Overlay and background colors
    "banner-overlay": "rgba(18, 18, 18, 0.7)",
    // Shadow colors (unified shadow system)
    "shadow-light": "rgba(0, 0, 0, 0.3)",
    "shadow-medium": "rgba(0, 0, 0, 0.5)",
    "shadow-dark": "rgba(0, 0, 0, 0.7)",
  },
};
