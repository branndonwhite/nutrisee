import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';

const NIcon = () => (
  <Svg viewBox="0 0 355.12 324.87" width={28} height={28}>
    <Path
      fill="#fff"
      d="M284.3,324.87c-2.22,0-4.47-.04-6.76-.11-53.75-1.76-93.72-44.66-101.84-109.3-6.11-48.59,10.65-110.09,18.78-136.07-1.55-.38-2.84-.3-3.5.25-48.34,39.73-89.71,119.29-94.2,181.14-.64,8.88-7.88,15.83-16.78,16.12-8.86.34-16.57-6.18-17.79-14.99-10.57-76.28,12.66-141.4,26.54-180.31,4.5-12.61,8.4-23.53,9.27-29.58-1.23-4.48-15.63-15.53-34.91-17.02-13.7-1.06-22.42,3.12-25.91,12.44-3.09,8.23-3.23,14.98-.44,20.62,4.93,9.95,18.35,15.84,23.11,17.28l-9.7,33.4c-3.21-.92-31.74-9.74-44.42-34.93-5.05-10.04-9.35-26.62-1.11-48.57C15.34,6.64,45.26-6.1,80.86,2.79c28.23,7.04,55.05,27.66,51.68,53.43-1.26,9.66-5.58,21.75-11.04,37.06-2.6,7.28-5.44,15.26-8.29,23.89,16.24-25.22,35.31-47.66,55.68-64.41,16.96-13.94,43.6-9.92,59.39,8.96,3.96,4.73,5.11,11.21,3.03,17.02-.28.77-27.85,78.69-21.11,132.37,5.87,46.75,32.75,77.7,68.48,78.88,37.03,1.23,60.95-9.99,61.19-10.11l15.26,31.25c-1.19.59-28.43,13.72-70.82,13.72Z"
    />
    <Path
      fill="#fff"
      d="M340.24,176.85l-12.74-3.47c-4.93-1.34-7.83-6.42-6.49-11.35l3.47-12.74c1.34-4.93-1.56-10.01-6.49-11.35l-12.74-3.47c-4.93-1.34-10.01,1.56-11.35,6.49l-3.47,12.74c-1.34,4.93-6.42,7.83-11.35,6.49l-12.74-3.47c-4.93-1.34-10.01,1.56-11.35,6.49l-3.47,12.74c-1.34,4.93,1.56,10.01,6.49,11.35l12.74,3.47c4.93,1.34,7.83,6.42,6.49,11.35l-3.47,12.74c-1.34,4.93,1.56,10.01,6.49,11.35l12.74,3.47c4.93,1.34,10.01-1.56,11.35-6.49l3.47-12.74c1.34-4.93,6.42-7.83,11.35-6.49l12.74,3.47c4.93,1.34,10.01-1.56,11.35-6.49l3.47-12.74c1.34-4.93-1.56-10.01-6.49-11.35Z"
    />
  </Svg>
);

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
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Yuk berkenalan</Text>
        <Text style={styles.title}>dengan <Text style={styles.titleBrand}>Nutrisee</Text></Text>
        <Text style={styles.subtitle}>
          Data yang kamu input akan mempengaruhi pengalaman{'\n'}
          penggunaan aplikasi Nutrisee yang lebih optimal.
        </Text>
      </View>

      {/* Nickname Input Card */}
      <View style={styles.nicknameCard}>
        <View style={styles.nicknameCardHeader}>
          <Text style={styles.nicknameCardTitle}>Halo, nama saya adalah...</Text>
          <NIcon />
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
      <TouchableOpacity
        style={styles.fieldRow}
        onPress={() => setShowGenderPicker(true)}
        activeOpacity={0.8}
      >
        <View style={styles.fieldLabelContainer}>
          <Text style={styles.fieldLabel}>Jenis Kelamin</Text>
        </View>
        <View style={styles.fieldValueContainer}>
          <Text style={[
            styles.fieldValue,
            !gender && styles.fieldPlaceholder
          ]}>
            {gender || 'Pilih'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </View>
      </TouchableOpacity>

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

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Jenis Kelamin</Text>
            <FlatList
              data={GENDER_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    gender === item && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setGender(item);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    gender === item && styles.modalOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  titleBrand: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: '#2563EB',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  nicknameCard: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  nicknameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nicknameCardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
  },
  nicknameInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 40,
    fontFamily: FONTS.medium,
    fontSize: 22,
    color: '#2563EB',
    textAlign: 'center',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  fieldLabelContainer: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minWidth: 130,
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#fff',
  },
  fieldValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fieldValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  fieldPlaceholder: {
    color: COLORS.placeholder,
  },
  dropdownArrow: {
    fontSize: 10,
    color: COLORS.placeholder,
  },
  doneButton: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    marginBottom: 8,
  },
  doneButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#2563EB',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
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