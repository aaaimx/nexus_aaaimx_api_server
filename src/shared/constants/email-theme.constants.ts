/**
 * Email Theme Constants
 * Centralized color and styling configuration for email templates
 */
export const EMAIL_THEME = {
  // Brand Colors - Base palette
  primary: "#A437A6", // Purple
  primaryDark: "#691F73", // Dark Purple
  primaryLight: "#C55AC8", // Light Purple
  primaryLighter: "#E6B3E8", // Very Light Purple

  // Secondary Colors
  secondary: "#0D518C", // Blue
  secondaryDark: "#0A3F6F", // Dark Blue
  secondaryLight: "#2A6BA3", // Light Blue
  secondaryLighter: "#B3D1E8", // Very Light Blue

  // Accent Colors
  accent: "#2CB1BF", // Cyan
  accentDark: "#238A96", // Dark Cyan
  accentLight: "#4FC4D1", // Light Cyan
  accentLighter: "#B3E8ED", // Very Light Cyan

  // Dark Theme Colors (like the reference)
  dark: "#151719", // Dark background
  darkLight: "#1F2937", // Light dark
  darkLighter: "#374151", // Very light dark

  // Light text colors for dark backgrounds
  light: "#F4F5F7", // Light text on dark
  lightMuted: "#A8B3B8", // Muted light text

  // Status Colors (derived from base palette)
  success: "#2CB1BF", // Using accent cyan for success
  successLight: "#B3E8ED",
  successDark: "#238A96",

  warning: "#A437A6", // Using primary purple for warning
  warningLight: "#E6B3E8",
  warningDark: "#691F73",

  danger: "#DC3545", // Keep red for danger (accessibility)
  dangerLight: "#F8D7DA",
  dangerDark: "#C82333",

  info: "#0D518C", // Using secondary blue for info
  infoLight: "#B3D1E8",
  infoDark: "#0A3F6F",

  // Neutral Colors (derived from dark theme)
  text: "#0C1226", // Dark navy for text
  textLight: "#4A5568", // Lighter navy
  textMuted: "#718096", // Muted navy

  background: "#FFFFFF", // Pure white
  backgroundLight: "#F7FAFC", // Very light gray
  backgroundMuted: "#EDF2F7", // Light gray

  border: "#E2E8F0", // Light border
  borderLight: "#F1F5F9", // Very light border

  // Spacing
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    xxl: "32px",
  },

  // Typography
  typography: {
    fontFamily: "Arial, sans-serif",
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      xxl: "24px",
      xxxl: "32px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Border Radius
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },

  // Shadows
  shadow: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
} as const;

/**
 * Email Template Styles
 * Pre-defined style combinations for common email elements
 */
