import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  PixelRatio
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import NIcon from '../../assets/images/icon/ICON_N White.svg';
import { useRouter } from 'expo-router';
import { Alert, ActivityIndicator } from 'react-native';
import { useRegister } from '../../context/RegisterContext';

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan', 'Lainnya'];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { setData } = useRegister();

  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const genderValueRef = useRef<View>(null);
  const dateValueRef = useRef<View>(null);
  const [valueLayout, setValueLayout] = useState({ 
    top: 0, 
    left: 0,
    width: 0,
  });
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  const openGenderPicker = () => {
    genderValueRef.current?.measureInWindow((gx, gy, gwidth, gheight) => {
      setValueLayout({
        top: gy + gheight,
        left: gx,
        width: gwidth,
      });
      setShowGenderPicker(true);
    });
  };

  const handleSubmit = () => {
  if (!nickname || !gender || !dateOfBirth) {
    Alert.alert('Error', 'Semua field harus diisi');
    return;
  }

  // save to context only, no API call
  setData({
    nickname,
    gender,
    date_of_birth: dateOfBirth.toISOString().split('T')[0],
  });

  router.push('/(auth)/weight'); 
};

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Yuk berkenalan</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>dengan </Text>
            <Image
              source={require('../../assets/images/branding/LOGO_Text_Colored.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>
            Data yang kamu input akan mempengaruhi pengalaman{'\n'}
            penggunaan aplikasi Nutrisee yang lebih optimal.
          </Text>
        </View>

        {/* Nickname Input Card */}
        <View style={styles.nicknameCard}>
          <View style={styles.nicknameCardHeader}>
            <Text style={styles.nicknameCardTitle}>Halo, nama saya adalah...</Text>
            <NIcon width={28} height={28} />
          </View>
          <TextInput
            style={styles.nicknameInput}
            placeholder="Martinus"
            placeholderTextColor="#A0B4D6"
            value={nickname}
            onChangeText={setNickname}
            maxLength={30}
          />
        </View>

        {/* Gender Picker */}
        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelContainer}>
              <Text style={styles.fieldLabel}>Jenis Kelamin</Text>
            </View>
            <TouchableOpacity
              ref={genderValueRef}
              style={styles.fieldValueContainer}
              onPress={openGenderPicker}
              activeOpacity={0.8}
            >
              <Text style={[styles.fieldValue, !gender && styles.fieldPlaceholder]}>
                {gender || 'Pilih'}
              </Text>
              <Text style={styles.dropdownArrow}>
                {showGenderPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date of Birth Picker */}
        <View style={{ marginBottom: 12 }}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelContainer}>
              <Text style={styles.fieldLabel}>Tanggal Lahir</Text>
            </View>
            <TouchableOpacity
              ref={dateValueRef}
              style={styles.fieldValueContainer}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.fieldValue,
                !dateOfBirth && styles.fieldPlaceholder
              ]}>
                {dateOfBirth ? formatDate(dateOfBirth) : 'DD/MM/YYYY'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* iOS Date Picker Done Button */}
        {showDatePicker && Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.doneButtonText}>Selesai</Text>
          </TouchableOpacity>
        )}

        {/* Lanjutkan Button */}
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push("/(auth)/weight")}    // change to handleSubmit once done
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>Lanjutkan</Text>
          }
        </TouchableOpacity>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Nutrisee berkomitmen untuk menggunakan data pribadi{'\n'}
          anda hanya untuk kebutuhan fungsional aplikasi.
        </Text>
      </ScrollView>
      {/* Dim overlay + dropdown OUTSIDE ScrollView */}
      {showGenderPicker && (
        <>
          <TouchableOpacity
            style={styles.dimOverlay}
            activeOpacity={1}
            onPress={() => setShowGenderPicker(false)}
          />
          <View style={[
            styles.dropdown,
            {
              top: valueLayout.top,
              left: valueLayout.left,
              width: valueLayout.width,
            }
          ]}>
            {GENDER_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.dropdownOption,
                  gender === item && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setGender(item);
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  gender === item && styles.dropdownOptionTextSelected,
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  logo: {
    width: 110,
    height: 49,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  nicknameCard: {
    backgroundColor: '#013397',
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
  },
  nicknameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nicknameCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#fff',
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  nicknameInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 40,
    fontFamily: FONTS.medium,
    fontSize: 22,
    color: '#013397',
    textAlign: 'center',
    minHeight: 170
  },
  fieldWrapper: {
    position: 'relative',
    zIndex: 20,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#024FE9',
    borderRadius: 20,
    padding: 6,
    paddingRight: 8
  },
  fieldLabelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 162,
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: '#fff',
    fontStyle: 'italic',
  },
  fieldValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff', 
    borderRadius: 15,
  },
  fieldValue: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
  },
  fieldPlaceholder: {
    color: COLORS.placeholder,
  },
  dropdownArrow: {
    fontSize: 10,
    color: COLORS.placeholder,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dropdownOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  dropdownOptionTextSelected: {
    color: '#024FE9',
    fontFamily: FONTS.semiBold,
  },
  doneButton: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    marginBottom: 8,
  },
  doneButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#024FE9',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 58,
    marginBottom: 40,
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.white,
  },
  footerNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#2563EB',
    fontFamily: FONTS.semiBold,
  },
});