import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProgressionScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pencapaian</Text>
          <Text style={styles.headerSub}>Apa saja sih yang sudah kamu capai bersama Nutrisee sejauh ini?</Text>
        </View>

        <View style={styles.content}>
          {/* AI Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Summary</Text>
            <Text style={styles.summaryText}>
              "Wah, minggu ini kamu rajin banget makan sayur... atau itu cuma garnish di samping burger? Teruslah bergerak, lemakmu nggak bakal lari sendiri kalau kamunya cuma duduk!"
            </Text>
          </View>

          {/* Sliding Graphs Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Grafik-grafik bisa dislide ke samping</Text>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={styles.graphSlider}
            >
              {[
                "1. Grafik Konsumsi Kalori Seminggu",
                "2. Grafik ratio makanan berlemak vs berserat",
                "3. Grafik Kalori Defisit seminggu terakhir",
                "4. Grafik perkiraan penurunan berat badan ke depannya"
              ].map((text, index) => (
                <View key={index} style={styles.graphPlaceholder}>
                  <Text style={styles.graphLabel}>{text}</Text>
                  {/* Visual placeholder for the actual graph */}
                  <View style={styles.graphBox}>
                    <View style={styles.crossLine1} />
                    <View style={styles.crossLine2} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Badges Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Badges</Text>
            <Text style={styles.cardSub}>Koleksi Badge yang sudah didapatkan user sejauh ini</Text>
            <View style={styles.badgeRow}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.badgeCircle} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#000', 
    padding: 25, 
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35,
    paddingBottom: 40 
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#AAA', fontSize: 13, marginTop: 10, lineHeight: 18 },
  content: { paddingHorizontal: 20, marginTop: -20 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardTitle: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 10 },
  cardSub: { fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 15 },
  summaryText: { fontSize: 13, textAlign: 'center', fontStyle: 'italic', lineHeight: 20, color: '#333' },
  
  // Graph Styles
  graphSlider: { marginTop: 10 },
  graphPlaceholder: { width: width - 80, alignItems: 'center' },
  graphLabel: { fontSize: 11, color: '#666', marginBottom: 15, textAlign: 'center' },
  graphBox: { 
    width: '100%', 
    height: 150, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    position: 'relative' 
  },
  crossLine1: { position: 'absolute', width: '120%', height: 1, backgroundColor: '#DDD', top: '50%', left: '-10%', transform: [{ rotate: '25deg' }] },
  crossLine2: { position: 'absolute', width: '120%', height: 1, backgroundColor: '#DDD', top: '50%', left: '-10%', transform: [{ rotate: '-25deg' }] },

  // Badge Styles
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  badgeCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0E0E0' }
});