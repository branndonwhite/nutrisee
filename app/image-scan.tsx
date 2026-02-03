import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ImageScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Izin Kamera diperlukan</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Beri Izin</Text></TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      // This captures the frame directly from the embedded viewfinder
      const result = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (result) setPhoto(result.uri);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => photo ? setPhoto(null) : router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NutriSCAN</Text>
        <View style={{ width: 24 }} />
      </View>

      {!photo ? (
        /* The Embedded Viewfinder */
        <View style={styles.flex1}>
          <CameraView style={styles.camera} ref={cameraRef} facing="back" />
          <View style={styles.footer}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <Ionicons name="camera" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Result View after taking photo */
        <ScrollView contentContainerStyle={styles.resultPadding}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stat Makanan</Text>
            <Text style={styles.cardSub}>Digambarkan dengan bar graph melingkupi:</Text>
            <Text style={styles.nutrientList}>1. Kalori{"\n"}2. Karbohidrat{"\n"}3. Protein{"\n"}4. Lemak{"\n"}5. Gula{"\n"}6. Serat{"\n"}7. Kalsium{"\n"}8. Vitamin (A/C/D){"\n"}9. Kolesterol</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.miniCard, { marginRight: 10 }]}>
              <Text style={styles.miniCardText}>Lokasi{"\n"}Pencatatan{"\n"}Makanan</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.miniCardText}>Jam Pencatatan{"\n"}Makanan</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Progress Bar Kalori Harian</Text>
              <View style={styles.progressBar}><View style={styles.progressFill} /></View>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  camera: { flex: 1, marginHorizontal: 20, borderRadius: 30, overflow: 'hidden' },
  overlayContainer: { position: 'absolute', top: 20, width: '100%', alignItems: 'center' },
  overlayText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { height: 120, justifyContent: 'center', alignItems: 'center' },
  captureBtn: { backgroundColor: '#007BFF', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: 250, borderRadius: 20 },
  resultPadding: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btn: { backgroundColor: '#000', padding: 15, borderRadius: 10, marginTop: 10 },
  // Result View
  resultContent: { padding: 20 },
  resultImage: { width: '100%', height: 200, borderRadius: 20, marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15 },
  cardTitle: { fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  cardSub: { fontSize: 11, color: '#666', textAlign: 'center', marginVertical: 5 },
  nutrientList: { fontSize: 12, lineHeight: 20, textAlign: 'center' },
  
  row: { flexDirection: 'row', marginBottom: 15 },
  miniCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 15, height: 80, justifyContent: 'center' },
  miniCardText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  progressCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginRight: 10 },
  progressTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  progressBar: { height: 8, backgroundColor: '#EEE', borderRadius: 4 },
  progressFill: { width: '70%', height: '100%', backgroundColor: '#007BFF', borderRadius: 4 },
  
  submitButton: { backgroundColor: '#007BFF', paddingVertical: 20, paddingHorizontal: 25, borderRadius: 15 },
  submitText: { color: '#FFF', fontWeight: 'bold' },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 10, marginTop: 10 }
});