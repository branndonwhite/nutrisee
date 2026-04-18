import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/fonts";
import { useRegister } from "../../context/RegisterContext";
import { updateWeight } from "../../api/client";
import { BackArrowIcon } from "@/assets/images/icon";

const MIN_WEIGHT = 20;
const MAX_WEIGHT = 155;
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCALE_HEIGHT = 250;
const RADIUS = SCREEN_WIDTH * 0.7;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = RADIUS * 1.1;
const DEG_PER_KG = 2.4;
const SVG_PADDING_TOP = 30;

export default function WeightScreen() {
  const router = useRouter();
  const { setData } = useRegister();

  // mode = 'register' (default) | 'update'
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isUpdate = mode === "update";

  const [weight, setWeight] = useState(70);
  const [inputText, setInputText] = useState("70");
  const [loading, setLoading] = useState(false);
  const angleRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);

  // ── Today's date (for update mode) ──────────────────────────────
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Scale logic (unchanged) ──────────────────────────────────────
  const clamp = (val: number) =>
    Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, val));

  const angleToKg = (angle: number) =>
    clamp(Math.round(70 + angle / DEG_PER_KG));

  const applyAngle = useCallback((angle: number) => {
    const maxAngle = (MAX_WEIGHT - 70) * DEG_PER_KG;
    const minAngle = (MIN_WEIGHT - 70) * DEG_PER_KG;
    const clamped = Math.min(maxAngle, Math.max(minAngle, angle));
    currentAngleRef.current = clamped;
    const kg = angleToKg(clamped);
    setWeight(kg);
    setInputText(String(kg));
  }, []);

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
        applyAngle(currentAngleRef.current - dx * 0.15);
      },
      onPanResponderRelease: () => {
        startMomentum(-velocityRef.current * 5);
      },
    }),
  ).current;

  const handleInputChange = (text: string) => {
    setInputText(text);
    const num = parseInt(text);
    if (!isNaN(num) && num >= MIN_WEIGHT && num <= MAX_WEIGHT) {
      const angle = (num - 70) * DEG_PER_KG;
      currentAngleRef.current = angle;
      setWeight(num);
    }
  };

  // ── Submit handlers ──────────────────────────────────────────────
  const handleRegisterSubmit = () => {
    setData({ weight });
    router.push("/(auth)/height");
  };

  const handleUpdateSubmit = async () => {
    setLoading(true);
    try {
      await updateWeight({ weight });
      router.back();
    } catch (e) {
      console.error("Failed to update weight", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Ticks (unchanged) ────────────────────────────────────────────
  const renderTicks = () => {
    const ticks = [];
    const visibleRange = 30;

    for (let kg = weight - visibleRange; kg <= weight + visibleRange; kg++) {
      if (kg < MIN_WEIGHT || kg > MAX_WEIGHT) continue;

      const relativeAngle = (kg - weight) * DEG_PER_KG;
      const angleRad = (relativeAngle * Math.PI) / 180;

      const isTen = kg % 10 === 0;
      const isFive = kg % 5 === 0 && !isTen;
      const isCenter = kg === weight;
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

  // ── Render ───────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {isUpdate && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}

      {/* ── Header: different for each mode ── */}
      {isUpdate ? (
        <View style={styles.updateHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <BackArrowIcon width={10} height={10} fill="#000" />
          </TouchableOpacity>
          <Text style={styles.updateTitle}>Update Berat Badan</Text>
          <View style={styles.headerSpacer} />
        </View>
      ) : (
        <View style={styles.header}>
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

      {/* ── Date subtitle (update mode only) ── */}
      {isUpdate && (
        <Text style={styles.dateText}>{dateStr}</Text>
      )}

      {/* ── Weight Card: label changes per mode ── */}
      <View style={styles.weightCard}>
        <Text style={styles.weightCardTitle}>
          {isUpdate ? "Berat Badan Terbaru" : "Berat Badan"}
        </Text>
        <View style={styles.weightDisplay}>
          <TextInput
            style={styles.weightInput}
            value={inputText}
            onChangeText={handleInputChange}
            keyboardType="numeric"
            maxLength={3}
            selectTextOnFocus
          />
          <Text style={styles.weightUnit}>kg</Text>
        </View>
      </View>

      {/* ── Indicator arrow ── */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorArrow} />
      </View>

      {/* ── Curved Scale ── */}
      <View style={styles.scaleContainer} {...panResponder.panHandlers}>
        <Svg width={SCREEN_WIDTH} height={SCALE_HEIGHT + SVG_PADDING_TOP}>
          {renderTicks()}
        </Svg>
      </View>

      {/* ── Bottom section: different button per mode ── */}
      <View style={styles.bottomSection}>
        {isUpdate ? (
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
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
            <Text style={styles.nextButtonText}>›</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerNote}>
          Nutrisee berkomitmen untuk menggunakan data pribadi{"\n"}
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
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  // ── Register header ──────────────────────────────────────────────
  header: {
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
  logo: {
    width: 110,
    height: 49,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },

  // ── Update header ────────────────────────────────────────────────
  updateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingTop: Platform.OS === "android" ? 12 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 2
  },
  updateTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: { width: 40 },
  dateText: {
    textAlign: "center",
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#888888",
    marginBottom: 20,
  },

  // ── Weight card ──────────────────────────────────────────────────
  weightCard: {
    backgroundColor: "#FF3E00",
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
  },
  weightCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: "#fff",
    fontStyle: "italic",
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

  // ── Scale ────────────────────────────────────────────────────────
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

  // ── Bottom section ───────────────────────────────────────────────
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
  nextButtonText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: FONTS.semiBold,
  },
  updateButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 80,
    alignItems: "center",
    marginBottom: 40,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  updateButtonDisabled: {
    backgroundColor: "#555555",
  },
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