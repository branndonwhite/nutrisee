import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import { useRegister } from '../../context/RegisterContext';
import { register, completeProfile } from '../../api/auth';

const DIET_GOALS = [
  { id: 'lose_weight', label: 'Menurunkan Berat Badan' },
  { id: 'gain_weight', label: 'Menaikkan Berat Badan' },
  { id: 'maintain_weight', label: 'Menjaga Berat Badan' },
];

export default function DietGoalScreen() {
  const router = useRouter();
  const { data, clearData } = useRegister();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;

    try {
        setLoading(true);

        await register(data.email!, data.password!);

        await completeProfile({
        nickname: data.nickname!,
        gender: data.gender!,
        date_of_birth: data.date_of_birth!,
        height: data.height!,
        weight: data.weight!,
        activity_level: data.activity_level!,
        diet_goal: selected,    // send selected diet goal
        });

        clearData();
        router.replace('/(app)/home');
    } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
        setLoading(false);
    }
    };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Yuk berkenalan</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>dengan </Text>
          <Image
            source={require('../../assets/images/branding/LOGO_Text_Colored.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.subtitle}>
          Data yang kamu input akan mempengaruhi pengalaman{'\n'}
          penggunaan aplikasi Nutrisee yang lebih optimal.
        </Text>
      </View>

      {/* Diet Goal Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tujuan diet saya adalah...</Text>
        <View style={styles.optionsContainer}>
          {DIET_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.option,
                selected === goal.id && styles.optionSelected,
              ]}
              onPress={() => setSelected(goal.id)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionLabel,
                selected === goal.id && styles.optionLabelSelected,
              ]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.nextButton, (!selected || loading) && styles.nextButtonDisabled]}
          onPress={() => router.push("/(app)/home")}
          disabled={!selected || loading}
        >
          <Text style={styles.nextButtonText}>›</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Nutrisee berkomitmen untuk menggunakan data pribadi{'\n'}
          anda hanya untuk kebutuhan fungsional aplikasi.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  logo: {
    width: 110,
    height: 49,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FF3E00',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#fff',
    shadowColor: '#FF3E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  optionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: '#FF3E00',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 140,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: FONTS.semiBold,
  },
  footerNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
  },
});