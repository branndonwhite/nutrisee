import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import { useRegister } from '../../context/RegisterContext';

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Kurang Aktif',
    description: 'Kerja kantor duduk seharian dan tidak atau jarang berolahraga.',
    multiplier: 1.2,
  },
  {
    id: 'light',
    label: 'Aktif Ringan',
    description: 'Kadang jalan atau aktivitas ringan, olahraga 1-3x seminggu.',
    multiplier: 1.375,
  },
  {
    id: 'moderate',
    label: 'Aktif Sedang',
    description: 'Aktif bergerak atau olahraga rutin 3-5x seminggu.',
    multiplier: 1.55,
  },
  {
    id: 'active',
    label: 'Aktif Tinggi',
    description: 'Olahraga intens atau kerja fisik berat setiap hari.',
    multiplier: 1.725,
  },
];

export default function ActivityLevelScreen() {
  const router = useRouter();
  const { setData } = useRegister();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    setData({ activity_level: selected });
    router.push('/(auth)/diet-goal');
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

      {/* Activity Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seberapa aktif saya dalam sehari</Text>
        <View style={styles.optionsContainer}>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.option,
                selected === level.id && styles.optionSelected,
              ]}
              onPress={() => setSelected(level.id)}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  selected === level.id && styles.optionLabelSelected,
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  selected === level.id && styles.optionDescriptionSelected,
                ]}>
                  {level.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={() => router.push("/(auth)/diet-goal")}
          disabled={!selected}
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
    padding: 16,
    paddingBottom: 12,
    marginHorizontal: 24,
  },
  cardTitle: {
    fontFamily: FONTS.boldItalic,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: -4,
    flexDirection: 'row',
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
  optionContent: {
    alignItems: 'center'
  },
  optionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center'
  },
  optionLabelSelected: {
    color: '#FF3E00',
  },
  optionDescription: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    textAlign:'center'
  },
  optionDescriptionSelected: {
    color: '#FF3E00',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 56,
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