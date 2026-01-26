import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthStyles as s } from '../../components/auth/AuthStyles';
import { useUser } from '../context/UserContext';

export default function Step2() {
  const { userData, updateUserData } = useUser();
  const router = useRouter();

  const handleFinish = async () => {
    // Final logic: sending the data to your backend or AI API
    console.log("Submitting all data:", userData);
    
    // After success:
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <View style={s.logoContainer}>
          <Text style={s.logoNutri}>Nutri</Text>
          <MaterialCommunityIcons name="plus" size={18} color="#FF6B6B" style={{ marginTop: -10 }} />
          <Text style={s.logoSee}>see</Text>
        </View>

        <Text style={s.title}>Lebih dekat dengan Nutrisee</Text>
        <Text style={s.subtitle}>Masukkan informasi mengenai makanan yang ingin anda hindari (larangan agama, alergi, atau
preferensi pribadi).</Text>

        <TextInput 
          style={s.textArea} 
          placeholder="Masukkan makanan yang ingin dihindari (Babi, sapi, kacang-kacangan, atau lainnya)." 
          multiline 
          value={userData.restrictions}
          onChangeText={(text) => updateUserData({ restrictions: text })}
        />

        <TouchableOpacity style={s.button} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.buttonText}>Lanjutkan</Text>
        </TouchableOpacity>
        
        <Text style={s.footerText}>Nutrisee menggunakan teknologi AI LLM yang dapat memahami kebutuhanmu menggunakan bahasa sehari-hari dengan dukungan lebih dari 150 bahasa!</Text>
      </View>
    </SafeAreaView>
  );
}