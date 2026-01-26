import React from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStyles as s } from '../../components/auth/AuthStyles';
import { useUser } from '../context/UserContext';

export default function SignIn() {
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

        <Text style={s.title}>Buat Akun Nutrisee</Text>
        <Text style={s.subtitle}>Masukkan email anda untuk mendaftar!</Text>

        <TextInput 
          style={s.input} 
          placeholder="email@domain.com" 
          value={userData.email}
          keyboardType="email-address"
          onChangeText={(text) => updateUserData({ email: text })}
        />
        
        <TouchableOpacity style={s.button} onPress={() => router.push('/(auth)/step1')}>
          <Text style={s.buttonText}>Lanjutkan</Text>
        </TouchableOpacity>

        <View style={s.dividerContainer}>
          <View style={s.line} /><Text style={s.orText}>or</Text><View style={s.line} />
        </View>

        <TouchableOpacity style={s.socialButton}>
          <FontAwesome name="google" size={18} color="#DB4437" style={{marginRight: 10}} />
          <Text>Lanjutkan dengan Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.socialButton}>
          <FontAwesome name="apple" size={20} color="#000" style={{marginRight: 10}} />
          <Text>Lanjutkan dengan Apple ID</Text>
        </TouchableOpacity>

        <Text style={s.footerText}>Dengan memilih Lanjutkan, anda setuju kepada Syarat dan Ketentuan Layanan serta Kebijakan Privasi kami.</Text>
      </View>
    </SafeAreaView>
  );
}