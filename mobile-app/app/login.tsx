import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthService } from "@/services/api";
import { Colors } from "@/constants/theme";
import { useTractors } from "@/context/TractorContext";

export default function LoginScreen() {
  const router = useRouter();
  const { setIsLoggedIn } = useTractors();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"input" | "otp">("input");
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState(""); // Stores the temporary JWT from server
  const [loading, setLoading] = useState(false);

  const primaryColor = Colors.light?.emerald800 || "#064e3b";

  const handleRequestOTP = async () => {
    if (!email.includes("@")) {
      return Alert.alert("त्रुटी", "कृपया वैध ईमेल पत्ता टाका");
    }
    if (mode === "signup" && !name) {
      return Alert.alert("त्रुटी", "कृपया तुमचे नाव टाका");
    }

    setLoading(true);
    try {
      let response;
      if (mode === "signup") {
        response = await AuthService.signup(name, email);
      } else {
        response = await AuthService.login(email);
      }

      setOtpToken(response.otpToken);
      setStep("otp");

      Alert.alert("ओटीपी पाठवला", "तुमच्या ईमेलवर आलेला ६ अंकी कोड टाका");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "सर्व्हरशी संपर्क होऊ शकला नाही";
      Alert.alert("प्रवेश नाकारला", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return Alert.alert("त्रुटी", "६ अंकी ओटीपी आवश्यक आहे");

    setLoading(true);
    try {
      await AuthService.verifyOTP(otp, otpToken);
      setIsLoggedIn(true);
      router.replace("/");
    } catch (err) {
      Alert.alert("त्रुटी", "ओटीपी चुकीचा आहे किंवा वेळ संपली आहे.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Tractor Manager</Text>
          <Text style={styles.subtitle}>
            {step === "input" 
              ? (mode === "login" ? "लॉगिन करा (Login)" : "नवीन खाते उघडा (Signup)")
              : "ओटीपी पडताळणी (Verify Email OTP)"}
          </Text>

          {step === "input" ? (
            <View style={styles.inputContainer}>
              {mode === "signup" && (
                <>
                  <Text style={styles.inputLabel}>पूर्ण नाव (Full Name)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="तुमचे नाव"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  <View style={{ height: 15 }} />
                </>
              )}
              
              <Text style={styles.inputLabel}>ईमेल पत्ता (Email Address)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="example@mail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ओटीपी कोड (Email OTP Code)</Text>
              <View style={styles.otpWrapper}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={step === "input" ? handleRequestOTP : handleVerifyOTP}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.buttonText}>
                {step === "input" ? "ओटीपी पाठवा" : "खात्री करा"}
              </Text>
            )}
          </TouchableOpacity>

          {step === "input" ? (
            <TouchableOpacity 
              onPress={() => setMode(mode === "login" ? "signup" : "login")}
              style={styles.toggleButton}
            >
              <Text style={{ color: primaryColor, fontWeight: "700" }}>
                {mode === "login" ? "नवीन खाते उघडा? (Sign up)" : "आधीच खाते आहे? (Login)"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setStep("input")} style={styles.toggleButton}>
              <Text style={{ color: primaryColor, fontWeight: "700" }}>मागे जा / ईमेल बदला</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 24, padding: 30, elevation: 8, alignItems: "center" },
  logo: { width: 90, height: 90, borderRadius: 20, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: "900", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 30, textAlign: "center" },
  inputContainer: { width: "100%", marginBottom: 20 },
  inputLabel: { fontSize: 12, color: "#94A3B8", marginBottom: 8, fontWeight: "700", textTransform: "uppercase" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: "#E2E8F0" },
  input: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1E293B" },
  otpWrapper: { backgroundColor: "#F1F5F9", borderRadius: 12, height: 65, justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  otpInput: { textAlign: "center", fontSize: 28, fontWeight: "800", letterSpacing: 10, color: "#064e3b" },
  button: { width: "100%", height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  toggleButton: { marginTop: 20 },
});