import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { BackArrowIcon, DietIcon } from '../../assets/images/icon';
import { getDailyStats, DailyStats } from '../../api/dashboard';

const BLUE     = '#014FE9';
const BLACK    = '#000000';
const WHITE    = '#FFFFFF';
const LIGHT_BG = '#F2F2F2';
const DARK     = '#1A1A1A';
const ORANGE   = '#FF3E00';
const GREEN    = '#22C55E';

export default function WeightDetailScreen() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const diet      = stats?.diet;
  const current   = diet?.current_weight ?? 0;
  const target    = diet?.target_weight ?? null;
  const remaining = diet?.kg_remaining ?? null;
  const direction = diet?.direction ?? null;

  const startWeight = target !== null && remaining !== null
    ? (direction === 'turun' ? current + remaining : current - remaining)
    : current;
  const totalToLose = target !== null ? Math.abs(startWeight - target) : 1;
  const alreadyDone = target !== null ? Math.abs(current - startWeight) : 0;
  const progressRatio = totalToLose > 0 ? Math.min(alreadyDone / totalToLose, 1) : 0;

  const progressionData = stats?.progression ?? [];

  const directionLabel = direction === 'turun' ? 'Menurunkan' : direction === 'naik' ? 'Menaikkan' : '-';
  const directionColor = direction === 'turun' ? ORANGE : GREEN;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrowIcon width={10} height={15} fill={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Berat Badan</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color={BLUE} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Main weight card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <DietIcon width={20} height={20} />
              <Text style={styles.summaryTitle}> Berat Badan</Text>
            </View>

            <View style={styles.weightRow}>
              <View style={styles.weightItem}>
                <Text style={styles.weightValue}>{current.toFixed(1)}</Text>
                <Text style={styles.weightUnit}>kg</Text>
                <Text style={styles.weightLabel}>Saat Ini</Text>
              </View>
              {target !== null && (
                <>
                  <View style={styles.weightArrow}>
                    <Text style={[styles.arrowText, { color: directionColor }]}>
                      {direction === 'turun' ? '↓' : '↑'}
                    </Text>
                  </View>
                  <View style={styles.weightItem}>
                    <Text style={[styles.weightValue, { color: directionColor }]}>{target.toFixed(1)}</Text>
                    <Text style={styles.weightUnit}>kg</Text>
                    <Text style={styles.weightLabel}>Target</Text>
                  </View>
                </>
              )}
            </View>

            {target !== null && remaining !== null && (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {
                    flex: Math.max(progressRatio, 0.001),
                    backgroundColor: directionColor,
                  }]} />
                  <View style={{ flex: Math.max(1 - progressRatio, 0.001) }} />
                </View>
                <Text style={styles.remainingText}>
                  <Text style={[styles.remainingHighlight, { color: directionColor }]}>
                    {remaining.toFixed(1)} kg
                  </Text>
                  {' '}lagi menuju target
                </Text>
              </>
            )}
          </View>

          {/* Direction card */}
          {direction && (
            <View style={[styles.directionCard, { backgroundColor: directionColor }]}>
              <Text style={styles.directionLabel}>Program Diet</Text>
              <Text style={styles.directionValue}>{directionLabel} Berat Badan</Text>
              {remaining !== null && (
                <Text style={styles.directionDesc}>
                  {remaining.toFixed(1)} kg lagi menuju {target?.toFixed(1)} kg
                </Text>
              )}
            </View>
          )}

          {/* 7-day calorie progression */}
          {progressionData.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Kalori 7 Hari Terakhir</Text>
              <View style={styles.progressionCard}>
                {[...progressionData].reverse().map((day, i) => {
                  const maxCal = Math.max(...progressionData.map(d => d.calories), 1);
                  const p = day.calories / maxCal;
                  const d = new Date(day.date);
                  const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
                  return (
                    <View key={i} style={styles.dayRow}>
                      <Text style={styles.dayLabel}>{label}</Text>
                      <View style={styles.dayTrack}>
                        <View style={[styles.dayFill, { flex: Math.max(p, 0.001) }]} />
                        <View style={{ flex: Math.max(1 - p, 0.001) }} />
                      </View>
                      <Text style={styles.dayValue}>{day.calories}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Macro breakdown */}
          <Text style={styles.sectionTitle}>Detail Hari Ini</Text>
          {[
            { label: 'Karbohidrat', value: `${stats?.today.carbs ?? 0} gr` },
            { label: 'Protein',     value: `${stats?.today.protein ?? 0} gr` },
            { label: 'Lemak',       value: `${stats?.today.fat ?? 0} gr` },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statCardLabel}>{item.label}</Text>
              <Text style={styles.statCardValue}>{item.value}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: LIGHT_BG },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: LIGHT_BG,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: WHITE,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 4,
  },
  headerTitle:  { flex: 1, textAlign: 'center', fontFamily: FONTS.extraBold, fontSize: 18, color: BLACK },
  headerSpacer: { width: 36 },
  content:      { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  summaryCard: {
    backgroundColor: DARK, borderRadius: 20, padding: 16, gap: 12,
  },
  summaryRow:   { flexDirection: 'row', alignItems: 'center' },
  summaryTitle: { fontFamily: FONTS.bold, fontSize: 16, color: WHITE },

  weightRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  weightItem:  { alignItems: 'center', gap: 2 },
  weightValue: { fontFamily: FONTS.extraBold, fontSize: 48, color: WHITE, lineHeight: 52 },
  weightUnit:  { fontFamily: FONTS.regular, fontSize: 16, color: '#aaa', marginTop: -4 },
  weightLabel: { fontFamily: FONTS.regular, fontSize: 12, color: '#777', marginTop: 4 },
  weightArrow: { alignItems: 'center', justifyContent: 'center' },
  arrowText:   { fontSize: 36, fontFamily: FONTS.extraBold },

  progressTrack: {
    flexDirection: 'row', height: 10, backgroundColor: '#333',
    borderRadius: 10, overflow: 'hidden',
  },
  progressFill:       { borderRadius: 10 },
  remainingText:      { fontFamily: FONTS.regular, fontSize: 13, color: '#aaa', textAlign: 'center' },
  remainingHighlight: { fontFamily: FONTS.bold, fontSize: 14 },

  directionCard:  { borderRadius: 20, padding: 20, gap: 4 },
  directionLabel: { fontFamily: FONTS.bold, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  directionValue: { fontFamily: FONTS.extraBold, fontSize: 24, color: WHITE },
  directionDesc:  { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: BLACK, marginTop: 4 },

  progressionCard: { backgroundColor: WHITE, borderRadius: 20, padding: 16, gap: 10 },
  dayRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayLabel:  { fontFamily: FONTS.regular, fontSize: 12, color: '#888', width: 60 },
  dayTrack: {
    flex: 1, flexDirection: 'row', height: 10,
    backgroundColor: LIGHT_BG, borderRadius: 10, overflow: 'hidden',
  },
  dayFill:   { backgroundColor: ORANGE, borderRadius: 10 },
  dayValue:  { fontFamily: FONTS.bold, fontSize: 12, color: BLACK, width: 36, textAlign: 'right' },

  statCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statCardLabel: { fontFamily: FONTS.semiBold, fontSize: 14, color: BLACK },
  statCardValue: { fontFamily: FONTS.bold, fontSize: 14, color: '#555' },
});
