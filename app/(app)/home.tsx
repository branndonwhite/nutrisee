import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  Image,
  ImageBackground,
  Animated,
  PanResponder,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import BlurContainer from '../../components/BlurContainer';
import {
  NIcon, AIOverviewIcon, CalorieIcon, AchievementIcon,
  DietIcon, FavIcon, NutriscanIcon, UpdateIcon, MaleIcon, FemaleIcon, TextIcon
} from '../../assets/images/icon';
import { statue, body, fish } from '../../assets/images/bg-photo';
import { getDailyStats, getAIOverview, DailyStats } from '../../api/dashboard';
import * as SecureStore from 'expo-secure-store';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
// 3-column grid: full width minus horizontal padding (16*2) minus 2 gaps (10*2), divided by 3
const GRID_PADDING = 32;
const GRID_GAP = 10;
const NUTRITION_COL_WIDTH = (SCREEN_WIDTH - GRID_PADDING - GRID_GAP * 2) / 3;

const HEADER_HEIGHT = 120;
const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 140 : 148;
const VIEWPORT_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - NAVBAR_HEIGHT;
const CARD_GAP = 24;

const TOTAL_CARDS = 3;


// Abstract background images — require() calls must be static
const ABSTRACT = {
  p1: require('../../assets/images/abstract/Protein 1.png'),
  p2: require('../../assets/images/abstract/Protein 2.png'),
  p3: require('../../assets/images/abstract/Protein 3.png'),
  p7: require('../../assets/images/abstract/Protein 7.png'),
  p8: require('../../assets/images/abstract/Protein 8.png'),
} as const;

// Maps each nutrition key to its abstract fill image
const NUTRITION_ABSTRACT: Record<string, ReturnType<typeof require>> = {
  karbo:      ABSTRACT.p1,
  protein:    ABSTRACT.p2,
  lemak:      ABSTRACT.p8,
  gula:       ABSTRACT.p8,
  serat:      ABSTRACT.p1,
  kalsium:    ABSTRACT.p7,
  vitaminA:   ABSTRACT.p2,
  vitaminC:   ABSTRACT.p1,
  vitaminD:   ABSTRACT.p8,
  kolesterol: ABSTRACT.p1,
};

const NUTRITION_IMG_TRANSFORM: Record<string, any[]> = {
  karbo:      [{ translateX: -18 }],
  protein:    [{ scale: 1.3 }],
  lemak:      [{ scale: 1.3 }],
  gula:       [{ translateX: -20 }],
  serat:      [{ translateX: 18 }],
  kalsium:    [{ translateX: -16 }, { translateY: -6 }, { scale: 1.3 }],
  vitaminA:   [{ rotate: '90deg' }, { translateX: -16 }, { scale: 1.5 }],
  vitaminC:   [{ rotate: '30deg' }, { translateY: 10 }, { scale: 1.6 }],
  vitaminD:   [{ translateX: 16 }, { translateY: -12 }, { scale: 1.3 }],
  kolesterol: [{ scaleX: -1 }, { scale: 2 }, { translateX: -50 }, { translateY: 10 }],
};

type NutrientKey = 'karbo' | 'protein' | 'lemak' | 'gula' | 'serat' | 'kalsium' | 'vitaminA' | 'vitaminC' | 'vitaminD' | 'kolesterol';

const ALL_NUTRIENTS: { key: NutrientKey; label: string; shortLabel: string }[] = [
  { key: 'karbo',      label: 'Karbohidrat', shortLabel: 'Karbo'     },
  { key: 'protein',    label: 'Protein',     shortLabel: 'Protein'   },
  { key: 'lemak',      label: 'Lemak',       shortLabel: 'Lemak'     },
  { key: 'gula',       label: 'Gula',        shortLabel: 'Gula'      },
  { key: 'serat',      label: 'Serat',       shortLabel: 'Serat'     },
  { key: 'kalsium',    label: 'Kalsium',     shortLabel: 'Kalsium'   },
  { key: 'vitaminA',   label: 'Vitamin A',   shortLabel: 'Vit. A'    },
  { key: 'vitaminC',   label: 'Vitamin C',   shortLabel: 'Vit. C'    },
  { key: 'vitaminD',   label: 'Vitamin D',   shortLabel: 'Vit. D'    },
  { key: 'kolesterol', label: 'Kolesterol',  shortLabel: 'Kolesterol' },
];

