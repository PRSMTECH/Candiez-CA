/**
 * Ant Design Mobile Theme Configuration
 * Candiez-CA Purple/Lavender Theme
 */

// Candiez Color Palette
const colors = {
  // Primary colors
  primary: '#B57EDC', // Lavender purple
  primaryLight: '#E8D5F2', // Light lavender
  primaryDark: '#7B4A9E', // Deep purple

  // Accent colors
  teal: '#5BC0BE',
  pink: '#F5A9B8',
  yellow: '#F7DC6F',

  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutrals
  white: '#FFFFFF',
  background: '#FAFAFA',
  textPrimary: '#2D2D2D',
  textSecondary: '#6B6B6B',
};

// Ant Design Mobile Custom Theme
export const antdMobileTheme = {
  // Primary color - Candiez Lavender Purple
  '--adm-color-primary': colors.primary,
  '--adm-color-success': colors.success,
  '--adm-color-warning': colors.warning,
  '--adm-color-danger': colors.error,

  // Button styles
  '--adm-button-primary-border-color': colors.primary,
  '--adm-button-primary-background-color': colors.primary,

  // Component border radius
  '--adm-button-border-radius': '8px',
  '--adm-card-border-radius': '16px',

  // Font family
  '--adm-font-family': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export default antdMobileTheme;
