import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { TractorService } from "@/services/api";
import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTractors } from "@/context/TractorContext";

export default function SeasonExpensesScreen() {
  const router = useRouter();
  const { tractorId, plateNumber, year } = useLocalSearchParams();

  const { tractors, loading, setTractors } = useTractors();

  const [filter, setFilter] = useState("ALL");

  const primaryColor = Colors.light?.emerald800 || "#064e3b";

  const tractor = useMemo(() => {
    return tractors.find((t) => t.id === Number(tractorId));
  }, [tractorId, tractors]);

  const masterData = useMemo(() => {
    if (!tractor || !year) return [];

    const seasonStart = new Date(`${year}-06-01`);
    const seasonEnd = new Date(`${Number(year) + 1}-05-31`);

    return (tractor.expenses || []).filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= seasonStart && expDate <= seasonEnd;
    });
  }, [tractor, year]);

  const filteredData = useMemo(() => {
    return filter === "ALL"
      ? masterData
      : masterData.filter((item) => item.type === filter);
  }, [filter, masterData]);

  const handleDelete = (expenseId: number) => {
    Alert.alert("खर्च हटवा", "तुम्हाला खात्री आहे?", [
      { text: "रद्द करा", style: "cancel" },
      {
        text: "हो, हटवा",
        style: "destructive",
        onPress: async () => {
          try {
            await TractorService.deleteExpense(expenseId);

            setTractors((prev) =>
              prev.map((tractor) => {
                if (tractor.id === Number(tractorId)) {
                  return {
                    ...tractor,
                    expenses: tractor.expenses.filter(
                      (e) => e.id !== expenseId
                    ),
                  };
                }
                return tractor;
              })
            );
            Alert.alert("यशस्वी", "खर्च हटवला आहे.");
          } catch (e) {
            Alert.alert("त्रुटी", "हटवता आले नाही.");
          }
        },
      },
    ]);
  };

  const stats = {
    total: filteredData.reduce((s, e) => s + e.amount, 0),
    maint: masterData
      .filter((e) => e.type === "MAINTENANCE")
      .reduce((s, e) => s + e.amount, 0),
    driver: masterData
      .filter((e) => e.type === "DRIVER_AMOUNT")
      .reduce((s, e) => s + e.amount, 0),
    mukadam: masterData
      .filter((e) => e.type === "MUKADAM_AMOUNT")
      .reduce((s, e) => s + e.amount, 0),
  };

  const getDynamicDetails = () => {
    switch (filter) {
      case "MAINTENANCE":
        return { label: "मेंटेनन्स खर्च (Maintenance)", amount: stats.maint };
      case "DRIVER_AMOUNT":
        return {
          label: `ड्रायव्हर खर्च (${tractor?.driverName})`,
          amount: stats.driver,
        };
      case "MUKADAM_AMOUNT":
        return {
          label: `मुकादम खर्च (${tractor?.mukadamName})`,
          amount: stats.mukadam,
        };
      default:
        return { label: "एकूण खर्च (Total Spend)", amount: stats.total };
    }
  };

  const { label, amount } = getDynamicDetails();

  const HeaderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.mainTotalRow}>
        <View>
          <Text style={styles.totalLabel}>{label}</Text>
          <Text style={[styles.totalAmount, { color: primaryColor }]}>
            ₹{amount.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="finance"
            size={30}
            color={primaryColor}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.smallStat}>
          <Text style={styles.smallStatLabel}>मेंटेनन्स</Text>
          <Text style={styles.smallStatValue}>
            ₹{stats.maint.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.smallStat}>
          <Text style={styles.smallStatLabel}>ड्रायव्हर</Text>
          <Text style={styles.smallStatValue}>
            ₹{stats.driver.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.smallStat}>
          <Text style={styles.smallStatLabel}>मुकादम</Text>
          <Text style={styles.smallStatValue}>
            ₹{stats.mukadam.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>
    </View>
  );

  const displayTitle = plateNumber ? `${plateNumber} - खर्च` : "गाडी खर्च";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={primaryColor}
        translucent={true}
      />
      <Stack.Screen
        options={{
          title: loading && !tractor ? "माहिती लोड होत आहे..." : displayTitle,
          headerShown: true,
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 20 }}
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

      {loading && !tractor ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 10, color: "#64748B" }}>
            माहिती लोड होत आहे...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <HeaderSummary />
              <View style={styles.filterBar}>
                {["ALL", "MAINTENANCE", "DRIVER_AMOUNT", "MUKADAM_AMOUNT"].map(
                  (v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setFilter(v)}
                      style={[
                        styles.chip,
                        filter === v && {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filter === v && { color: "#fff" },
                        ]}
                      >
                        {v === "ALL"
                          ? "सर्व"
                          : v === "MAINTENANCE"
                          ? "दुरुस्ती"
                          : v === "DRIVER_AMOUNT"
                          ? "ड्रायव्हर"
                          : "मुकादम"}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          }
          // ✅ Add this prop to handle empty state
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="cash-off"
                size={64}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>कोणताही खर्च आढळला नाही</Text>
              <Text style={styles.emptySubText}>
                निवडलेल्या श्रेणीसाठी कोणतीही नोंद नाही.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <View
                style={[
                  styles.colorIndicator,
                  {
                    backgroundColor:
                      item.type === "MAINTENANCE" ? "#f59e0b" : primaryColor,
                  },
                ]}
              />
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.categoryTitle}>
                    {item.type.replace("_", " ")}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      style={styles.actionIcon}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cardMainRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>
                      {item?.type === "MAINTENANCE"
                        ? "Maintenance Work"
                        : item?.type === "DRIVER_AMOUNT"
                        ? tractor?.driverName
                        : tractor?.mukadamName}
                    </Text>
                    {item.description && (
                      <Text style={styles.descriptionText}>
                        {item.description}
                      </Text>
                    )}

                    <View style={styles.dateRow}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={14}
                        color="#94a3b8"
                      />
                      <Text style={styles.dateText}>
                        {new Date(item.date).toLocaleString("mr-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemAmount}>₹{item.amount}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  summaryContainer: {
    padding: 20,
    backgroundColor: "#f8fafc",
    margin: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
  },
  mainTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  totalAmount: { fontSize: 32, fontWeight: "900" },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 15,
  },
  smallStat: { flex: 1 },
  smallStatLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "bold",
    marginBottom: 2,
  },
  smallStatValue: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  filterBar: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 15 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipText: { fontSize: 13, fontWeight: "800", color: "#475569" },
  listCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  colorIndicator: { width: 5 },
  cardInfo: { flex: 1, padding: 16 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  itemAmount: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  personName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 4,
  },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 5 },
  dateText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionIcon: {
    padding: 4,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#475569",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#64748B", // Slate 500
    fontWeight: "500",
    marginTop: 2,
    marginBottom: 4,
    fontStyle: "italic",
  },
});
