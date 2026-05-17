import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { BackArrowIcon, AchievementIcon } from '../../assets/images/icon';
import { getDailyStats, DailyStats } from '../../api/dashboard';

const BLUE      = '#014FE9';
const BLACK     = '#000000';
const WHITE     = '#FFFFFF';
const LIGHT_BG  = '#F2F2F2';
const DARK      = '#1A1A1A';
const ORANGE    = '#FF3E00';

export default function CalorieDetailScreen() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const goal      = stats?.today.calorie_goal ?? 0;
  const consumed  = stats?.today.calories_consumed ?? 0;
  const remaining = Math.max(0, goal - consumed);
  const progress  = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  const pencapaian = stats?.pencapaian;

  const macros = [
    { label: 'Karbohidrat', value: stats?.today.carbs        ?? 0, goal: stats?.macro_goals.carbs    ?? 0,    unit: 'gr' },
    { label: 'Protein',     value: stats?.today.protein      ?? 0, goal: stats?.macro_goals.protein  ?? 0,    unit: 'gr' },
    { label: 'Lemak',       value: stats?.today.fat          ?? 0, goal: stats?.macro_goals.fat      ?? 0,    unit: 'gr' },
    { label: 'Gula',        value: stats?.today.sugar        ?? 0, goal: stats?.macro_goals.sugar    ?? 0,    unit: 'gr' },
    { label: 'Serat',       value: stats?.today.fiber        ?? 0, goal: stats?.macro_goals.fiber    ?? 0,    unit: 'gr' },
    { label: 'Kalsium',     value: stats?.today.calcium      ?? 0, goal: 1000,                                unit: 'mg' },
    { label: 'Vitamin A',   value: stats?.today.vitamin_a    ?? 0, goal: 900,                                 unit: 'μg' },
    { label: 'Vitamin C',   value: stats?.today.vitamin_c    ?? 0, goal: 90,                                  unit: 'mg' },
    { label: 'Vitamin D',   value: stats?.today.vitamin_d    ?? 0, goal: 20,                                  unit: 'μg' },
    { label: 'Kolesterol',  value: stats?.today.cholesterol  ?? 0, goal: 300,                                 unit: 'mg' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrowIcon width={10} height={15} fill={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalori Harian</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color={BLUE} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Calorie summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <AchievementIcon width={20} height={20} />
              <Text style={styles.summaryTitle}> Progres Kalori</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { flex: Math.max(progress, 0.001) }]}>
                <Text style={styles.progressConsumed} numberOfLines={1}>
                  <Text style={styles.progressConsumedBold}>{consumed}</Text>
                  <Text style={styles.progressConsumedSub}> / {goal}kkal</Text>
                </Text>
              </View>
              <View style={{ flex: Math.max(1 - progress, 0.001) }} />
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{consumed}</Text>
                <Text style={styles.statLabel}>Masuk (kkal)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{remaining}</Text>
                <Text style={styles.statLabel}>Tersisa (kkal)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{goal}</Text>
                <Text style={styles.statLabel}>Target (kkal)</Text>
              </View>
            </View>
          </View>

          {/* Pencapaian */}
          {pencapaian && (
            <View style={styles.pencapaianCard}>
              <Text style={styles.pencapaianLabel}>{pencapaian.label}</Text>
              <Text style={styles.pencapaianValue}>
                <Text style={styles.pencapaianHighlight}>{pencapaian.value}</Text>
                {' '}{pencapaian.unit}
              </Text>
              <Text style={styles.pencapaianDesc}>{pencapaian.description}</Text>
            </View>
          )}

          {/* Macros */}
          <Text style={styles.sectionTitle}>Nutrisi Hari Ini</Text>
          {macros.map((m) => {
            const p = m.goal > 0 ? Math.min(m.value / m.goal, 1) : 0;
            return (
              <View key={m.label} style={styles.macroRow}>
                <View style={styles.macroLabelRow}>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                  <Text style={styles.macroGoal}>{m.value} / {m.goal}{m.unit}</Text>
                </View>
                <View style={styles.macroTrack}>
                  <View style={[styles.macroFill, { flex: Math.max(p, 0.001) }]} />
                  <View style={{ flex: Math.max(1 - p, 0.001) }} />
                </View>
              </View>
            );
          })}

          {/* 7-day progression */}
          {(stats?.progression?.length ?? 0) > 0 && (
            <>
              <Text style={styles.sectionTitle}>7 Hari Terakhir</Text>
              <View style={styles.progressionCard}>
                {[...stats!.progression].reverse().map((day, i) => {
                  const p = goal > 0 ? Math.min(day.calories / goal, 1) : 0;
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

  // Summary card
  summaryCard: {
    backgroundColor: DARK, borderRadius: 20, padding: 16, gap: 12, overflow: 'hidden',
  },
  summaryRow:   { flexDirection: 'row', alignItems: 'center' },
  summaryTitle: { fontFamily: FONTS.bold, fontSize: 16, color: WHITE },
  progressTrack: {
    flexDirection: 'row', height: 31, backgroundColor: '#F7F7F7',
    borderRadius: 33, overflow: 'hidden', padding: 4,
  },
  progressFill: {
    backgroundColor: ORANGE, borderRadius: 25,
    justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 10,
  },
  progressConsumed:     { flexDirection: 'row', alignItems: 'baseline' },
  progressConsumedBold: { fontFamily: FONTS.extraBold, fontSize: 12, color: WHITE },
  progressConsumedSub:  { fontFamily: FONTS.regular,   fontSize: 10, color: 'rgba(255,255,255,0.85)' },
  statRow:     { flexDirection: 'row', paddingTop: 8 },
  statItem:    { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: '#333' },
  statValue:   { fontFamily: FONTS.extraBold, fontSize: 22, color: WHITE },
  statLabel:   { fontFamily: FONTS.regular,   fontSize: 11, color: '#aaa' },

  // Pencapaian
  pencapaianCard: {
    backgroundColor: BLUE, borderRadius: 20, padding: 20, gap: 4,
  },
  pencapaianLabel:     { fontFamily: FONTS.bold,      fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  pencapaianValue:     { fontFamily: FONTS.regular,   fontSize: 18, color: WHITE },
  pencapaianHighlight: { fontFamily: FONTS.extraBold, fontSize: 36, color: WHITE },
  pencapaianDesc:      { fontFamily: FONTS.regular,   fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  // Macros
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: BLACK, marginTop: 4 },
  macroRow:     { backgroundColor: WHITE, borderRadius: 16, padding: 14, gap: 8 },
  macroLabelRow:{ flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel:   { fontFamily: FONTS.semiBold, fontSize: 14, color: BLACK },
  macroGoal:    { fontFamily: FONTS.regular,  fontSize: 13, color: '#888' },
  macroTrack: {
    flexDirection: 'row', height: 10, backgroundColor: LIGHT_BG,
    borderRadius: 10, overflow: 'hidden',
  },
  macroFill:    { backgroundColor: BLUE, borderRadius: 10 },

  // 7-day progression
  progressionCard: { backgroundColor: WHITE, borderRadius: 20, padding: 16, gap: 10 },
  dayRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayLabel:  { fontFamily: FONTS.regular, fontSize: 12, color: '#888', width: 60 },
  dayTrack: {
    flex: 1, flexDirection: 'row', height: 10,
    backgroundColor: LIGHT_BG, borderRadius: 10, overflow: 'hidden',
  },
  dayFill:   { backgroundColor: ORANGE, borderRadius: 10 },
  dayValue:  { fontFamily: FONTS.bold, fontSize: 12, color: BLACK, width: 36, textAlign: 'right' },
});
