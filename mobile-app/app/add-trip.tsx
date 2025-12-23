import React, { useState, useEffect, useMemo } from "react";
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
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { Strings } from "@/constants/Strings";
import { Tractor, TractorService, TripData } from "@/services/api";

import { useTractors } from "@/context/TractorContext";

export default function AddTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    tractors,
    loading: contextLoading,
    setTractors,
  } = useTractors();

  const [selectedTractorId, setSelectedTractorId] = useState<number | null>(
    params.tractorId
      ? Number(params.tractorId)
      : params.preSelectedId
      ? Number(params.preSelectedId)
      : null
  );

  const [slipNumber, setSlipNumber] = useState("");
  const [weight, setWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [diesel, setDiesel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = params.editMode === "true";
  const primaryColor = Colors.light?.emerald800 || "#2b8a3e";

  // --- 1. GET CURRENT TRACTOR & FACTORY DATA ---
  const activeTractor = useMemo(() => {
    return tractors.find((t) => t.id === selectedTractorId) || null;
  }, [selectedTractorId, tractors]);

  const activeFactory = activeTractor?.karkhana || null;

  useEffect(() => {
    if (isEditMode) {
      setSlipNumber((params.slip as string) || "");
      setWeight((params.weight as string) || "");
      setDistance((params.distance as string) || "");
      setDiesel((params.diesel as string) || "");
      setSelectedTractorId(Number(params.tractorId));
    } else if (params.preSelectedId) {
      const exists = tractors.find(
        (t) => t.id === Number(params.preSelectedId)
      );
      if (exists) setSelectedTractorId(exists.id);
    }
  }, [params.editMode, tractors]);

  // --- 2. CALCULATIONS (Memoized for immediate updates) ---
  const calculation = useMemo(() => {
    // Default values if no factory assigned
    const currentTodniRate = activeFactory?.todniRate || 0;
    const currentDieselRate = activeFactory?.dieselRate || 0;
    const threshold = activeFactory?.distanceThreshold || 25;
    
    // Parse Inputs
    const weightNum = parseFloat(weight) || 0;
    const distanceNum = parseFloat(distance) || 0;
    const dieselNum = parseFloat(diesel) || 0;

    // A. Transport Rate Logic (Tiered)
    const isLongDistance = distanceNum > threshold;
    const transportRate = isLongDistance 
      ? (activeFactory?.vahatukRateLong || 0)
      : (activeFactory?.vahatukRateShort || 0);

    // B. Gross Income
    const cuttingIncome = weightNum * currentTodniRate;
    const transportIncome = weightNum * transportRate;
    
    // C. Deductions - Diesel
    const dieselCost = dieselNum * currentDieselRate;
    
    // D. Deductions - Commissions
    const todniCommPercent = activeFactory?.todniCommRate || 0;
    const transportCommPercent = activeFactory?.vahatukCommRate || 0;

    const todniCommAmount = cuttingIncome * (todniCommPercent / 100);
    const transportCommAmount = transportIncome * (transportCommPercent / 100);
    const totalCommission = todniCommAmount + transportCommAmount;

    // E. Net Profit
    const netTripProfit = cuttingIncome + transportIncome - dieselCost + totalCommission;

    return {
      weightNum,
      distanceNum,
      dieselNum,
      cuttingIncome,
      transportIncome,
      dieselCost,
      todniCommAmount,
      transportCommAmount,
      todniCommPercent,
      transportCommPercent,
      totalCommission,
      netTripProfit,
      isLongDistance,
      currentTodniRate, 
      transportRate
    };
  }, [weight, distance, diesel, activeFactory]);


  const handleSubmit = async () => {
    if (!selectedTractorId || !slipNumber || !weight || !distance) {
      Alert.alert(
        "माहिती अपूर्ण आहे",
        "कृपया ट्रॅक्टर, स्लिप नंबर, वजन आणि अंतर भरा."
      );
      return;
    }

    if (!activeFactory) {
      Alert.alert("त्रुटी", "निवडलेल्या ट्रॅक्टरला कारखाना जोडलेला नाही.");
      return;
    }

    const tripPayload = {
      tractorId: selectedTractorId,
      slipNumber,
      netWeight: calculation.weightNum,
      distance: calculation.distanceNum,
      dieselLiters: calculation.dieselNum,
      cuttingIncome: calculation.cuttingIncome,
      transportIncome: calculation.transportIncome,
      cuttingCommission: calculation.todniCommAmount,
      transportCommission: calculation.transportCommAmount,
      dieselCost: calculation.dieselCost,
      netTripProfit: calculation.netTripProfit,
      date: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);

      let savedTrip: TripData | null = null;

      if (isEditMode && params.tripId) {
        savedTrip = await TractorService.updateTrip(
          Number(params.tripId),
          tripPayload
        );
      } else {
        savedTrip = await TractorService.addTrip(tripPayload);
      }

      if (savedTrip) {
        setTractors((prev) =>
          prev.map((t) => {
            if (t.id === selectedTractorId) {
              // 1. Update trips list
              const updatedTrips = isEditMode
                ? t.trips.map((tr) => (tr.id === savedTrip!.id ? savedTrip! : tr))
                : [savedTrip!, ...t.trips];

              // 2. Update Last Trip (Fixing Type Error)
              let updatedLastTrip = t.lastTrip;
              
              if (!isEditMode) {
                 // New trip is always latest
                 updatedLastTrip = {
                    id: savedTrip!.id,
                    weight: savedTrip!.netWeight,     // Map netWeight -> weight
                    date: savedTrip!.date,
                    profit: savedTrip!.netTripProfit  // Map netTripProfit -> profit
                 };
              } else if (t.lastTrip?.id === savedTrip!.id) {
                 // Editing the most recent trip
                 updatedLastTrip = {
                    id: savedTrip!.id,
                    weight: savedTrip!.netWeight,
                    date: savedTrip!.date,
                    profit: savedTrip!.netTripProfit
                 };
              }

              return {
                ...t,
                trips: updatedTrips,
                lastTrip: updatedLastTrip
              };
            }
            return t;
          })
        );
        Alert.alert("यशस्वी", "ट्रिप जतन केली!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("त्रुटी", "सर्व्हरने माहिती स्वीकारली नाही.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("त्रुटी", "माहिती जतन करताना समस्या आली.");
    } finally {
      setIsSubmitting(false);
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
          title: isEditMode ? "ट्रिप दुरुस्त करा" : Strings.addTripTitle,
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TRACTOR SELECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>
            {Strings.selectTractor || "ट्रॅक्टर निवडा"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tractorScroll}
          >
            {tractors.map((tractor) => {
              const isSelected = selectedTractorId === tractor.id;
              return (
                <TouchableOpacity
                  key={tractor.id}
                  style={[
                    styles.tractorCard,
                    isSelected && styles.tractorCardSelected,
                  ]}
                  onPress={() => setSelectedTractorId(tractor.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.2)"
                          : "#F0FDF4",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="tractor"
                      size={24}
                      color={isSelected ? "#fff" : primaryColor}
                    />
                  </View>
                  <Text
                    style={[
                      styles.tractorPlate,
                      isSelected && styles.textSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {tractor.plateNumber}
                  </Text>
                  <Text
                    style={[
                      styles.tractorDriver,
                      isSelected && styles.textSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {tractor.karkhana?.name || "No Factory"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. FORM FIELDS */}
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {Strings.slipNumber || "स्लिप नंबर"}{" "}
              <Text style={{ color: "red" }}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="उदा: 1234"
                keyboardType="numeric"
                value={slipNumber}
                onChangeText={setSlipNumber}
              />
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>
                {Strings.weight || "वजन"} (Tons){" "}
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="weight-kilogram"
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: primaryColor, fontWeight: "bold" },
                  ]}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>
                {Strings.distance || "अंतर"} (km){" "}
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={distance}
                  onChangeText={setDistance}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Diesel Row - Now Full Width since Bonus is gone, or keep it consistent */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>
                {Strings.diesel || "डिझेल"} (Ltr){" "}
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="gas-station"
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={diesel}
                  onChangeText={setDiesel}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 3. RECEIPT PREVIEW (ESTIMATE) */}
        <View style={styles.receiptCard}>
          <Text style={styles.receiptTitle}>अंदाजित पावती (ESTIMATE)</Text>
          <View style={styles.dashedLine} />
          
          {/* Incomes */}
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>तोडणी उत्पन्न ({calculation.currentTodniRate} ₹)</Text>
            <Text style={[styles.receiptValue, { color: "#2E7D32" }]}>
             + ₹ {calculation.cuttingIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>वाहतूक उत्पन्न ({calculation.transportRate} ₹)</Text>
            <Text style={[styles.receiptValue, { color: "#2E7D32" }]}>
             + ₹ {calculation.transportIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>

          {/* Diesel Deduction */}
          {calculation.dieselNum > 0 && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>
                डिझेल खर्च ({activeFactory?.dieselRate} ₹)
              </Text>
              <Text style={[styles.receiptValue, { color: "#C62828" }]}>
                - ₹ {calculation.dieselCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          )}

          {/* Commission Deductions (Breakdown) */}
          {activeFactory && (
            <>
                <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>तोडणी कमिशन ({calculation.todniCommPercent}%)</Text>
                    <Text style={[styles.receiptValue, { color: "#2E7D32" }]}>
                    + ₹ {calculation.todniCommAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </Text>
                </View>
                <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>वाहतूक कमिशन ({calculation.transportCommPercent}%)</Text>
                    <Text style={[styles.receiptValue, { color: "#2E7D32" }]}>
                    + ₹ {calculation.transportCommAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </Text>
                </View>
            </>
          )}

          <View style={styles.solidLine} />
          
          {/* Net Profit */}
          <View style={styles.receiptRow}>
            <Text style={styles.totalLabel}>एकूण नफा</Text>
            <Text style={[styles.totalValue, { color: primaryColor }]}>
              ₹ {calculation.netTripProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.actionText}>
                {isEditMode
                  ? "अपडेट करा"
                  : Strings.submitTrip || "ट्रिप जतन करा"}
              </Text>
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
  scrollContent: { padding: 20 },
  sectionContainer: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  tractorScroll: { paddingRight: 20 },
  tractorCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginRight: 16,
    width: 200,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
    alignItems: "center",
    elevation: 2,
  },
  tractorCardSelected: { backgroundColor: "#2b8a3e", borderColor: "#2b8a3e" },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  tractorPlate: { fontSize: 16, fontWeight: "bold", color: "#333" },
  tractorDriver: { fontSize: 13, color: "#666", marginTop: 4 },
  textSelected: { color: "#fff" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  inputContainer: { marginBottom: 0 },
  label: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#111" },
  row: { flexDirection: "row" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 16 },
  receiptCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 72,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  receiptTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
  },
  dashedLine: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  receiptLabel: { fontSize: 14, color: "#555" },
  receiptValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  solidLine: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: "900", color: "#333" },
  totalValue: { fontSize: 20, fontWeight: "900" },
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
});