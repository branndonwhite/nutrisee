import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList
} from "react-native";
import { BackArrowIcon, NutriscanIcon } from "../../assets/images/icon";
import GalleryIcon from "../../assets/images/icon/GalleryIcon";
import ScanLoadingOverlay from "../../components/ScanLoadingOverlay";
import { FONTS } from "../../constants/fonts";

// ─── Constants ───────────────────────────────────────────────────────────────
const BLUE = "#024FE9";
const BLACK = "#000000";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F2F2F2";

const HEADER_HEIGHT = 120;

const FOOD_FACTS: string[] = [
  "Soto punya lebih dari 70 variasi di Indonesia, dan hampir setiap daerah punya versi kuah dan isian yang unik!",
  "Tempe adalah makanan fermentasi asli Indonesia yang mengandung protein lengkap dan probiotik alami.",
  "Nasi putih yang didinginkan setelah dimasak memiliki indeks glikemik lebih rendah dibanding nasi yang baru matang.",
];

const GAP = 12;
// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ScanTextScreen() {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<1 | 2>(1);
  const flatListRef = useRef<FlatList>(null);
  const [factCardWidth, setFactCardWidth] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleNextFact = () => {
    setFactIndex((prev) => (prev + 1) % FOOD_FACTS.length);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => setSelectedImage(null);

  const handleCek = async () => {
    if (!description.trim() && !selectedImage) return;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Step 1: detecting food
    setLoadingStep(1);
    setIsLoading(true);

    try {
      // TODO: replace with real API call
      // Step 1 simulated — in real usage, your API does both steps server-side.
      // Advance to step 2 after a short delay to show both status lines.
      await new Promise((r) => setTimeout(r, 1200)); // simulate step 1
      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 1000)); // simulate step 2

      // TODO: replace with real API result
      router.push({
        pathname: "/(app)/result-screen",
        params: {
          data: JSON.stringify({
            description,
            imageUri: selectedImage ?? undefined,
          }),
        },
      });
    } finally {
      setIsLoading(false);
      setLoadingStep(1); // reset for next use
    }
  };

  const canSubmit = description.trim().length > 0 || selectedImage !== null;

  return (
    <View style={styles.container}>
      {/* ── Loading overlay ── */}
      <ScanLoadingOverlay visible={isLoading} step={loadingStep} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <BackArrowIcon width={20} height={20} fill={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NutriSCAN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Input Card ── */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder={
              "Deskripsikan makanan yang ingin kamu cek nutrisinya! Misalkan: Seporsi nasi goreng dengan topping sosis, bakso, dan ikan teri."
            }
            placeholderTextColor="#AAAAAA"
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Attached image preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <Ionicons name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Action row */}
          <View style={styles.cardActionRow}>
            {/* Gallery */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={pickFromGallery}
            >
              <GalleryIcon width={22} height={18} fill={BLACK} />
            </TouchableOpacity>

            {/* Camera */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={pickFromCamera}
            >
              <NutriscanIcon width={22} height={22} fill={BLACK} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {/* Cek */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.cekButton,
                  !canSubmit && styles.cekButtonDisabled,
                ]}
                onPress={handleCek}
                disabled={!canSubmit || isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.cekButtonText}>
                  {isLoading ? "..." : "Cek"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* ── Fun Fact Card ── */}
        <View 
          style={styles.factCard}
          onLayout={(e) => setFactCardWidth(e.nativeEvent.layout.width - 32 - GAP)}
        >
          <Text style={styles.factTitle}>
            <Text style={styles.factTitleItalic}>Fun Fact!</Text>
          </Text>
          <FlatList
            ref={flatListRef}
            data={FOOD_FACTS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            snapToInterval={factCardWidth + GAP}
            decelerationRate="fast"
            contentContainerStyle={{ gap: GAP }}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / factCardWidth
              );
              setFactIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={[styles.factTextBox, { width: factCardWidth }]}>
                <Text style={styles.factText}>{item}</Text>
              </View>
            )}
          />
          {/* Pagination dots */}
          <View style={styles.dotsRow}>
            {FOOD_FACTS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === factIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: HEADER_HEIGHT,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: LIGHT_BG,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    color: BLACK,
  },
  headerSpacer: {
    width: 36,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // ── Input Card ──
  inputCard: {
    backgroundColor: BLUE,
    borderRadius: 20,
    padding: 12,
    gap: 12,
  },
  textInput: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    minHeight: 330,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: "#222",
    lineHeight: 22,
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    padding: 1,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  cekButton: {
    backgroundColor: BLACK,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  cekButtonDisabled: {
    backgroundColor: "#555",
  },
  cekButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: WHITE,
  },

  // ── Fun Fact Card ──
  factCard: {
    backgroundColor: BLUE,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  factTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    color: WHITE,
  },
  factTitleItalic: {
    fontFamily: FONTS.boldItalic,
  },
  factTextBox: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
  },
  factText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#222",
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: WHITE,
  },
});
