import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';

type CameraPermissionNavigationProp = StackNavigationProp<RootStackParamList, 'CameraPermissionScreen'>;

type Props = {
  navigation: CameraPermissionNavigationProp;
};

const CameraPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleAllowCameraAccess = async () => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const result = await request(permission);
    if (result === RESULTS.GRANTED) {
      navigation.replace('CameraScreen');
    } else {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to use this feature. Please enable it in settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNotNow = () => {
    navigation.goBack();
  };

  const scale = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale }] }]}> 
          <BrandHeader subtitle="Allow access so Unify Voice can capture your sign and voice input." />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Camera Permission</Text>
            <Text style={styles.sectionSubtitle}>
              Grant camera access to use gesture recognition and capture your voice accurately.
            </Text>

            <Pressable onPress={handleAllowCameraAccess} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>Allow Camera Access</Text>
            </Pressable>

            <Pressable onPress={handleNotNow} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.secondaryButtonText}>Not Now</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
});

export default CameraPermissionScreen;
