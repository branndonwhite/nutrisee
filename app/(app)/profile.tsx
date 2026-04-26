import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  Platform,
  Image,
  Alert,
  ActionSheetIOS,
  Modal,
  Share,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { BlurView } from 'expo-blur';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import BlurContainer from '../../components/BlurContainer';
import {
  NIcon,
  AIOverviewIcon,
  AchievementIcon,
  CalorieIcon,
  NotesIcon,
  UpdateIcon,
  DownloadIcon,
  ShareIcon,
  MaleIcon,
  FemaleIcon,
  WeightIcon,
  BackArrowIcon
} from '../../assets/images/icon';
import { uploadProfileImage, getProfile } from '../../api/profile';
import { logout } from '../../api/auth';

// ─── Logo assets ──────────────────────────────────────────────────────────────
const LOGO_COLORED = require('../../assets/images/branding/LOGO_Text_Colored.png');
const LOGO_WHITE   = require('../../assets/images/branding/LOGO_Text_White.png');

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_H_PAD = 32;
const PAGE_WIDTH = SCREEN_WIDTH - SCREEN_H_PAD;
const PAGE_CONTENT_WIDTH = PAGE_WIDTH - 32;

const BAR_CHART_HEIGHT = 150;
const BAR_CHART_LABEL_H = 36;

const LINE_H = 120;
const LINE_W = PAGE_CONTENT_WIDTH;

const SHARE_CARD_W = SCREEN_WIDTH - 64;

const BADGE_GAP = 10;
const BADGE_COL_W = (PAGE_CONTENT_WIDTH - BADGE_GAP * 2) / 3;

