import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';

type ForgotPasswordNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;

type Props = {
  navigation: ForgotPasswordNavigationProp;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetLink = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    Alert.alert(
      'Reset Link Sent',
      'A password reset link has been sent to your email address.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const scale = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale }] }]}> 
          <BrandHeader subtitle="Enter your email to reset your password securely." />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Forgot Password</Text>
            <Text style={styles.sectionSubtitle}>
              We’ll send a secure reset link to your email address.
            </Text>

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              mode="outlined"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              theme={{
                colors: {
                  background: COLORS.surface,
                  text: COLORS.textPrimary,
                  placeholder: COLORS.textHint,
                },
              }}
            />

            <Pressable onPress={handleSendResetLink} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>SEND RESET LINK</Text>
            </Pressable>

            <Pressable onPress={handleBackToLogin} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.secondaryButtonText}>Back to Login</Text>
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
    paddingTop: 24,
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
  label: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    height: 52,
    borderRadius: 16,
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
    marginBottom: 14,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
});

export default ForgotPasswordScreen;
