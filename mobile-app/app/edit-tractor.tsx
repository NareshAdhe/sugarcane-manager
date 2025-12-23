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
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TractorService, Tractor } from "@/services/api";
import { Colors } from "@/constants/theme";
import { useTractors } from "@/context/TractorContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTractorScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Get Context Data (Tractors & Karkhanas)
  const { tractors, setTractors, karkhanas } = useTractors();

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // --- STATES ---
  const [plateNumber, setPlateNumber] = useState("");
  const [modelName, setModelName] = useState("");
  
  // Factory State
  const [showFactoryPicker, setShowFactoryPicker] = useState(false);
  const [selectedKarkhanaId, setSelectedKarkhanaId] = useState<number | null>(null);
  const [selectedKarkhanaName, setSelectedKarkhanaName] = useState("");

  // Driver State
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [originalDriver, setOriginalDriver] = useState({ name: "", phone: "" });

  // Mukadam State
  const [mukadamName, setMukadamName] = useState("");
  const [mukadamPhone, setMukadamPhone] = useState("");
  const [isNewMukadam, setIsNewMukadam] = useState(false);
  const [originalMukadam, setOriginalMukadam] = useState({ name: "", phone: "" });

  const primaryColor = Colors.light?.emerald800 || "#065f46";

  // --- LOAD DATA ---
  useEffect(() => {
    const currentTractor = tractors.find((t) => t.id === Number(id));

    if (currentTractor) {
      setPlateNumber(currentTractor.plateNumber || "");
      setModelName(currentTractor.modelName || "");

      // Load Factory
      if (currentTractor.karkhana) {
        setSelectedKarkhanaId(currentTractor.karkhana.id);
        setSelectedKarkhanaName(currentTractor.karkhana.name);
      }

      // Load Driver
      const dName = currentTractor.driverName || "";
      const dPhone = currentTractor.driver?.phone || "";
      setDriverName(dName);
      setDriverPhone(dPhone);
      setOriginalDriver({ name: dName, phone: dPhone });

      // Load Mukadam
      const mName = currentTractor.mukadamName || "";
      const mPhone = currentTractor.mukadam?.phone || "";
      setMukadamName(mName);
      setMukadamPhone(mPhone);
      setOriginalMukadam({ name: mName, phone: mPhone });

      setLoadingData(false);
    } else {
      Alert.alert("Error", "ट्रॅक्टर सापडला नाही");
      router.back();
    }
  }, [id, tractors]);

  // --- HANDLERS ---
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
    setPlateNumber(formatPlateNumber(text));
  };

  const handleFactorySelect = (factory: any) => {
    setSelectedKarkhanaId(factory.id);
    setSelectedKarkhanaName(factory.name);
    setShowFactoryPicker(false);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updatePayload = {
        plateNumber,
        modelName,
        karkhanaId: selectedKarkhanaId, // Update Factory
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

      const updatedData = await TractorService.update(Number(id), updatePayload);

      if (updatedData) {
        setTractors((prevTractors: Tractor[]) =>
          prevTractors.map((t: Tractor): Tractor => {
            if (t.id === Number(id)) {
              return {
                ...t,
                plateNumber,
                modelName,
                karkhana: karkhanas.find(k => k.id === selectedKarkhanaId), // Update Local Factory
                driverName,
                mukadamName,
                // ✅ TS Fix: Fallback to 0 if ID/Advance is undefined
                driver: { 
                    id: t.driver?.id || 0,
                    name: driverName, 
                    phone: driverPhone, 
                    totalAdvanceGiven: t.driver?.totalAdvanceGiven || 0 
                },
                mukadam: { 
                    id: t.mukadam?.id || 0,
                    name: mukadamName, 
                    phone: mukadamPhone, 
                    totalAdvanceGiven: t.mukadam?.totalAdvanceGiven || 0
                },
              };
            }
            return t;
          })
        );

        Alert.alert("यशस्वी", "ट्रॅक्टर माहिती अपडेट झाली!", [{ text: "OK", onPress: () => router.back() }]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "बदल जतन करता आले नाहीत");
    } finally {
      setSaving(false);
    }
  };

  // --- RENDER FACTORY MODAL ---
  const renderFactoryModal = () => (
    <Modal visible={showFactoryPicker} transparent={true} animationType="slide" onRequestClose={() => setShowFactoryPicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>कारखाना निवडा (Select Factory)</Text>
            <TouchableOpacity onPress={() => setShowFactoryPicker(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={karkhanas || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.factoryItem, selectedKarkhanaId === item.id && styles.factoryItemActive]} 
                onPress={() => handleFactorySelect(item)}
              >
                <View style={styles.factoryIconBox}><Text style={styles.factoryIconText}>{item.name.charAt(0)}</Text></View>
                <Text style={[styles.factoryItemText, selectedKarkhanaId === item.id && styles.factoryItemTextActive]}>{item.name}</Text>
                {selectedKarkhanaId === item.id && <MaterialCommunityIcons name="check" size={20} color={primaryColor} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  if (loadingData) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} translucent={true} />
      
      <Stack.Screen
        options={{
          headerShown: true,
          title: "ट्रॅक्टर एडिट (Edit Tractor)",
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0, marginRight: 28 }}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {renderFactoryModal()}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          
          {/* SECTION 1: FACTORY */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>असाइनमेंट (ASSIGNMENT)</Text>
            <View style={styles.card}>
                <Text style={styles.label}>सध्याचा कारखाना <Text style={{ color: "#EF4444" }}>*</Text></Text>
                <TouchableOpacity style={styles.selectButton} onPress={() => setShowFactoryPicker(true)} activeOpacity={0.7}>
                    <View style={styles.selectContent}>
                        <View style={styles.inputIcon}>
                            <MaterialCommunityIcons name="domain" size={20} color={selectedKarkhanaName ? primaryColor : "#64748B"} />
                        </View>
                        <Text style={[styles.selectText, !selectedKarkhanaName && { color: "#94A3B8" }]}>
                            {selectedKarkhanaName || "कारखाना निवडा..."}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#94A3B8" style={{ marginRight: 12 }} />
                </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 2: DETAILS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <MaterialCommunityIcons name="tractor" size={22} color={primaryColor} />
                </View>
                <Text style={styles.cardTitle}>ट्रॅक्टर तपशील</Text>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>प्लेट नंबर</Text>
                <TextInput style={styles.input} value={plateNumber} onChangeText={handlePlateChange} autoCapitalize="characters" maxLength={13} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>मॉडेल नाव</Text>
                <TextInput style={styles.input} value={modelName} onChangeText={setModelName} />
            </View>
          </View>

          {/* SECTION 3: DRIVER (With Replace Logic) */}
          <View style={styles.card}>
             <View style={[styles.cardHeader, {justifyContent: 'space-between'}]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
                        <MaterialCommunityIcons name={isNewDriver ? "account-plus" : "account"} size={22} color="#2563EB" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>ड्रायव्हर माहिती</Text>
                        {isNewDriver && <Text style={{fontSize: 10, color: '#2563EB', fontWeight: 'bold', marginLeft: 12}}>नवीन ड्रायव्हर जोडत आहे</Text>}
                    </View>
                </View>
                {/* Replace Button */}
                <TouchableOpacity 
                    style={[styles.replaceBtn, isNewDriver && styles.replaceBtnActive]}
                    onPress={() => {
                        if(!isNewDriver) { setDriverName(""); setDriverPhone(""); setIsNewDriver(true); }
                        else { setDriverName(originalDriver.name); setDriverPhone(originalDriver.phone); setIsNewDriver(false); }
                    }}
                >
                    <Text style={[styles.replaceBtnText, isNewDriver && {color: '#2563EB'}]}>
                        {isNewDriver ? "रद्द करा" : "ड्रायव्हर बदला"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>पूर्ण नाव</Text>
                <TextInput 
                    style={[styles.input, isNewDriver && styles.inputHighlight]} 
                    value={driverName} onChangeText={setDriverName} placeholder="Driver Name" placeholderTextColor="#94A3B8" 
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>फोन नंबर</Text>
                <TextInput 
                    style={[styles.input, isNewDriver && styles.inputHighlight]} 
                    value={driverPhone} onChangeText={setDriverPhone} keyboardType="phone-pad" maxLength={10} placeholder="Phone No" placeholderTextColor="#94A3B8" 
                />
            </View>
          </View>

          {/* SECTION 4: MUKADAM (With Replace Logic) */}
          <View style={styles.card}>
             <View style={[styles.cardHeader, {justifyContent: 'space-between'}]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[styles.iconCircle, { backgroundColor: "#FFF7ED" }]}>
                        <MaterialCommunityIcons name={isNewMukadam ? "account-multiple-plus" : "account-tie"} size={22} color="#EA580C" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>मुकादम माहिती</Text>
                        {isNewMukadam && <Text style={{fontSize: 10, color: '#EA580C', fontWeight: 'bold', marginLeft: 12}}>नवीन मुकादम जोडत आहे</Text>}
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.replaceBtn, isNewMukadam && styles.replaceBtnActiveMukadam]}
                    onPress={() => {
                        if(!isNewMukadam) { setMukadamName(""); setMukadamPhone(""); setIsNewMukadam(true); }
                        else { setMukadamName(originalMukadam.name); setMukadamPhone(originalMukadam.phone); setIsNewMukadam(false); }
                    }}
                >
                    <Text style={[styles.replaceBtnText, isNewMukadam && {color: '#C2410C'}]}>
                        {isNewMukadam ? "रद्द करा" : "मुकादम बदला"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>पूर्ण नाव</Text>
                <TextInput 
                    style={[styles.input, isNewMukadam && styles.inputHighlightMukadam]} 
                    value={mukadamName} onChangeText={setMukadamName} placeholder="Mukadam Name" placeholderTextColor="#94A3B8"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>फोन नंबर</Text>
                <TextInput 
                    style={[styles.input, isNewMukadam && styles.inputHighlightMukadam]} 
                    value={mukadamPhone} onChangeText={setMukadamPhone} keyboardType="phone-pad" maxLength={10} placeholder="Phone No" placeholderTextColor="#94A3B8" 
                />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleUpdate}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.actionText}>बदल जतन करा (Save)</Text>
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: "#ccd0d4ff",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginLeft: 12 },
  
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 14, fontSize: 16, color: "#0F172A", fontWeight: "500" },
  
  // Specific Highlight styles for editing
  inputHighlight: { borderColor: "#2563EB", backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: "600" },
  inputHighlightMukadam: { borderColor: "#F97316", backgroundColor: "#FFF7ED", color: "#C2410C", fontWeight: "600" },

  // Replace Buttons
  replaceBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" },
  replaceBtnActive: { backgroundColor: "#DBEAFE", borderColor: "#2563EB" },
  replaceBtnActiveMukadam: { backgroundColor: "#FFEDD5", borderColor: "#F97316" },
  replaceBtnText: { fontSize: 12, fontWeight: "700", color: "#64748B" },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff",
    padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: "#ccd0d4ff", elevation: 10, zIndex: 10,
  },
  actionButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 14 },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 11, fontWeight: "800", color: "#64748B", marginBottom: 8, letterSpacing: 1 },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 },

  selectButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", height: 50,
  },
  selectContent: { flexDirection: "row", alignItems: "center" },
  inputIcon: { paddingHorizontal: 12 },
  selectText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "60%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  factoryItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  factoryItemActive: { backgroundColor: "#F0FDF4", borderRadius: 12, paddingHorizontal: 10, borderBottomWidth: 0 },
  factoryIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", marginRight: 12 },
  factoryIconText: { fontWeight: "700", color: "#475569" },
  factoryItemText: { flex: 1, fontSize: 16, fontWeight: "600", color: "#475569" },
  factoryItemTextActive: { color: "#065f46", fontWeight: "800" },
});