import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  RefreshControl,
  TouchableOpacity,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Strings } from "@/constants/Strings";
import { TractorService } from "@/services/api";
import { TractorCard } from "@/components/ui/tractor-card";

import { useTractors } from "@/context/TractorContext";

export default function FleetDashboard() {
  const router = useRouter();
  const primaryColor = Colors.light?.emerald800 || "#065f46";

  const { tractors, loading, error, refreshData } = useTractors();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const recentActivities = useMemo(() => {
    if (!tractors || tractors.length === 0) return [];

    let allEvents: any[] = [];

    tractors.forEach((t) => {
      if (t.lastTrip) {
        allEvents.push({
          id: `trip-${t.lastTrip.id}`,
          type: "TRIP",
          date: new Date(t.lastTrip.date),
          title: `${t.plateNumber} - ${t.lastTrip.weight} टन`,
          subtitle: "ऊस (Trip)",
          amount: t.lastTrip.profit,
          icon: "barley",
          color: "#15803d",
        });
      }

      if (t.lastExpense) {
        let expenseSubtitle = "खर्च";
        if (t.lastExpense.type === "MAINTENANCE") {
          expenseSubtitle = "दुरुस्ती (Maintenance)";
        } else if (t.lastExpense.type === "DRIVER_AMOUNT") {
          expenseSubtitle = t.driverName || "ड्रायव्हर पेमेंट";
        } else if (t.lastExpense.type === "MUKADAM_AMOUNT") {
          expenseSubtitle = t.mukadamName || "मुकादम पेमेंट";
        }

        allEvents.push({
          id: `exp-${t.lastExpense.id}`,
          type: "EXPENSE",
          date: new Date(t.lastExpense.date),
          title: `${t.plateNumber} - खर्च`,
          subtitle: expenseSubtitle,
          amount: t.lastExpense.amount,
          icon:
            t.lastExpense.type === "MAINTENANCE" ? "wrench" : "account-cash",
          color: "#b91c1c",
        });
      }
    });

    return allEvents
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [tractors]);

  const handleEdit = (tractor: any) => {
    router.push({
      pathname: "/edit-tractor",
      params: { id: tractor.id },
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert("खात्री करा", "तुम्हाला हा ट्रॅक्टर हटवायचा आहे का?", [
      { text: "रद्द करा", style: "cancel" },
      {
        text: "हटवा",
        style: "destructive",
        onPress: async () => {
          try {
            await TractorService.delete(id);
            await refreshData();
            Alert.alert("यशस्वी", "ट्रॅक्टर यशस्वीरित्या हटवला");
          } catch (err) {
            Alert.alert("त्रुटी", "हटवता आले नाही. पुन्हा प्रयत्न करा.");
          }
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth();
    return isToday
      ? "आज (Today)"
      : date.toLocaleDateString("mr-IN", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>गाड्यांची माहिती लोड होत आहे...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={50}
          color="red"
        />
        <Text style={{ color: "red", marginTop: 10 }}>
          माहिती लोड करण्यात अडचण आली.
        </Text>
        <TouchableOpacity
          onPress={refreshData}
          style={{
            marginTop: 15,
            padding: 12,
            backgroundColor: "#fff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>पुन्हा प्रयत्न करा (Retry)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} translucent={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[primaryColor]}
          />
        }
      >
        <DashboardHeader
          title={"Tractor Manager"}
          subtitle={new Date().toLocaleDateString("mr-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />

        {/* --- SECTION 1: RECENT ACTIVITY --- */}
        <View style={styles.feedContainer}>
          <Text style={styles.sectionTitle}>
            अलीकडील घडामोडी (Recent Activity)
          </Text>

          <View style={styles.feedCard}>
            {recentActivities.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={30}
                  color="#cbd5e1"
                />
                <Text style={styles.emptyFeedText}>अद्याप हालचाल नाही.</Text>
              </View>
            ) : (
              recentActivities.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.feedItem}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: item.color + "15" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={20}
                        color={item.color}
                      />
                    </View>

                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                      <Text style={styles.feedTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.feedSubtitle}>
                        {formatDate(item.date)} • {item.subtitle}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.feedAmount,
                        {
                          color: item.type === "TRIP" ? "#15803d" : "#b91c1c",
                        },
                      ]}
                    >
                      {item.type === "TRIP" ? "+" : "-"} ₹
                      {item.amount.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  {index < recentActivities.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* --- SECTION 2: ACTIVE FLEET --- */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>{Strings.activeFleet}</Text>
          {tractors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="tractor"
                size={60}
                color="#cbd5e1"
              />
              <Text style={styles.emptyText}>अद्याप एकही ट्रॅक्टर नाही</Text>
            </View>
          ) : (
            tractors.map((tractor) => (
              <TractorCard
                key={tractor.id}
                tractor={tractor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPress={() =>
                  router.push({
                    pathname: "/season-selection",
                    params: {
                      id: tractor.id,
                      plateNumber: tractor.plateNumber,
                    },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* --- ACTION ROW --- */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: "#fff",
              borderColor: primaryColor,
              borderWidth: 1.5,
            },
          ]}
          onPress={() => router.push("/add-tractor")}
        >
          <MaterialCommunityIcons
            name="tractor"
            size={20}
            color={primaryColor}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.actionButtonText, { color: primaryColor }]}>
            नवीन ट्रॅक्टर
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push("/add-trip")}
        >
          <MaterialCommunityIcons
            name="plus"
            size={22}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.actionButtonText, { color: "#fff" }]}>
            नवीन ट्रीप
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: { marginTop: 10, color: "#64748b", fontWeight: "600" },
  feedContainer: { paddingHorizontal: 16, marginTop: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
    marginLeft: 4,
  },
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  feedTitle: { fontSize: 14, fontWeight: "700", color: "#334155" },
  feedSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 2,
  },
  feedAmount: { fontSize: 15, fontWeight: "800" },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 66,
    marginRight: 16,
  },
  emptyFeedText: { color: "#94a3b8", fontSize: 14, marginTop: 8 },
  listContainer: { paddingHorizontal: 16 },
  emptyContainer: { alignItems: "center", marginTop: 30 },
  emptyText: {
    color: "#94a3b8",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  actionRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccd0d4ff",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 14,
  },
  actionButtonText: { fontSize: 16, fontWeight: "700" },
});
