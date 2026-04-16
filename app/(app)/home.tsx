import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import BlurContainer from '../../components/BlurContainer';
import {
  NIcon, AIOverviewIcon, CalorieIcon, AchievementIcon,
  DietIcon, FavIcon, NutriscanIcon, UpdateIcon, MaleIcon, FemaleIcon, TextIcon
} from '../../assets/images/icon';
import { statue, body, fish } from '../../assets/images/bg-photo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HEADER_HEIGHT = 100;
const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 96 : 80;
const VIEWPORT_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - NAVBAR_HEIGHT;
const CARD_GAP = 24;

const DUMMY = {
  nickname: 'Martinus',
  date: 'Jumat, 13 Februari 2025',
  gender: 'male',
  aiOverview: 'Hari Sabtu ya jalan-jalan,\nJalan-jalan ke Toko Jamu.\nJangan lupa makan sayuran,\ndan juga tambah lagi vitaminmu!\n\nPola makan kamu sudah tergolong baik! Pertahankan kebiasaan ini dan ikuti anjuran di atas secara konsisten untuk mencapai hasil kesehatan yang optimal ya sobat Nutrisee 😁.',
  calorieGoal: 2650,
  caloriesIn: 2020,
  nutrition: {
    karbo: { consumed: 320, goal: 430 },
    protein: { consumed: 66, goal: 65 },
    lemak: { consumed: 90, goal: 75 },
    gula: { consumed: 62, goal: 50 },
    serat: { consumed: 20, goal: 37 },
  },
  pencapaian: { label: 'Defisit', value: '3000', unit: 'kkal', description: 'dalam 3 hari' },
  diet: { value: '10kg', description: 'turun dalam 1 bulan.' },
  favorit: { label: 'Raja Laut 🐟', description: 'Kamu mengonsumsi lebih dari 5 porsi Ikan dalam seminggu ini!' },
};

const TOTAL_CARDS = 3;

