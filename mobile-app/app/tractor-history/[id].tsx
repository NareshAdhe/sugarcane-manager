import React, { useMemo, useCallback } from "react";
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
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/theme";
import { Strings } from "@/constants/Strings";
import { TractorService } from "@/services/api";

import { useTractors } from "@/context/TractorContext";

export default function TractorHistoryScreen() {
  const { id, year } = useLocalSearchParams();
  const router = useRouter();

  const { tractors, loading, setTractors } = useTractors();

  const primaryColor = Colors.light?.emerald800 || "#2b8a3e";

  const tractor = useMemo(() => {
    return tractors.find((t) => t.id === Number(id));
  }, [id, tractors]);

  const filteredTrips = useMemo(() => {
    if (!tractor || !year) return [];

    const seasonStart = new Date(`${year}-06-01`);
    const seasonEnd = new Date(`${Number(year) + 1}-05-31`);

    return tractor.trips.filter((trip) => {
      const tripDate = new Date(trip.date);
      return tripDate >= seasonStart && tripDate <= seasonEnd;
    });
  }, [tractor, year]);

  const history = filteredTrips;
  const plateNumber = tractor?.plateNumber || "";

  const handleDelete = (tripId: number) => {
    Alert.alert(
      "ट्रिप हटवा",
      "तुम्हाला खात्री आहे की तुम्ही हा व्यवहार हटवू इच्छिता?",
      [
        { text: "रद्द करा", style: "cancel" },
        {
          text: "हटवा",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await TractorService.deleteTrip(tripId);
              if (success) {
                setTractors((prev) =>
                  prev.map((t) => {
                    if (t.id === Number(id)) {
                      const updatedTrips = t.trips.filter(
                        (trip) => trip.id !== tripId
                      );
                      return {
                        ...t,
                        trips: updatedTrips,
                        lastTrip:
                          t.lastTrip?.id === tripId
                            ? updatedTrips.length > 0
                              ? {
                                  id: updatedTrips[0].id,
                                  weight: updatedTrips[0].netWeight,
                                  date: updatedTrips[0].date,
                                  profit: updatedTrips[0].netTripProfit,
                                }
                              : null
                            : t.lastTrip,
                      };
                    }
                    return t;
                  })
                );
                Alert.alert("यशस्वी", "व्यवहार यशस्वीरित्या हटवण्यात आला आहे.");
              }
            } catch (e) {
              Alert.alert("त्रुटी", "व्यवहार हटवता आला नाही.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item: any) => {
    const currentTractorId = Array.isArray(id) ? id[0] : id;
    router.push({
      pathname: "/add-trip",
      params: {
        tripId: item.id,
        tractorId: currentTractorId,
        slip: item.slipNumber,
        weight: item.netWeight.toString(),
        distance: item.distance?.toString(),
        diesel: item.dieselLiters?.toString(),
        bonus: (item.commission || 0).toString(),
        editMode: "true",
      },
    });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      day: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
    };
  };

  const renderHeader = () => {
    const totalWeight = history.reduce((acc, t) => acc + t.netWeight, 0);
    const totalNet = history.reduce((acc, t) => acc + t.netTripProfit, 0);

    return (
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[primaryColor, "#065f46", "#064e3b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View style={styles.statGroup}>
              <Text style={styles.totalLabel}>निव्वळ नफा (Net)</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Text style={styles.totalValue}>
                  {totalNet >= 1000
                    ? `${(totalNet / 1000).toFixed(1)}k`
                    : totalNet.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.glassDivider} />

            <View style={styles.statGroup}>
              <Text style={styles.totalLabel}>
                {Strings.totalTonnage || "एकूण ऊस"}
              </Text>
              <View style={styles.amountContainer}>
                <Text style={styles.totalValue}>{totalWeight.toFixed(1)}</Text>
                <Text style={styles.unitText}> {Strings.tons || "टन"}</Text>
              </View>
            </View>
          </View>

          <MaterialCommunityIcons
            name="chart-areaspline"
            size={80}
            color="rgba(255,255,255,0.05)"
            style={styles.bgIcon}
          />
        </LinearGradient>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>
            {Strings.allTransactions || "सर्व व्यवहार"}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{history.length} ट्रिप्स</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTrip = ({ item }: { item: any }) => {
    const tripDieselCost = item.dieselCost || 0;
    const tripNetProfit = item.netTripProfit || 0;
    const bonusAmount = item.commission || 0;

    const { day, month, year } = formatDate(item.date);
    const todniColor = "#EF6C00";
    const vahatukColor = "#1976D2";
    const dieselColor = "#C62828";
    const bonusColor = "#2E7D32";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateGroup}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={16}
              color="#888"
            />
            <Text style={styles.dateText}>
              {day} {month} {year}
            </Text>
            <View style={[styles.slipGroup, { marginLeft: 10 }]}>
              <Text style={styles.slipValue}>#{item.slipNumber}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 15 }}>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={22}
                color={primaryColor}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color="#C62828"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.heroItemLeft}>
            <Text style={styles.heroLabel}>{Strings.weight || "वजन"}</Text>
            <View style={styles.weightBadge}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={20}
                color="#333"
              />
              <Text style={styles.heroValueMain}>{item.netWeight}</Text>
            </View>
          </View>

          <View style={styles.heroItemRight}>
            <Text style={styles.heroLabel}>नफा (Profit)</Text>
            <Text style={styles.moneyValue}>
              ₹{tripNetProfit.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.incomeSection}>
            <View style={styles.microRow}>
              <View
                style={[
                  styles.microIconBadge,
                  { backgroundColor: todniColor + "15" },
                ]}
              >
                <MaterialCommunityIcons
                  name="barley"
                  size={14}
                  color={todniColor}
                />
              </View>
              <Text style={styles.microText}>
                तोडणी:{" "}
                <Text style={[styles.microValue, { color: todniColor }]}>
                  ₹{item.cuttingIncome}
                </Text>
              </Text>
            </View>

            <View style={styles.microRow}>
              <View
                style={[
                  styles.microIconBadge,
                  { backgroundColor: vahatukColor + "15" },
                ]}
              >
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={14}
                  color={vahatukColor}
                />
              </View>
              <Text style={styles.microText}>
                वाहतूक:{" "}
                <Text style={[styles.microValue, { color: vahatukColor }]}>
                  ₹{item.transportIncome}
                </Text>
              </Text>
            </View>

            {bonusAmount > 0 && (
              <View style={styles.microRow}>
                <View
                  style={[
                    styles.microIconBadge,
                    { backgroundColor: bonusColor + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="gift-outline"
                    size={14}
                    color={bonusColor}
                  />
                </View>
                <Text style={styles.microText}>
                  बोनस:{" "}
                  <Text style={[styles.microValue, { color: bonusColor }]}>
                    ₹{bonusAmount}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {item.dieselCost > 0 && (
            <View style={styles.microRow}>
              <View
                style={[
                  styles.microIconBadge,
                  { backgroundColor: dieselColor + "15" },
                ]}
              >
                <MaterialCommunityIcons
                  name="gas-station"
                  size={14}
                  color={dieselColor}
                />
              </View>
              <Text style={styles.microText}>
                डिझेल:{" "}
                <Text style={[styles.microValue, { color: dieselColor }]}>
                  - ₹{tripDieselCost.toLocaleString()}
                </Text>
              </Text>
              <Text style={{ fontSize: 9, color: "#999", marginLeft: 4 }}>
                ({item.dieselLiters}L)
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F8" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={primaryColor}
        translucent={true}
      />

      <Stack.Screen
        options={{
          title:
            loading && !plateNumber
              ? "माहिती लोड होत आहे..."
              : `${plateNumber} History`,
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 10, color: "#64748B" }}>
            माहिती लोड होत आहे...
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTrip}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {Strings.noHistory || "व्यवहार आढळले नाहीत"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 50 },
  headerContainer: { marginBottom: 10 },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  statGroup: { flex: 1, alignItems: "center" },
  amountContainer: { flexDirection: "row", alignItems: "baseline" },
  glassDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 10,
  },
  totalLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  currencySymbol: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 2,
  },
  unitText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  bgIcon: { position: "absolute", right: -10, bottom: -10 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  badge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "bold", color: "#475569" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  dateGroup: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 14, color: "#666", fontWeight: "500", marginLeft: 6 },
  slipGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slipValue: { fontSize: 13, fontWeight: "bold", color: "#333" },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heroItemLeft: { alignItems: "flex-start" },
  heroItemRight: { alignItems: "flex-end" },
  heroLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  weightBadge: { flexDirection: "row", alignItems: "baseline" },
  heroValueMain: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 2,
  },
  moneyValue: { fontSize: 22, fontWeight: "bold", color: "#2E7D32" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginHorizontal: 8 },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  microRow: { flexDirection: "row", alignItems: "center" },
  incomeSection: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  microIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  microText: { fontSize: 12, color: "#666" },
  microValue: { fontWeight: "bold" },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#888", fontSize: 16 },
});
