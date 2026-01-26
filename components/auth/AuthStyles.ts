import { StyleSheet } from 'react-native';

export const AuthStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 35, justifyContent: 'center', alignItems: 'center' },
  // Logo
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 50 },
  logoNutri: { fontSize: 34, fontWeight: '800', color: '#0066FF' },
  logoSee: { fontSize: 34, fontWeight: '800', color: '#E6A07A' },
  // Text
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  // Inputs
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 15, backgroundColor: '#FAFAFA', marginBottom: 15 },
  textArea: { width: '100%', height: 120, borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 15, paddingTop: 15, backgroundColor: '#FAFAFA', marginBottom: 20, textAlignVertical: 'top' },
  // Buttons
  button: { width: '100%', backgroundColor: '#000', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  // Social
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  line: { flex: 1, height: 1, backgroundColor: '#EEE' },
  orText: { marginHorizontal: 15, color: '#BBB', fontSize: 13 },
  socialButton: { flexDirection: 'row', backgroundColor: '#F2F2F2', width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  // Footer
  footerText: { fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 18 },
  bold: { fontWeight: '700', color: '#444' }
});