export default function HomeScreen() {
  const router = useRouter();
  const [showScanModal, setShowScanModal] = useState(false);

  // Measured heights of each card
  const cardHeightsRef = useRef<number[]>([]);
  const measuredRef = useRef(0);
  const [snapPositions, setSnapPositions] = useState<number[]>([]);
  const snapPositionsRef = useRef<number[]>([]);

  // Current focused card index
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // The single translateY driving all card movement
  const translateY = useRef(new Animated.Value(0)).current;

  // ─── Snap position calculation ──────────────────────────────────
  // translateY needed to center card[i] in the viewport:
  // cardTop (in stack space) = sum of (prevCardHeight + CARD_GAP) for all prev cards
  // to center: translateY = -(cardTop - (VIEWPORT_HEIGHT - cardHeight) / 2)
  const buildSnapPositions = (heights: number[]) => {
    const positions: number[] = [];
    let runningTop = 0;
    heights.forEach((h) => {
      const centerOffset = Math.max(0, (VIEWPORT_HEIGHT - h) / 2);
      positions.push(-(runningTop - centerOffset));
      runningTop += h + CARD_GAP;
    });
    return positions;
  };

  const handleCardLayout = (index: number, height: number) => {
    if (cardHeightsRef.current[index] !== undefined) return; // already measured
    cardHeightsRef.current[index] = height;
    measuredRef.current += 1;
    if (measuredRef.current === TOTAL_CARDS) {
      const positions = buildSnapPositions(cardHeightsRef.current);
      snapPositionsRef.current = positions; // <-- ref for PanResponder closure
      setSnapPositions(positions);          // <-- state for getCardStyle interpolation
      translateY.setValue(positions[0]);
    }
  };

  // ─── Snap animation ──────────────────────────────────────────────
  const snapTo = (index: number) => {
    if (snapPositionsRef.current.length === 0) return;
    const clamped = Math.max(0, Math.min(index, TOTAL_CARDS - 1));
    currentIndexRef.current = clamped;
    setCurrentIndex(clamped);
    Animated.spring(translateY, {
      toValue: snapPositionsRef.current[clamped],
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  };

  // ─── Pan responder ───────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8,

      onPanResponderGrant: () => {
        // Freeze current value as offset so drag starts from current position
        translateY.stopAnimation();
        translateY.extractOffset(); // <-- replaces setOffset(_value) + setValue(0)
      },

      onPanResponderMove: Animated.event(
        [null, { dy: translateY }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, { dy, vy }) => {
        translateY.flattenOffset();
        const SWIPE_THRESHOLD = 40;
        const VEL_THRESHOLD = 0.3;
        let next = currentIndexRef.current;
        if (dy < -SWIPE_THRESHOLD || vy < -VEL_THRESHOLD) {
          next = Math.min(next + 1, TOTAL_CARDS - 1);
        } else if (dy > SWIPE_THRESHOLD || vy > VEL_THRESHOLD) {
          next = Math.max(next - 1, 0);
        }
        snapTo(next);
      },

      onPanResponderTerminate: () => {
        translateY.flattenOffset();
        snapTo(currentIndexRef.current);
      },
    })
  ).current;

  // ─── Per-card animated style ─────────────────────────────────────
  // Drive scale + opacity from translateY relative to each card's snap position
  const getCardStyle = (index: number) => {
    if (snapPositions.length < TOTAL_CARDS) return {};

    const snapVal = snapPositions[index];

    const opacity = translateY.interpolate({
      inputRange: [snapVal - VIEWPORT_HEIGHT, snapVal - 60, snapVal, snapVal + 60, snapVal + VIEWPORT_HEIGHT],
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
      extrapolate: 'clamp',
    });

    const scale = translateY.interpolate({
      inputRange: [snapVal - VIEWPORT_HEIGHT, snapVal - 60, snapVal, snapVal + 60, snapVal + VIEWPORT_HEIGHT],
      outputRange: [0.88, 0.94, 1, 0.94, 0.88],
      extrapolate: 'clamp',
    });

    return { opacity, transform: [{ scale }] };
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const getNutritionColor = (consumed: number, goal: number) => {
    const ratio = consumed / goal;
    if (ratio <= 0.7) return '#4CAF50';
    if (ratio <= 1.0) return '#FF3E00';
    return '#D32F2F';
  };

  const caloriesLeft = DUMMY.calorieGoal - DUMMY.caloriesIn;
  const calorieProgress = DUMMY.caloriesIn / DUMMY.calorieGoal;

  // ─── Card renders ─────────────────────────────────────────────────

  const renderAICard = () => (
    <Animated.View
      style={[styles.cardSlot, getCardStyle(0)]}
      onLayout={(e) => handleCardLayout(0, e.nativeEvent.layout.height)}
    >
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <View style={styles.aiCardTitleRow}>
            <AIOverviewIcon width={24} height={24} />
            <Text style={styles.aiCardTitle}> <Text style={styles.aiCardTitleItalic}>AI</Text> Overview!</Text>
          </View>
          <NIcon width={28} height={28} />
        </View>
        <View style={styles.aiCardBody}>
          <Text style={styles.aiCardText}>{DUMMY.aiOverview}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderCalorieCard = () => (
    <Animated.View
      style={[styles.cardSlot, getCardStyle(1)]}
      onLayout={(e) => handleCardLayout(1, e.nativeEvent.layout.height)}
    >
      {/* Kalori Harian */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieHeader}>
          <View style={styles.calorieTitleRow}>
            <CalorieIcon width={20} height={20} />
            <Text style={styles.calorieTitle}> Kalori Harian</Text>
          </View>
          <Text style={styles.calorieGoalText}>
            {DUMMY.calorieGoal}
            <Text style={styles.calorieUnit}>kkal/hari</Text>
          </Text>
        </View>
        <View style={styles.calorieBar}>
          <View style={[styles.calorieProgress, { flex: calorieProgress }]}>
            <Text style={styles.calorieIn}>
              {DUMMY.caloriesIn} <Text style={styles.calorieInLabel}>masuk</Text>
            </Text>
          </View>
          <View style={styles.calorieRemaining}>
            <Text style={styles.calorieLeftValue}>{caloriesLeft}</Text>
            <Text style={styles.calorieLeftLabel}>tersisa</Text>
          </View>
        </View>
      </View>

      {/* Nutrition Grid */}
      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionRow}>
          {(['karbo', 'protein', 'lemak'] as const).map((key) => {
            const item = DUMMY.nutrition[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            const color = getNutritionColor(item.consumed, item.goal);
            return (
              <View key={key} style={styles.nutritionCard}>
                <View style={styles.nutritionCardHeader}>
                  <Text style={styles.nutritionLabel}>{label}</Text>
                  <Text style={styles.nutritionGoal}>{item.goal}<Text style={styles.nutritionUnit}>gr</Text></Text>
                </View>
                <View style={[styles.nutritionBox, { backgroundColor: color }]}>
                  <Text style={styles.nutritionValue}>{item.consumed}<Text style={styles.nutritionValueUnit}>gr</Text></Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.nutritionRow}>
          {(['gula', 'serat'] as const).map((key) => {
            const item = DUMMY.nutrition[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            const color = getNutritionColor(item.consumed, item.goal);
            return (
              <View key={key} style={styles.nutritionCard}>
                <View style={styles.nutritionCardHeader}>
                  <Text style={styles.nutritionLabel}>{label}</Text>
                  <Text style={styles.nutritionGoal}>{item.goal}<Text style={styles.nutritionUnit}>gr</Text></Text>
                </View>
                <View style={[styles.nutritionBox, { backgroundColor: color }]}>
                  <Text style={styles.nutritionValue}>{item.consumed}<Text style={styles.nutritionValueUnit}>gr</Text></Text>
                </View>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowScanModal(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderCardsSection = () => (
    <Animated.View
      style={[styles.cardSlot, getCardStyle(2)]}
      onLayout={(e) => handleCardLayout(2, e.nativeEvent.layout.height)}
    >
      {/* Pencapaian */}
      <View style={[styles.darkCard, styles.pencapaianCard]}>
        <Image source={statue} style={styles.pencapaianImage} />
        <View style={styles.darkCardLabelRow}>
          <AchievementIcon width={18} height={18} />
          <Text style={styles.darkCardLabel}> Pencapaian</Text>
        </View>
        <Text style={styles.pencapaianDefisit}>{DUMMY.pencapaian.label}</Text>
        <Text style={styles.pencapaianValue}>
          <Text style={styles.pencapaianHighlight}>{DUMMY.pencapaian.value}</Text>
          {DUMMY.pencapaian.unit}
        </Text>
        <Text style={styles.pencapaianDescription}>{DUMMY.pencapaian.description}</Text>
      </View>

      {/* Diet */}
      <View style={[styles.darkCard, styles.dietCard]}>
        <Image source={body} style={styles.dietImage} />
        <View style={styles.darkCardLabelRow}>
          <DietIcon width={18} height={18} />
          <Text style={styles.darkCardLabel}> Diet</Text>
        </View>
        <Text style={styles.dietValue}>{DUMMY.diet.value}</Text>
        <Text style={styles.dietDescription}>{DUMMY.diet.description}</Text>
      </View>

      {/* Favorit */}
      <View style={[styles.darkCard, styles.favoritCard]}>
        <Image source={fish} style={styles.favoritImage} />
        <View style={styles.darkCardLabelRow}>
          <FavIcon width={18} height={18} />
          <Text style={styles.darkCardLabel}> Favorit</Text>
        </View>
        <Text style={styles.favoritLabel}>{DUMMY.favorit.label}</Text>
        <Text style={styles.favoritDescription}>{DUMMY.favorit.description}</Text>
      </View>
    </Animated.View>
  );

  // ─── Root render ──────────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* Gesture area — full screen, behind header/navbar */}
      <View style={styles.gestureArea} {...panResponder.panHandlers}>
        {/* The card stack — translated as one unit */}
        <Animated.View
          style={[styles.cardStack, { transform: [{ translateY }] }]}
        >
          {renderAICard()}
          {renderCalorieCard()}
          {renderCardsSection()}
        </Animated.View>
      </View>

      {/* Header — floats above everything */}
      <BlurContainer
        intensity={60}
        tint="light"
        style={styles.header}
        androidFallbackColor="rgba(245,245,245,0.95)"
        gradientDirection="header"
      >
        <Text style={styles.headerGreeting}>
          Hi <Text style={styles.headerName}>{DUMMY.nickname}!</Text>
        </Text>
        <Text style={styles.headerDate}>{DUMMY.date}</Text>
      </BlurContainer>

      {/* Navbar — floats above everything */}
      <BlurContainer
        intensity={60}
        tint="light"
        style={styles.navbar}
        androidFallbackColor="rgba(245,245,245,0.95)"
        gradientDirection="footer"
      >
        <TouchableOpacity style={styles.updateWeightButton}>
          <View style={styles.updateWeightInner}>
            <UpdateIcon width={26} height={26} />
          </View>
        </TouchableOpacity>

        <View style={styles.cameraButtonOuter}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setShowScanModal(true)}
          >
            <NutriscanIcon width={32} height={32} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileInner}>
            {DUMMY.gender === 'male'
              ? <MaleIcon width={26} height={26} />
              : <FemaleIcon width={26} height={26} />
            }
          </View>
        </TouchableOpacity>
      </BlurContainer>

      {/* Scan Modal */}
      <Modal
        visible={showScanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScanModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowScanModal(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowScanModal(false);
                  router.push('/(app)/nutriscan-text');
                }}
              >
                <View style={styles.modalOptionIconBox}>
                  <TextIcon width={40} height={40} />
                </View>
                <Text style={styles.modalOptionLabel}>Deskripsi Teks</Text>
                <Text style={styles.modalOptionDesc}>
                  Ketik deskripsi makanan{'\n'}yang ingin kamu cek{'\n'}nutrisinya.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowScanModal(false);
                  router.push('/(app)/nutriscan-camera');
                }}
              >
                <View style={styles.modalOptionIconBox}>
                  <NutriscanIcon width={40} height={40} />
                </View>
                <Text style={styles.modalOptionLabel}>Ambil Gambar</Text>
                <Text style={styles.modalOptionDesc}>
                  Cek nutrisi makananmu{'\n'}menggunakan NutriSEE{'\n'}AI Image Recognition.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Full-screen gesture capture area — sits behind header/navbar
  gestureArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  // Card stack starts at HEADER_HEIGHT so cards begin below the header
  cardStack: {
    paddingTop: HEADER_HEIGHT,
    paddingHorizontal: 16,
    gap: CARD_GAP,
  },

  // Each card slot — natural height, no forced size
  cardSlot: {},

  // ── Header ────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    height: HEADER_HEIGHT,
  },
  headerGreeting: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  headerName: {
    fontFamily: FONTS.extraBold,
    color: '#2563EB',
  },
  headerDate: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── AI Card ───────────────────────────────────────────────────────
  aiCard: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 16,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#fff',
  },
  aiCardTitleItalic: {
    fontStyle: 'italic',
  },
  aiCardBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  aiCardText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },

  // ── Calorie Card ──────────────────────────────────────────────────
  calorieCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#fff',
  },
  calorieGoalText: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: '#fff',
  },
  calorieUnit: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#888',
  },
  calorieBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    height: 72,
  },
  calorieProgress: {
    backgroundColor: '#FF3E00',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  calorieIn: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: '#fff',
  },
  calorieInLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#fff',
  },
  calorieRemaining: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieLeftValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: COLORS.text,
  },
  calorieLeftLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // ── Nutrition Grid ────────────────────────────────────────────────
  nutritionGrid: { gap: 10 },
  nutritionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  nutritionCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 12,
  },
  nutritionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#fff',
  },
  nutritionGoal: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#888',
  },
  nutritionUnit: { fontSize: 10 },
  nutritionBox: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 80,
  },
  nutritionValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: '#fff',
  },
  nutritionValueUnit: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  addButtonText: {
    fontSize: 36,
    color: '#888',
    fontFamily: FONTS.regular,
  },

  // ── Dark Cards ────────────────────────────────────────────────────
  darkCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    minHeight: 200,
  },
  darkCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  darkCardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#888',
  },

  pencapaianCard: {},
  pencapaianImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '120%',
    height: '125%',
    resizeMode: 'cover',
  },
  pencapaianDefisit: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#fff',
  },
  pencapaianValue: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#fff',
  },
  pencapaianHighlight: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: '#FF3E00',
  },
  pencapaianDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#FF3E00',
  },

  dietCard: { marginTop: 10 },
  dietImage: {
    position: 'absolute',
    right: -15,
    top: -60,
    bottom: 0,
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  dietValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 48,
    color: '#fff',
  },
  dietDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#fff',
  },

  favoritCard: { marginTop: 10 },
  favoritImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '120%',
    height: '130%',
    resizeMode: 'cover',
  },
  favoritLabel: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    color: '#fff',
    marginBottom: 8,
  },
  favoritDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#fff',
  },

  // ── Navbar ────────────────────────────────────────────────────────
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    height: NAVBAR_HEIGHT,
  },
  updateWeightButton: { alignItems: 'center', justifyContent: 'center' },
  updateWeightInner: {
    width: 44, height: 44,
    backgroundColor: '#014FE9',
    alignItems: 'center', justifyContent: 'center',
    borderTopLeftRadius: 50, borderTopRightRadius: 20,
    borderBottomRightRadius: 20, borderBottomLeftRadius: 50,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonOuter: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,62,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cameraButton: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FF3E00CC',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#FF3E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  profileButton: { alignItems: 'center', justifyContent: 'center' },
  profileInner: {
    width: 44, height: 44,
    backgroundColor: '#E0E0E0',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2, borderColor: '#ECB270',
    borderTopLeftRadius: 20, borderTopRightRadius: 50,
    borderBottomRightRadius: 50, borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Modal ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FF3E00',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 48,
  },
  modalOptions: { flexDirection: 'row', gap: 12 },
  modalOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16, paddingBottom: 30, paddingHorizontal: 8,
    alignItems: 'center',
  },
  modalOptionIconBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  modalOptionLabel: {
    fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text,
    marginBottom: 8, textAlign: 'center',
  },
  modalOptionDesc: {
    fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
});