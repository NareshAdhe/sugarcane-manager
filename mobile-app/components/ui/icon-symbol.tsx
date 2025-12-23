import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/**
 * 1. Define the MAPPING first without forcing 'as IconMapping'.
 * Using 'as const' tells TypeScript these are the EXACT valid keys.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'expand-less', // Better Material Icon for 'up'
  'chevron.down': 'expand-more', // Better Material Icon for 'down'
  'car.fill': 'directions-car',
  'fuelpump.fill': 'local-gas-station',
  'person.fill': 'person',
  'wrench.and.screwdriver.fill': 'build',
  'doc.text.fill': 'description',
  'plus': 'add',
} as const; 

/**
 * 2. This type now automatically includes every key you add above.
 */
export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // ✅ Access the mapping using the dynamic name type
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}