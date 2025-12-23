import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTractors } from "@/context/TractorContext";
import { Colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";

// Reusable Menu Item Component
const SettingsMenuItem = ({ icon, label, subLabel, onPress, color = "#475569", iconBg = "#F1F5F9" }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuLabel}>{label}</Text>
      {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const {
    setIsLoggedIn,
    userProfile, 
    loading: contextLoading,
  } = useTractors();

  const primaryColor = Colors.light?.emerald800 || "#064e3b";

  const handleLogout = () => {
    Alert.alert("लॉगआउट", "तुम्ही खात्रीने बाहेर पडू इच्छिता?", [
      { text: "रद्द करा", style: "cancel" },
      {
        text: "लॉगआउट",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("userToken");
          setIsLoggedIn(false);
          router.replace("/login");
        },
      },
    ]);
  };

  if (contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <Stack.Screen
        options={{
          headerShown: true,
          title: "सेटिंग्ज (Settings)",
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* PROFILE CARD */}
        <LinearGradient colors={[primaryColor, "#065f46"]} style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={36} color={primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>
                {userProfile?.name || "वापरकर्ता"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userProfile?.email || "ईमेल लोड होत आहे..."}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* FACTORY CONFIGURATION */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="factory" size={18} color={primaryColor} />
          <Text style={styles.sectionTitle}>कारखाना व्यवस्थापन</Text>
        </View>

        <View style={styles.card}>
          <SettingsMenuItem 
            icon="factory" 
            label="माझे कारखाने" 
            subLabel="दर, अंतर तफावत आणि कमिशन बदला" 
            color={primaryColor}
            iconBg="#ECFDF5"
            onPress={() => router.push("/karkhanas")}
          />
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account-cog-outline" size={18} color={primaryColor} />
          <Text style={styles.sectionTitle}>खाते</Text>
        </View>

        <View style={styles.card}>
          <SettingsMenuItem 
            icon="logout" 
            label="लॉगआउट" 
            subLabel="ऍप मधून बाहेर पडा"
            color="#dc2626"
            iconBg="#fee2e2"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  scrollBody: { padding: 20, paddingTop: 0},
  profileCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 15 },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { color: "#fff", fontSize: 18, fontWeight: "800" },
  userEmail: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.02,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  menuSubLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 52,
  },
  versionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 10,
    marginBottom: 40,
  },
});