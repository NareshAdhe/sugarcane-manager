import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTractors } from "@/context/TractorContext";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function KarkhanasScreen() {
  const router = useRouter();
  const { karkhanas, tractors } = useTractors();
  
  // App Theme Colors
  const primaryColor = Colors.light?.emerald800 || "#065f46";
  const textMuted = "#64748b";

  const getAssignedCount = (id: number) => {
    return tractors.filter((t) => t.karkhana?.id === id).length;
  };

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => router.push(`/karkhanas/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
            <MaterialCommunityIcons name="factory" size={24} color={primaryColor} />
          </View>
          <View>
            <Text style={styles.factoryName}>{item.name}</Text>
            <View style={styles.tractorBadge}>
              <MaterialCommunityIcons name="tractor" size={12} color={textMuted} />
              <Text style={styles.tractorCount}>
                {getAssignedCount(item.id)} ट्रॅक्टर जोडलेले
              </Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
      </View>

      <View style={styles.divider} />

      {/* --- SECTION 2: RATES GRID (Business Logic) --- */}
      <View style={styles.gridContainer}>
        {/* Row 1: Transport Rates */}
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={14} color="#2563EB" />
              <Text style={styles.gridLabel}>वाहतूक (≤{item.distanceThreshold}km)</Text>
            </View>
            <Text style={styles.gridValue}>₹{item.vahatukRateShort}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="truck-fast-outline" size={14} color="#2563EB" />
              <Text style={styles.gridLabel}>वाहतूक ({'>'}{item.distanceThreshold}km)</Text>
            </View>
            <Text style={styles.gridValue}>₹{item.vahatukRateLong}</Text>
          </View>
        </View>

        {/* Row 2: Todni & Diesel */}
        <View style={[styles.gridRow, { marginTop: 12 }]}>
          <View style={styles.gridItem}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="content-cut" size={14} color="#D97706" />
              <Text style={styles.gridLabel}>तोडणी दर (Todni)</Text>
            </View>
            <Text style={styles.gridValue}>₹{item.todniRate}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="gas-station" size={14} color="#DC2626" />
              <Text style={styles.gridLabel}>डिझेल दर (Diesel)</Text>
            </View>
            <Text style={styles.gridValue}>₹{item.dieselRate}</Text>
          </View>
        </View>
      </View>

      {/* --- SECTION 3: COMMISSIONS FOOTER --- */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>कमिशन (COMMISSIONS)</Text>
        <View style={styles.footerRow}>
          <View style={styles.commItem}>
            <MaterialCommunityIcons name="percent" size={14} color={textMuted} />
            <Text style={styles.commText}>तोडणी: {item.todniCommRate}%</Text>
          </View>
          <View style={styles.verticalLine} />
          <View style={styles.commItem}>
            <MaterialCommunityIcons name="percent" size={14} color={textMuted} />
            <Text style={styles.commText}>वाहतूक: {item.vahatukCommRate}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 1. Status Bar matches the header */}
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      {/* 2. Standard Emerald Header */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: "माझे कारखाने (My Factories)",
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={karkhanas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
             <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons name="factory" size={50} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyText}>अद्याप कोणताही कारखाना जोडलेला नाही.</Text>
                <Text style={styles.emptySubText}>खालील + बटण दाबून सुरुवात करा.</Text>
             </View>
        }
      />

      {/* 3. Matching Emerald FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => router.push("/add-karkhana")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean light background
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // --- CARD STYLING ---
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Section 1: Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  factoryName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  tractorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tractorCount: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },

  // Section 2: Grid
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Subtle contrast
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  gridValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  // Section 3: Footer
  footer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  commItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  verticalLine: {
    width: 1,
    height: 12,
    backgroundColor: "#CBD5E1",
  },

  // --- FAB ---
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20, // Modern Squircle
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  
  // --- EMPTY STATE ---
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    opacity: 0.8,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748B',
  }
});