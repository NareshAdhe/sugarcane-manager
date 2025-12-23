import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

// 1. Context Hook इम्पोर्ट करा
import { useTractors } from "@/context/TractorContext";

export default function SeasonSelectionScreen() {
  const { id, plateNumber } = useLocalSearchParams();
  const router = useRouter();
  
  const { refreshData } = useTractors();

  const primaryColor = Colors.light?.emerald800 || "#065f46";
  const lightBg = primaryColor + "10";

  const seasons = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const startYear = currentMonth >= 5 ? currentYear : currentYear - 1;

    return Array.from({ length: 5 }, (_, i) => {
      const year = startYear - i;
      const nextYear = year + 1;
      const label = `${year}-${String(nextYear).slice(-2)}`;
      
      return {
        label: label,
        value: String(year),
        isCurrent: i === 0,
        status: i === 0 ? "Active" : "Closed",
      };
    });
  }, []);

  const handleSelectSeason = async (seasonValue: string) => {
    const targetId = Array.isArray(id) ? id[0] : id;

    router.push({
      pathname: "/tractor/[id]",
      params: { id: targetId, year: seasonValue },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: String(plateNumber) || "वर्ष निवडा",
          headerShown: true,
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
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
      <View style={styles.topBanner}>
        <View style={[styles.bannerIconBox, { backgroundColor: lightBg }]}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={28}
            color={primaryColor}
          />
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerMainText}>कामकाजाचा हंगाम निवडा</Text>
          <Text style={styles.bannerSubText}>
            खालिलपैकी एक वर्ष निवडा (Select Year)
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            उपलब्ध हंगाम (Available Seasons)
          </Text>
        </View>

        {seasons.map((season) => (
          <TouchableOpacity
            key={season.value}
            activeOpacity={0.8}
            style={[
              styles.card,
              season.isCurrent && { borderColor: primaryColor, borderWidth: 1.5 },
            ]}
            onPress={() => handleSelectSeason(season.value)}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: season.isCurrent ? lightBg : "#F1F5F9" },
              ]}
            >
              <MaterialCommunityIcons
                name={season.isCurrent ? "calendar-check" : "calendar-lock"}
                size={28}
                color={season.isCurrent ? primaryColor : "#64748B"}
              />
            </View>

            <View style={styles.labelWrapper}>
              <Text style={styles.label}>{season.label}</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: season.isCurrent ? primaryColor : "#94A3B8" },
                ]}
              >
                {season.isCurrent
                  ? "चालू हंगाम (Current)"
                  : "मागील हंगाम (History)"}
              </Text>
            </View>

            <View
              style={[
                styles.arrowCircle,
                {
                  backgroundColor: season.isCurrent ? primaryColor : "#F1F5F9",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={season.isCurrent ? "#fff" : "#CBD5E1"}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Styles - कोणतेही बदल नाहीत
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  backBtn: { marginRight: 20 },
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccd0d4ff",
  },
  bannerIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bannerContent: {
    flex: 1,
  },
  bannerMainText: {
    color: "#1E293B",
    fontSize: 19,
    fontWeight: "800",
  },
  bannerSubText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: { paddingHorizontal: 20, marginTop: 25, marginBottom: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#ccd0d4ff"
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  labelWrapper: { flex: 1 },
  label: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  statusText: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});