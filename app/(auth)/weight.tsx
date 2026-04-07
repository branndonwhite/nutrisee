import { useRouter } from "expo-router";
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
} from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/fonts";
import { useRegister } from "../../context/RegisterContext";

const MIN_WEIGHT = 20;
const MAX_WEIGHT = 500;
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCALE_HEIGHT = 300;
const RADIUS = SCREEN_WIDTH * 0.7;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = RADIUS * 1.1;
const DEG_PER_KG = 2.5;
const SVG_PADDING_TOP = 30; // space for labels above arc

export default function WeightScreen() {
  const router = useRouter();
  const { setData } = useRegister();

  const [weight, setWeight] = useState(70);
  const [inputText, setInputText] = useState("70");
  const angleRef = useRef(0); // 0 = center = 70kg
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);

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

  const handleSubmit = () => {
    setData({ weight });
    router.push("/(auth)/height");
  };

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

      // 3 levels of tick length
      const tickLength = isCenter ? 180 : isTen ? 44 : isFive ? 28 : 14;

      const outerX = CENTER_X + RADIUS * Math.sin(angleRad);
      const outerY = CENTER_Y - RADIUS * Math.cos(angleRad) + SVG_PADDING_TOP;
      const innerX = CENTER_X + (RADIUS - tickLength) * Math.sin(angleRad);
      const innerY = CENTER_Y - (RADIUS - tickLength) * Math.cos(angleRad) + SVG_PADDING_TOP;

      // Label above outer edge
      const labelRadius = RADIUS + 28;
      const labelX = CENTER_X + labelRadius * Math.sin(angleRad);
      const labelY = CENTER_Y - labelRadius * Math.cos(angleRad) + SVG_PADDING_TOP;

      // Relaxed visibility — only clip if truly off screen
      const isLabelVisible = labelY > 0 && labelY < SCALE_HEIGHT + SVG_PADDING_TOP
        && labelX > 0 && labelX < SCREEN_WIDTH;

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
              fontSize={13}
              fill="#888"
              fontFamily={FONTS.regular}
            >
              {kg}
            </SvgText>
          )}
        </React.Fragment>,
      );
    }
    return ticks;
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
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

      {/* Weight Card */}
      <View style={styles.weightCard}>
        <Text style={styles.weightCardTitle}>Berat Badan</Text>
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

      {/* Indicator arrow — fixed position */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorArrow} />
      </View>

      {/* Curved Scale */}
      <View style={styles.scaleContainer} {...panResponder.panHandlers}>
        <Svg width={SCREEN_WIDTH} height={SCALE_HEIGHT + SVG_PADDING_TOP}>
          {renderTicks()}
        </Svg>
      </View>
      
      {/* Center label — completely outside scaleContainer */}
      {weight % 5 === 0 && (
        <Text style={styles.centerLabel}>{weight}</Text>
      )}

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
        <Text style={styles.nextButtonText}>›</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footerNote}>
        Nutrisee berkomitmen untuk menggunakan data pribadi{"\n"}
        anda hanya untuk kebutuhan fungsional aplikasi.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
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
    marginTop: 8,
    lineHeight: 20,
  },
  weightCard: {
    backgroundColor: "#FF3E00",
    borderRadius: 20,
    marginHorizontal: 28,
    padding: 10,
    marginBottom: 16,
  },
  weightCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
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
    marginLeft: -8,
  },
  scaleContainer: {
    height: SCALE_HEIGHT + SVG_PADDING_TOP,
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  centerLabel: {
    position: 'absolute',
    top: -9,           
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#888',
    zIndex: 25
  },
  indicatorContainer: {
    position: "absolute",
    top: 475,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
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
  scaleSvg: {
    position: "absolute",
    top: 0,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 100,
    zIndex: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: FONTS.bold,
    lineHeight: 32,
  },
  footerNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 24,
    position: "absolute",
    bottom: 38,
    left: 0,
    right: 0,
  },
});
