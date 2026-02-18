import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal, Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../components/DashboardStyles';

export default function DashboardScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleTakeText = () => {
    setIsMenuOpen(false);
    router.push('/text-scan');
  };

  const handleTakeImage = () => {
    setIsMenuOpen(false); // Close the popup menu
    router.push('/image-scan'); // Navigate to your custom embedded camera screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Black Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi Martinus!</Text>
          <Text style={styles.subGreeting}>Selamat Siang! Yuk lihat catatan kalorimu!</Text>
        </View>

        {/* Dashboard Cards */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Overview</Text>
            <Text style={styles.cardText}>Estimasi kalori yang dikeluarkan kegiatan berdasarkan GPS/smartwatch, rekomendasi makanan, saran makanan yang perlu dihindari, etc</Text>
          </View>
          
          {/* Card 2: Stat Nutrisi Harian - Updated Grid Layout */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stat Nutrisi Harian</Text>
            
            {/* Top Calorie Summary Bar */}
            <View style={styles.calorieSummaryBar}>
              <View style={[styles.calorieSummaryItem, styles.borderRight]}>
                <Text style={styles.calorieLabel}>Kalori Terbakar</Text>
              </View>
              <View style={[styles.calorieSummaryItem, styles.borderRight]}>
                <Text style={styles.calorieLabel}>Kalori Masuk</Text>
              </View>
              <View style={styles.calorieSummaryItem}>
                <Text style={styles.calorieLabel}>Kebutuhan{"\n"}Kalori Harian</Text>
              </View>
            </View>

            {/* Nutrient Grid */}
            <View style={styles.nutrientGrid}>
              {[
                "Karbohidrat", "Protein", 
                "Lemak", "Gula", 
                "Serat", "Kolesterol", 
                "Kalsium", "Vitamin A/C/D\n(Klik utk info lebih)"
              ].map((nutrient, index) => (
                <View key={index} style={styles.nutrientGridItem}>
                  <Text style={styles.nutrientText}>{nutrient}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progression Overview</Text>
            <Text style={styles.cardText}>Graph konsumsi kalori beberapa hari terakhir, bisa diswipe jadi graph kalori terbakar beberapa hari terakhir, etc. Bisa diklik ke Progress Page</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Menu */}
      <Modal visible={isMenuOpen} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setIsMenuOpen(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuContent}>
              <TouchableOpacity style={styles.menuItem} onPress={handleTakeText}>
                <MaterialCommunityIcons name="paperclip" size={32} color="black" />
                <Text style={styles.menuLabelTitle}>Deskripsi Teks</Text>
                <Text style={styles.menuLabelSub}>Ketik deskripsi makanan yang ingin kamu cek nutrisinya.</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleTakeImage}>
                <Ionicons name="camera-outline" size={32} color="black" />
                <Text style={styles.menuLabelTitle}>Ambil Gambar</Text>
                <Text style={styles.menuLabelSub}>Cek nutrisi makananmu menggunakan NutriSEE AI Image Recognition.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Custom Bottom Tab Bar Simulation */}
      <View style={styles.tabBar}>
        <TouchableOpacity><Ionicons name="home-outline" size={24} color="black" /></TouchableOpacity>
        <TouchableOpacity style={styles.blueButton} onPress={() => setIsMenuOpen(true)}>
          <Ionicons name="camera" size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity><Ionicons name="person-circle-outline" size={24} color="black" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}