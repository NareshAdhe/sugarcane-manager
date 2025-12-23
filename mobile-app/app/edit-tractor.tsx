import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TractorService, Tractor } from "@/services/api";
import { Colors } from "@/constants/theme";

import { useTractors } from "@/context/TractorContext";

export default function EditTractorScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // 1. Destructure tractors from Context
  const { tractors, setTractors, loading: contextLoading } = useTractors();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [plateNumber, setPlateNumber] = useState("");
  const [modelName, setModelName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [mukadamName, setMukadamName] = useState("");
  const [mukadamPhone, setMukadamPhone] = useState("");
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [isNewMukadam, setIsNewMukadam] = useState(false);
  const [originalDriver, setOriginalDriver] = useState({ name: "", phone: "" });
  const [originalMukadam, setOriginalMukadam] = useState({
    name: "",
    phone: "",
  });

  const primaryColor = Colors.light?.emerald800 || "#065f46";

  useEffect(() => {
    const currentTractor = tractors.find((t) => t.id === Number(id));

    if (currentTractor) {
      setPlateNumber(currentTractor.plateNumber || "");
      setModelName(currentTractor.modelName || "");

      const dName = currentTractor.driverName || "";
      const dPhone = currentTractor.driver?.phone || "";
      const mName = currentTractor.mukadamName || "";
      const mPhone = currentTractor.mukadam?.phone || "";

      setDriverName(dName);
      setDriverPhone(dPhone);
      setMukadamName(mName);
      setMukadamPhone(mPhone);

      setOriginalDriver({ name: dName, phone: dPhone });
      setOriginalMukadam({ name: mName, phone: mPhone });

      setLoading(false);
    } else {
      Alert.alert("Error", "ट्रॅक्टरची माहिती सापडली नाही");
      router.back();
    }
  }, [id, tractors]);

  const formatPlateNumber = (text: string) => {
    const cleaned = text.replace(/-/g, "").toUpperCase();
    let result = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i === 2 || i === 4 || i === 6) result += "-";
      result += cleaned[i];
      if (result.length >= 13) break;
    }
    return result;
  };

  const handlePlateChange = (text: string) => {
    const formatted = formatPlateNumber(text);
    setPlateNumber(formatted);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updatePayload = {
        plateNumber,
        modelName,
        driver: {
          name: driverName,
          phone: driverPhone,
          isReplacement: isNewDriver,
        },
        mukadam: {
          name: mukadamName,
          phone: mukadamPhone,
          isReplacement: isNewMukadam,
        },
      };

      const updatedData = await TractorService.update(
        Number(id),
        updatePayload
      );

      if (updatedData) {
        setTractors((prevTractors: Tractor[]) =>
          prevTractors.map((t: Tractor): Tractor => {
            if (t.id === Number(id)) {
              return {
                ...t,
                plateNumber: plateNumber,
                modelName: modelName,
                driverName: driverName,
                mukadamName: mukadamName,
                driver: {
                  ...t.driver,
                  id: t.driver?.id || 0,
                  name: driverName,
                  phone: driverPhone,
                  totalAdvanceGiven: t.driver?.totalAdvanceGiven || 0,
                },
                mukadam: {
                  ...t.mukadam,
                  id: t.mukadam?.id || 0,
                  name: mukadamName,
                  phone: mukadamPhone,
                  totalAdvanceGiven: t.mukadam?.totalAdvanceGiven || 0,
                },
              };
            }
            return t;
          })
        );

        Alert.alert("यशस्वी", "माहिती यशस्वीरित्या बदलली!");
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "बदल जतन करता आले नाहीत");
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = (
    <>
      <View style={{ backgroundColor: primaryColor }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={primaryColor}
        translucent={true}
      />
      <Stack.Screen
        options={{
          title: "माहिती दुरुस्त करा (Update)",
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
            <Text style={styles.inputLabel}>प्लेट नंबर</Text>
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
            <Text style={styles.inputLabel}>मॉडेल नाव</Text>
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
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
                <MaterialCommunityIcons
                  name={isNewDriver ? "account-plus" : "account"}
                  size={22}
                  color="#2563EB"
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.cardTitle}>ड्रायव्हर माहिती</Text>
                {isNewDriver && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#2563EB",
                      fontWeight: "700",
                    }}
                  >
                    (नवा ड्रायव्हर जोडला जात आहे)
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!isNewDriver) {
                  setDriverName("");
                  setDriverPhone("");
                  setIsNewDriver(true);
                } else {
                  setDriverName(originalDriver.name);
                  setDriverPhone(originalDriver.phone);
                  setIsNewDriver(false);
                }
              }}
              style={[
                styles.replaceBtn,
                isNewDriver && {
                  backgroundColor: "#EFF6FF",
                  borderColor: "#2563EB",
                },
              ]}
            >
              <Text
                style={[
                  styles.replaceBtnText,
                  isNewDriver && { color: "#2563EB" },
                ]}
              >
                {isNewDriver ? "रद्द करा" : "ड्रायव्हर बदला"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              पूर्ण नाव {isNewDriver && <Text style={{ color: "red" }}>*</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                isNewDriver && { borderColor: "#2563EB", borderWidth: 1 },
              ]}
              value={driverName}
              onChangeText={setDriverName}
              placeholder="ड्रायव्हरचे नाव"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              फोन नंबर {isNewDriver && <Text style={{ color: "red" }}>*</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                isNewDriver && { borderColor: "#2563EB", borderWidth: 1 },
              ]}
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
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#FFF7ED" }]}>
                <MaterialCommunityIcons
                  name={isNewMukadam ? "account-multiple-plus" : "account-tie"}
                  size={22}
                  color="#EA580C"
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.cardTitle}>मुकादम माहिती</Text>
                {isNewMukadam && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                    }}
                  >
                    (नवा मुकादम जोडला जात आहे)
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!isNewMukadam) {
                  setMukadamName("");
                  setMukadamPhone("");
                  setIsNewMukadam(true);
                } else {
                  setMukadamName(originalMukadam.name);
                  setMukadamPhone(originalMukadam.phone);
                  setIsNewMukadam(false);
                }
              }}
              style={[
                styles.replaceBtn,
                isNewMukadam && {
                  backgroundColor: "#FFF7ED",
                  borderColor: "#EA580C",
                },
              ]}
            >
              <Text
                style={[
                  styles.replaceBtnText,
                  isNewMukadam && { color: "#EA580C" },
                ]}
              >
                {isNewMukadam ? "रद्द करा" : "मुकादम बदला"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              पूर्ण नाव{" "}
              {isNewMukadam && <Text style={{ color: "red" }}>*</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                isNewMukadam && { borderColor: "#EA580C", borderWidth: 1 },
              ]}
              value={mukadamName}
              onChangeText={setMukadamName}
              placeholder="मुकादमचे नाव"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              फोन नंबर {isNewMukadam && <Text style={{ color: "red" }}>*</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                isNewMukadam && { borderColor: "#EA580C", borderWidth: 1 },
              ]}
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
          onPress={handleUpdate}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.actionText}>बदल जतन करा</Text>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  form: { padding: 16, paddingBottom: 64 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 20,
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
    paddingBottom: 28,
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  replaceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  replaceBtnText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
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
