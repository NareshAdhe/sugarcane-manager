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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { KarkhanaService } from "@/services/api";
import { Colors } from "@/constants/theme";
import { useTractors } from "@/context/TractorContext";
import { SafeAreaView } from "react-native-safe-area-context";

const InputField = ({ label, value, onChange, icon, placeholder, keyboardType = "default", suffix }: any) => (
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

export default function AddKarkhanaScreen() {
  const router = useRouter();
  const { setKarkhanas } = useTractors();
  const [saving, setSaving] = useState(false);

  // Form States (with defaults for easier entry)
  const [name, setName] = useState("");
  const [todniRate, setTodniRate] = useState("365");
  const [distanceThreshold, setDistanceThreshold] = useState("25"); 
  const [vahatukRateShort, setVahatukRateShort] = useState("200"); 
  const [vahatukRateLong, setVahatukRateLong] = useState("300");   
  const [todniCommRate, setTodniCommRate] = useState("20");
  const [vahatukCommRate, setVahatukCommRate] = useState("20");
  const [dieselRate, setDieselRate] = useState("75");

  const primaryColor = Colors.light?.emerald800 || "#065f46";

  const handleSave = async () => {
    if (!name || !todniRate || !vahatukRateShort || !vahatukRateLong || !distanceThreshold || !todniCommRate || !vahatukCommRate || !dieselRate) {
      Alert.alert("माहिती अपूर्ण", "कृपया सर्व दर (Rates) आणि माहिती भरा");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        todniRate: parseFloat(todniRate),
        vahatukRateShort: parseFloat(vahatukRateShort),
        vahatukRateLong: parseFloat(vahatukRateLong),
        distanceThreshold: parseFloat(distanceThreshold),
        todniCommRate: parseFloat(todniCommRate),
        vahatukCommRate: parseFloat(vahatukCommRate),
        dieselRate: parseFloat(dieselRate),
      };

      const response = await KarkhanaService.create(payload);

      if (response) {
        setKarkhanas((prev: any) => [...prev, response]);
        Alert.alert("यशस्वी", "नवीन कारखाना यशस्वीरित्या जोडला!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert("त्रुटी", "कारखाना साठवताना अडचण आली.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      <Stack.Screen
        options={{
          headerShown: true,
          title: "नवीन कारखाना (Add Factory)",
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER SECTION - NAME */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ओळख (IDENTITY)</Text>
            <View style={styles.card}>
              <InputField 
                label="कारखान्याचे नाव (Factory Name)" 
                value={name} 
                onChange={setName} 
                icon="factory" 
                placeholder="उदा. समृद्धी शुगर" 
              />
            </View>
          </View>

          {/* TRANSPORT RATES */}
          <View style={styles.section}>
             <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>वाहतूक दर (TRANSPORT)</Text>
                <MaterialCommunityIcons name="truck-fast-outline" size={16} color="#64748B" />
             </View>
            
            <View style={styles.card}>
              {/* Threshold Hero Input */}
              <View style={styles.thresholdContainer}>
                 <Text style={styles.thresholdLabel}>तफावत अंतर (Distance Limit)</Text>
                 <View style={styles.thresholdInputBox}>
                    <TextInput 
                        style={styles.thresholdInput}
                        value={distanceThreshold}
                        onChangeText={setDistanceThreshold}
                        keyboardType="numeric"
                    />
                    <Text style={styles.thresholdUnit}>KM</Text>
                 </View>
                 <Text style={styles.thresholdDesc}>जवळच्या आणि लांबच्या वाहतुकीसाठी अंतर मर्यादा.</Text>
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

          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.actionText}>कारखाना साठवा (Save)</Text>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  scrollContent: { padding: 20, paddingBottom: 130 },
  
  section: { marginBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeader: { fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 1 },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },

  // Input Styling
  inputContainer: { marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 50,
  },
  inputIcon: { paddingHorizontal: 12 },
  textInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B', height: '100%' },
  suffixContainer: { backgroundColor: '#F1F5F9', height: '100%', justifyContent: 'center', paddingHorizontal: 12, borderLeftWidth: 1, borderLeftColor: '#E2E8F0', borderTopRightRadius: 11, borderBottomRightRadius: 11 },
  suffixText: { fontWeight: '700', color: '#64748B', fontSize: 12 },

  // Threshold Hero Styling
  thresholdContainer: { alignItems: 'center', paddingVertical: 10 },
  thresholdLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  thresholdInputBox: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  thresholdInput: { fontSize: 32, fontWeight: '900', color: '#0F172A', textAlign: 'center', minWidth: 60 },
  thresholdUnit: { fontSize: 14, fontWeight: '800', color: '#94A3B8', marginLeft: 4 },
  thresholdDesc: { fontSize: 12, color: '#94A3B8' },

  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  footer: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: "#fff", 
    padding: 16, 
    paddingBottom: 30, 
    borderTopWidth: 1, 
    borderTopColor: "#E2E8F0" 
  },
  actionButton: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 18, 
    borderRadius: 16 
  },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});