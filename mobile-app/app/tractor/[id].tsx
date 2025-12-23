import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/theme";
import { Strings } from "@/constants/Strings";
import { IconSymbol } from "@/components/ui/icon-symbol";

// 1. Global Context Hook इम्पोर्ट करा
import { useTractors } from "@/context/TractorContext";
import { Expense, TripData } from "@/services/api";

export default function TractorDetailScreen() {
  const { id, year } = useLocalSearchParams();
  const router = useRouter();

  // 2. कॉन्टेक्स्ट मधून डेटा आणि रिफ्रेश फंक्शन मिळवा
  const { tractors, loading, refreshData } = useTractors();

  const [refreshing, setRefreshing] = useState(false);
  const [isMukadamCollapsed, setIsMukadamCollapsed] = useState(true);
  const [isDriverCollapsed, setIsDriverCollapsed] = useState(true);

  const primaryColor = Colors.light?.emerald800 || "#064e3b";

  const tractor = useMemo(() => {
    return tractors.find((t) => t.id === Number(id));
  }, [id, tractors]);

  // 1. Filtered Trips (History)
  const allTrips = useMemo(() => {
    if (!tractor || !year) return [];
    const seasonStart = new Date(`${year}-06-01`);
    const seasonEnd = new Date(`${Number(year) + 1}-05-31`);

    return tractor.trips.filter((trip) => {
      const tripDate = new Date(trip.date);
      return tripDate >= seasonStart && tripDate <= seasonEnd;
    });
  }, [tractor, year]);

  const allExpenses = useMemo(() => {
    if (!tractor || !year) return [];

    const seasonStart = new Date(`${year}-06-01`);
    const seasonEnd = new Date(`${Number(year) + 1}-05-31`);

    return (tractor.expenses || []).filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= seasonStart && expDate <= seasonEnd;
    });
  }, [tractor, year]);

  const driver = tractor?.driver;
  const mukadam = tractor?.mukadam;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCallDriver = () => {
    if (!driver) return;
    const phone = driver.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert(Strings.edit, "Driver phone number is unavailable.");
  };

  const handleCallMukadam = () => {
    if (!mukadam) return;
    const phone = mukadam.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert(Strings.edit, "Mukadam phone number is unavailable.");
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    return { day, month };
  };

  // For Expenses
  const expenseTotals = useMemo(() => {
    return allExpenses.reduce(
      (acc, exp: Expense) => {
        if (exp.type === "MAINTENANCE") {
          acc.totalMaintenance += exp.amount || 0;
        } else if (exp.type === "DRIVER_AMOUNT") {
          acc.totalDriverAmount += exp.amount || 0;
        } else if (exp.type === "MUKADAM_AMOUNT") {
          acc.totalMukadamAmount += exp.amount || 0;
        }
        return acc;
      },
      { totalMaintenance: 0, totalDriverAmount: 0, totalMukadamAmount: 0 }
    );
  }, [allExpenses]);

  // For Trips
  const totals = useMemo(() => {
    return allTrips.reduce(
      (acc, t: TripData) => {
        acc.totalWeight += t.netWeight || 0;
        acc.totalTodni += t.cuttingIncome || 0;
        acc.totalVahatuk += t.transportIncome || 0;
        acc.totalDieselCost += t.dieselCost || 0;
        acc.netProfit += t.netTripProfit || 0;
        acc.tripCount += 1;
        acc.totalBonus += t.commission || 0;
        return acc;
      },
      {
        totalWeight: 0,
        totalTodni: 0,
        totalVahatuk: 0,
        totalDieselCost: 0,
        netProfit: 0,
        tripCount: 0,
        totalBonus: 0,
      }
    );
  }, [allTrips]);

  const totalIncome = totals.totalTodni + totals.totalVahatuk;
  const totalDieselExpenseDisplay = totals.totalDieselCost;
  const totalMaintenance = expenseTotals.totalMaintenance;

  const renderDriverDetailsCard = () => (
    <View style={styles.mukadamDetailsContainer}>
      <Text style={styles.mukadamTitle}>
        {Strings.driverDetails || "ड्रायव्हर माहिती"}
      </Text>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="account"
          size={20}
          color="#555"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{Strings.driver || "नाव"}:</Text>
        <Text style={styles.detailValue}>{driver?.name || "N/A"}</Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="phone"
          size={20}
          color="#555"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>Phone:</Text>
        <TouchableOpacity onPress={handleCallDriver}>
          <Text
            style={[
              styles.detailValue,
              { color: primaryColor, fontWeight: "bold" },
            ]}
          >
            {driver?.phone || "N/A"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="cash-multiple"
          size={20}
          color="#555"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{Strings.totalAdvanceGiven}:</Text>
        <Text style={[styles.detailValue, { color: "#C62828" }]}>
          {Strings.currency}
          {expenseTotals.totalDriverAmount.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderMukadamDetailsCard = () => (
    <View style={styles.mukadamDetailsContainer}>
      <Text style={styles.mukadamTitle}>{Strings.mukadamDetails}</Text>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="account-tie"
          size={20}
          color="#555"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{Strings.mukadamName}:</Text>
        <Text style={styles.detailValue}>{mukadam?.name || "N/A"}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="phone"
          size={20}
          color="#555"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>Phone:</Text>
        <TouchableOpacity onPress={handleCallMukadam}>
          <Text
            style={[
              styles.detailValue,
              { color: primaryColor, fontWeight: "bold" },
            ]}
          >
            {mukadam?.phone || "N/A"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="cash-multiple"
          size={20}
          color="#555"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{Strings.totalAdvanceGiven}:</Text>
        <Text style={[styles.detailValue, { color: "#C62828" }]}>
          {Strings.currency}
          {expenseTotals.totalMukadamAmount.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const getHeaderTitle = () => {
    if (loading || !tractor) return "माहिती लोड होत आहे...";
    return tractor.plateNumber;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <Stack.Screen
        options={{
          title: getHeaderTitle(),
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      {loading || !tractor ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 10, color: "#64748B" }}>
            माहिती लोड होत आहे...
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[primaryColor]}
              />
            }
          >
            {/* HERO CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.iconBox}>
                  <IconSymbol name="car.fill" size={32} color={primaryColor} />
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.plateNumber}>{tractor.plateNumber}</Text>
                  <Text style={styles.subText}>
                    {tractor.modelName || Strings.activeAsset}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: primaryColor }]}
                  onPress={handleCallDriver}
                >
                  <FontAwesome5 name="phone-alt" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />

              <View style={styles.driverRow}>
                <TouchableOpacity
                  style={styles.moreDetailsBtn}
                  onPress={() => setIsDriverCollapsed(!isDriverCollapsed)}
                >
                  <IconSymbol
                    name={isDriverCollapsed ? "chevron.left" : "chevron.up"}
                    size={16}
                    color={primaryColor}
                  />
                  <Text
                    style={[
                      styles.moreDetailsTextDriver,
                      { color: primaryColor },
                    ]}
                  >
                    {Strings.driverDetails}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moreDetailsBtn}
                  onPress={() => setIsMukadamCollapsed(!isMukadamCollapsed)}
                >
                  <Text
                    style={[
                      styles.moreDetailsTextMukadam,
                      { color: primaryColor },
                    ]}
                  >
                    {Strings.mukadamDetails}
                  </Text>
                  <IconSymbol
                    name={isMukadamCollapsed ? "chevron.right" : "chevron.up"}
                    size={16}
                    color={primaryColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isDriverCollapsed && (
              <View style={styles.collapsibleWrapper}>
                {renderDriverDetailsCard()}
              </View>
            )}

            {mukadam && !isMukadamCollapsed && (
              <View style={styles.collapsibleWrapper}>
                {renderMukadamDetailsCard()}
              </View>
            )}

            {/* TOTAL INCOME/TONNAGE CARD */}
            <LinearGradient
              colors={[primaryColor, "#064e3b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.weightCard}
            >
              <View style={styles.cardInternalLayout}>
                <View>
                  <Text style={styles.weightLabel}>
                    {Strings.totalIncome} / {Strings.totalTonnage}
                  </Text>
                  <Text style={styles.weightValue}>
                    {Strings.currency}
                    {totalIncome.toLocaleString()}{" "}
                    <Text style={{ fontSize: 18, opacity: 0.8 }}>/</Text>{" "}
                    {totals.totalWeight.toFixed(1)} {Strings.tons}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={48}
                  color="rgba(255,255,255,0.2)"
                />
              </View>
            </LinearGradient>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{Strings.summary}</Text>
              <TouchableOpacity
                style={styles.addExpenseHeaderBtn}
                onPress={() =>
                  router.push({
                    pathname: "/add-expense",
                    params: {
                      id: tractor.id,
                      plateNumber: tractor.plateNumber,
                    },
                  })
                }
              >
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={18}
                  color={primaryColor}
                />
                <Text
                  style={[styles.addExpenseHeaderText, { color: primaryColor }]}
                >
                  खर्च जोडा
                </Text>
              </TouchableOpacity>
            </View>

            {/* FINANCIAL SUMMARY BOXES */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#FFF3E0", borderColor: "#FFE0B2" },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#FFE0B2" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="barley"
                    size={20}
                    color="#EF6C00"
                  />
                </View>
                <Text style={styles.statLabel}>{Strings.cuttingIncome}</Text>
                <Text style={[styles.statValue, { color: "#EF6C00" }]}>
                  {Strings.currency}
                  {totals.totalTodni.toLocaleString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#E8F5E9", borderColor: "#C8E6C9" },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#C8E6C9" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="truck"
                    size={20}
                    color="#2E7D32"
                  />
                </View>
                <Text style={styles.statLabel}>{Strings.transportIncome}</Text>
                <Text style={[styles.statValue, { color: "#2E7D32" }]}>
                  {Strings.currency}
                  {totals.totalVahatuk.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#FFEBEE", borderColor: "#FFCDD2" },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#FFCDD2" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="gas-station"
                    size={20}
                    color="#C62828"
                  />
                </View>
                <Text style={styles.statLabel}>{Strings.dieselExpense}</Text>
                <Text style={[styles.statValue, { color: "#C62828" }]}>
                  - {Strings.currency}
                  {totalDieselExpenseDisplay.toLocaleString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#F3E5F5", borderColor: "#E1BEE7" },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#E1BEE7" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="wrench"
                    size={20}
                    color="#7B1FA2"
                  />
                </View>
                <Text style={styles.statLabel}>
                  {Strings.maintenanceExpense}
                </Text>
                <Text style={[styles.statValue, { color: "#7B1FA2" }]}>
                  - {Strings.currency}
                  {totalMaintenance.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#E8EAF6", borderColor: "#C5CAE9" },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#C5CAE9" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-distance"
                    size={20}
                    color="#3F51B5"
                  />
                </View>
                <Text style={styles.statLabel}>{Strings.totalTrips}</Text>
                <Text style={[styles.statValue, { color: "#3F51B5" }]}>
                  {totals.tripCount.toLocaleString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  {
                    flex: 1,
                    backgroundColor: "#FCE4EC",
                    borderColor: "#F8BBD0",
                  },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#F8BBD0" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="gift"
                    size={20}
                    color="#AD1457"
                  />
                </View>
                <Text style={styles.statLabel}>{Strings.totalBonus}</Text>
                <Text style={[styles.statValue, { color: "#AD1457" }]}>
                  {Strings.currency}
                  {totals.totalBonus.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  {
                    flex: 1,
                    backgroundColor: "#E3F2FD",
                    borderColor: "#BBDEFB",
                  },
                ]}
              >
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: "#BBDEFB" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={20}
                    color="#1565C0"
                  />
                </View>
                <Text style={styles.statLabel}>एकूण नफा (Profit)</Text>
                <Text style={[styles.statValue, { color: "#1565C0" }]}>
                  {Strings.currency}
                  {(totals.netProfit - totalMaintenance).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Financial Management */}
            <View style={styles.actionSection}>
              <Text style={styles.sectionTitle}>
                आर्थिक व्यवस्थापन (Financials)
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.financeCard}
                onPress={() =>
                  router.push({
                    pathname: "/expense-list",
                    params: {
                      tractorId: id,
                      year: year,
                      plateNumber: tractor.plateNumber,
                    },
                  })
                }
              >
                <LinearGradient
                  colors={[primaryColor, "#065f46"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBg}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.glassIconContainer}>
                      <MaterialCommunityIcons
                        name="wallet-membership"
                        size={28}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.mainBtnText}>खर्च व्यवस्थापन</Text>
                      <Text style={styles.subBtnText}>
                        सर्व नोंदी आणि हिशोब पहा
                      </Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <MaterialCommunityIcons
                        name="arrow-right-circle"
                        size={32}
                        color="rgba(255,255,255,0.8)"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* RECENT TRIPS */}
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>{Strings.recentTrips}</Text>
            </View>
            <View style={styles.historyList}>
              {allTrips.length === 0 ? (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: "#999", fontSize: 16 }}>
                    {Strings.noHistory}
                  </Text>
                </View>
              ) : (
                allTrips.slice(0, 3).map((trip: any) => {
                  const { day, month } = formatDate(trip.date);
                  return (
                    <View key={trip.id} style={styles.tripRow}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>{day}</Text>
                        <Text style={styles.monthText}>{month}</Text>
                      </View>
                      <View style={styles.tripInfo}>
                        <Text style={styles.slipText}>
                          Slip #{trip.slipNumber}
                        </Text>
                        <Text style={styles.weightText}>
                          {trip.netWeight} {Strings.tons}
                        </Text>
                      </View>
                      <View style={styles.amountBox}>
                        <Text style={styles.tripAmount}>
                          + {Strings.currency}
                          {trip.netTripProfit.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
              {allTrips.length > 0 && (
                <TouchableOpacity
                  style={styles.viewAllRow}
                  onPress={() =>
                    router.push({
                      pathname: "/tractor-history/[id]",
                      params: { id: tractor.id, year },
                    })
                  }
                >
                  <Text style={[styles.viewAllText, { color: primaryColor }]}>
                    {Strings.viewAll}
                  </Text>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={primaryColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={() =>
                router.push({
                  pathname: "/add-trip",
                  params: { preSelectedId: tractor.id },
                })
              }
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={24}
                color="#fff"
              />
              <Text style={styles.actionText}>{Strings.addNewTrip}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContent: { padding: 20, paddingBottom: 100 },
  collapsibleWrapper: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  mukadamDetailsContainer: { padding: 0 },
  mukadamTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailIcon: { marginRight: 15, width: 24, textAlign: "center" },
  detailLabel: { fontSize: 14, color: "#555", fontWeight: "500", flex: 1 },
  detailValue: { fontSize: 14, color: "#333", fontWeight: "bold" },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
  },
  heroTop: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: "#E0F2F1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  heroInfo: { flex: 1 },
  plateNumber: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subText: { fontSize: 12, color: "#888" },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 14 },
  driverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 12, color: "#888" },
  driverName: { fontSize: 16, fontWeight: "600", color: "#333" },
  moreDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 8,
    borderRadius: 8,
  },
  moreDetailsTextMukadam: { fontSize: 12, fontWeight: "600", marginRight: 4 },
  moreDetailsTextDriver: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  weightCard: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardInternalLayout: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  weightValue: { color: "#fff", fontSize: 24, fontWeight: "900" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  historyList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
    marginBottom: 24,
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateBox: {
    backgroundColor: "#F5F7FA",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 14,
    width: 48,
  },
  dateText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  monthText: { fontSize: 10, color: "#666", textTransform: "uppercase" },
  tripInfo: { flex: 1 },
  slipText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  weightText: { fontSize: 12, color: "#666" },
  amountBox: { alignItems: "flex-end" },
  tripAmount: { fontSize: 16, fontWeight: "bold", color: "#2E7D32" },
  viewAllRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  viewAllText: { fontSize: 14, fontWeight: "bold", marginRight: 4 },
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
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addExpenseHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addExpenseHeaderText: { fontSize: 13, fontWeight: "700", marginLeft: 4 },
  actionSection: { marginTop: 25, marginBottom: 10 },
  financeCard: { borderRadius: 24, overflow: "hidden", elevation: 8 },
  gradientBg: { padding: 20 },
  cardContent: { flexDirection: "row", alignItems: "center" },
  glassIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  textContainer: { flex: 1, marginLeft: 16 },
  mainBtnText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
  },
  subBtnText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginTop: 2,
  },
  arrowContainer: { marginLeft: 10 },
});
