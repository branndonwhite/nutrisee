import { StyleSheet } from 'react-native';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/Colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 100 },
  header: { 
    backgroundColor: '#000', 
    height: 230, 
    paddingHorizontal: 25, 
    justifyContent: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35
  },
  greeting: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  subGreeting: { color: '#AAA', fontSize: 14, marginTop: 5 },
  cardContainer: { marginTop: -40, paddingHorizontal: 20 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2 
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  cardText: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  calorieSummaryBar: {
    flexDirection: 'row',
    backgroundColor: '#BDBDBD', // Grey background from screenshot
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    height: 60,
  },
  calorieSummaryItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#999',
  },
  calorieLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    color: '#333',
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutrientGridItem: {
    width: '48%', // Two items per row with a small gap
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  nutrientText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#333',
  },
  // Tab Bar
  tabBar: { 
    flexDirection: 'row', 
    height: 105, 
    backgroundColor: '#FFF', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderRadius: 26,
    borderTopColor: '#EEE',
  },
  blueButton: { 
    backgroundColor: '#007BFF', 
    width: 118, 
    height: 118, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: -60,
    borderWidth: 4,
    borderColor: '#FFF'
  },

  // Modal Overlay
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
  menuContent: { flexDirection: 'row', justifyContent: 'space-between' },
  menuItem: { width: '45%', alignItems: 'center' },
  menuLabelTitle: { fontWeight: 'bold', fontSize: 14, marginTop: 10 },
  menuLabelSub: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 5 }
});