import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { FONTS } from '../../constants/fonts';
import { BackArrowIcon, NutriscanIcon, CamSwitchIcon } from '../../assets/images/icon';
import GalleryIcon from '../../assets/images/icon/GalleryIcon';
import ScanLoadingOverlay from '../../components/ScanLoadingOverlay';
import BlurContainer from '../../components/BlurContainer';
import { analyzeMealImage } from '../../api/meals';
import { setAudioModeAsync } from 'expo-audio';
import * as Location from 'expo-location';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ── Compress image and return base64 ─────────────────────────────────────────
const compressAndEncode = async (uri: string): Promise<string> => {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: 'base64',
  });
  return base64;
};

export default function NutriScanCameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [galleryThumbUri, setGalleryThumbUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<1 | 2>(1);

  const cameraRef = useRef<CameraView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync(false);
        if (status !== 'granted') return;
        const { assets } = await MediaLibrary.getAssetsAsync({
          first: 1,
          sortBy: MediaLibrary.SortBy.creationTime,
          mediaType: MediaLibrary.MediaType.photo,
        });
        if (assets[0]) {
          const info = await MediaLibrary.getAssetInfoAsync(assets[0].id);
          setGalleryThumbUri(info.localUri ?? assets[0].uri);
        }
      } catch (e) {
        console.log('MediaLibrary error:', e);
      }
    })();
  }, []);

  const flipCamera = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setGalleryThumbUri(result.assets[0].uri);
      await submitImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    try { await setAudioModeAsync({ playsInSilentMode: true }); } catch {}
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setCapturedPhoto(photo.uri);
      await submitImage(photo.uri);
    }
  };

  const submitImage = async (uri: string) => {
    setLoadingStep(1);
    setIsLoading(true);
    try {
      // Step 1: Compress + encode
      const base64 = await compressAndEncode(uri);

      setLoadingStep(2);

      // Fetch location in parallel with API call
      let locationName = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          const geocode = await Location.reverseGeocodeAsync(loc.coords);
          if (geocode[0]) {
            const { district, subregion, region } = geocode[0];
            locationName = `${district ?? subregion ?? ''}, ${region ?? ''}.`;
          }
        }
      } catch { /* location optional */ }

      // Step 2: Send to API
      const { nutrition, image_url } = await analyzeMealImage(base64);

      router.push({
        pathname: '/(app)/result-screen',
        params: {
          data: JSON.stringify({ ...nutrition, image_url, imageUri: uri, location: locationName }),
        },
      });
    } catch (err: any) {
      console.error('submitImage error:', err.message);
      // TODO: show an error toast/alert to the user
    } finally {
      setIsLoading(false);
      setLoadingStep(1);
    }
  };

  // ── Permission states ──
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Nutrisee membutuhkan akses kamera untuk memindai makananmu.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScanLoadingOverlay visible={isLoading} step={loadingStep} />

      {/* ── Full screen camera ── */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {/* ── Dark gradient overlay at top ── */}
      <BlurContainer
        intensity={50}
        tint="dark"
        style={styles.topOverlay}
        androidFallbackColor="rgba(0,0,0,0.55)"
        gradientDirection="header"
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <BackArrowIcon width={10} height={15} fill={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NutriSCAN</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Ambil Gambar untuk memulai NutriSCAN</Text>
      </BlurContainer>

      {/* ── Bottom controls ── */}
      <BlurContainer
        intensity={50}
        tint="dark"
        style={styles.bottomControls}
        androidFallbackColor="rgba(0,0,0,0.55)"
        gradientDirection="footer"
      >
        {/* Gallery thumbnail */}
        <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
          {galleryThumbUri ? (
            <Image source={{ uri: galleryThumbUri }} style={styles.galleryThumb} />
          ) : (
            <GalleryIcon width={26} height={22} fill={WHITE} />
          )}
        </TouchableOpacity>

        {/* Shutter */}
        <Animated.View style={[styles.shutterOuter, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.shutterButton} onPress={takePhoto} activeOpacity={0.85}>
            <NutriscanIcon width={36} height={36} fill="rgba(0,0,0,0.5)" />
          </TouchableOpacity>
        </Animated.View>

        {/* Flip camera */}
        <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
          <CamSwitchIcon width={26} height={26} fill={WHITE} />
        </TouchableOpacity>
      </BlurContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },

  // ── Permission ──
  permissionContainer: {
    flex: 1,
    backgroundColor: BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  permissionText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: WHITE,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#014FE9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: WHITE,
  },

  // ── Top overlay ──
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingBottom: 20,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    color: WHITE,
  },
  headerSpacer: { width: 36 },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // ── Bottom controls ──
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 48,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderTopLeftRadius: 50, borderTopRightRadius: 20,
    borderBottomRightRadius: 20, borderBottomLeftRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderTopLeftRadius: 20, borderTopRightRadius: 50,
    borderBottomRightRadius: 50, borderBottomLeftRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
});