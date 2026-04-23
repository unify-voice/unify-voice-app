import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme';
import auth from '@react-native-firebase/auth';

const uvLogo = require('../assets/uv_logo.png');

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const { width } = Dimensions.get('window');
const logoSize = Math.min(100, width * 0.24);

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  // Start animation
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 650,
    useNativeDriver: true,
  }).start();

  // Check Firebase auth state
  const unsubscribe = auth().onAuthStateChanged(user => {
    setTimeout(() => {
      if (user) {
        navigation.replace('HomeScreen'); // ✅ already logged in
      } else {
        navigation.replace('Onboarding'); // ❌ not logged in
      }
    }, 1800); // keep your splash timing
  });

  return unsubscribe;
}, [fadeAnim, navigation]);

  const scale = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backgroundGlow} />
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale }] }]}>   
          <View style={styles.brandRow}>
            <Image source={uvLogo} style={[styles.logo, { width: logoSize, height: logoSize }]} />
            <Text style={styles.title}>Unify Voice</Text>
          </View>
          <Text style={styles.subtitle}>Bridging silence with intelligent translation</Text>
        </Animated.View>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  backgroundGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
    top: '18%',
    right: -30,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginLeft: 14,
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  logo: {
    borderRadius: 22,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SplashScreen;

