import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import { useRegister } from '../../context/RegisterContext';

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 250;
const RULER_WIDTH = 150;
const PX_PER_CM = 10; // pixels per cm
const RULER_HEIGHT = 400;

export default function HeightScreen() {
  const router = useRouter();
  const { setData } = useRegister();

  const [height, setHeight] = useState(164);
  const [inputText, setInputText] = useState('164');
  const [loading, setLoading] = useState(false);
  const offsetRef = useRef(164 * PX_PER_CM);
  const lastYRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const clamp = (val: number) =>
    Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, val));

  const applyOffset = useCallback((offset: number) => {
    const clamped = Math.min(
      MAX_HEIGHT * PX_PER_CM,
      Math.max(MIN_HEIGHT * PX_PER_CM, offset)
    );
    offsetRef.current = clamped;
    const cm = clamp(Math.round(clamped / PX_PER_CM));
    setHeight(cm);
    setInputText(String(cm));
  }, []);

  const startMomentum = useCallback((velocity: number) => {
    if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    let vel = velocity;
    const friction = 0.93;
    const step = () => {
      vel *= friction;
      if (Math.abs(vel) < 0.3) return;
      applyOffset(offsetRef.current + vel);
      animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [applyOffset]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => {
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        lastYRef.current = gs.y0;
        velocityRef.current = 0;
      },
      onPanResponderMove: (_, gs) => {
        const dy = gs.moveY - lastYRef.current;
        lastYRef.current = gs.moveY;
        velocityRef.current = dy;
        // swipe up = increase height, swipe down = decrease
        applyOffset(offsetRef.current - dy);
      },
      onPanResponderRelease: () => {
        startMomentum(-velocityRef.current * 3);
      },
    })
  ).current;

  const handleInputChange = (text: string) => {
    setInputText(text);
    const num = parseInt(text);
    if (!isNaN(num) && num >= MIN_HEIGHT && num <= MAX_HEIGHT) {
      offsetRef.current = num * PX_PER_CM;
      setHeight(num);
    }
  };

  const handleSubmit = () => {
    setData({ height });
    router.push('/(auth)/activity-level');
  };

  const renderRuler = () => {
    const ticks = [];
    const visibleRange = 15;
    const centerY = RULER_HEIGHT / 2;
    const rightEdge = RULER_WIDTH; // ticks start from right edge

    for (let cm = height - visibleRange; cm <= height + visibleRange; cm++) {
      if (cm < MIN_HEIGHT || cm > MAX_HEIGHT) continue;

      const relativeCm = cm - height;
      const y = centerY + relativeCm * PX_PER_CM;

      const isTen = cm % 10 === 0;
      const isFive = cm % 5 === 0 && !isTen;
      const isCenter = cm === height;

      const tickWidth = isCenter ? 64 : isTen ? 54 : isFive ? 40 : 32;

      // Ticks extend FROM right edge LEFTWARD
      const x2 = rightEdge;
      const x1 = x2 - tickWidth;
      
      const labelX = x2 - 54 - 12; 

      ticks.push(
        <React.Fragment key={cm}>
          <Line
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={isCenter ? '#FF3E00' : isTen ? '#555' : isFive ? '#888' : '#CCC'}
            strokeWidth={isCenter ? 2.5 : isTen ? 2 : isFive ? 1.5 : 1}
          />
          {isTen && (
            <SvgText
              x={labelX - 8}       
              y={y}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize={23}
              fill="#888"
              fontFamily={FONTS.bold}
            >
              {cm}
            </SvgText>
          )}
        </React.Fragment>
      );
    }
    return ticks;
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

      {/* Height Card + Ruler side by side */}
      <View style={styles.content}>
        {/* Left side — card centered vertically */}
        <View style={styles.cardWrapper}>
            <View style={styles.heightCard}>
              <Text style={styles.heightCardTitle}>Tinggi Badan</Text>
              <View style={styles.heightDisplay}>
                  <TextInput
                  style={styles.heightInput}
                  value={inputText}
                  onChangeText={handleInputChange}
                  keyboardType="numeric"
                  maxLength={3}
                  selectTextOnFocus
                  />
                  <Text style={styles.heightUnit}>cm</Text>
              </View>
            </View>
        </View>

        {/* Right side — ruler */}
        <View style={styles.rulerContainer} {...panResponder.panHandlers}>
            <View style={styles.indicatorArrow} />
            <Svg width="100%" height={400}>
            {renderRuler()}
            </Svg>
        </View>
      </View>

      {/* Bottom section — button + footer in normal flow */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/(auth)/activity-level")}
          disabled={loading}
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
    marginBottom: 28,
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
  content: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',        
    justifyContent: 'flex-start',
    marginHorizontal: 24,
    gap: 16,
  },
  cardWrapper: {
    justifyContent: 'center',  
    alignItems: 'center',
  },
  heightCard: {
    backgroundColor: '#FF3E00',
    borderRadius: 20,
    padding: 10,
    width: 220,
  },
  heightCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  heightDisplay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  heightInput: {
    fontFamily: FONTS.extraBold,
    fontSize: 90,
    color: '#FF3E00',
    textAlign: 'center',
    minWidth: 120,
    padding: 0,
  },
  heightUnit: {
    fontFamily: FONTS.medium,
    fontSize: 32,
    color: COLORS.textSecondary,
    marginTop: -8,
  },
  rulerContainer: {
    width: 150,
    height: 320,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  indicatorArrow: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FF3E00',
    zIndex: 10,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 34,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    zIndex: 20,
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