const DEFAULT_NUTRIENTS: NutrientKey[] = ['karbo', 'protein', 'lemak', 'gula', 'serat'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Gesture nav  → insets.bottom ≈ 0  → treat same as iOS (24 px breathing room)
  // 3-button nav → insets.bottom ≈ 48 → add only 4 px on top (keeps old spacing)
  const navbarPb  = insets.bottom + (insets.bottom > 0 ? 4 : 24);
  const navbarPt  = Platform.OS === 'ios' ? 12 : 8;
  const navbarH   = navbarPt + 72 + navbarPb + 16; // 16 px visual buffer
  const [showScanModal, setShowScanModal] = useState(false);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [aiOverview, setAiOverview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedNutrients, setSelectedNutrients] = useState<NutrientKey[]>(DEFAULT_NUTRIENTS);
  const [pendingNutrients, setPendingNutrients] = useState<NutrientKey[]>(DEFAULT_NUTRIENTS);
  const [showNutrientPicker, setShowNutrientPicker] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('selectedNutrients').then(raw => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as NutrientKey[];
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedNutrients(parsed);
      } catch {}
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      const fetchData = async () => {
        try {
          // Fetch independently so a cache error on AI overview
          // doesn't block the calorie/nutrient stats from updating
          const [statsResult, overviewResult] = await Promise.allSettled([
            getDailyStats(),
            getAIOverview(),
          ]);
          if (!active) return;
          if (statsResult.status === 'fulfilled') {
            setStats(statsResult.value);
          } else {
            const errCode = statsResult.reason?.response?.data?.code;
            const status  = statsResult.reason?.response?.status;
            // Profile not found (onboarding incomplete) → send back to onboarding
            if (errCode === 'NO_PROFILE' || status === 404) {
              await SecureStore.deleteItemAsync('onboarding_complete');
              router.replace('/(auth)/register');
              return;
            }
            console.error('getDailyStats error:', statsResult.reason?.response?.data, statsResult.reason?.message);
          }
          if (overviewResult.status === 'fulfilled') setAiOverview(overviewResult.value);
          else console.error('getAIOverview error:', overviewResult.reason?.message);
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchData();
      return () => { active = false; };
    }, [])
  );

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

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
  // Fade cards in only after initial position is set — prevents visible jump on first paint
  const cardStackOpacity = useRef(new Animated.Value(0)).current;

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
    // Always update height — cards change size when real data loads
    cardHeightsRef.current[index] = height;
    // Count how many are measured
    const measured = cardHeightsRef.current.filter(h => h !== undefined).length;
    if (measured === TOTAL_CARDS) {
      const positions = buildSnapPositions(cardHeightsRef.current);
      snapPositionsRef.current = positions;
      setSnapPositions(positions);
      // Always re-centre the currently focused card.
      // This covers both the initial layout and subsequent data-driven
      // height changes (e.g. AI text loading in after the first paint).
      translateY.setValue(positions[currentIndexRef.current]);
      if (measuredRef.current < TOTAL_CARDS) {
        // First time all cards are measured — fade in so the user never
        // sees the cards at the wrong (pre-snap) position.
        measuredRef.current = TOTAL_CARDS;
        Animated.timing(cardStackOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
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
        translateY.stopAnimation();
        translateY.extractOffset();
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
  const getColorScheme = (consumed: number, goal: number): { bar: string; shape: string; opacity: number } => {
    if (goal === 0) return { bar: '#FF3E00', shape: '#AD2A00', opacity: 0.5 };
    const ratio = consumed / goal;
    if (ratio < 1.0)   return { bar: '#FF3E00', shape: '#AD2A00', opacity: 0.5  };
    if (ratio <= 1.10) return { bar: '#164463', shape: '#267BB5', opacity: 0.5  };
    return { bar: '#ED0000', shape: '#CF1818', opacity: 0.85 };
  };

  const getNutrientData = (key: NutrientKey) => {
    const t = stats?.today;
    const mg = stats?.macro_goals;
    const map: Record<NutrientKey, { consumed: number; goal: number }> = {
      karbo:      { consumed: t?.carbs   ?? 0, goal: mg?.carbs   ?? 0 },
      protein:    { consumed: t?.protein ?? 0, goal: mg?.protein ?? 0 },
      lemak:      { consumed: t?.fat     ?? 0, goal: mg?.fat     ?? 0 },
      gula:       { consumed: t?.sugar   ?? 0, goal: mg?.sugar   ?? 0 },
      serat:      { consumed: t?.fiber   ?? 0, goal: mg?.fiber   ?? 0 },
      kalsium:    { consumed: t?.calcium     ?? 0, goal: 1000 },
      vitaminA:   { consumed: t?.vitamin_a   ?? 0, goal: 900  },
      vitaminC:   { consumed: t?.vitamin_c   ?? 0, goal: 90   },
      vitaminD:   { consumed: t?.vitamin_d   ?? 0, goal: 20   },
      kolesterol: { consumed: t?.cholesterol ?? 0, goal: 300  },
    };
    return map[key];
  };

  const calorieGoal = stats?.today?.calorie_goal ?? 0;
  const caloriesIn = stats?.today?.calories_consumed ?? 0;
  const caloriesLeft = calorieGoal - caloriesIn;
  const calorieProgress = calorieGoal > 0 ? Math.min(caloriesIn / calorieGoal, 1) : 0;
  const safeCalorieProgress = Math.max(calorieProgress, 0.001);
  const safeCalorieRemaining = Math.max(1 - calorieProgress, 0.001);
  const calorieScheme = getColorScheme(caloriesIn, calorieGoal);

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
          {loading
            ? <ActivityIndicator color="#014FE9" style={{ marginVertical: 20 }} />
            : <Text style={styles.aiCardText}>{aiOverview}</Text>
          }
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
        {/* Header area — overflow:hidden here strictly contains the abstract image
            so it can never bleed into the white calorieBar below, regardless of
            any parent transform (scale/opacity from getCardStyle). */}
        <View style={styles.calorieHeaderWrapper}>
          <Image source={ABSTRACT.p3} style={[styles.calorieCardAbstract, { transform: [{ translateX: 125 }, { translateY: -140 }, { scale: 0.5 }, { rotate: '22deg' }] }]} resizeMode="cover" />
          <View style={styles.calorieHeader}>
            <View style={styles.calorieTitleRow}>
              <CalorieIcon width={20} height={20} />
              <Text style={styles.calorieTitle}> Kalori Harian</Text>
            </View>
            <Text style={styles.calorieGoalText}>
              {calorieGoal}
              <Text style={styles.calorieUnit}>kkal/hari</Text>
            </Text>
          </View>
        </View>
        <View style={styles.calorieBar}>
          {/* Only show the fill when calories have actually been logged */}
          {caloriesIn > 0 && (
            <ImageBackground
              source={ABSTRACT.p2}
              style={[styles.calorieProgress, { flex: safeCalorieProgress, backgroundColor: calorieScheme.bar }]}
              imageStyle={[styles.barFillImg, { tintColor: calorieScheme.shape, opacity: calorieScheme.opacity, transform: [{ scaleX: -1 }] }]}
              resizeMode="cover"
            >
              <Text style={styles.calorieIn}>{caloriesIn}</Text>
              <Text style={styles.calorieInLabel}>masuk</Text>
            </ImageBackground>
          )}
          <View style={[styles.calorieRemaining, { flex: caloriesIn > 0 ? safeCalorieRemaining : 1 }]}>
            <Text style={styles.calorieLeftValue}>{caloriesLeft}</Text>
            <Text style={styles.calorieLeftLabel}>tersisa</Text>
          </View>
        </View>
      </View>

      {/* Nutrition Grid — dynamic, driven by selectedNutrients */}
      <View style={styles.nutritionGrid}>
        {(() => {
          // Split selected nutrients into rows of 3, then fill last row with + button
          const items: (NutrientKey | '__add__')[] = [...selectedNutrients, '__add__'];
          const rows: (NutrientKey | '__add__')[][] = [];
          for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
          return rows.map((row, ri) => (
            <View key={ri} style={styles.nutritionRow}>
              {row.map((key) => {
                if (key === '__add__') return (
                  <View key="add" style={styles.addButtonWrapper}>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => { setPendingNutrients(selectedNutrients); setShowNutrientPicker(true); }}
                    >
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                );
                const item = getNutrientData(key);
                const label = ALL_NUTRIENTS.find(n => n.key === key)?.shortLabel ?? key;
                const unit = ({ kalsium: 'mg', vitaminA: 'μg', vitaminC: 'mg', vitaminD: 'μg', kolesterol: 'mg' } as Record<string, string>)[key] ?? 'gr';
                const scheme = getColorScheme(item.consumed, item.goal);
                const progress = item.goal > 0 ? Math.min(item.consumed / item.goal, 1) : 0;
                const safeProgress = Math.max(progress, 0.001);
                const safeRemaining = Math.max(1 - progress, 0.001);
                return (
                  <View key={key} style={styles.nutritionCard}>
                    {(key === 'kalsium' || key === 'kolesterol') ? (
                      <View style={styles.nutritionCardHeaderScroll}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.nutritionCardHeaderScrollContent}
                        >
                          <Text style={styles.nutritionLabel}>{label}</Text>
                          <Text style={styles.nutritionGoal}>{item.goal}<Text style={styles.nutritionUnit}>{unit}</Text></Text>
                        </ScrollView>
                      </View>
                    ) : (
                      <View style={styles.nutritionCardHeader}>
                        <Text style={styles.nutritionLabel} numberOfLines={1}>{label}</Text>
                        <Text style={styles.nutritionGoal}>{item.goal}<Text style={styles.nutritionUnit}>{unit}</Text></Text>
                      </View>
                    )}
                    <View style={styles.nutritionBar}>
                      <View style={[styles.nutritionBarRemaining, { flex: safeRemaining }]} />
                      <ImageBackground
                        source={NUTRITION_ABSTRACT[key] ?? ABSTRACT.p1}
                        style={[styles.nutritionBarFill, { flex: safeProgress, backgroundColor: scheme.bar }]}
                        imageStyle={[styles.barFillImg, { tintColor: scheme.shape, opacity: scheme.opacity, transform: NUTRITION_IMG_TRANSFORM[key] ?? [] }]}
                        resizeMode="cover"
                      />
                      {/* Value pinned to center of the whole bar, color switches at midpoint */}
                      <View style={styles.nutritionValueOverlay} pointerEvents="none">
                        <Text style={[styles.nutritionValue, { color: progress > 0.5 ? '#fff' : '#888' }]}>
                          {item.consumed}<Text style={[styles.nutritionValueUnit, { color: progress > 0.5 ? '#fff' : '#888' }]}>{unit}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ));
        })()}
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
        <Text style={styles.pencapaianDefisit}>{stats?.pencapaian?.label ?? '-'}</Text>
        <Text style={styles.pencapaianValue}>
          <Text style={styles.pencapaianHighlight}>{stats?.pencapaian?.value ?? 0}</Text>
          {stats?.pencapaian?.unit ?? 'kkal'}
        </Text>
        <Text style={{color: '#fff'}}>dalam <Text style={styles.pencapaianDescription}>{stats?.pencapaian?.description ?? '-'}</Text></Text>
      </View>

      {/* Diet */}
      <View style={[styles.darkCard, styles.dietCard]}>
        <Image source={body} style={styles.dietImage} />
        <View style={styles.darkCardLabelRow}>
          <DietIcon width={18} height={18} />
          <Text style={styles.darkCardLabel}> Diet</Text>
        </View>
        <Text style={styles.dietValue}><Text style={{fontSize: 72}}>{stats?.diet?.kg_remaining?.toFixed(1) ?? '-'}</Text>kg</Text>
        <Text style={{color: '#fff'}}>{stats?.diet?.direction === 'turun' ? 'Turun' : 'Naik'} menuju <Text style={styles.dietDescription}>target berat</Text></Text>
      </View>

      {/* Favorit */}
      <View style={[styles.darkCard, styles.favoritCard]}>
        <Image source={fish} style={styles.favoritImage} />
        <View style={styles.darkCardLabelRow}>
          <FavIcon width={18} height={18} />
          <Text style={styles.darkCardLabel}> Favorit</Text>
        </View>
        <Text style={styles.favoritLabel}>{stats?.favorit?.food_name ?? '🍽️'}</Text>
        <Text style={styles.favoritDescription}>
          {'Kamu mencatatnya sebanyak '}
          <Text style={{fontFamily: FONTS.bold}}>{stats?.favorit?.count ?? 0}x</Text>
          {' dalam\nseminggu ini!'}
        </Text>
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
          style={[styles.cardStack, { transform: [{ translateY }], opacity: cardStackOpacity }]}
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
          Hi <Text style={styles.headerName}>{stats?.profile?.nickname ?? ''}!</Text>
        </Text>
        <Text style={styles.headerDate}>{todayStr}</Text>
      </BlurContainer>

      {/* Navbar — floats above everything */}
      <BlurContainer
        intensity={60}
        tint="light"
        style={[styles.navbar, { paddingBottom: navbarPb, height: navbarH }]}
        androidFallbackColor="rgba(245,245,245,0.95)"
        gradientDirection="footer"
      >
        <TouchableOpacity 
          style={styles.updateWeightButton}
          onPress={() => router.push('/(auth)/weight?mode=update')}  
        >
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

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(app)/profile')}
        >
          <View style={styles.profileInner}>
            {stats?.profile?.avatar_url ? (
              <Image
                source={{ uri: stats.profile.avatar_url }}
                style={{ width: '100%', height: '100%', borderRadius: 0 }}
                resizeMode="cover"
              />
            ) : stats?.profile?.gender?.toLowerCase().includes('laki') ? (
              <MaleIcon width={26} height={26} />
            ) : (
              <FemaleIcon width={26} height={26} />
            )}
          </View>
        </TouchableOpacity>
      </BlurContainer>

      {/* Nutrient Picker Modal */}
      <Modal
        visible={showNutrientPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNutrientPicker(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { justifyContent: 'center' }]}
          activeOpacity={1}
          onPress={() => setShowNutrientPicker(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.nutrientPickerCard}>
              {/* Abstract decoration — top right */}
              <Image
                source={ABSTRACT.p3}
                style={styles.nutrientPickerAbstract}
                resizeMode="cover"
              />
              {/* Header */}
              <View style={styles.nutrientPickerHeader}>
                <Text style={styles.nutrientPickerTitle}>Dashboard Gizi</Text>
              </View>
              <Text style={styles.nutrientPickerSubtitle}>
                Atur Dashboard Gizi sesuai kebutuhanmu!
              </Text>

              {/* Nutrient toggle grid */}
              <View style={styles.nutrientPickerGrid}>
                {ALL_NUTRIENTS.map((n) => {
                  const active = pendingNutrients.includes(n.key);
                  return (
                    <TouchableOpacity
                      key={n.key}
                      style={[styles.nutrientChip, active && styles.nutrientChipActive]}
                      onPress={() => {
                        setPendingNutrients(prev =>
                          prev.includes(n.key)
                            ? prev.filter(k => k !== n.key)
                            : [...prev, n.key]
                        );
                      }}
                    >
                      <Text style={[styles.nutrientChipText, active && styles.nutrientChipTextActive]}>
                        {n.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Update button */}
              <TouchableOpacity
                style={styles.nutrientUpdateBtn}
                onPress={() => {
                  setSelectedNutrients(pendingNutrients);
                  SecureStore.setItemAsync('selectedNutrients', JSON.stringify(pendingNutrients));
                  setShowNutrientPicker(false);
                }}
              >
                <Text style={styles.nutrientUpdateBtnText}>Perbarui</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Scan Modal */}
      <Modal
        visible={showScanModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowScanModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowScanModal(false)}
        >
          <View style={[styles.modalCard, { paddingBottom: 999 + insets.bottom + 16 }]}>
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowScanModal(false);
                  router.push('/(app)/nutriscan-text');
                }}
              >
                <TextIcon width={40} height={40} fill="#000" />
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
                <NutriscanIcon width={40} height={40} fill="#000" />
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
    paddingBottom: VIEWPORT_HEIGHT,
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
    backgroundColor: '#024FE9',
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
    fontFamily: FONTS.boldItalic,
  },
  aiCardBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: -8,
    marginBottom: -8,
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
    overflow: 'hidden',
  },
  // Clips the abstract image to exactly the dark header row — geometry-level
  // containment so it cannot bleed into calorieBar under any transform.
  calorieHeaderWrapper: {
    overflow: 'hidden',
    // Extend to card edges so the abstract image fills the full dark header area
    marginHorizontal: -16,
    marginTop: -16,
    // Restore padding so the header text sits in the right position
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    // No borderRadius — calorieCard's overflow:hidden clips the corners
  },
  calorieCardAbstract: {
    ...StyleSheet.absoluteFillObject,
    tintColor: '#FF3E0080',
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#fff',
  },
  calorieUnit: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#fff',
  },
  calorieBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    height: 72,
    marginHorizontal: -6,
    marginBottom: -6,
    padding: 2,
  },
  calorieProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Applied via ImageBackground's imageStyle prop — sized correctly in flex containers
  barFillImg: {},
  calorieIn: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  calorieInLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  calorieRemaining: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieLeftValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  calorieLeftLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ── Nutrition Grid ────────────────────────────────────────────────
  nutritionGrid: { gap: 10 },
  nutritionRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  nutritionCard: {
    width: NUTRITION_COL_WIDTH,   // explicit — same in both rows regardless of sibling count
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 12,
    height: 120,
  },
  nutritionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nutritionCardHeaderScroll: {
    height: 20,
    marginBottom: 6,
    overflow: 'hidden',
  },
  nutritionCardHeaderScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nutritionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#fff',
  },
  nutritionGoal: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  nutritionUnit: { 
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  // Vertical progress bar — mirrors calorieBar but vertical
  nutritionBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'column', // top = remaining, bottom = filled
    marginHorizontal: -4,
    marginBottom: -4,
    padding: 1
  },
  nutritionBarRemaining: {
    // top portion — white (already from container bg)
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  nutritionBarFill: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  nutritionValueOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
  },
  nutritionValueUnit: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  // Wrapper so the circle button sits centered within the grid cell
  addButtonWrapper: {
    width: NUTRITION_COL_WIDTH,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 74,
    height: 74,
    borderRadius: 50,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 50,
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
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
    marginBottom: 16,
  },
  darkCardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#fff',
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
    fontSize: 36,
    color: '#FF3E00',
  },
  pencapaianDescription: {
    fontFamily: FONTS.bold,
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
    fontSize: 40,
    color: '#fff',
  },
  dietDescription: {
    fontFamily: FONTS.bold,
    fontSize: 16,
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
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
    textAlign:'center',
  },
  favoritDescription: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#fff',
    textAlign:'center',
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
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    // paddingBottom + height applied inline (inset-aware, see navbarStyle below)
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
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
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FF3E00',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // No bottom radius — bleeds into home bar
    paddingTop: 12,
    paddingHorizontal: 12,
    // paddingBottom is set inline: 999 + insets.bottom + 16 (so it clears the
    // system nav bar on both gesture-nav and 3-button-nav Android devices)
    marginBottom: -999, // pulls the bleed back so card sits flush at screen edge
  },
  modalOptions: { flexDirection: 'row', gap: 12 },
  modalOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    // No bottom radius — cards bleed all the way down
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 999,  // bleed below
    marginBottom: -999,  // cancel layout impact so card position is unchanged
    alignItems: 'center',
    gap: 12,
  },
  modalOptionLabel: {
    fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text,
    marginBottom: 4, textAlign: 'center',
  },
  modalOptionDesc: {
    fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },

  // ── Nutrient Picker Modal ─────────────────────────────────────────
  nutrientPickerCard: {
    backgroundColor: '#0E1214',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  nutrientPickerAbstract: {
    position: 'absolute',
    width: 140,
    height: 140,
    top: -7,
    right: -20,
    tintColor: '#313131',
    transform: [{ rotate: '20deg' }],
  },
  nutrientPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nutrientPickerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#fff',
  },
  nutrientPickerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  nutrientPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  nutrientChip: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  nutrientChipActive: {
    backgroundColor: '#FF3E00',
  },
  nutrientChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#888',
  },
  nutrientChipTextActive: {
    color: '#fff',
  },
  nutrientUpdateBtn: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nutrientUpdateBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#fff',
  },
});