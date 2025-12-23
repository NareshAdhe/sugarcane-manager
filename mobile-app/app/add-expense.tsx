import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TractorService, Tractor, Expense } from "@/services/api";
import { Colors } from "@/constants/theme";

import { useTractors } from "@/context/TractorContext";

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { setTractors } = useTractors();

  const primaryColor = Colors.light?.emerald800 || "#064e3b";
  const lightEmerald = "#ecfdf5";

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("MAINTENANCE");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    {
      label: "मेंटेनन्स (Maintenance)",
      value: "MAINTENANCE",
      icon: "wrench-outline",
    },
    {
      label: "ड्रायव्हर (Driver)",
      value: "DRIVER_AMOUNT",
      icon: "account-cash-outline",
    },
    {
      label: "मुकादम (Mukadam)",
      value: "MUKADAM_AMOUNT",
      icon: "account-tie-outline",
    },
  ];

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("माहिती भरा", "कृपया खर्चाची रक्कम टाका");
      return;
    }

    setIsSaving(true);
    try {
      const savedExpense = (await TractorService.addExpense(Number(id), {
        amount: parseFloat(amount),
        type: type as any,
        description: description,
        date: new Date().toISOString(),
      })) as Expense | null;

      if (savedExpense) {
        setTractors((prevTractors: Tractor[]) =>
          prevTractors.map((t: Tractor): Tractor => {
            if (t.id === Number(id)) {
              const expenseWithPerson = {
                ...savedExpense,
                description: description,
                driver:
                  type === "DRIVER_AMOUNT"
                    ? { name: t.driver?.name || "N/A" }
                    : null,
                mukadam:
                  type === "MUKADAM_AMOUNT"
                    ? { name: t.mukadam?.name || "N/A" }
                    : null,
              };

              const updatedDriver =
                type === "DRIVER_AMOUNT"
                  ? {
                      ...t.driver,
                      id: t.driver?.id || 0,
                      totalAdvanceGiven:
                        (t.driver?.totalAdvanceGiven || 0) +
                        savedExpense.amount,
                      name: t.driver?.name || "N/A",
                      phone: t.driver?.phone,
                    }
                  : t.driver;

              const updatedMukadam =
                type === "MUKADAM_AMOUNT"
                  ? {
                      ...t.mukadam,
                      id: t.mukadam?.id || 0,
                      totalAdvanceGiven:
                        (t.mukadam?.totalAdvanceGiven || 0) +
                        savedExpense.amount,
                      name: t.mukadam?.name || "N/A",
                      phone: t.mukadam?.phone,
                    }
                  : t.mukadam;

              return {
                ...t,
                expenses: [expenseWithPerson as any, ...(t.expenses || [])],
                driver: updatedDriver as any,
                mukadam: updatedMukadam as any,
                lastExpense: {
                  id: savedExpense.id,
                  amount: savedExpense.amount,
                  type: savedExpense.type,
                  date: savedExpense.date,
                },
              };
            }
            return t;
          })
        );

        Alert.alert(
          "यशस्वी (Success)",
          "खर्च यशस्वीरित्या जतन केला आहे!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (e) {
      console.error("Save Error:", e);
      Alert.alert("त्रुटी", "खर्च साठवता आला नाही");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: primaryColor }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={primaryColor}
        translucent={true}
      />

      <Stack.Screen
        options={{
          title: "नवीन खर्च जोडा (Expense)",
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainCard}>
            <Text style={styles.inputLabel}>एकूण रक्कम (Total Amount)</Text>
            <View style={styles.amountContainer}>
              <View style={styles.amountRow}>
                <Text style={[styles.currencySymbol, { color: primaryColor }]}>
                  ₹
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: primaryColor }]}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#cbd5e1"
                  autoFocus
                  selectionColor={primaryColor}
                  multiline={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.descriptionCard}>
            <Text style={styles.inputLabel}>तपशील (Description)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="उदा. टायर दुरुस्ती, ऑइल चेंज इ."
              placeholderTextColor="#94A3B8"
              selectionColor={primaryColor}
            />
          </View>

          <Text style={styles.sectionTitle}>खर्चाचा प्रकार निवडा</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => {
              const isSelected = type === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setType(cat.value)}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryCard,
                    isSelected && {
                      borderColor: primaryColor,
                      backgroundColor: lightEmerald,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      isSelected && { backgroundColor: primaryColor },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={26}
                      color={isSelected ? "#fff" : "#64748b"}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && { color: primaryColor },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && { borderColor: primaryColor },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: primaryColor },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: primaryColor }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveBtnText}>खर्च साठवा (Save Expense)</Text>
              <MaterialCommunityIcons name="check-all" size={24} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfdfd" },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  brandHeader: {
    height: 120,
    alignItems: "center",
    paddingTop: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  plateBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 4,
  },
  plateText: { fontWeight: "900", fontSize: 18, letterSpacing: 1 },
  headerTitle: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: "600",
  },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 40 },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    marginBottom: 24,
    alignItems: "center",
  },
  amountContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
    paddingHorizontal: 10,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: "900",
    marginRight: 8,
    marginTop: 4,
  },
  amountInput: {
    fontSize: 42,
    fontWeight: "900",
    paddingVertical: 8,
    marginRight: 24,
    textAlign: "left",
    minWidth: 40,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 15,
    marginLeft: 5,
  },
  categoryContainer: { gap: 12 },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ccd0d4ff",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryInfo: { flex: 1 },
  categoryLabel: { fontSize: 15, fontWeight: "700", color: "#47556b" },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccd0d4ff",
  },
  saveBtn: {
    height: 60,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 4,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  descriptionInput: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
});
