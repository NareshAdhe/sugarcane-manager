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
  StatusBar,
  Modal,
  FlatList,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TractorService, Tractor } from "@/services/api";
import { Colors } from "@/constants/theme";

import { useTractors } from "@/context/TractorContext";

export default function AddTractorScreen() {
  const router = useRouter();

  // ✅ Fixed: Destructure 'karkhanas' so the list isn't undefined
  const { setTractors, loading: contextLoading, karkhanas } = useTractors();

  const [saving, setSaving] = useState(false);

  // Form State
  const [plateNumber, setPlateNumber] = useState("");
  const [modelName, setModelName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [mukadamName, setMukadamName] = useState("");
  const [mukadamPhone, setMukadamPhone] = useState("");

  // Factory Selection State
  const [showFactoryPicker, setShowFactoryPicker] = useState(false);
  const [selectedKarkhanaId, setSelectedKarkhanaId] = useState<number | null>(null);
  const [selectedKarkhanaName, setSelectedKarkhanaName] = useState("");

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

  const handleFactorySelect = (factory: any) => {
    setSelectedKarkhanaId(factory.id);
    setSelectedKarkhanaName(factory.name);
    setShowFactoryPicker(false);
  };

  const handleSave = async () => {
    // 1. Validate Factory Selection
    if (!selectedKarkhanaId) {
      Alert.alert("निवड आवश्यक", "कृपया आधी कारखाना निवडा (Select Factory)");
      return;
    }

    // 2. Validate Text Fields
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
      // 3. Include karkhanaId in payload
      const newTractor = (await TractorService.create({
        plateNumber,
        modelName,
        karkhanaId: selectedKarkhanaId, // ✅ Important: Link tractor to factory
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
            // Helper to prevent UI crashes if backend doesn't return the full object immediately
            karkhana: karkhanas.find(k => k.id === selectedKarkhanaId),
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

  const renderFactoryModal = () => (
    <Modal
      visible={showFactoryPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFactoryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              कारखाना निवडा (Select Factory)
            </Text>
            <TouchableOpacity onPress={() => setShowFactoryPicker(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={karkhanas || []} // Safety check
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.factoryItem,
                  selectedKarkhanaId === item.id && styles.factoryItemActive,
                ]}
                onPress={() => handleFactorySelect(item)}
              >
                <View style={styles.factoryIconBox}>
                  <Text style={styles.factoryIconText}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.factoryItemText,
                    selectedKarkhanaId === item.id &&
                      styles.factoryItemTextActive,
                  ]}
                >
                  {item.name}
                </Text>
                {selectedKarkhanaId === item.id && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={primaryColor}
                  />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", padding: 20, color: "#94A3B8" }}>
                कोणताही कारखाना उपलब्ध नाही. आधी कारखाना जोडा.
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );

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
        {/* Render the Modal (invisible until clicked) */}
        {renderFactoryModal()}

        {/* SECTION 1: FACTORY SELECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>असाइनमेंट (ASSIGNMENT)</Text>
          <View style={styles.card}>
            <Text style={styles.label}>
              कोणत्या कारखान्यासाठी? (Select Factory){" "}
              <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowFactoryPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.selectContent}>
                <View style={styles.inputIcon}>
                  <MaterialCommunityIcons
                    name="domain"
                    size={20}
                    color={selectedKarkhanaName ? primaryColor : "#64748B"}
                  />
                </View>
                <Text
                  style={[
                    styles.selectText,
                    !selectedKarkhanaName && { color: "#94A3B8" },
                  ]}
                >
                  {selectedKarkhanaName || "कारखाना निवडा..."}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="#94A3B8"
                style={{ marginRight: 12 }}
              />
            </TouchableOpacity>
          </View>
        </View>

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
  // ✅ Increased padding bottom to 120 so content scrolls above the footer
  form: { padding: 16, paddingBottom: 120 },
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
    elevation: 10, // Shadow for Android
    zIndex: 10,    // Layer order for iOS
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
  section: { marginBottom: 24 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 1,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 },

  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 50,
  },
  selectContent: { flexDirection: "row", alignItems: "center" },
  inputIcon: { paddingHorizontal: 12 },
  selectText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  factoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  factoryItemActive: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  factoryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  factoryIconText: { fontWeight: "700", color: "#475569" },
  factoryItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  factoryItemTextActive: { color: "#065f46", fontWeight: "800" },
});