const TEMP_BACKGROUNDS = [
  require('../../assets/images/bg-photo/fish.jpg'),
  require('../../assets/images/bg-photo/body.jpg'),
  require('../../assets/images/bg-photo/statue.jpg'),
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Nutrient {
  key: string;
  label: string;
  unit: string;
  goal: number;
  values: number[];
  color: string;
}

interface WeightData {
  dates: string[];
  values: number[];
  startWeight: number;
  goalWeight: number;
  targetDays: number;
  color: string;
}

type ShareModalState =
  | { type: 'nutrient'; nutrient: Nutrient }
  | { type: 'weight' };

// ─── Dummy data ───────────────────────────────────────────────────────────────
const DUMMY = {
  fullName: 'Martinus Nathanael',
  gender: 'male',
  height: 164,
  currentWeight: 68,
  streak: 333,
  profilePhoto: null as string | null,

  aiTips: [
    {
      sections: [
        { label: 'Kalori', text: 'Konsumsi kalori kamu sudah menurun selama seminggu terakhir bersama Nutrisee. Jaga kebiasaan baik ini untuk mempercepat proses penurunan berat badanmu!' },
        { label: 'Makro', text: 'Konsumsi karbohidrat mu cukup. Tingkatkan konsumsi protein dan jaga kadar lemak dengan mengurangi konsumsi gorengan.' },
        { label: 'Mikro', text: 'Asupan mikronutrienmu masih kurang minggu ini—coba tambahkan sayur dan buah berwarna agar kebutuhan vitamin dan mineralmu lebih terpenuhi.' },
      ],
    },
    {
      sections: [
        { label: 'Ide Makanan', text: 'Agar tetap sehat dan senang dalam makan siang, coba minggu ini tambahkan variasi seperti:\n\nPagi: Oatmeal dengan buah\nSiang: Ayam panggang atau ikan kukus\nMalam: Sayur tumis atau salad segar' },
        { label: 'Tips Aktivitas', text: 'Luangkan 5–10 menit setiap 1–2 jam untuk berdiri, berjalan ringan, atau melakukan peregangan sederhana agar sirkulasi tubuh tetap lancar dan mengurangi risiko pegal akibat duduk terlalu lama.' },
      ],
    },
    {
      sections: [
        { label: 'Catatan Diet', text: 'Dengan kecepatan saat ini, kamu dapat mencapai gol berat badanmu dalam 64–70 hari lagi. Kurangi konsumsi lemak agar kamu dapat mencapai target dalam 60 hari.\n\nKamu cenderung makan banyak di weekend, coba ganti beberapa snack mu menjadi snack tinggi protein.\n\nKadar protein yang rendah di pagi hari dapat mengurangi produktivitasmu selama sehari loh.' },
      ],
    },
  ],

  weekDates: ['31 Mar', '01 Apr', '02 Apr', '03 Apr', '04 Apr', '05 Apr', '06 Apr'],
  nutrients: [
    { key: 'kalori',  label: 'Kalori',      unit: 'kkal/hari', goal: 2650, values: [2100, 1900, 2200, 1800, 2400, 1700, 1960], color: '#FF3E00' },
    { key: 'karbo',   label: 'Karbohidrat', unit: 'gr/hari',   goal: 430,  values: [390, 320, 410, 290, 420, 300, 480],         color: '#024FE9' },
    { key: 'protein', label: 'Protein',     unit: 'gr/hari',   goal: 65,   values: [55, 48, 70, 42, 65, 50, 68],               color: '#4CAF50' },
    { key: 'lemak',   label: 'Lemak',       unit: 'gr/hari',   goal: 75,   values: [80, 62, 88, 55, 72, 60, 90],               color: '#ECB270' },
    { key: 'gula',    label: 'Gula',        unit: 'gr/hari',   goal: 50,   values: [45, 30, 55, 25, 60, 35, 62],               color: '#E91E63' },
    { key: 'serat',   label: 'Serat',       unit: 'gr/hari',   goal: 37,   values: [22, 18, 28, 15, 30, 20, 20],               color: '#9C27B0' },
  ] as Nutrient[],

  weightData: {
    dates: ["Okt '25", "Nov '25", "Des '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26"],
    values: [75, 71, 73, 70, 68, 67, 65],
    startWeight: 75,
    goalWeight: 64,
    targetDays: 67,
    color: '#FF3E00',
  } as WeightData,

  logDays: [
    { day: 'Minggu', date: '02' },
    { day: 'Senin',  date: '03' },
    { day: 'Selasa', date: '04' },
    { day: 'Rabu',   date: '05' },
    { day: 'Kamis',  date: '06' },
    { day: 'Jumat',  date: '07' },
    { day: 'Sabtu',  date: '08' },
  ],
  logEntries: [
    { time: '08:33', name: 'Bubur Ayam Tradisional',    cal: 400, karbo: 50, protein: 18, lemak: 15 },
    { time: '12:55', name: 'Soto Ayam Bening + Nasi',   cal: 500, karbo: 55, protein: 22, lemak: 18 },
    { time: '19:13', name: 'Ikan Goreng Kuning + Nasi', cal: 650, karbo: 65, protein: 25, lemak: 30 },
  ],
  badges: [
    { key: 'cons_7',    image: require('../../assets/images/badges/Badge_Cons_7.png'),     imageOff: require('../../assets/images/badges/Badge_Cons_7off.png'),      achieved: true  },
    { key: 'cons_30',   image: require('../../assets/images/badges/Badge_Cons_30.png'),    imageOff: require('../../assets/images/badges/Badge_Cons_30off.png'),     achieved: true  },
    { key: 'cons_365',  image: require('../../assets/images/badges/Badge_Cons_365.png'),   imageOff: require('../../assets/images/badges/Badge_Cons_365off.png'),    achieved: false },
    { key: 'food_10',   image: require('../../assets/images/badges/Badge_Food_10.png'),    imageOff: require('../../assets/images/badges/Badge_Food_10off.png'),     achieved: true  },
    { key: 'food_100',  image: require('../../assets/images/badges/Badge_Food_100.png'),   imageOff: require('../../assets/images/badges/Badge_Food_100off.png'),    achieved: true  },
    { key: 'food_1000', image: require('../../assets/images/badges/Badge_Food_1000.png'),  imageOff: require('../../assets/images/badges/Badge_Food_1000off.png'),   achieved: false },
    { key: 'share',     image: require('../../assets/images/badges/Badge_Share.png'),      imageOff: require('../../assets/images/badges/Badge_Share_off.png'),      achieved: true  },
    { key: 'nutrisi',   image: require('../../assets/images/badges/Badge_Nutrition.png'),  imageOff: require('../../assets/images/badges/Badge_Nutrition_off.png'),  achieved: true  },
    { key: 'berat',     image: require('../../assets/images/badges/Badge_Goal.png'),       imageOff: require('../../assets/images/badges/Badge_Goal_off.png'),       achieved: false },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRemarkForState = (state: ShareModalState): string => {
  if (state.type === 'nutrient') {
    const n = state.nutrient;
    const today = n.values[n.values.length - 1];
    const pct = Math.round(Math.abs(today - n.goal) / n.goal * 100);
    return today < n.goal ? `Defisit ${pct}%!` : `Surplus ${pct}%!`;
  }
  const d = DUMMY.weightData;
  const diff = d.startWeight - d.values[d.values.length - 1];
  return diff > 0 ? `Turun ${diff}kg` : `Naik ${Math.abs(diff)}kg`;
};

const getRemarkColor = (state: ShareModalState): string =>
  state.type === 'nutrient' ? state.nutrient.color : DUMMY.weightData.color;

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const BarChart: React.FC<{ nutrient: Nutrient; dates: string[]; contentWidth?: number }> = ({
  nutrient, dates, contentWidth,
}) => {
  const todayIdx = dates.length - 1;
  const maxVal = Math.max(...nutrient.values, nutrient.goal) * 1.08;
  const goalPct = nutrient.goal / maxVal;
  const LABEL_W = 36;

  return (
    <View style={[bStyles.root, contentWidth ? { width: contentWidth } : undefined]}>
      <Text style={[bStyles.goalLabel, { bottom: BAR_CHART_LABEL_H + goalPct * BAR_CHART_HEIGHT - 7 }]}>
        {nutrient.goal}
      </Text>
      <View style={[bStyles.goalLineRow, { bottom: BAR_CHART_LABEL_H + goalPct * BAR_CHART_HEIGHT, left: LABEL_W }]}>
        <View style={bStyles.goalDash} />
      </View>
      <View style={[bStyles.barsArea, { left: LABEL_W }]}>
        {nutrient.values.map((val, i) => {
          const isToday = i === todayIdx;
          const fillH = Math.max(6, (val / maxVal) * BAR_CHART_HEIGHT);
          return (
            <View key={i} style={bStyles.col}>
              <View style={bStyles.barContainer}>
                {isToday && (
                  <Text numberOfLines={1} style={[bStyles.todayValueLabel, { color: nutrient.color, bottom: fillH + 4 }]}>
                    {val}
                  </Text>
                )}
                <View style={[bStyles.barFill, {
                  height: fillH,
                  backgroundColor: isToday ? nutrient.color : 'rgba(210,210,210,0.2)',
                  borderRadius: 10,
                }]} />
              </View>
              <View style={[bStyles.timelineDot, isToday && { backgroundColor: nutrient.color }]} />
              <Text style={[bStyles.dateLabel, isToday && bStyles.dateLabelToday]}>
                {dates[i].split(' ')[0]}{'\n'}{dates[i].split(' ')[1]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const bStyles = StyleSheet.create({
  root: { marginTop: 12, height: BAR_CHART_HEIGHT + BAR_CHART_LABEL_H + 28, position: 'relative' },
  goalLineRow: { position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  goalLabel: { position: 'absolute', left: 0, fontFamily: FONTS.bold, fontSize: 11, color: '#FF3E00', zIndex: 3, backgroundColor: '#1A1A1A', paddingHorizontal: 2, borderRadius: 4 },
  goalDash: { flex: 1, height: 0, borderTopWidth: 1.5, borderColor: '#FF3E00', borderStyle: 'dashed' },
  barsArea: { position: 'absolute', bottom: 0, right: 0, height: BAR_CHART_HEIGHT + BAR_CHART_LABEL_H + 28, flexDirection: 'row', alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center' },
  todayValueLabel: { fontFamily: FONTS.bold, fontSize: 11, textAlign: 'center', position: 'absolute', alignSelf: 'center', minWidth: 36 },
  barContainer: { width: '72%', height: BAR_CHART_HEIGHT, justifyContent: 'flex-end', position: 'relative' },
  barFill: { width: '100%' },
  timelineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 6 },
  dateLabel: { fontFamily: FONTS.regular, fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 3, lineHeight: 13 },
  dateLabelToday: { fontFamily: FONTS.bold, color: '#fff' },
});

// ─── Weight Line Chart ────────────────────────────────────────────────────────
const WeightChart: React.FC<{ data: WeightData; lineW?: number }> = ({ data, lineW }) => {
  const { values, dates, startWeight, goalWeight, targetDays, color } = data;
  const allVals = [...values, startWeight, goalWeight];
  const minV = Math.min(...allVals) - 3;
  const maxV = Math.max(...allVals) + 3;
  const range = maxV - minV;
  const Y_LABEL_W = 30;
  const Y_RIGHT_PAD = 20;
  const usedLineW = lineW ?? LINE_W;
  const plotW = usedLineW - Y_LABEL_W - Y_RIGHT_PAD;
  const colW = plotW / (values.length - 1);
  const lastIdx = values.length - 1;
  const toY = (v: number) => LINE_H - ((v - minV) / range) * LINE_H;
  const points = values.map((v, i) => ({ x: i * colW, y: toY(v) }));
  const startY = toY(startWeight);
  const goalY = toY(goalWeight);

  return (
    <View>
      <View style={{ height: LINE_H + 10, marginTop: 12, position: 'relative', flexDirection: 'row' }}>
        <View style={{ width: Y_LABEL_W, position: 'relative', height: LINE_H }}>
          <Text style={[wStyles.yLabel, { top: startY - 8, color }]}>{startWeight}</Text>
          <Text style={[wStyles.yLabel, { top: goalY - 8, color: '#024FE9' }]}>{goalWeight}</Text>
        </View>
        <View style={{ width: plotW, height: LINE_H, position: 'relative' }}>
          <View style={[wStyles.refLine, { top: startY, borderColor: color }]} />
          <View style={[wStyles.refLine, { top: goalY, borderColor: '#024FE9' }]} />
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const dx = p.x - prev.x; const dy = p.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={[wStyles.segment, {
                width: len, left: prev.x, top: prev.y - 1,
                transform: [{ rotate: `${angle}deg` }],
                backgroundColor: i === lastIdx ? color : 'rgba(255,62,0,0.5)',
              }]} />
            );
          })}
          {points.map((p, i) => {
            const isLast = i === lastIdx;
            return (
              <React.Fragment key={i}>
                <Text style={[wStyles.dotValue, {
                  left: p.x - 13, top: p.y - 20,
                  color: isLast ? color : 'rgba(255,255,255,0.65)',
                  fontFamily: isLast ? FONTS.bold : FONTS.regular,
                }]}>{values[i]}</Text>
                <View style={[wStyles.dot, {
                  left: p.x - (isLast ? 5 : 4), top: p.y - (isLast ? 5 : 4),
                  width: isLast ? 10 : 8, height: isLast ? 10 : 8,
                  borderRadius: isLast ? 5 : 4,
                  backgroundColor: isLast ? color : 'rgba(255,255,255,0.5)',
                }]} />
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* X-axis */}
      <View style={{ height: 36, marginTop: 8, position: 'relative', marginLeft: Y_LABEL_W }}>
        {dates.map((d, i) => (
          <View key={i} style={[wStyles.timelineCol, { position: 'absolute', left: i * colW - 18, width: 36 }]}>
            <View style={[wStyles.timelineDot, i === lastIdx && { backgroundColor: color }]} />
            <Text style={[wStyles.timelineLabel, i === lastIdx && { color: '#fff', fontFamily: FONTS.bold }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Estimate — 2 lines, centered */}
      <View style={wStyles.estimateRow}>
        <Text style={wStyles.estimateText}>Estimasi Target Berat Badan akan tercapai dalam</Text>
        <View style={wStyles.estimateBadgeRow}>
          <View style={[wStyles.estimateBadge, { backgroundColor: color }]}>
            <Text style={wStyles.estimateDays}>{targetDays}</Text>
          </View>
          <Text style={wStyles.estimateText}>hari</Text>
        </View>
      </View>
    </View>
  );
};

const wStyles = StyleSheet.create({
  yLabel: { fontFamily: FONTS.bold, fontSize: 12, position: 'absolute', left: 0, backgroundColor: '#1A1A1A', paddingHorizontal: 2, borderRadius: 4 },
  refLine: { position: 'absolute', left: 0, right: 0, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed' },
  segment: { position: 'absolute', height: 2.5, borderRadius: 2, transformOrigin: 'left center' },
  dot: { position: 'absolute' },
  dotValue: { position: 'absolute', fontSize: 11, width: 26, textAlign: 'center' },
  timelineCol: { alignItems: 'center', gap: 4 },
  timelineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  timelineLabel: { fontFamily: FONTS.regular, fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  // 2-line estimate
  estimateRow: { alignItems: 'center', marginTop: 14, gap: 4 },
  estimateBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  estimateText: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, textAlign: 'center' },
  estimateBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  estimateDays: { fontFamily: FONTS.extraBold, fontSize: 16, color: '#fff' },
});

// ─── Shared chart card inner content ─────────────────────────────────────────
const ChartCardContent: React.FC<{
  type: 'nutrient' | 'weight';
  nutrient?: Nutrient;
  remark: string;
  remarkColor: string;
  cardW: number;
}> = ({ type, nutrient, remark, remarkColor, cardW }) => {
  const cardContentW = cardW - 32; // 16px padding each side
  const remarkMatch = remark.match(/^(.*?)(\d+\S*)$/);
  const remarkLabel = remarkMatch?.[1].trim() ?? remark;
  const remarkBold  = remarkMatch?.[2] ?? '';

  return (
    <>
      <View style={shareStyles.innerCardHeader}>
        <View style={shareStyles.innerTitleRow}>
          {type === 'nutrient'
            ? <><CalorieIcon width={18} height={18} /><Text style={shareStyles.innerTitle}> {nutrient!.label}</Text></>
            : <><WeightIcon width={18} height={18} /><Text style={shareStyles.innerTitle}> Berat Badan</Text></>
          }
        </View>
        <Text style={shareStyles.innerRemark}>
          {remarkLabel}{' '}
          <Text style={[shareStyles.innerRemarkBold, { color: remarkColor }]}>{remarkBold}</Text>
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {type === 'nutrient'
          ? <BarChart nutrient={nutrient!} dates={DUMMY.weekDates} contentWidth={cardContentW} />
          : <WeightChart data={DUMMY.weightData} lineW={cardContentW} />
        }
      </View>
    </>
  );
};

// ─── Modal preview card (no bg, colored logo) ────────────────────────────────
const ModalCard: React.FC<{
  type: 'nutrient' | 'weight';
  nutrient?: Nutrient;
  remark: string;
  remarkColor: string;
  cardW: number;
}> = (props) => (
  <View style={[shareStyles.modalCard, { width: props.cardW }]}>
    <ChartCardContent {...props} />
  </View>
);

// ─── Capture card (food bg + overlay, transparent, white logo) ───────────────
const CaptureCard = React.forwardRef<ViewShot | null, {
  type: 'nutrient' | 'weight';
  nutrient?: Nutrient;
  remark: string;
  remarkColor: string;
  bgSource: any;
  cardW: number;
}>((props, ref) => {
  const { bgSource, cardW } = props;

  return (
    <ViewShot ref={ref} options={{ format: 'jpg', quality: 0.95 }}>
      <View style={[shareStyles.captureRoot, { width: cardW }]}>
        <Image source={bgSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {Platform.OS === 'ios'
          ? <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          : <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        }
        <View style={[shareStyles.captureInnerCard, { width: cardW - 24 }]}>
          <ChartCardContent {...props} />
        </View>
        <View style={shareStyles.logoRow}>
          <Image source={LOGO_WHITE} style={shareStyles.logoImg} resizeMode="contain" />
        </View>
      </View>
    </ViewShot>
  );
});

// ─── Share Modal ──────────────────────────────────────────────────────────────
const ShareModal: React.FC<{
  state: ShareModalState;
  shotRef: React.RefObject<ViewShot | null>;
  onClose: () => void;
}> = ({ state, shotRef, onClose }) => {
  const nutrient = state.type === 'nutrient' ? state.nutrient : undefined;
  const remark = getRemarkForState(state);
  const remarkColor = getRemarkColor(state);

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk menyimpan gambar.');
        return;
      }
      const uri = await (shotRef.current as any).capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Tersimpan!', 'Grafik berhasil disimpan ke galeri.');
    } catch (e) {
      Alert.alert('Gagal', `Tidak dapat menyimpan gambar: ${e}`);
    }
  };

  const handleShare = async () => {
    try {
      const uri = await (shotRef.current as any).capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Bagikan Grafik Nutrisi' });
      } else {
        // Fallback for iOS simulator / web
        await Share.share({ url: uri, message: 'Lihat progress nutrisi saya di Nutrisee!' });
      }
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat membagikan gambar.');
    }
  };

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />

      {Platform.OS === 'ios'
        ? <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        : <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.82)' }]} />
      }

      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

      <View style={shareStyles.modalContent} pointerEvents="box-none">
        {/* Tagline */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={shareStyles.tagline}>
            Bagikan <Text style={shareStyles.taglineBold}>Progress</Text>mu
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={shareStyles.tagline}>bersama</Text>
            <Image source={LOGO_COLORED} style={{ width: 100, height: 40, marginLeft: -8 }} resizeMode="contain" />
          </View>
        </View>

        {/* Preview card */}
        <TouchableOpacity activeOpacity={1}>
          <ModalCard
            type={state.type}
            nutrient={nutrient}
            remark={remark}
            remarkColor={remarkColor}
            cardW={SHARE_CARD_W}
          />
        </TouchableOpacity>

        {/* Buttons */}
        <View style={shareStyles.actionRow}>
          <TouchableOpacity style={shareStyles.actionBtn} onPress={handleSave}>
            <View style={[shareStyles.actionIcon, { backgroundColor: '#FF3E00' }]}>
              <DownloadIcon width={22} height={22} />
            </View>
            <Text style={shareStyles.actionLabel}>Simpan{'\n'}Grafik</Text>
          </TouchableOpacity>
          <TouchableOpacity style={shareStyles.actionBtn} onPress={handleShare}>
            <View style={[shareStyles.actionIcon, { backgroundColor: '#024FE9' }]}>
              <ShareIcon width={22} height={22} />
            </View>
            <Text style={shareStyles.actionLabel}>Bagikan{'\n'}Grafik</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const shareStyles = StyleSheet.create({
  modalContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 24 },
  tagline: { fontFamily: FONTS.regular, fontSize: 20, color: '#fff', textAlign: 'center', lineHeight: 28 },
  taglineBold: { fontFamily: FONTS.extraBold },

  modalCard: {
    backgroundColor: 'rgba(26,26,26,0.88)',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },

  captureRoot: {
    overflow: 'hidden',
    paddingVertical: 28, paddingHorizontal: 12,
    alignItems: 'center', gap: 16,
  },
  captureInnerCard: {
    backgroundColor: 'rgba(15,15,15,0.65)',
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },

  innerCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  innerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  innerTitle: { fontFamily: FONTS.extraBold, fontSize: 18, color: '#fff' },
  innerRemark: { fontFamily: FONTS.regular, fontSize: 14, color: '#fff' },
  innerRemarkBold: { fontFamily: FONTS.extraBold, fontSize: 18 },

  logoRow: { alignItems: 'center' },
  logoImg: { width: 120, height: 36 },

  actionRow: { flexDirection: 'row', gap: 40 },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 16 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(DUMMY.profilePhoto);
  const [aiTipIndex, setAiTipIndex] = useState(0);
  const [nutrientIndex, setNutrientIndex] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState(1);
  const [shareModal, setShareModal] = useState<ShareModalState | null>(null);
  const [captureBg] = useState(() => TEMP_BACKGROUNDS[Math.floor(Math.random() * TEMP_BACKGROUNDS.length)]);

  // shotRef lives in main screen so CaptureCard is always mounted outside Modal
  const shotRef = useRef<ViewShot | null>(null);

  useEffect(() => {
  getProfile().then(p => {
    if (p.avatar_url) setProfilePhoto(p.avatar_url);
  }).catch(() => {}); // fail silently if no profile yet
}, []);

  const openShareModal = useCallback((state: ShareModalState) => {
    setShareModal(state);
  }, []);

  const handleProfileImagePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Batal', 'Ambil Foto', 'Pilih dari Galeri', 'Hapus Foto'], destructiveButtonIndex: 3, cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) launchCamera();
          else if (idx === 2) launchGallery();
          else if (idx === 3) setProfilePhoto(null);
        }
      );
    } else {
      Alert.alert('Foto Profil', 'Pilih sumber foto', [
        { text: 'Ambil Foto', onPress: launchCamera },
        { text: 'Pilih dari Galeri', onPress: launchGallery },
        { text: 'Hapus Foto', style: 'destructive', onPress: () => setProfilePhoto(null) },
        { text: 'Batal', style: 'cancel' },
      ]);
    }
  }, []);

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { 
      Alert.alert('Izin diperlukan', 'Izinkan akses kamera.'); 
      return; 
    }
    const result = await ImagePicker.launchCameraAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.8 
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePhoto(uri);                        // optimistic update
      const avatar_url = await uploadProfileImage(uri);
      setProfilePhoto(avatar_url);                 // replace with Cloudinary URL
    }
  };

  const launchGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePhoto(uri);                          // optimistic update
      const avatar_url = await uploadProfileImage(uri);
      setProfilePhoto(avatar_url);                   // replace with Cloudinary URL
    }
  };

  return (
    <View style={styles.root}>
      {/* Share Modal */}
      {shareModal && (
        <ShareModal
          state={shareModal}
          shotRef={shotRef}
          onClose={() => setShareModal(null)}
        />
      )}

      {/* CaptureCard — always mounted, off left edge, fully rendered for ViewShot */}
      {shareModal && (
        <View style={{ position: 'absolute', left: -(SHARE_CARD_W + 20), top: 0 }} pointerEvents="none">
          <CaptureCard
            ref={shotRef}
            type={shareModal.type}
            nutrient={shareModal.type === 'nutrient' ? shareModal.nutrient : undefined}
            remark={getRemarkForState(shareModal)}
            remarkColor={getRemarkColor(shareModal)}
            bgSource={captureBg}
            cardW={SHARE_CARD_W}
          />
        </View>
      )}

      {/* Header */}
      <BlurContainer intensity={60} tint="light" style={styles.header}
        androidFallbackColor="rgba(245,245,245,0.95)" gradientDirection="header">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrowIcon width={10} height={15} fill="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistik Nutrisi</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ width: 32 }} />
      </BlurContainer>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card ─────────────────────────────── */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleProfileImagePress} activeOpacity={0.8}>
            <View style={styles.avatar}>
              {profilePhoto
                ? <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                : <View style={styles.avatarPlaceholder}>
                    {DUMMY.gender === 'male' ? <MaleIcon width={48} height={48} fill="#9EB4F0" /> : <FemaleIcon width={48} height={48} fill="#9EB4F0" />}
                  </View>
              }
            </View>
            <View style={styles.cameraBadge}><UpdateIcon width={18} height={18} fill="#024FE9" /></View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{DUMMY.fullName}</Text>
            <View style={styles.profileStatsRow}>
              {DUMMY.gender === 'male' ? <MaleIcon width={16} height={16} fill="#024FE9" /> : <FemaleIcon width={16} height={16} fill="#E91E63" />}
              <Text style={styles.profileStats}> {DUMMY.height}cm | {DUMMY.currentWeight}kg</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakValue}>{DUMMY.streak}</Text>
            <Text style={styles.streakLabel}>HARI{'\n'}log streak</Text>
          </View>
        </View>

        {/* ── AI Tips ───────────────────────────────────── */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTitleRow}>
              <AIOverviewIcon width={20} height={20} />
              <Text style={styles.aiTitle}>{' '}<Text style={styles.aiTitleItalic}>AI</Text> Tips</Text>
            </View>
            <NIcon width={26} height={26} />
          </View>
          <FlatList
            data={DUMMY.aiTips} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `tip-${i}`}
            onMomentumScrollEnd={(e) => setAiTipIndex(Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH))}
            renderItem={({ item }) => (
              <View style={{ width: PAGE_WIDTH, paddingHorizontal: 16, gap: 10 }}>
                {item.sections.map((s, i) => (
                  <View key={i} style={styles.aiSection}>
                    <Text style={styles.aiSectionLabel}>{s.label}</Text>
                    <Text style={styles.aiSectionText}>{s.text}</Text>
                  </View>
                ))}
              </View>
            )}
          />
          <View style={styles.dotsRow}>
            {DUMMY.aiTips.map((_, i) => (
              <View key={i} style={[styles.dot, i === aiTipIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Nutrient Tracker ─────────────────────────── */}
        <View style={styles.darkCard}>
          <FlatList
            data={DUMMY.nutrients} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `nutrient-${i}`}
            onMomentumScrollEnd={(e) => setNutrientIndex(Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH))}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openShareModal({ type: 'nutrient', nutrient: item })}
                style={{ width: PAGE_WIDTH, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4, flex: 1 }}
              >
                <View style={styles.nutrientHeader}>
                  <View style={styles.nutrientTitleRow}>
                    <CalorieIcon width={20} height={20} />
                    <Text style={styles.nutrientTitle}> {item.label}</Text>
                  </View>
                  <View style={styles.nutrientGoalRow}>
                    <Text style={styles.nutrientGoalBig}>{item.goal}</Text>
                    <Text style={styles.nutrientGoalUnit}>{item.unit}</Text>
                  </View>
                </View>
                <BarChart nutrient={item} dates={DUMMY.weekDates} />
              </TouchableOpacity>
            )}
          />
          <View style={[styles.dotsRow, { paddingBottom: 10 }]}>
            {DUMMY.nutrients.map((_, i) => (
              <View key={i} style={[styles.dot, i === nutrientIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Berat Badan ───────────────────────────────── */}
        <View style={styles.darkCard}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => openShareModal({ type: 'weight' })}>
            <View style={styles.darkCard}>
              <View style={styles.weightHeader}>
                <View style={styles.weightTitleRow}>
                  <WeightIcon width={22} height={22} />
                  <Text style={styles.nutrientTitle}> Berat Badan</Text>
                </View>
                <Text style={styles.weightTargetLabel}>
                  Target <Text style={styles.weightTargetValue}>{DUMMY.weightData.goalWeight}kg</Text>
                </Text>
              </View>
              <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
                <WeightChart data={DUMMY.weightData} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Log Makanan ───────────────────────────────── */}
        <View style={styles.logCard}>
          <View style={styles.logHeader}>
            <AIOverviewIcon width={20} height={20} />
            <Text style={styles.logTitle}> Log Makanan</Text>
          </View>
          <View style={styles.daySelectorContainer}>
            <View style={styles.daySelectorRow}>
              <TouchableOpacity><Text style={styles.dayArrow}>‹</Text></TouchableOpacity>
              <View style={styles.dayList}>
                {DUMMY.logDays.map((d, i) => {
                  const isActive = i === activeDayIndex;
                  return (
                    <TouchableOpacity key={i} style={styles.dayCol} onPress={() => setActiveDayIndex(i)}>
                      <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{d.day}</Text>
                      <Text style={[styles.dayDate, isActive && styles.dayDateActive]}>{d.date}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity><Text style={styles.dayArrow}>›</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.logEntriesCard}>
            {DUMMY.logEntries.map((entry, i) => (
              <View key={i} style={[styles.logEntry, i > 0 && styles.logEntryBorder]}>
                <Text style={styles.logTime}>{entry.time}</Text>
                <View style={styles.logEntryMid}>
                  <Text style={styles.logName}>{entry.name} <Text style={styles.logCal}>~{entry.cal}kkal</Text></Text>
                  <Text style={styles.logMacro}>Karbohidrat {entry.karbo}g | Protein {entry.protein}g | Lemak {entry.lemak}g</Text>
                </View>
                <TouchableOpacity
                  style={styles.logEditBtn}
                  onPress={() => router.push({
                    pathname: '/(app)/result-screen',
                    params: {
                      name: entry.name,
                      cal: entry.cal,
                      karbo: entry.karbo,
                      protein: entry.protein,
                      lemak: entry.lemak,
                      time: entry.time,
                      viewMode: 'profile', 
                      // data: JSON.stringify(mealLog)
                    },
                  })}
                >
                  <NotesIcon width={22} height={22} fill="rgba(0,0,0,0.25)" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ── Badges ───────────────────────────────────── */}
        <View style={styles.badgeCard}>
          <View style={styles.badgeHeader}>
            <View style={styles.badgeTitleRow}>
              <AchievementIcon width={20} height={20} />
              <Text style={styles.badgeTitle}> Badges</Text>
            </View>
            <Text style={styles.badgeCount}>
              <Text style={styles.badgeCountNum}>{DUMMY.badges.filter(b => b.achieved).length}/{DUMMY.badges.length}</Text>
              {' '}tercapai
            </Text>
          </View>
          <View style={styles.badgeGrid}>
            {DUMMY.badges.map((badge) => (
              <View key={badge.key} style={styles.badgeItem}>
                <Image source={badge.achieved ? badge.image : badge.imageOff} style={styles.badgeImage} resizeMode="contain" />
              </View>
            ))}
          </View>
        </View>
        
        {/* ── Log Out ───────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Log Out', 'Kamu yakin ingin keluar?', [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                  await logout();
                  router.replace('/(auth)/register');
                },
              },
            ]);
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 110 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },
  headerSpacer: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 126, paddingHorizontal: 16, gap: 16 },

  profileCard: { backgroundColor: '#013397', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#E0E0E0', overflow: 'hidden', borderWidth: 3.5, borderColor: '#ECB270' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C8D6F5' },
  cameraBadge: { position: 'absolute', bottom: 0, left: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#024FE9' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: FONTS.extraBold, fontSize: 20, color: '#fff' },
  profileStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  profileStats: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  streakBadge: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  streakValue: { fontFamily: FONTS.extraBold, fontSize: 28, color: '#FF3E00', lineHeight: 32 },
  streakLabel: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 13 },

  aiCard: { backgroundColor: '#024FE9', borderRadius: 20, paddingTop: 14, paddingBottom: 14, overflow: 'hidden' },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: { fontFamily: FONTS.bold, fontSize: 17, color: '#fff' },
  aiTitleItalic: { fontFamily: FONTS.boldItalic },
  aiSection: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 12 },
  aiSectionLabel: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text, width: 72, flexShrink: 0 },
  aiSectionText: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, color: COLORS.text, lineHeight: 20 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingTop: 12, paddingHorizontal: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#fff', width: 20, borderRadius: 4 },

  darkCard: { backgroundColor: '#1A1A1A', borderRadius: 20, overflow: 'hidden' },
  nutrientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nutrientTitleRow: { flexDirection: 'row', alignItems: 'center' },
  nutrientTitle: { fontFamily: FONTS.extraBold, fontSize: 20, color: '#fff' },
  nutrientGoalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  nutrientGoalBig: { fontFamily: FONTS.extraBold, fontSize: 24, color: '#fff' },
  nutrientGoalUnit: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  weightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  weightTitleRow: { flexDirection: 'row', alignItems: 'center' },
  weightTargetLabel: { fontFamily: FONTS.regular, fontSize: 17, color: '#fff' },
  weightTargetValue: { fontFamily: FONTS.extraBold, fontSize: 24, color: '#fff' },

  logCard: { backgroundColor: '#024FE9', borderRadius: 20, paddingTop: 16, paddingBottom: 16, overflow: 'hidden' },
  logHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  logTitle: { fontFamily: FONTS.extraBold, fontSize: 22, color: '#fff' },
  daySelectorContainer: { marginHorizontal: 12, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 4 },
  daySelectorRow: { flexDirection: 'row', alignItems: 'center' },
  dayArrow: { fontSize: 22, color: 'rgba(0,0,0,0.3)', fontFamily: FONTS.regular, paddingHorizontal: 6 },
  dayList: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1 },
  dayName: { fontFamily: FONTS.regular, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginBottom: 2 },
  dayNameActive: { color: '#FF3E00', fontFamily: FONTS.bold },
  dayDate: { fontFamily: FONTS.extraBold, fontSize: 18, color: 'rgba(0,0,0,0.75)' },
  dayDateActive: { color: '#FF3E00' },
  logEntriesCard: { marginHorizontal: 12, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  logEntry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  logEntryBorder: { borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  logTime: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary, width: 40, flexShrink: 0 },
  logEntryMid: { flex: 1 },
  logName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  logCal: { fontFamily: FONTS.bold, fontSize: 14, color: '#FF3E00' },
  logMacro: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  logEditBtn: { padding: 4 },

  badgeCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 16 },
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badgeTitleRow: { flexDirection: 'row', alignItems: 'center' },
  badgeTitle: { fontFamily: FONTS.extraBold, fontSize: 20, color: '#fff' },
  badgeCount: { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  badgeCountNum: { fontFamily: FONTS.extraBold, fontSize: 18, color: '#fff' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: BADGE_GAP },
  badgeItem: { width: BADGE_COL_W, height: BADGE_COL_W, alignItems: 'center', justifyContent: 'center' },
  badgeImage: { width: BADGE_COL_W * 0.85, height: BADGE_COL_W * 0.85 },

  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF3E00',
  },
  logoutText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FF3E00',
  },
});