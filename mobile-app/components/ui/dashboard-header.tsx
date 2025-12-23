import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTractors } from "@/context/TractorContext";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const router = useRouter();
  const { userSettings } = useTractors();

  const primaryColor = Colors.light?.emerald800 || "#065f46";
  const secondaryColor = "#064e3b";

  const RateInfoBox = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | number;
  }) => (
    <View style={styles.rateBox}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={16} color={primaryColor} />
      </View>
      <View style={styles.rateTextContainer}>
        <Text style={styles.rateLabel}>{label}</Text>
        <Text style={styles.rateValue}>₹{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            <ThemedText style={styles.title}>{title}</ThemedText>
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/settings")}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logoImage}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* FLOATING RATES CARD */}
      <View style={styles.ratesCard}>
        {/* Wrap rates in a row-direction view */}
        <View style={styles.ratesRow}>
          <RateInfoBox
            icon="gas-station"
            label="डिझेल"
            value={userSettings?.defaultDieselRate || 0}
          />
          <View style={styles.verticalDivider} />
          <RateInfoBox
            icon="truck-delivery"
            label="वाहतूक"
            value={userSettings?.defaultVahatukRateShort || 0}
          />
          <View style={styles.verticalDivider} />
          <RateInfoBox
            icon="tools"
            label="तोडणी"
            value={userSettings?.defaultTodniRate || 0}
          />
        </View>

        {/* ✅ PLACE THE NOTE HERE (Under the rates row) */}
        <View style={styles.settingsNote}>
          <Text style={styles.noteText}>
            * दर (Rates) बदलण्यासाठी सेटिंग्ज वापरा !!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "transparent",
  },
  headerGradient: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: { flex: 1 },
  title: {
    paddingVertical: 4,
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoWrapper: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  rateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },
  rateTextContainer: {
    justifyContent: "center",
  },
  rateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
  },
  verticalDivider: {
    width: 1,
    height: 25,
    backgroundColor: "#e2e8f0",
  },
  ratesCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    marginTop: -40,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  ratesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  settingsNote: {
    marginTop: 10,
    paddingTop: 8,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  noteText: {
    fontSize: 9,
    color: "#dc2626",
    fontWeight: "700",
  },
});
