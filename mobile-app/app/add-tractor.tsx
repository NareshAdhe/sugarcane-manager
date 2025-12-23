import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TractorService, Tractor } from "@/services/api";
import { Colors } from "@/constants/theme";

import { useTractors } from "@/context/TractorContext";

export default function AddTractorScreen() {
  const router = useRouter();

  const { setTractors, loading: contextLoading } = useTractors();

  const [saving, setSaving] = useState(false);

  const [plateNumber, setPlateNumber] = useState("");
  const [modelName, setModelName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [mukadamName, setMukadamName] = useState("");
  const [mukadamPhone, setMukadamPhone] = useState("");

  const primaryColor = Colors.light?.emerald800 || "#065f46";

  const formatPlateNumber = (text: string) => {
    const cleaned = text.replace(/-/g, "").toUpperCase();
    let result = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i === 2 || i === 4 || i === 6) {
        result += "-";
      }
      result += cleaned[i];
      if (result.length >= 13) break;
    }
    return result;
  };

  const handlePlateChange = (text: string) => {
    const formatted = formatPlateNumber(text);
    setPlateNumber(formatted);
  };

  const handleSave = async () => {
    if (
      !plateNumber ||
      !modelName ||
      !driverName ||
      !driverPhone ||
      !mukadamName ||
      !mukadamPhone
    ) {
      Alert.alert("माहिती अपूर्ण", "कृपया लाल फुली (*) असलेली माहिती भरा");
      return;
    }

    setSaving(true);
    try {
      const newTractor = (await TractorService.create({
        plateNumber,
        modelName,
        driver: { name: driverName, phone: driverPhone },
        mukadam: { name: mukadamName, phone: mukadamPhone },
      })) as Tractor | null;

      if (newTractor) {
        setTractors((prevTractors: Tractor[]) => [
          ...prevTractors,
          {
            ...newTractor,
            driverName: newTractor.driver?.name || "No Driver",
            mukadamName: newTractor.mukadam?.name || "No Mukadam",
            trips: [],
            expenses: [],
            lastTrip: null,
            lastExpense: null,
          },
        ]);

        Alert.alert("यशस्वी", "नवीन ट्रॅक्टर यशस्वीरित्या जोडला!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Create error:", error);
      Alert.alert("त्रुटी", "ट्रॅक्टर साठवताना अडचण आली");
    } finally {
      setSaving(false);
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
          title: "नवीन ट्रॅक्टर (New Tractor)",
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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {renderHeader}
      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
              <MaterialCommunityIcons
                name="tractor"
                size={22}
                color={primaryColor}
              />
            </View>
            <Text style={styles.cardTitle}>ट्रॅक्टर तपशील</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              प्लेट नंबर <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={plateNumber}
              onChangeText={handlePlateChange}
              placeholder="उदा. MH-21-AN-4560"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              maxLength={13}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              मॉडेल नाव <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={modelName}
              onChangeText={setModelName}
              placeholder="उदा. Mahindra Arjun"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
              <MaterialCommunityIcons
                name="account"
                size={22}
                color="#2563EB"
              />
            </View>
            <Text style={styles.cardTitle}>ड्रायव्हर माहिती</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              पूर्ण नाव <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={driverName}
              onChangeText={setDriverName}
              placeholder="ड्रायव्हरचे नाव"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              फोन नंबर <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={driverPhone}
              onChangeText={setDriverPhone}
              placeholder="मोबाइल नंबर"
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FFF7ED" }]}>
              <MaterialCommunityIcons
                name="account-tie"
                size={22}
                color="#EA580C"
              />
            </View>
            <Text style={styles.cardTitle}>मुकादम माहिती</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              पूर्ण नाव <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={mukadamName}
              onChangeText={setMukadamName}
              placeholder="मुकादमचे नाव"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              फोन नंबर <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={mukadamPhone}
              onChangeText={setMukadamPhone}
              placeholder="मोबाइल नंबर"
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.actionText}>ट्रॅक्टर साठवा (Save)</Text>
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
  form: { padding: 16, paddingBottom: 64 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 12,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  saveButton: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
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
