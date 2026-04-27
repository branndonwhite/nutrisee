import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
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
import { authenticate } from '../../api/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { setData } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan kata sandi harus diisi");
      return;
    }

    setLoading(true);
    try {
      const { isNewUser, hasProfile } = await authenticate(email, password);

      if (!isNewUser && hasProfile) {
        // Existing user with complete profile → go to app
        router.replace('/(app)/home');
      } else {
        // New user OR existing user without profile → go through onboarding
        setData({ email, password });
        router.push('/(auth)/personal-info');
      }
    } catch (err: any) {
      console.log('authenticate error:', JSON.stringify(err?.response?.data));
      console.log('authenticate status:', err?.response?.status);
      console.log('authenticate message:', err?.message);
      const message = err?.response?.data?.error ?? 'Terjadi kesalahan, coba lagi';
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg/SPLASH_Background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Shapes overlay at the top */}
      <Image
        source={require("../../assets/images/bg/REGIS_Shapes.png")}
        style={styles.shapesOverlay}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/branding/LOGO_Text_White.png")}
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
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Kata Sandi"
            placeholderTextColor="rgba(255,255,255,0.5)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Lanjutkan Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  shapesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 280,
    zIndex: 0,
  },
  container: {
    flexGrow: 1,
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
    color: '#fff',
    textAlign: "center",
    marginBottom: 6,
  },
  subheading: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#fff',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.6)',
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  link: {
    fontFamily: FONTS.semiBold,
    color: '#fff',
    textDecorationLine: "underline",
  },
});