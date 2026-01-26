import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// 1. Import the hook
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TextScanScreen() {
  const [description, setDescription] = useState('');
  const router = useRouter();
  
  // 2. Get the insets (top is the height of the notification bar)
  const insets = useSafeAreaInsets();

  return (
    // 3. Remove SafeAreaView and use a normal View with dynamic padding
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NutriSCAN</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <TextInput
          style={styles.textArea}
          placeholder="Deskripsikan makanan yang ingin kamu cek nutrisinya!..."
          placeholderTextColor="#999"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Lanjutkan</Text>
        </TouchableOpacity>

        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderText}>
            Nanti akan ada grafis ilustrasi di sini
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  backButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 10, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 20 },
  textArea: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, height: 180, fontSize: 14, textAlignVertical: 'top', marginBottom: 30 },
  button: { backgroundColor: '#000', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  placeholderSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#000', paddingHorizontal: 40, lineHeight: 24 }
});