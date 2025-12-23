import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const router = useRouter();

  const primaryColor = Colors.light?.emerald800 || "#065f46";
  const secondaryColor = "#064e3b";

  const handleNavigateToSettings = () => {
    router.push("/settings");
  };

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
              onPress={handleNavigateToSettings}
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

        {/* Note Section (Marathi) */}
        <TouchableOpacity 
          style={styles.noteContainer} 
          activeOpacity={0.8}
          onPress={handleNavigateToSettings}
        >
          <MaterialCommunityIcons 
            name="information-outline" 
            size={14} 
            color="rgba(255, 255, 255, 0.9)" 
          />
          <Text style={styles.noteText}>
            कारखाने जोडण्यासाठी सेटिंग्जमध्ये जा !!
          </Text>
        </TouchableOpacity>

      </LinearGradient>
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
    paddingBottom: 40, 
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, 
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
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  noteText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2, 
  },
});