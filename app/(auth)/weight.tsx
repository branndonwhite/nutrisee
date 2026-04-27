import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import { completeProfile } from "../../api/auth";
import { logWeight, updateWeightGoal, getWeightGoal } from '../../api/weight';
import { BackArrowIcon, NextArrowIcon } from "../../assets/images/icon";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/fonts";
import { useRegister } from "../../context/RegisterContext";

const HEADER_HEIGHT = 120;
const MIN_WEIGHT = 20;
const MAX_WEIGHT = 155;
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCALE_HEIGHT = 250;
const RADIUS = SCREEN_WIDTH * 0.7;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = RADIUS * 1.1;
const DEG_PER_KG = 2.4;
const SVG_PADDING_TOP = 30;

type TabState = { weight: number; angle: number };

export default function WeightScreen() {
  const router = useRouter();
  const { setData, data, clearData } = useRegister();
  // mode: 'register' (default) | 'register-goal' | 'update'
  // 'update' handles both current + goal weight via internal tab switcher
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isUpdate = mode === "update";
  const isRegisterGoal = mode === "register-goal";

  // ── Tab state (update mode only) ──────────────────────────────────
  const [activeTab, setActiveTab] = useState<"current" | "goal">("current");
  const tabUnderlineAnim = useRef(new Animated.Value(0)).current;
  const [tabStates, setTabStates] = useState<{
    current: TabState;
    goal: TabState;
  }>({
    current: { weight: 70, angle: 0 },
    goal: { weight: 70, angle: 0 },
  });

  useEffect(() => {
    if (!isUpdate) return;

    const fetchWeightData = async () => {
      try {
        const data = await getWeightGoal();
        const currentW = data.current_weight ?? 70;
        const goalW = data.target_weight ?? 70;

        setTabStates({
          current: { weight: currentW, angle: (currentW - 70) * DEG_PER_KG },
          goal:    { weight: goalW,    angle: (goalW    - 70) * DEG_PER_KG },
        });

        currentAngleRef.current = (currentW - 70) * DEG_PER_KG;
      } catch (err) {
        console.error('Failed to fetch weight data:', err);
      }
    };

    fetchWeightData();
  }, [isUpdate]);

  // ── Register mode state ───────────────────────────────────────────
  const [weight, setWeight] = useState(70);
  const [inputText, setInputText] = useState("70");
  const [loading, setLoading] = useState(false);

  // ── Scale refs ────────────────────────────────────────────────────
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);

  // ── Date ──────────────────────────────────────────────────────────
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Tab switching ─────────────────────────────────────────────────
  const switchTab = (tab: "current" | "goal") => {
    setActiveTab(tab);
    Animated.spring(tabUnderlineAnim, {
      toValue: tab === "current" ? 0 : 1,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
    // Restore angle ref for the newly active tab
    currentAngleRef.current = tabStates[tab].angle;
  };

  // ── Scale helpers ─────────────────────────────────────────────────
  const clamp = (val: number) =>
    Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, val));
  const angleToKg = (angle: number) =>
    clamp(Math.round(70 + angle / DEG_PER_KG));

  const applyAngle = useCallback(
    (angle: number) => {
      const maxAngle = (MAX_WEIGHT - 70) * DEG_PER_KG;
      const minAngle = (MIN_WEIGHT - 70) * DEG_PER_KG;
      const clamped = Math.min(maxAngle, Math.max(minAngle, angle));
      currentAngleRef.current = clamped;
      const kg = angleToKg(clamped);

      if (isUpdate) {
        setTabStates((prev) => ({
          ...prev,
          [activeTab]: { weight: kg, angle: clamped },
        }));
      } else {
        setWeight(kg);
        setInputText(String(kg));
      }
    },
    [isUpdate, activeTab],
  );

  const applyAngleRef = useRef(applyAngle);
  useEffect(() => {
    applyAngleRef.current = applyAngle;
  }, [applyAngle]);

  const startMomentum = useCallback(
    (velocity: number) => {
      if (animFrameRef.current !== null)
        cancelAnimationFrame(animFrameRef.current);
      let vel = velocity;
      const friction = 0.93;
      const step = () => {
        vel *= friction;
        if (Math.abs(vel) < 0.05) return;
        applyAngle(currentAngleRef.current + vel);
        animFrameRef.current = requestAnimationFrame(step);
      };
      animFrameRef.current = requestAnimationFrame(step);
    },
    [applyAngle],
  );

  const startMomentumRef = useRef(startMomentum);
  useEffect(() => {
    startMomentumRef.current = startMomentum;
  }, [startMomentum]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => {
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        lastXRef.current = gs.x0;
        velocityRef.current = 0;
      },
      onPanResponderMove: (_, gs) => {
        const dx = gs.moveX - lastXRef.current;
        lastXRef.current = gs.moveX;
        velocityRef.current = dx * 0.15;
        applyAngleRef.current(currentAngleRef.current - dx * 0.15);
      },
      onPanResponderRelease: () => {
        startMomentumRef.current(-velocityRef.current * 5);
      },
    }),
  ).current;

  const handleInputChange = (text: string) => {
    const num = parseInt(text);
    if (isUpdate) {
      if (!isNaN(num) && num >= MIN_WEIGHT && num <= MAX_WEIGHT) {
        const angle = (num - 70) * DEG_PER_KG;
        currentAngleRef.current = angle;
        setTabStates((prev) => ({
          ...prev,
          [activeTab]: { weight: num, angle },
        }));
      }
    } else {
      setInputText(text);
      if (!isNaN(num) && num >= MIN_WEIGHT && num <= MAX_WEIGHT) {
        const angle = (num - 70) * DEG_PER_KG;
        currentAngleRef.current = angle;
        setWeight(num);
      }
    }
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleRegisterSubmit = async () => {
    if (isRegisterGoal) {
      setLoading(true);
      try {
        await completeProfile({
          nickname: data.nickname!,
          gender: data.gender!,
          date_of_birth: data.date_of_birth!,
          height: data.height!,
          weight: data.weight!,
          activity_level: data.activity_level!,
          diet_goal: data.diet_goal!,
          target_weight: weight,
        });
        clearData();
        router.replace("/(app)/home");
      } catch (err: any) {
        console.log("Full error:", JSON.stringify(err?.response?.data));
        console.log("Status:", err?.response?.status);
        console.log("Message:", err?.message);
        Alert.alert(
          "Error",
          err?.response?.data?.error || err?.message || "Terjadi kesalahan",
        );
      } finally {
        setLoading(false);
      }
    } else {
      setData({ weight });
      router.push("/(auth)/height");
    }
  };

  const handleUpdateSubmit = async () => {
    const message =
      activeTab === "current"
        ? "Berat badan\nberhasil diperbarui!"
        : "Target berat badan\nberhasil diperbarui!";
    setLoading(true);
    try {
      await Promise.all([
        logWeight({ weight: tabStates.current.weight }),
        updateWeightGoal({ target_weight: tabStates.goal.weight }),
      ]);
      router.replace(
        `/(app)/success-splash?message=${encodeURIComponent(message)}&dest=${encodeURIComponent("/(app)/home")}` as any,
      );
    } catch (e) {
      Alert.alert("Error", "Gagal memperbarui berat badan");
      console.error("Failed to update weight", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Display weight (active tab or register state) ─────────────────
  const displayWeight = isUpdate ? tabStates[activeTab].weight : weight;

  // ── Ticks ─────────────────────────────────────────────────────────
  const renderTicks = () => {
    const ticks = [];
    const visibleRange = 30;

    for (
      let kg = displayWeight - visibleRange;
      kg <= displayWeight + visibleRange;
      kg++
    ) {
      if (kg < MIN_WEIGHT || kg > MAX_WEIGHT) continue;

      const relativeAngle = (kg - displayWeight) * DEG_PER_KG;
      const angleRad = (relativeAngle * Math.PI) / 180;

      const isTen = kg % 10 === 0;
      const isFive = kg % 5 === 0 && !isTen;
      const isCenter = kg === displayWeight;
      const isLabel = kg % 5 === 0;

      const tickLength = isCenter ? 180 : isTen ? 44 : isFive ? 28 : 14;

      const outerX = CENTER_X + RADIUS * Math.sin(angleRad);
      const outerY = CENTER_Y - RADIUS * Math.cos(angleRad) + SVG_PADDING_TOP;
      const innerX = CENTER_X + (RADIUS - tickLength) * Math.sin(angleRad);
      const innerY =
        CENTER_Y - (RADIUS - tickLength) * Math.cos(angleRad) + SVG_PADDING_TOP;

      const labelRadius = RADIUS + 28;
      const labelX = CENTER_X + labelRadius * Math.sin(angleRad);
      const labelY =
        CENTER_Y - labelRadius * Math.cos(angleRad) + SVG_PADDING_TOP;

      const isLabelVisible =
        labelY > 0 &&
        labelY < SCALE_HEIGHT + SVG_PADDING_TOP &&
        labelX > 0 &&
        labelX < SCREEN_WIDTH;

      ticks.push(
        <React.Fragment key={kg}>
          <Line
            x1={outerX}
            y1={outerY}
            x2={innerX}
            y2={innerY}
            stroke={
              isCenter ? "#FF3E00" : isTen ? "#555" : isFive ? "#888" : "#CCC"
            }
            strokeWidth={isCenter ? 2.5 : isTen ? 2 : isFive ? 1.5 : 1}
          />
          {isLabel && isLabelVisible && (
            <SvgText
              x={labelX}
              y={labelY + 4}
              textAnchor="middle"
              fontSize={23}
              fill="#888"
              fontFamily={FONTS.bold}
            >
              {kg}
            </SvgText>
          )}
        </React.Fragment>,
      );
    }
    return ticks;
  };

  const tabUnderlineLeft = tabUnderlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "52%"],
  });

  // ── Render ────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.root, isUpdate && styles.rootUpdate]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {isUpdate && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
      )}

      {/* Header */}
      {isUpdate ? (
        // Update: absolute, home-mirrored height — back button + title + date
        <View style={styles.headerUpdate}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <BackArrowIcon width={10} height={15} fill="#000" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.updateTitle}>Update Berat Badan</Text>
            <Text style={styles.headerDate}>{dateStr}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      ) : (
        // Register: normal flow, original layout — logo + subtitle, no date
        <View style={styles.headerRegister}>
          <Text style={styles.title}>Yuk berkenalan</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>dengan </Text>
            <Image
              source={require("../../assets/images/branding/LOGO_Text_Colored.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>
            Data yang kamu input akan mempengaruhi pengalaman{"\n"}
            penggunaan aplikasi Nutrisee yang lebih optimal.
          </Text>
        </View>
      )}

      {/* Weight Card */}
      <View style={[styles.weightCard, isUpdate && styles.weightCardUpdate]}>
        {/* Tab switcher — update mode only */}
        {isUpdate ? (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => switchTab("current")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "current" && styles.tabLabelActive,
                ]}
              >
                Saat Ini
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => switchTab("goal")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "goal" && styles.tabLabelActive,
                ]}
              >
                Target
              </Text>
            </TouchableOpacity>
            <Animated.View
              style={[styles.tabUnderline, { left: tabUnderlineLeft }]}
            />
          </View>
        ) : (
          <Text style={styles.weightCardTitle}>
            {isRegisterGoal
              ? "Target berat badan saya adalah..."
              : "Berat Badan"}
          </Text>
        )}

        <View style={styles.weightDisplay}>
          <TextInput
            style={styles.weightInput}
            value={String(displayWeight)}
            onChangeText={handleInputChange}
            keyboardType="numeric"
            maxLength={3}
            selectTextOnFocus
          />
          <Text style={styles.weightUnit}>kg</Text>
        </View>
      </View>

      {/* Indicator arrow */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorArrow} />
      </View>

      {/* Curved Scale */}
      <View style={styles.scaleContainer} {...panResponder.panHandlers}>
        <Svg width={SCREEN_WIDTH} height={SCALE_HEIGHT + SVG_PADDING_TOP}>
          {renderTicks()}
        </Svg>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {isUpdate ? (
          <TouchableOpacity
            style={[
              styles.updateButton,
              loading && styles.updateButtonDisabled,
            ]}
            onPress={handleUpdateSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.updateButtonText}>
              {loading ? "Menyimpan..." : "Perbarui"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleRegisterSubmit}
          >
            <NextArrowIcon width={20} height={20} />
          </TouchableOpacity>
        )}

        <Text style={styles.footerNote}>
          {isRegisterGoal
            ? "Target berat badanmu akan menjadi pertimbangan\nNutrisee dalam merekomendasikan program yang sesuai."
            : "Nutrisee berkomitmen untuk menggunakan data pribadi\nanda hanya untuk kebutuhan fungsional aplikasi."}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 80, // register mode — normal flow
  },
  rootUpdate: {
    paddingTop: HEADER_HEIGHT, // update mode — offset for absolute header
  },

  // ── Update header: absolute, mirrors home.tsx geometry ────────────
  headerUpdate: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerDate: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },

  // ── Register header: normal flow, original layout ─────────────────
  headerRegister: {
    alignItems: "center",
    marginBottom: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: "center",
  },
  logo: { width: 110, height: 49 },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },

  // Update header title
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 2,
  },
  backChevron: {
    fontSize: 28,
    color: "#1A1A1A",
    lineHeight: 32,
    marginTop: -2,
  },
  updateTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: { width: 36 },

  // Weight card
  weightCard: {
    backgroundColor: "#FF3E00",
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
  },
  weightCardUpdate: {
    marginTop: 20,
  },
  weightCardTitle: {
    fontFamily: FONTS.boldItalic,
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  weightDisplay: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 170,
  },
  weightInput: {
    fontFamily: FONTS.extraBold,
    fontSize: 90,
    color: "#FF3E00",
    textAlign: "center",
    minWidth: 120,
  },
  weightUnit: {
    fontFamily: FONTS.medium,
    fontSize: 40,
    color: COLORS.textSecondary,
    alignSelf: "flex-end",
    marginBottom: 26,
    marginLeft: -4,
  },

  // Tab switcher
  tabBar: {
    flexDirection: "row",
    marginBottom: 10,
    position: "relative",
    height: 44,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tabLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "rgba(255,255,255,0.55)",
  },
  tabLabelActive: { color: "#FFFFFF" },
  tabUnderline: {
    position: "absolute",
    bottom: 4,
    top: 4,
    width: "46%",
    backgroundColor: "#FF3E00",
    borderRadius: 10,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Scale
  scaleContainer: {
    height: SCALE_HEIGHT + SVG_PADDING_TOP,
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  indicatorContainer: {
    position: "absolute",
    top: 468 + SCALE_HEIGHT / 12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
    paddingTop: 25,
  },
  indicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FF3E00",
  },

  // Bottom section
  bottomSection: {
    alignItems: "center",
    paddingBottom: 34,
    paddingTop: 8,
    marginTop: "auto",
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    zIndex: 20,
  },
  updateButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 80,
    alignItems: "center",
    marginBottom: 40,
    zIndex: 20,
    // shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.18, shadowRadius: 10, elevation: 5,
  },
  updateButtonDisabled: { backgroundColor: "#555555" },
  updateButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  footerNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
