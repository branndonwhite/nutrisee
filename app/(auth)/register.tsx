import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRegister } from '../../context/RegisterContext';
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/fonts";

export default function RegisterScreen() {
  const router = useRouter();
  const { setData } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan kata sandi harus diisi");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Kata sandi minimal 8 karakter");
      return;
    }

    // Just save to context, no API call
    setData({ email, password });
    router.push('/(auth)/personal-info');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/branding/LOGO_Text_Colored.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Daftar untuk memulai perjalanan sehatmu!
      </Text>
      <Text style={styles.subheading}>
        Masukkan email dan kata sandi untuk mendaftar!
      </Text>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email@domain.com"
          placeholderTextColor={COLORS.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Kata Sandi"
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Lanjutkan Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/(auth)/personal-info")} //change to handleRegister once all UI done
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Lanjutkan</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>atau</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Button */}
      <TouchableOpacity style={styles.socialButton}>
        <Image
          source={{ uri: "https://www.google.com/favicon.ico" }}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Lanjutkan dengan Google</Text>
      </TouchableOpacity>

      {/* Apple Button */}
      <TouchableOpacity style={styles.socialButton}>
        <AntDesign name="apple" size={20} color={COLORS.text} />
        <Text style={styles.socialButtonText}>Lanjutkan dengan Apple ID</Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.terms}>
        Dengan memilih Lanjutkan, anda setuju kepada{" "}
        <Text style={styles.link}>Syarat dan Ketentuan Layanan</Text> serta{" "}
        <Text style={styles.link}>Kebijakan Privasi</Text> kami.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 28,
  },
  logo: {
    width: 160,
    height: 71,
  },
  heading: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  subheading: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
    marginHorizontal: 8,
    gap: 10,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  appleIcon: {
    fontSize: 20,
    color: COLORS.text,
  },
  socialButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  terms: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  link: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    textDecorationLine: "underline",
  },
});
