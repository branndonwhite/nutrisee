import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import { AntDesign } from '@expo/vector-icons';

export default function RegisterScreen() {
  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/branding/LOGO_Text_Colored.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Daftar untuk memulai perjalanan sehatmu!</Text>
      <Text style={styles.subheading}>Masukkan email dan kata sandi untuk mendaftar!</Text>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email@domain.com"
          placeholderTextColor={COLORS.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Kata Sandi"
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry
        />
      </View>

      {/* Lanjutkan Button */}
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Lanjutkan</Text>
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
          source={{ uri: 'https://www.google.com/favicon.ico' }}
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
        Dengan memilih Lanjutkan, anda setuju kepada{' '}
        <Text style={styles.link}>Syarat dan Ketentuan Layanan</Text>
        {' '}serta{' '}
        <Text style={styles.link}>Kebijakan Privasi</Text>
        {' '}kami.
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
    paddingBottom: 32
  },
  logoContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 8
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
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  link: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    textDecorationLine: 'underline',
  },
});