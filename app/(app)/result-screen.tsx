import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { BackArrowIcon, LocationIcon } from '../../assets/images/icon';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';

// ─── Constants ───────────────────────────────────────────────────────────────
const BLUE = '#014FE9';
const DARK_BLUE = '#013397';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_BG = '#F2F2F2';
const HEADER_HEIGHT = 120;

// ─── Types ───────────────────────────────────────────────────────────────────
interface NutritionResult {
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  description?: string; // only for text mode
  imageUri?: string;    // only for image mode
  location: string;
  time: string;         // e.g. "17.03"
  date: string;         // e.g. "25 Maret 2026"
  // Calorie progress
  caloriesConsumed: number;
  calorieGoal: number;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ScanResultScreen() {
  const params = useLocalSearchParams();

  // TODO: replace with real API result
  const passed = params.data ? JSON.parse(params.data as string) : {};
  const result: NutritionResult = {
    ...DUMMY_RESULT,
    imageUri: passed.imageUri ?? DUMMY_RESULT.imageUri,
  };

  const hasImage = !!result.imageUri;

  // Stagger entrance animations
  const fadeAnims = Array.from({ length: 5 }, () => useRef(new Animated.Value(0)).current);
  const slideAnims = Array.from({ length: 5 }, () => useRef(new Animated.Value(24)).current);

  useEffect(() => {
    const animations = fadeAnims.map((fade, i) =>
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 350,
          delay: i * 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 350,
          delay: i * 80,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(80, animations).start();
  }, []);

  const animatedStyle = (index: number) => ({
    opacity: fadeAnims[index],
    transform: [{ translateY: slideAnims[index] }],
  });

  const calorieProgress = Math.min(result.caloriesConsumed / result.calorieGoal, 1);

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrowIcon width={20} height={20} fill={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NutriSCAN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Card 1: Food Info ── */}
        <Animated.View style={[animatedStyle(0)]}>
          {hasImage ? (
            // ── Image variant ──
            <View style={styles.imageCard}>
              <Image source={{ uri: result.imageUri }} style={styles.foodImage} />
              {/* Name + calorie overlay at bottom */}
              <View style={styles.imageCardFooter}>
                <Text style={styles.imageCardFoodName} numberOfLines={1}>
                  {result.foodName}
                </Text>
                <Text style={styles.imageCardCalories}>
                  {result.calories}
                  <Text style={styles.imageCardCaloriesUnit}>kkal</Text>
                </Text>
              </View>
            </View>
          ) : (
            // ── Text variant ──
            <View style={styles.textCard}>
              <View style={styles.textCardHeader}>
                <Text style={styles.textCardFoodName} numberOfLines={1}>
                  {result.foodName}
                </Text>
                <Text style={styles.textCardCalories}>
                  {result.calories}
                  <Text style={styles.textCardCaloriesUnit}>kkal</Text>
                </Text>
              </View>
              <View style={styles.textCardDescBox}>
                <Text style={styles.textCardDesc}>"{result.description}"</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* ── Card 2: Macros ── */}
        <Animated.View style={[styles.macrosRow, animatedStyle(1)]}>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>
              {result.carbs}
              <Text style={styles.macroUnit}>gr</Text>
            </Text>
            <Text style={styles.macroLabel}>Karbohidrat</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>
              {result.protein}
              <Text style={styles.macroUnit}>gr</Text>
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>
              {result.fat}
              <Text style={styles.macroUnit}>gr</Text>
            </Text>
            <Text style={styles.macroLabel}>Lemak</Text>
          </View>
        </Animated.View>

        {/* ── Card 3: Location + Time ── */}
        <Animated.View style={[styles.metaRow, animatedStyle(2)]}>
          {/* Location */}
          <View style={styles.locationCard}>
            <LocationIcon width={25} height={36} style={styles.locationIcon}/>
            <View style={styles.locationTextBox}>
              <Text style={styles.locationText}>{result.location}</Text>
            </View>
            
          </View>

          {/* Date + Time */}
          <View style={styles.timeCard}>
            <Text style={styles.timeValue}>{result.time}</Text>
            <Text style={styles.timeDate}>{result.date}</Text>
          </View>
        </Animated.View>

        {/* ── Card 4: Calorie Progress + Submit ── */}
        <Animated.View style={[styles.submitCard, animatedStyle(3)]}>
          <View style={styles.submitLeft}>
            <Text style={styles.submitLabel}>Progress Kalori Hari Ini</Text>
            {/* Progress bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { flex: calorieProgress }]}>
                <Text style={styles.progressConsumed}>
                  {result.caloriesConsumed} 
                  <Text style={styles.progressGoal}> / {result.calorieGoal}kkal</Text>
                </Text>
              </View>
              <View style={{ flex: 1 - calorieProgress }} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={() => router.replace('/(app)/scan-success')}
          >
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// ─── Dummy data (used when no params passed) ─────────────────────────────────
const DUMMY_RESULT: NutritionResult = {
  foodName: 'Nasi Goreng Jawa',
  calories: 650,
  carbs: 70,
  protein: 25,
  fat: 25,
  description: 'Nasi goreng jawa dengan topping sosis, bla bla bla bla satu porsi',
  imageUri: undefined,
  location: 'Kemanggisan,\nDKI Jakarta.',
  time: '17.03',
  date: '25 Maret 2026',
  caloriesConsumed: 2020,
  calorieGoal: 2650,
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: LIGHT_BG,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    color: BLACK,
  },
  headerSpacer: { width: 36 },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // ── Text variant card ──
  textCard: {
    backgroundColor: BLUE,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  textCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textCardFoodName: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: WHITE,
    flex: 1,
    marginRight: 8,
  },
  textCardCalories: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: WHITE,
  },
  textCardCaloriesUnit: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: WHITE,
  },
  textCardDescBox: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    minHeight: 130,
    margin: -6,
    marginTop: 4,
    justifyContent: 'center',
  },
  textCardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── Image variant card ──
  imageCard: {
    backgroundColor: BLUE,
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 320
  },
  foodImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  imageCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  imageCardFoodName: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: WHITE,
    flex: 1,
    marginRight: 8,
  },
  imageCardCalories: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: WHITE,
  },
  imageCardCaloriesUnit: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: WHITE,
  },

  // ── Macros ──
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    color: WHITE,
  },
  macroUnit: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: WHITE,
  },
  macroLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: WHITE,
  },

  // ── Meta row ──
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationCard: {
    flex: 1,
    backgroundColor: DARK_BLUE,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationIcon: {
    marginHorizontal: 6,
  },
  locationTextBox: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 17,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: -6,
    marginRight: -6,
    justifyContent: 'center',
  },
  locationText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: BLACK,
    flex: 1,
    lineHeight: 20,
    textAlign: 'center'
  },
  timeCard: {
    backgroundColor: DARK_BLUE,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  timeValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    color: WHITE,
    letterSpacing: -0.5,
  },
  timeDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: WHITE,
    marginTop: 2,
  },


  // ── Submit card ──
  submitCard: {
    backgroundColor: BLACK,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitLeft: {
    flex: 1,
    gap: 6,
    minHeight: 70,
    marginTop: 5,
    marginHorizontal: 14,
  },
  submitLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: WHITE,
    textAlign: 'center'
  },
  progressBarTrack: {
    flexDirection: 'row',
    height: 31,
    backgroundColor: '#F7F7F7',
    borderRadius: 33,
    overflow: 'hidden',
    padding: 4,
  },
  progressBarFill: {
    backgroundColor: BLUE,
    borderRadius: 25,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  progressConsumed: {
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    color: WHITE,
  },
  progressGoal: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: WHITE,
  },
  submitButton: {
    backgroundColor: BLUE,
    borderRadius: 17,
    height: 78,
    width: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: WHITE,
    letterSpacing: 0.5,
  },
});