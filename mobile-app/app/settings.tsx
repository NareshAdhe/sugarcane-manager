import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { UserService } from "@/services/api";

const SettingInput = ({
  label,
  value,
  onChange,
  icon,
  unit,
  primaryColor,
}: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <MaterialCommunityIcons name={icon} size={22} color={primaryColor} />
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0.00"
        selectionColor={primaryColor}
        returnKeyType="done"
      />
      <Text style={styles.unitText}>{unit}</Text>
    </View>
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const {
    setIsLoggedIn,
    userSettings,
    setUserSettings,
    loading: contextLoading,
  } = useTractors();

  const primaryColor = Colors.light?.emerald800 || "#064e3b";

  const [dieselRate, setDieselRate] = useState(
    userSettings?.defaultDieselRate?.toString() || "0"
  );
  const [vahatukRateShort, setVahatukRateShort] = useState(
    userSettings?.defaultVahatukRateShort?.toString() || "0"
  );
  const [vahatukRateLong, setVahatukRateLong] = useState(
    userSettings?.defaultVahatukRateLong?.toString() || "0"
  );
  const [todniRate, setTodniRate] = useState(
    userSettings?.defaultTodniRate?.toString() || "0"
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userSettings) {
      setDieselRate(userSettings.defaultDieselRate.toString());
      setVahatukRateShort(userSettings.defaultVahatukRateShort.toString());
      setVahatukRateLong(userSettings.defaultVahatukRateLong.toString());
      setTodniRate(userSettings.defaultTodniRate.toString());
    }
  }, [userSettings]);

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

  const handleSaveSettings = async () => {
    if (!dieselRate || !vahatukRateShort || !vahatukRateLong || !todniRate) {
      Alert.alert("त्रुटी", "कृपया सर्व दर भरा");
      return;
    }

    setIsSaving(true);
    try {
      const response = await UserService.updateSettings({
        dieselRate,
        vahatukRateShort,
        vahatukRateLong,
        todniRate,
      });

      setUserSettings(response.settings);

      Alert.alert("यशस्वी", "सेटिंग्ज यशस्वीरित्या जतन केल्या आहेत!");
    } catch (error) {
      console.error("Save Settings Error:", error);
      Alert.alert("त्रुटी", "सेटिंग्ज जतन करता आल्या नाहीत.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderHeader = (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={primaryColor}
        translucent={true}
      />
      <Stack.Screen
        options={{
          title: "सेटिंग्ज (Settings)",
          headerShown: true,
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 0, marginRight: 28 }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={26}
                color="#fff"
              />
            </TouchableOpacity>
          ),
        }}
      />
    </>
  );

  if (contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        {renderHeader}
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: 10, color: "#64748B" }}>
          माहिती लोड होत आहे...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* PROFILE SECTION */}
        <LinearGradient
          colors={[primaryColor, "#065f46"]}
          style={styles.profileCard}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons
                name="account"
                size={40}
                color={primaryColor}
              />
            </View>
            <View>
              <Text style={styles.userName}>
                {userSettings?.name || "User Name"}
              </Text>
              <Text style={styles.userEmail}>
                {userSettings?.email || "Email"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* RATE MANAGER SECTION */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="finance"
            size={20}
            color={primaryColor}
          />
          <Text style={styles.sectionTitle}>दर व्यवस्थापक (Rate Manager)</Text>
        </View>

        <View style={styles.card}>
          <SettingInput
            label="डिझेल दर (Diesel Rate)"
            value={dieselRate}
            onChange={setDieselRate}
            icon="gas-station"
            unit="₹/Ltr"
          />
          <View style={styles.divider} />

          <SettingInput
            label="वाहतूक दर - २५ किमी पर्यंत (≤ 25km)"
            value={vahatukRateShort}
            onChange={setVahatukRateShort}
            icon="map-marker-distance"
            unit="₹/Ton"
          />
          <View style={styles.divider} />

          <SettingInput
            label="वाहतूक दर - २५ किमी पेक्षा जास्त (> 25km)"
            value={vahatukRateLong}
            onChange={setVahatukRateLong}
            icon="truck-fast"
            unit="₹/Ton"
          />
          <View style={styles.divider} />

          <SettingInput
            label="तोडणी दर (Todni Rate)"
            value={todniRate}
            onChange={setTodniRate}
            icon="tools"
            unit="₹/Ton"
            primaryColor={primaryColor}
          />
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color={primaryColor}
          />
          <Text style={styles.sectionTitle}>खाते (Account)</Text>
        </View>

        <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
          <View style={[styles.iconBox, { backgroundColor: "#fee2e2" }]}>
            <MaterialCommunityIcons name="logout" size={22} color="#dc2626" />
          </View>
          <Text style={[styles.actionText, { color: "#dc2626" }]}>
            लॉगआउट (Logout)
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#dc2626"
          />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.footerActionText}>बदल जतन करा (Save)</Text>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollBody: { padding: 20, paddingBottom: 100 },
  profileCard: {
    padding: 25,
    borderRadius: 24,
    marginBottom: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 15 },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { color: "#fff", fontSize: 20, fontWeight: "900" },
  userEmail: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 25,
  },
  inputWrapper: { marginBottom: 15 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 10,
  },
  unitText: { fontSize: 14, fontWeight: "800", color: "#94a3b8" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 10 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: "700" },
  saveButton: {
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    elevation: 4,
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  versionText: {
    textAlign: "center",
    marginTop: 30,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#ccd0d4ff",
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
  },
  footerActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
