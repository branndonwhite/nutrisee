import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import NIcon from '../../assets/images/icon/ICON_N White.svg';

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan', 'Lainnya'];

export default function PersonalInfoScreen() {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

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
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      style={{ overflow: 'visible' }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Yuk berkenalan dengan</Text>
          <Image
            source={require('../../assets/images/branding/LOGO_Text_Colored.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.subtitle}>
          Data yang kamu input akan mempengaruhi pengalaman penggunaan aplikasi Nutrisee yang lebih optimal.
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
        <TouchableOpacity
          style={styles.fieldRow}
          onPress={() => setShowGenderPicker(!showGenderPicker)}
          activeOpacity={0.8}
        >
          <View style={styles.fieldLabelContainer}>
            <Text style={styles.fieldLabel}>Jenis Kelamin</Text>
          </View>
          <View style={styles.fieldValueContainer}>
            <Text style={[styles.fieldValue, !gender && styles.fieldPlaceholder]}>
              {gender || 'Pilih'}
            </Text>
            <Text style={styles.dropdownArrow}>
              {showGenderPicker ? '▲' : '▼'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Inline Dropdown */}
        {showGenderPicker && (
          <View style={styles.dropdown}>
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
        )}
      </View>

      {/* Date of Birth Picker */}
      <TouchableOpacity
        style={styles.fieldRow}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.8}
      >
        <View style={styles.fieldLabelContainer}>
          <Text style={styles.fieldLabel}>Tanggal Lahir</Text>
        </View>
        <View style={styles.fieldValueContainer}>
          <Text style={[
            styles.fieldValue,
            !dateOfBirth && styles.fieldPlaceholder
          ]}>
            {dateOfBirth ? formatDate(dateOfBirth) : 'DD/MM/YYYY'}
          </Text>
        </View>
      </TouchableOpacity>

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
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Lanjutkan</Text>
      </TouchableOpacity>

      {/* Footer note */}
      <Text style={styles.footerNote}>
        Nutrisee berkomitmen untuk menggunakan data pribadi{'\n'}
        anda hanya untuk kebutuhan fungsional aplikasi.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 100,
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
    flexWrap: 'wrap',
    gap: 4,
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
    marginVertical: 10
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: -12,
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
  },
  fieldWrapper: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#024FE9',
    borderRadius: 20,
    // marginBottom: 12,
    padding: 6,
    paddingRight: 8
  },
  fieldLabelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 150,
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
    top: '100%',
    right: 0,
    width: '55%',       // aligns with the value container width
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 4,
    zIndex: 20,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
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
    marginBottom: 54,
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