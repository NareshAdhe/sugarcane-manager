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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { KarkhanaService } from "@/services/api";
import { useTractors } from "@/context/TractorContext";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const InputField = ({
  label,
  value,
  onChange,
  icon,
  placeholder,
  keyboardType = "default",
  suffix,
}: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon}>
        <MaterialCommunityIcons name={icon} size={20} color="#64748B" />
      </View>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
      />
      {suffix && (
        <View style={styles.suffixContainer}>
          <Text style={styles.suffixText}>{suffix}</Text>
        </View>
      )}
    </View>
  </View>
);

export default function EditKarkhanaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { karkhanas, setKarkhanas } = useTractors();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [todniRate, setTodniRate] = useState("");
  const [distanceThreshold, setDistanceThreshold] = useState("25");
  const [vahatukRateShort, setVahatukRateShort] = useState("");
  const [vahatukRateLong, setVahatukRateLong] = useState("");
  const [todniCommRate, setTodniCommRate] = useState("");
  const [vahatukCommRate, setVahatukCommRate] = useState("");
  const [dieselRate, setDieselRate] = useState("");

  const primaryColor = Colors.light?.emerald800 || "#065f46";

  useEffect(() => {
    const factory = karkhanas.find((k) => k.id === Number(id));
    if (factory) {
      setName(factory.name);
      setTodniRate(factory.todniRate.toString());
      setDistanceThreshold(factory.distanceThreshold?.toString() || "25");
      setVahatukRateShort(factory.vahatukRateShort?.toString() || "");
      setVahatukRateLong(factory.vahatukRateLong?.toString() || "");
      setTodniCommRate(factory.todniCommRate.toString());
      setVahatukCommRate(factory.vahatukCommRate.toString());
      setDieselRate(factory.dieselRate.toString());
    }
  }, [id, karkhanas]);

  const handleUpdate = async () => {
    if (!name || !todniRate || !vahatukRateShort || !vahatukRateLong) {
      Alert.alert("अपूर्ण माहिती", "कृपया सर्व आवश्यक माहिती भरा.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        todniRate: parseFloat(todniRate),
        distanceThreshold: parseFloat(distanceThreshold),
        vahatukRateShort: parseFloat(vahatukRateShort),
        vahatukRateLong: parseFloat(vahatukRateLong),
        todniCommRate: parseFloat(todniCommRate),
        vahatukCommRate: parseFloat(vahatukCommRate),
        dieselRate: parseFloat(dieselRate),
      };

      const updated = await KarkhanaService.update(Number(id), payload);

      if (updated) {
        setKarkhanas((prev) =>
          prev.map((k) => (k.id === Number(id) ? updated : k))
        );
        Alert.alert("यशस्वी", "कारखान्याची माहिती अपडेट झाली!");
        router.back();
      }
    } catch (error) {
      Alert.alert("त्रुटी", "माहिती जतन करताना अडचण आली.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "कारखाना हटवायचा आहे?",
      "ही कृती परत करता येणार नाही. जोडलेले सर्व ट्रॅक्टर 'Unassigned' होतील.",
      [
        { text: "रद्द करा", style: "cancel" },
        {
          text: "कायमचे हटवा",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await KarkhanaService.delete(Number(id));
              setKarkhanas((prev) => prev.filter((k) => k.id !== Number(id)));
              router.back();
            } catch (e) {
              Alert.alert("त्रुटी", "कारखाना हटवता आला नाही.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <Stack.Screen
        options={{
          headerShown: true,
          title: "कारखाना एडिट",
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "800", fontSize: 18 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving}
              style={styles.headerSaveBtn}
            >
              {saving ? (
                <ActivityIndicator color={primaryColor} size="small" />
              ) : (
                <Text style={[styles.headerSaveText, { color: primaryColor }]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER SECTION - NAME */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ओळख (IDENTITY)</Text>
            <View style={styles.card}>
              <InputField
                label="कारखान्याचे नाव (Factory Name)"
                value={name}
                onChange={setName}
                icon="factory"
                placeholder="उदा. सह्याद्री शुगर"
              />
            </View>
          </View>

          {/* TRANSPORT RATES */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeader}>वाहतूक दर (TRANSPORT)</Text>
              <MaterialCommunityIcons
                name="truck-fast-outline"
                size={16}
                color="#64748B"
              />
            </View>

            <View style={styles.card}>
              {/* Threshold Hero Input */}
              <View style={styles.thresholdContainer}>
                <Text style={styles.thresholdLabel}>
                  तफावत अंतर (Distance Limit)
                </Text>
                <View style={styles.thresholdInputBox}>
                  <TextInput
                    style={styles.thresholdInput}
                    value={distanceThreshold}
                    onChangeText={setDistanceThreshold}
                    keyboardType="numeric"
                  />
                  <Text style={styles.thresholdUnit}>KM</Text>
                </View>
                <Text style={styles.thresholdDesc}>
                  जवळच्या आणि लांबच्या वाहतुकीसाठी अंतर मर्यादा.
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <InputField
                    label={`आतला दर (< ${distanceThreshold} किमी)`}
                    value={vahatukRateShort}
                    onChange={setVahatukRateShort}
                    icon="map-marker-radius"
                    keyboardType="numeric"
                    placeholder="0"
                    suffix="₹"
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    label={`बाहेरचा दर (> ${distanceThreshold} किमी)`}
                    value={vahatukRateLong}
                    onChange={setVahatukRateLong}
                    icon="map-marker-distance"
                    keyboardType="numeric"
                    placeholder="0"
                    suffix="₹"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* OPERATIONAL RATES */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>इतर दर (OPERATIONAL RATES)</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <InputField
                    label="तोडणी दर (Todni)"
                    value={todniRate}
                    onChange={setTodniRate}
                    icon="content-cut"
                    keyboardType="numeric"
                    suffix="₹/T"
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    label="डिझेल दर (Diesel)"
                    value={dieselRate}
                    onChange={setDieselRate}
                    icon="gas-station"
                    keyboardType="numeric"
                    suffix="₹/L"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* DEDUCTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>कमिशन (COMMISSIONS %)</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <InputField
                    label="तोडणी कमिशन"
                    value={todniCommRate}
                    onChange={setTodniCommRate}
                    icon="percent"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    label="वाहतूक कमिशन"
                    value={vahatukCommRate}
                    onChange={setVahatukCommRate}
                    icon="percent"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* DANGER ZONE */}
          <View style={styles.dangerZone}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={20}
                    color="#EF4444"
                  />
                  <Text style={styles.deleteText}>
                    कारखाना हटवा (Delete Factory)
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.dangerDesc}>
              हा कारखाना हटवल्यास त्यासंबंधित सर्व हिशोब आणि ट्रॅक्टर माहिती
              निघून जाईल.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerSaveBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerSaveText: { fontWeight: "700", fontSize: 13 },
  scrollContent: { padding: 20 },

  section: { marginBottom: 24 },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  inputContainer: { marginBottom: 4 },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 50,
  },
  inputIcon: { paddingHorizontal: 12 },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    height: "100%",
  },
  suffixContainer: {
    backgroundColor: "#F1F5F9",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
  },
  suffixText: { fontWeight: "700", color: "#64748B", fontSize: 12 },

  thresholdContainer: { alignItems: "center", paddingVertical: 10 },
  thresholdLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  thresholdInputBox: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  thresholdInput: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    minWidth: 60,
  },
  thresholdUnit: {
    fontSize: 14,
    fontWeight: "800",
    color: "#94A3B8",
    marginLeft: 4,
  },
  thresholdDesc: { fontSize: 12, color: "#94A3B8" },

  row: { flexDirection: "row", gap: 8 },
  halfInput: { flex: 1 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },

  // Danger Zone
  dangerZone: { alignItems: "center", marginTop: 10 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  deleteText: { color: "#EF4444", fontWeight: "700" },
  dangerDesc: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
    textAlign: "center",
  },
});
