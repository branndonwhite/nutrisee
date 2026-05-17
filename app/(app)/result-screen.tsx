import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { BackArrowIcon, LocationIcon, NutriscanIcon, TextIcon } from '../../assets/images/icon';
import GalleryIcon from '../../assets/images/icon/GalleryIcon';
import ScanLoadingOverlay from '../../components/ScanLoadingOverlay';
import { logMeal, analyzeTextMeal, uploadImage } from '../../api/meals';
import { getDailyStats } from '../../api/dashboard';

// ─── Constants ───────────────────────────────────────────────────────────────
const BLUE      = '#014FE9';
const DARK_BLUE = '#013397';
const BLACK     = '#000000';
const WHITE     = '#FFFFFF';
const LIGHT_BG  = '#F2F2F2';
const HEADER_HEIGHT = 120;

const ABSTRACT = {
  p3: require('../../assets/images/abstract/Protein 3.png'),
  p5: require('../../assets/images/abstract/Protein 5.png'),
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface NutritionData {
  foodName:    string;
  calories:    number;
  carbs:       number;
  protein:     number;
  fat:         number;
  sugar:       number;
  fiber:       number;
  calcium:     number;
  cholesterol: number;
  vitaminA:    number;
  vitaminC:    number;
  vitaminD:    number;
  description?: string;
  imageUri?:   string;
  imageUrl?:   string; // Cloudinary URL (for logMeal)
  location:    string;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ResultScreen() {
  const params          = useLocalSearchParams();
  const passed          = params.data ? JSON.parse(params.data as string) : {};
  const scanMode        = (params.mode as 'text' | 'image') ?? 'text';
  const isViewOnly      = params.viewMode === 'profile';

  // ── Nutrition state (updated by re-analysis) ──
  const [data, setData] = useState<NutritionData>({
    foodName:    passed.food_name   ?? passed.foodName   ?? '-',
    calories:    passed.calories    ?? 0,
    carbs:       passed.carbs       ?? 0,
    protein:     passed.protein     ?? 0,
    fat:         passed.fat         ?? 0,
    sugar:       passed.sugar       ?? 0,
    fiber:       passed.fiber       ?? 0,
    calcium:     passed.calcium     ?? 0,
    cholesterol: passed.cholesterol ?? 0,
    vitaminA:    passed.vitamin_a   ?? passed.vitaminA   ?? 0,
    vitaminC:    passed.vitamin_c   ?? passed.vitaminC   ?? 0,
    vitaminD:    passed.vitamin_d   ?? passed.vitaminD   ?? 0,
    description: passed.description ?? undefined,
    imageUri:    passed.image_url   ?? passed.imageUri   ?? undefined,
    imageUrl:    passed.image_url   ?? undefined,
    location:    passed.location    ?? '',
  });

  // ── Additional info state ──
  const [showAdditional,     setShowAdditional]     = useState(false);
  const [additionalText,     setAdditionalText]     = useState('');
  const [additionalImageUri, setAdditionalImageUri] = useState<string | null>(null);

  // ── Re-analyze loading ──
  const [isReanalyzing,  setIsReanalyzing]  = useState(false);
  const [reanalyzeStep,  setReanalyzeStep]  = useState<1 | 2>(1);

  // ── Submit ──
  const [submitting, setSubmitting] = useState(false);

  // ── Daily stats ──
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [calorieGoal,      setCalorieGoal]      = useState(2000);

  // ── Macro pager ──
  const [macroPage,      setMacroPage]      = useState(0);
  const [macroCardWidth, setMacroCardWidth] = useState(0);
  const macroFlatListRef = useRef<FlatList>(null);

  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
  const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    (async () => {
      try {
        const stats = await getDailyStats();
        setCaloriesConsumed(stats.today.calories_consumed);
        setCalorieGoal(stats.today.calorie_goal);
      } catch { /* keep defaults */ }
    })();
  }, []);

  // Stagger entrance animations
  const fadeAnims  = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const slideAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(24))).current;

  useEffect(() => {
    Animated.stagger(
      80,
      fadeAnims.map((fade, i) =>
        Animated.parallel([
          Animated.timing(fade,         { toValue: 1, duration: 350, delay: i * 80, useNativeDriver: true }),
          Animated.timing(slideAnims[i],{ toValue: 0, duration: 350, delay: i * 80, useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  const animStyle = (i: number) => ({
    opacity:   fadeAnims[i],
    transform: [{ translateY: slideAnims[i] }],
  });

  const getMacroPages = (d: NutritionData) => [
    [
      { label: 'Karbohidrat', value: d.carbs,   unit: 'gr' },
      { label: 'Protein',     value: d.protein,  unit: 'gr' },
      { label: 'Lemak',       value: d.fat,      unit: 'gr' },
    ],
    [
      { label: 'Gula',  value: d.sugar, unit: 'gr' },
      { label: 'Serat', value: d.fiber, unit: 'gr' },
    ],
    [
      { label: 'Vitamin A', value: d.vitaminA, unit: 'μg' },
      { label: 'Vitamin C', value: d.vitaminC, unit: 'mg' },
      { label: 'Vitamin D', value: d.vitaminD, unit: 'μg' },
    ],
    [
      { label: 'Kalsium',    value: d.calcium,     unit: 'mg' },
      { label: 'Kolesterol', value: d.cholesterol, unit: 'mg' },
    ],
  ];

  const calorieProgress = calorieGoal > 0
    ? Math.min((caloriesConsumed + data.calories) / calorieGoal, 1)
    : 0;

  // ── Image pickers (for text-mode additional image) ──
  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) setAdditionalImageUri(result.assets[0].uri);
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) setAdditionalImageUri(result.assets[0].uri);
  }, []);

  // ── Re-analyze ──
  const handleReanalyze = async () => {
    setReanalyzeStep(1);
    setIsReanalyzing(true);
    try {
      let newImageUrl: string | undefined;

      if (scanMode === 'text' && additionalImageUri) {
        // Upload the additional image first
        const compressed = await ImageManipulator.manipulateAsync(
          additionalImageUri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        const base64 = await FileSystem.readAsStringAsync(compressed.uri, { encoding: 'base64' });
        setReanalyzeStep(2);
        const uploaded = await uploadImage(base64);
        newImageUrl = uploaded.image_url;
      } else {
        setReanalyzeStep(2);
      }

      // Re-analyze: combine original + additional
      const descriptionForApi  = scanMode === 'text'  ? data.description  : additionalText.trim() || undefined;
      const imageUrlForApi      = scanMode === 'image' ? data.imageUrl     : newImageUrl;

      const { nutrition } = await analyzeTextMeal(descriptionForApi ?? '', imageUrlForApi);

      setData(prev => ({
        ...prev,
        foodName:    nutrition.food_name    ?? prev.foodName,
        calories:    nutrition.calories     ?? prev.calories,
        carbs:       nutrition.carbs        ?? prev.carbs,
        protein:     nutrition.protein      ?? prev.protein,
        fat:         nutrition.fat          ?? prev.fat,
        sugar:       nutrition.sugar        ?? prev.sugar,
        fiber:       nutrition.fiber        ?? prev.fiber,
        calcium:     nutrition.calcium      ?? prev.calcium,
        cholesterol: nutrition.cholesterol  ?? prev.cholesterol,
        vitaminA:    nutrition.vitamin_a    ?? prev.vitaminA,
        vitaminC:    nutrition.vitamin_c    ?? prev.vitaminC,
        vitaminD:    nutrition.vitamin_d    ?? prev.vitaminD,
        ...(scanMode === 'text' && newImageUrl
          ? { imageUri: additionalImageUri ?? prev.imageUri, imageUrl: newImageUrl }
          : {}),
        ...(scanMode === 'image' && additionalText.trim()
          ? { description: additionalText.trim() }
          : {}),
      }));

      setAdditionalText('');
      setAdditionalImageUri(null);
      setShowAdditional(false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Gagal memperbarui analisis, coba lagi');
    } finally {
      setIsReanalyzing(false);
      setReanalyzeStep(1);
    }
  };

  const canReanalyze = scanMode === 'text'
    ? !!additionalImageUri
    : additionalText.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScanLoadingOverlay visible={isReanalyzing} step={reanalyzeStep} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrowIcon width={10} height={15} fill={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NutriSCAN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Card 1: Food Info ── */}
        <Animated.View style={animStyle(0)}>
          {data.imageUri ? (
            <View style={styles.imageCard}>
              {data.description ? (
                /* ── Combined: name/cal → image → description ── */
                <>
                  {/* Abstract top-left for combined layout */}
                  <Image source={ABSTRACT.p5} style={styles.foodCardAbstractTopLeft} resizeMode="contain" />
                  <View style={styles.imageCardHeader}>
                    <Text style={styles.imageCardFoodName} numberOfLines={1}>{data.foodName}</Text>
                    <Text style={styles.imageCardCalories}>
                      {data.calories}<Text style={styles.imageCardCaloriesUnit}>kkal</Text>
                    </Text>
                  </View>
                  <Image source={{ uri: data.imageUri }} style={styles.foodImage} />
                  <View style={styles.imageCardDescBox}>
                    <Text style={styles.textCardDesc}>"{data.description}"</Text>
                  </View>
                </>
              ) : (
                /* ── Image only: image → name/cal footer ── */
                <>
                  {/* Abstract bottom-left for image-only layout */}
                  <Image source={ABSTRACT.p5} style={styles.foodCardAbstractBottomLeft} resizeMode="contain" />
                  <Image source={{ uri: data.imageUri }} style={styles.foodImage} />
                  <View style={styles.imageCardFooter}>
                    <Text style={styles.imageCardFoodName} numberOfLines={1}>{data.foodName}</Text>
                    <Text style={styles.imageCardCalories}>
                      {data.calories}<Text style={styles.imageCardCaloriesUnit}>kkal</Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.textCard}>
              <Image source={ABSTRACT.p5} style={styles.foodCardAbstractTopLeft} resizeMode="contain" />
              <View style={styles.textCardHeader}>
                <Text style={styles.textCardFoodName} numberOfLines={1}>{data.foodName}</Text>
                <Text style={styles.textCardCalories}>
                  {data.calories}<Text style={styles.textCardCaloriesUnit}>kkal</Text>
                </Text>
              </View>
              <View style={styles.textCardDescBox}>
                <Text style={styles.textCardDesc}>"{data.description}"</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* ── Card 1b: Additional Info (only when not view-only) ── */}
        {!isViewOnly && showAdditional && (
          <Animated.View style={[styles.additionalCard, animStyle(1)]}>
            <Text style={styles.additionalTitle}>
              {scanMode === 'text' ? 'Tambah Foto' : 'Tambah Deskripsi'}
            </Text>
            <Text style={styles.additionalSubtitle}>
              {scanMode === 'text'
                ? 'Tambah foto makananmu agar analisis lebih akurat'
                : 'Tambah deskripsi agar analisis lebih akurat'}
            </Text>

            {scanMode === 'text' ? (
              /* ── Image picker for text mode ── */
              additionalImageUri ? (
                <View style={styles.additionalImageWrapper}>
                  <Image source={{ uri: additionalImageUri }} style={styles.additionalImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setAdditionalImageUri(null)}
                  >
                    <Ionicons name="close-circle" size={24} color={WHITE} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.additionalPickerRow}>
                  <TouchableOpacity style={styles.additionalPickerBtn} onPress={pickFromGallery}>
                    <GalleryIcon width={22} height={18} fill={WHITE} />
                    <Text style={styles.additionalPickerLabel}>Galeri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.additionalPickerBtn} onPress={pickFromCamera}>
                    <NutriscanIcon width={22} height={22} fill={WHITE} />
                    <Text style={styles.additionalPickerLabel}>Kamera</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              /* ── Text input for image mode ── */
              <TextInput
                style={styles.additionalTextInput}
                placeholder="Deskripsikan makananmu lebih detail…"
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                value={additionalText}
                onChangeText={setAdditionalText}
                textAlignVertical="top"
              />
            )}

            {/* Re-analyze button — shown when there's new data */}
            {canReanalyze && (
              <TouchableOpacity
                style={styles.reanalyzeBtn}
                onPress={handleReanalyze}
                activeOpacity={0.85}
              >
                <Text style={styles.reanalyzeBtnText}>Perbarui Analisis</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* ── Card 2: Macros (swipeable) ── */}
        <Animated.View style={animStyle(2)}>
          <FlatList
            ref={macroFlatListRef}
            data={getMacroPages(data)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            snapToInterval={macroCardWidth + 12}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 12 }}
            onLayout={(e) => setMacroCardWidth(e.nativeEvent.layout.width)}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (macroCardWidth + 12));
              setMacroPage(index);
            }}
            renderItem={({ item: page }) => (
              <View style={[styles.macrosRow, { width: macroCardWidth }]}>
                {page.map((macro: { label: string; value: number; unit: string }) => (
                  <View key={macro.label} style={[styles.macroCard, { flex: 1 }]}>
                    <Text style={styles.macroValue}>
                      {macro.value}<Text style={styles.macroUnit}>{macro.unit}</Text>
                    </Text>
                    <Text style={styles.macroLabel}>{macro.label}</Text>
                  </View>
                ))}
              </View>
            )}
          />
          <View style={styles.macroDots}>
            {getMacroPages(data).map((_, i) => (
              <View key={i} style={[styles.macroDot, i === macroPage && styles.macroDotActive]} />
            ))}
          </View>
        </Animated.View>

        {/* ── Card 3: Location + Time ── */}
        <Animated.View style={[styles.metaRow, animStyle(3)]}>
          <View style={styles.locationCard}>
            <LocationIcon width={25} height={36} style={styles.locationIcon} />
            <View style={styles.locationTextBox}>
              <Text style={styles.locationText}>{data.location}</Text>
            </View>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeValue}>{time}</Text>
            <Text style={styles.timeDate}>{date}</Text>
          </View>
        </Animated.View>

        {/* ── Card 4: Calorie Progress (black) ── */}
        {!isViewOnly && (
          <Animated.View style={[styles.progressCard, animStyle(4)]}>
            {/* Protein 3 abstract — left decoration */}
            <Image source={ABSTRACT.p3} style={styles.progressCardAbstract} resizeMode="contain" />
            <Text style={styles.submitLabel}>Progress Kalori Hari Ini</Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { flex: Math.max(calorieProgress, 0.001) }]}>
                <Text style={styles.progressConsumed} numberOfLines={1}>
                  <Text style={styles.progressConsumedBold}>{Math.round(caloriesConsumed + data.calories)}</Text>
                  {' '}
                  <Text style={styles.progressConsumedGoal}>/ {calorieGoal}kkal</Text>
                </Text>
              </View>
              <View style={{ flex: Math.max(1 - calorieProgress, 0.001) }} />
            </View>
          </Animated.View>
        )}

        {/* ── Submit row: icon toggle + submit button ── */}
        {!isViewOnly && (
          <Animated.View style={[styles.submitRow, animStyle(5)]}>
            {/* Icon button — hidden when both image and description already exist */}
            {!(data.imageUri && data.description) && (
              <TouchableOpacity
                style={[styles.iconBtn, showAdditional && styles.iconBtnActive]}
                onPress={() => {
                  if (scanMode === 'text') {
                    // text-scan result → go to camera to attach a photo
                    router.push({
                      pathname: '/(app)/nutriscan-camera',
                      params: { description: data.description ?? '' },
                    });
                  } else {
                    // image-scan result → go to text-scan (camera hidden) to add description
                    // pass existing image so it's preserved in the final result
                    router.push({
                      pathname: '/(app)/nutriscan-text',
                      params: {
                        hideCamera: 'true',
                        existingImageUri: data.imageUri ?? '',
                        existingImageUrl: data.imageUrl ?? '',
                      },
                    });
                  }
                }}
                activeOpacity={0.85}
              >
                {scanMode === 'text' ? (
                  <NutriscanIcon width={26} height={26} fill={WHITE} />
                ) : (
                  <TextIcon width={26} height={26} fill={WHITE} />
                )}
              </TouchableOpacity>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.6 }]}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={async () => {
                setSubmitting(true);
                try {
                  await logMeal({
                    food_name:   data.foodName,
                    calories:    data.calories,
                    carbs:       data.carbs,
                    protein:     data.protein,
                    fat:         data.fat,
                    sugar:       data.sugar,
                    fiber:       data.fiber,
                    vitamin_a:   data.vitaminA,
                    vitamin_c:   data.vitaminC,
                    vitamin_d:   data.vitaminD,
                    calcium:     data.calcium,
                    cholesterol: data.cholesterol,
                    image_url:   data.imageUrl   ?? undefined,
                    description: data.description ?? undefined,
                    location:    data.location   ?? undefined,
                  });
                  router.replace('/(app)/success-splash?message=Sukses+mencatat+makananmu!&dest=/(app)/home');
                } catch (err) {
                  console.error('logMeal error:', err);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Text style={styles.submitButtonText}>{submitting ? '...' : 'SUBMIT'}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: LIGHT_BG },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center',
    height: HEADER_HEIGHT, paddingTop: 56, paddingBottom: 16,
    paddingHorizontal: 16, marginLeft: 2, backgroundColor: LIGHT_BG,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: WHITE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2,
  },
  headerTitle:  { flex: 1, textAlign: 'center', fontFamily: FONTS.extraBold, fontSize: 18, color: BLACK },
  headerSpacer: { width: 36 },

  // ── Scroll ──
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  // ── Food card abstracts ──
  foodCardAbstractTopLeft: {
    position: 'absolute', top: -15, left: -35,
    width: 150, height: 150, opacity: 0.5,
    transform: [{ translateX: -10 }, { rotate: '-65deg' }, { scale: 1.2 }],
  },
  foodCardAbstractBottomLeft: {
    position: 'absolute', bottom: -58, left: -35,
    width: 150, height: 150, opacity: 0.5,
    transform: [{ translateX: -10 }, { rotate: '-55deg' }, { scale: 1 }],
  },

  // ── Text variant card ──
  textCard:       { backgroundColor: BLUE, borderRadius: 20, padding: 14, gap: 10, overflow: 'hidden' },
  textCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textCardFoodName: { fontFamily: FONTS.bold, fontSize: 18, color: WHITE, flex: 1, marginRight: 8 },
  textCardCalories: { fontFamily: FONTS.extraBold, fontSize: 22, color: WHITE },
  textCardCaloriesUnit: { fontFamily: FONTS.regular, fontSize: 13, color: WHITE },
  textCardDescBox: {
    backgroundColor: WHITE, borderRadius: 14, padding: 16,
    minHeight: 130, margin: -6, marginTop: 4, justifyContent: 'center',
  },
  textCardDesc: {
    fontFamily: FONTS.regular, fontSize: 14, color: '#444',
    lineHeight: 22, fontStyle: 'italic', textAlign: 'center',
  },

  // ── Image variant card ──
  imageCard: {
    backgroundColor: BLUE, borderRadius: 20, overflow: 'hidden',
    paddingHorizontal: 10, paddingTop: 10, minHeight: 320,
  },
  foodImage:         { width: '100%', height: 260, resizeMode: 'cover', borderRadius: 12 },
  imageCardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 6, paddingTop: 6, paddingBottom: 8 },
  imageCardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  imageCardDescBox: {
    backgroundColor: WHITE, borderRadius: 14, padding: 16,
    marginTop: 12, marginBottom: 12,
    minHeight: 80, justifyContent: 'center',
  },
  imageCardFoodName: { fontFamily: FONTS.bold, fontSize: 18, color: WHITE, flex: 1, marginRight: 8 },
  imageCardCalories: { fontFamily: FONTS.extraBold, fontSize: 22, color: WHITE },
  imageCardCaloriesUnit: { fontFamily: FONTS.regular, fontSize: 13, color: WHITE },

  // ── Additional info card ──
  additionalCard: {
    backgroundColor: DARK_BLUE,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  additionalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: WHITE,
  },
  additionalSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -6,
  },
  additionalPickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  additionalPickerBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  additionalPickerLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: WHITE,
  },
  additionalImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  additionalImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    padding: 1,
  },
  additionalTextInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: WHITE,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  reanalyzeBtn: {
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reanalyzeBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: DARK_BLUE,
  },

  // ── Macros ──
  macrosRow: { flexDirection: 'row', gap: 12 },
  macroCard: {
    flex: 1, backgroundColor: BLUE, borderRadius: 20,
    paddingVertical: 24, paddingHorizontal: 12, alignItems: 'center', gap: 4,
  },
  macroValue: { fontFamily: FONTS.extraBold, fontSize: 26, color: WHITE },
  macroUnit:  { fontFamily: FONTS.regular,   fontSize: 14, color: WHITE },
  macroLabel: { fontFamily: FONTS.regular,   fontSize: 13, color: WHITE },
  macroDots:  { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  macroDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CCCCCC' },
  macroDotActive: { backgroundColor: BLUE },

  // ── Meta row ──
  metaRow: { flexDirection: 'row', gap: 12 },
  locationCard: {
    flex: 1, backgroundColor: DARK_BLUE, borderRadius: 20,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  locationIcon: { marginHorizontal: 6 },
  locationTextBox: {
    flex: 1, backgroundColor: WHITE, borderRadius: 17,
    paddingVertical: 12, paddingHorizontal: 12,
    marginVertical: -6, marginRight: -6, justifyContent: 'center',
  },
  locationText: {
    fontFamily: FONTS.regular, fontSize: 13, color: BLACK,
    flex: 1, lineHeight: 18, textAlign: 'center',
  },
  timeCard: {
    backgroundColor: DARK_BLUE, borderRadius: 20,
    paddingVertical: 14, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center', minWidth: 100,
  },
  timeValue: { fontFamily: FONTS.extraBold, fontSize: 28, color: WHITE, letterSpacing: -0.5 },
  timeDate:  { fontFamily: FONTS.regular,   fontSize: 12, color: WHITE, marginTop: 2 },

  // ── Progress card (black) ──
  progressCard: {
    backgroundColor: '#1a1a1a', borderRadius: 20,
    paddingTop: 16, paddingHorizontal: 16, paddingBottom: 20,
    gap: 12, overflow: 'hidden',
  },
  progressCardAbstract: {
    position: 'absolute', top: '50%', left: -15,
    width: 130, height: 130, opacity: 0.5,
    transform: [{ translateY: -55 }, { translateX: 10 }, { rotate: '20deg' }, { scale: 1.3 }],
  },
  submitLabel: { fontFamily: FONTS.bold, fontSize: 16, color: WHITE, textAlign: 'center' },
  progressBarTrack: {
    flexDirection: 'row', height: 31, backgroundColor: '#F7F7F7',
    borderRadius: 33, overflow: 'hidden', padding: 4,
  },
  progressBarFill: {
    backgroundColor: '#FF4500', borderRadius: 25,
    justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 10,
  },
  progressConsumed:      { flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 },
  progressConsumedBold:  { fontFamily: FONTS.extraBold, fontSize: 12, color: WHITE },
  progressConsumedGoal:  { fontFamily: FONTS.regular,   fontSize: 10, color: 'rgba(255,255,255,0.85)' },

  // ── Submit row ──
  submitRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: {
    width: 74, height: 74, borderRadius: 20,
    backgroundColor: BLACK,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#333333',
  },
  submitButton: {
    flex: 1, backgroundColor: BLACK, borderRadius: 20,
    height: 74, alignItems: 'center', justifyContent: 'center',
  },
  submitButtonText: { fontFamily: FONTS.extraBold, fontSize: 17, color: WHITE, letterSpacing: 1.5 },
});
