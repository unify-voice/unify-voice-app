import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';

type CameraNavigationProp = StackNavigationProp<RootStackParamList, 'CameraScreen'>;

type Props = {
  navigation: CameraNavigationProp;
};

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Camera setup
  const cameraRef = useRef<typeof Camera | null>(null);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');  const isFocused = useIsFocused();
  const device = useCameraDevice(cameraPosition);
  // ✅ Correct permission hook
  const { hasPermission, requestPermission } = useCameraPermission();

  // Animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ Request permission properly
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleFinish = () => {
    navigation.navigate('HomeScreen');
  };

  const scale = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const toggleCamera = () => {
    setCameraPosition(prev =>
      prev === 'back' ? 'front' : 'back'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale }] },
          ]}
        >
          <BrandHeader subtitle="Position yourself and start capturing gestures with clear camera feedback." />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Live Camera</Text>
            <Text style={styles.sectionSubtitle}>
              Use the camera view to translate gestures and speech into meaningful action.
            </Text>

            <View style={styles.cameraPreview}>
              {device && hasPermission ? (
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isFocused}
                />
              ) : (
                <Text style={styles.cameraText}>
                  {!hasPermission
                    ? 'Requesting camera permission...'
                    : 'Loading camera...'}
                </Text>
              )}
            </View>
            <Pressable onPress={toggleCamera} style={styles.switchButton}>
              <Text style={styles.switchText}>Switch Camera</Text>
            </Pressable>
            <Pressable
              onPress={handleFinish}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Finish</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    switchButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    padding: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  switchText: {
    color: 'white',
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  cameraPreview: {
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginBottom: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
});

export default CameraScreen;