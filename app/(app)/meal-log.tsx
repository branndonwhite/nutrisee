import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { BackArrowIcon, FavIcon, LocationIcon } from '../../assets/images/icon';
import { getMealHistory } from '../../api/meals';

const BLUE     = '#014FE9';
const BLACK    = '#000000';
const WHITE    = '#FFFFFF';
const LIGHT_BG = '#F2F2F2';
const DARK     = '#1A1A1A';
const ORANGE   = '#FF3E00';

interface Meal {
  id: number;
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  fiber: number;
  image_url?: string;
  description?: string;
  location?: string;
  logged_at: string;
}

export default function MealLogScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMealHistory(30).then(setMeals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein  = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs    = meals.reduce((sum, m) => sum + m.carbs, 0);

  // Group meals by date
  const grouped: Record<string, Meal[]> = {};
  meals.forEach((meal) => {
    const date = new Date(meal.logged_at).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(meal);
  });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrowIcon width={10} height={15} fill={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Makanan</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color={BLUE} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <FavIcon width={20} height={20} />
              <Text style={styles.summaryTitle}> Ringkasan 30 Hari</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{meals.length}</Text>
                <Text style={styles.statLabel}>Makanan</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCalories}</Text>
                <Text style={styles.statLabel}>Total kkal</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalProtein.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Protein (gr)</Text>
              </View>
            </View>
          </View>

          {/* Grouped meal entries */}
          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <FavIcon width={48} height={48} fill={ORANGE} />
              <Text style={styles.emptyText}>Belum ada makanan yang dicatat.</Text>
              <Text style={styles.emptySubtext}>Mulai scan makananmu!</Text>
            </View>
          ) : (
            Object.entries(grouped).map(([date, dayMeals]) => (
              <View key={date}>
                <Text style={styles.dateLabel}>{date}</Text>
                <View style={styles.dayGroup}>
                  {dayMeals.map((meal, idx) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={[styles.mealCard, idx < dayMeals.length - 1 && styles.mealCardBorder]}
                      activeOpacity={0.75}
                      onPress={() => router.push({
                        pathname: '/(app)/result-screen',
                        params: { data: JSON.stringify(meal), viewMode: 'profile' },
                      })}
                    >
                      {meal.image_url ? (
                        <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
                      ) : (
                        <View style={styles.mealImagePlaceholder}>
                          <FavIcon width={28} height={28} fill={ORANGE} />
                        </View>
                      )}
                      <View style={styles.mealInfo}>
                        <View style={styles.mealTopRow}>
                          <Text style={styles.mealName} numberOfLines={1}>{meal.food_name}</Text>
                          <Text style={styles.mealTime}>{formatTime(meal.logged_at)}</Text>
                        </View>
                        {meal.description ? (
                          <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
                        ) : null}
                        <View style={styles.mealMacroRow}>
                          <View style={styles.mealCalBadge}>
                            <Text style={styles.mealCalText}>{meal.calories} kkal</Text>
                          </View>
                          <Text style={styles.mealMacro}>Protein {meal.protein}g</Text>
                          <Text style={styles.mealMacro}>Karbo {meal.carbs}g</Text>
                          <Text style={styles.mealMacro}>Lemak {meal.fat}g</Text>
                        </View>
                        {meal.location ? (
                          <View style={styles.mealLocationRow}>
                            <LocationIcon width={12} height={12} fill="#bbb" />
                            <Text style={styles.mealLocation} numberOfLines={1}>{meal.location}</Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
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
    backgroundColor: DARK, borderRadius: 20, padding: 16, gap: 12,
  },
  summaryRow:   { flexDirection: 'row', alignItems: 'center' },
  summaryTitle: { fontFamily: FONTS.bold, fontSize: 16, color: WHITE },
  statRow:      { flexDirection: 'row', paddingTop: 4 },
  statItem:     { flex: 1, alignItems: 'center', gap: 2 },
  statDivider:  { width: 1, backgroundColor: '#333' },
  statValue:    { fontFamily: FONTS.extraBold, fontSize: 22, color: WHITE },
  statLabel:    { fontFamily: FONTS.regular, fontSize: 11, color: '#aaa' },

  // Date group
  dateLabel: {
    fontFamily: FONTS.bold, fontSize: 14, color: '#555',
    marginTop: 4, marginBottom: 6, paddingHorizontal: 4,
  },
  dayGroup: {
    backgroundColor: WHITE, borderRadius: 20, overflow: 'hidden',
  },

  // Meal card
  mealCard: {
    flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start',
  },
  mealCardBorder: {
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  mealImage: {
    width: 60, height: 60, borderRadius: 12, backgroundColor: LIGHT_BG,
  },
  mealImagePlaceholder: {
    width: 60, height: 60, borderRadius: 12, backgroundColor: LIGHT_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  mealImagePlaceholderText: { fontSize: 26 },
  mealInfo:    { flex: 1, gap: 4 },
  mealTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mealName:    { fontFamily: FONTS.semiBold, fontSize: 14, color: BLACK, flex: 1, marginRight: 8 },
  mealTime:    { fontFamily: FONTS.regular, fontSize: 12, color: '#999' },
  mealDesc:    { fontFamily: FONTS.regular, fontSize: 12, color: '#777', lineHeight: 18 },
  mealMacroRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  mealCalBadge:{
    backgroundColor: ORANGE, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  mealCalText: { fontFamily: FONTS.bold, fontSize: 11, color: WHITE },
  mealMacro:   { fontFamily: FONTS.regular, fontSize: 12, color: '#888' },
  mealLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  mealLocation:    { fontFamily: FONTS.regular, fontSize: 11, color: '#bbb', flexShrink: 1 },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: 8,
  },
  emptyEmoji:   { fontSize: 48 },
  emptyText:    { fontFamily: FONTS.bold, fontSize: 16, color: '#555' },
  emptySubtext: { fontFamily: FONTS.regular, fontSize: 14, color: '#999' },
});
