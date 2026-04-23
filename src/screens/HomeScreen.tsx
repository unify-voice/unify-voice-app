import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';
import { getAuth, signOut } from '@react-native-firebase/auth';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const uvLogo = require('../assets/uv_logo.png');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const authInstance = getAuth();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSignToText = () => {
    navigation.navigate('CameraPermissionScreen');
  };

  const handleSpeechToSign = () => {
    navigation.navigate('SpeechToSignScreen');
  };

  const handleSpeechToText = () => {
    navigation.navigate('SpeechToTextScreen');
  };

  // ✅ Logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
    await signOut(authInstance); // ✅ correct way

    navigation.replace('Login');
  } catch (error) {
    console.log(error);
  }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <BrandHeader subtitle="Choose a communication mode designed for fast, clear access." />
        <Text style={{ color: COLORS.textPrimary, fontSize: 28, fontWeight: '900' }}>
          {`Welcome, ${authInstance.currentUser?.displayName || 'User'}`}
        </Text>
        <View style={styles.cardsContainer}>
          <Pressable
            onPress={handleSignToText}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconShell}>
                <Image source={uvLogo} style={styles.icon} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Sign to Text</Text>
                <Text style={styles.cardSubtitle}>
                  Camera-based sign detection
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={handleSpeechToSign}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconShell}>
                <Image source={uvLogo} style={styles.icon} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Speech to Sign</Text>
                <Text style={styles.cardSubtitle}>
                  Translate spoken words visually
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={handleSpeechToText}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconShell}>
                <Image source={uvLogo} style={styles.icon} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Speech to Text</Text>
                <Text style={styles.cardSubtitle}>
                  Instant voice transcription
                </Text>
              </View>
            </View>
          </Pressable>

          {/* ✅ Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.tagline}>
            Bridging communication gaps with modern AI.
          </Text>
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
    paddingTop: 50,
    paddingBottom: 24,
  },
  cardsContainer: {
    marginTop: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ECF8EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ✅ Logout styles
  logoutButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;