export const EMAIL_STYLES = {
  // Container
  container: {
    fontFamily: EMAIL_THEME.typography.fontFamily,
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: EMAIL_THEME.dark,
    borderRadius: EMAIL_THEME.borderRadius.lg,
    overflow: "hidden",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },

  // Header Section
  header: {
    backgroundColor: EMAIL_THEME.dark,
    padding: "20px 20px 8px 20px",
    textAlign: "center" as const,
  },

  // Content Section
  content: {
    backgroundColor: EMAIL_THEME.background,
    padding: "20px 20px 24px 20px",
    borderRadius: "0 0 12px 12px",
  },

  // Headers
  h1: {
    color: EMAIL_THEME.primary,
    fontSize: "32px",
    fontWeight: EMAIL_THEME.typography.fontWeight.bold,
    margin: "0 0 12px 0",
    textAlign: "center" as const,
  },

  h2: {
    color: EMAIL_THEME.text,
    fontSize: "20px",
    fontWeight: EMAIL_THEME.typography.fontWeight.bold,
    margin: "0 0 16px 0",
    textAlign: "center" as const,
  },

  h2Success: {
    color: EMAIL_THEME.success,
    fontSize: EMAIL_THEME.typography.fontSize.xxl,
    fontWeight: EMAIL_THEME.typography.fontWeight.semibold,
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },

  h2Primary: {
    color: EMAIL_THEME.primary,
    fontSize: EMAIL_THEME.typography.fontSize.xxl,
    fontWeight: EMAIL_THEME.typography.fontWeight.semibold,
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },

  h2Secondary: {
    color: EMAIL_THEME.secondary,
    fontSize: EMAIL_THEME.typography.fontSize.xxl,
    fontWeight: EMAIL_THEME.typography.fontWeight.semibold,
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },

  h2Accent: {
    color: EMAIL_THEME.accent,
    fontSize: EMAIL_THEME.typography.fontSize.xxl,
    fontWeight: EMAIL_THEME.typography.fontWeight.semibold,
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },

  h3: {
    color: EMAIL_THEME.text,
    fontSize: EMAIL_THEME.typography.fontSize.lg,
    fontWeight: EMAIL_THEME.typography.fontWeight.medium,
    margin: "0 0 12px 0",
  },

  // Paragraphs
  p: {
    color: EMAIL_THEME.text,
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 16px 0",
  },

  pLight: {
    color: EMAIL_THEME.textLight,
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 16px 0",
  },

  pIntro: {
    color: EMAIL_THEME.textLight,
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 20px 0",
    textAlign: "center" as const,
  },

  // Code Display
  codeContainer: {
    backgroundColor: EMAIL_THEME.dark,
    padding: "20px",
    textAlign: "center" as const,
    margin: "20px auto",
    borderRadius: "8px",
    border: `2px solid ${EMAIL_THEME.primary}`,
    display: "inline-block",
    minWidth: "120px",
  },

  code: {
    color: EMAIL_THEME.primary,
    fontSize: "24px",
    fontWeight: EMAIL_THEME.typography.fontWeight.bold,
    letterSpacing: "4px",
    margin: "0",
    fontFamily: "monospace",
  },

  // Info Box
  infoBox: {
    backgroundColor: EMAIL_THEME.accentLighter,
    padding: `${EMAIL_THEME.spacing.xl} ${EMAIL_THEME.spacing.lg}`,
    borderRadius: EMAIL_THEME.borderRadius.lg,
    margin: `${EMAIL_THEME.spacing.xl} 0`,
    border: `1px solid ${EMAIL_THEME.accentLight}`,
  },

  // Footer
  footer: {
    backgroundColor: EMAIL_THEME.backgroundLight,
    padding: "20px",
    textAlign: "center" as const,
    borderTop: `1px solid ${EMAIL_THEME.borderLight}`,
  },

  // Footer Brand
  footerBrand: {
    color: EMAIL_THEME.primary,
    fontWeight: EMAIL_THEME.typography.fontWeight.semibold,
    fontSize: "16px",
    letterSpacing: "0.5px",
    textAlign: "center" as const,
    margin: "0 auto 8px auto",
    display: "block",
  },

  // Footer Description
  footerDescription: {
    color: EMAIL_THEME.textMuted,
    fontSize: "12px",
    textAlign: "center" as const,
    margin: "0 auto",
    lineHeight: "1.4",
    display: "block",
  },

  // Dividers
  divider: {
    height: "1px",
    backgroundColor: EMAIL_THEME.border,
    margin: "0",
    border: "none",
    width: "100%",
  },

  dividerPrimary: {
    height: "2px",
    backgroundColor: EMAIL_THEME.primary,
    margin: "0",
    border: "none",
  },

  // Buttons (for future use)
  button: {
    display: "inline-block",
    padding: `${EMAIL_THEME.spacing.md} ${EMAIL_THEME.spacing.xl}`,
    backgroundColor: EMAIL_THEME.primary,
    color: EMAIL_THEME.background,
    textDecoration: "none",
    borderRadius: EMAIL_THEME.borderRadius.md,
    fontWeight: EMAIL_THEME.typography.fontWeight.medium,
    fontSize: EMAIL_THEME.typography.fontSize.base,
  },

  buttonPrimary: {
    display: "inline-block",
    padding: `${EMAIL_THEME.spacing.md} ${EMAIL_THEME.spacing.xl}`,
    backgroundColor: EMAIL_THEME.primary,
    color: EMAIL_THEME.background,
    textDecoration: "none",
    borderRadius: EMAIL_THEME.borderRadius.md,
    fontWeight: EMAIL_THEME.typography.fontWeight.medium,
    fontSize: EMAIL_THEME.typography.fontSize.base,
  },

  buttonSecondary: {
    display: "inline-block",
    padding: `${EMAIL_THEME.spacing.md} ${EMAIL_THEME.spacing.xl}`,
    backgroundColor: EMAIL_THEME.secondary,
    color: EMAIL_THEME.background,
    textDecoration: "none",
    borderRadius: EMAIL_THEME.borderRadius.md,
    fontWeight: EMAIL_THEME.typography.fontWeight.medium,
    fontSize: EMAIL_THEME.typography.fontSize.base,
  },

  buttonAccent: {
    display: "inline-block",
    padding: `${EMAIL_THEME.spacing.md} ${EMAIL_THEME.spacing.xl}`,
    backgroundColor: EMAIL_THEME.accent,
    color: EMAIL_THEME.background,
    textDecoration: "none",
    borderRadius: EMAIL_THEME.borderRadius.md,
    fontWeight: EMAIL_THEME.typography.fontWeight.medium,
    fontSize: EMAIL_THEME.typography.fontSize.base,
  },

  buttonHover: {
    backgroundColor: EMAIL_THEME.primaryDark,
  },
} as const;

/**
 * Helper function to generate inline styles from style objects
 */
export function generateInlineStyles(styles: Record<string, any>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/**
 * Helper function to generate CSS classes (for future use with external CSS)
 */
export function generateCSSClasses(styles: Record<string, any>): string {
  return Object.entries(styles)
    .map(([key, value]) => `.${key} { ${key}: ${value}; }`)
    .join("\n");
}
