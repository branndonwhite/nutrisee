import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthStyles as s } from '../../components/auth/AuthStyles';
import { useUser } from '../context/UserContext';

export default function Step1() {
  const { userData, updateUserData } = useUser();
  const router = useRouter();
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <View style={s.logoContainer}>
          <Text style={s.logoNutri}>Nutri</Text>
          <MaterialCommunityIcons name="plus" size={18} color="#FF6B6B" style={{ marginTop: -10 }} />
          <Text style={s.logoSee}>see</Text>
        </View>

        <Text style={s.title}>Yuk berkenalan dengan Nutrisee</Text>
        <Text style={s.subtitle}>Masukkan data pribadi anda untuk pengalaman penggunaan aplikasi yang lebih efektif.</Text>

        <TextInput 
          style={s.input} 
          placeholder="Nama Panggilan"
          value={userData.nickname}
          onChangeText={(text) => updateUserData({ nickname: text })}
        />

        <TextInput 
          style={s.input} 
          placeholder="Jenis Kelamin" 
          value={userData.gender}
          onChangeText={(text) => updateUserData({ gender: text })}
        />
        
        <TextInput 
          style={s.input} 
          placeholder="Tinggi Badan" 
          keyboardType="numeric"
          value={userData.height} 
          onChangeText={(text) => updateUserData({ height: text })}
        />
        
        <TextInput 
          style={s.input} 
          placeholder="Berat Badan" 
          keyboardType="numeric"
          value={userData.weight} 
          onChangeText={(text) => updateUserData({ weight: text })} 
        />

        <TouchableOpacity style={s.button} onPress={() => router.push('/(auth)/step2')}>
          <Text style={s.buttonText}>Lanjutkan</Text>
        </TouchableOpacity>

        <Text style={s.footerText}>Nutrisee berkomitmen untuk menggunakan data pribadi anda hanya untuk kebutuhan fungsional aplikasi.</Text>
      </View>
    </SafeAreaView>
  );
}