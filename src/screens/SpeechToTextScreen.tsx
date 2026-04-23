import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';

type SpeechToTextNavigationProp = StackNavigationProp<RootStackParamList, 'SpeechToTextScreen'>;

type Props = {
  navigation: SpeechToTextNavigationProp;
};

const SpeechToTextScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>  
        <BrandHeader subtitle="Turn spoken words into accurate text instantly." />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Speech to Text</Text>
          <Text style={styles.bodyText}>
            This mode listens to speech and converts it into a clean transcript for fast reading and sharing.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.buttonText}>RETURN HOME</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
  },
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default SpeechToTextScreen;
