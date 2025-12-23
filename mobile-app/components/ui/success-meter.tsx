import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Strings } from '@/constants/Strings';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SuccessMeterProps {
  title: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export function SuccessMeter({ title, current, target, color, unit = Strings.currency }: SuccessMeterProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const progress = target > 0 ? Math.min(Math.max(current / target, 0), 1) : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 12, color: theme.subtext }}>{title}</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 12 }}>{percentage}%</ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.footer}>
        <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
          {unit}{current.toLocaleString()} / {unit}{target.toLocaleString()}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    alignItems: 'flex-end',
  },
});
