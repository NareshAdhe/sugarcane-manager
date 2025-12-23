/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2f9e44'; // Emerald Green for Sugarcane theme
const tintColorDark = '#40c057';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f8f9fa', // Light gray background for better contrast
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    border: '#e9ecef',
    success: '#2f9e44', // Green
    warning: '#fcc419', // Yellow
    danger: '#e03131',  // Red
    primary: '#1864ab', // Blue for transport
    secondary: '#e67700', // Orange for harvesting
    subtext: '#868e96',
    emerald800: '#2b8a3e',
    emerald100: '#ebfbee',
  },
  dark: {
    text: '#ECEDEE',
    background: '#101113',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#25262b',
    border: '#2C2E33',
    success: '#40c057',
    warning: '#ffd43b',
    danger: '#fa5252',
    primary: '#339af0',
    secondary: '#ff922b',
    subtext: '#909296',
    emerald800: '#2b8a3e',
    emerald100: '#ebfbee',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
