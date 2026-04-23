import React, { useState, useEffect, useRef } from 'react';
import '@react-native-firebase/app';
import { getAuth, updateProfile } from '@react-native-firebase/auth';


import {
  Animated,
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { TextInput } from 'react-native-paper';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';
import { signInWithGoogle } from '../auth/googleAuth';

type SignupNavigationProp = StackNavigationProp<RootStackParamList, 'SignupScreen'>;

type Props = {
  navigation: SignupNavigationProp;
};

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const authInstance = getAuth();
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Real-time password match validation: clear error when passwords match
  useEffect(() => {
    if (password && confirmPassword && password === confirmPassword) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [password, confirmPassword]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFirebaseError = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/network-request-failed':
        return 'Network error, please try again';
      case 'auth/invalid-email':
        return 'Enter a valid email address';
      default:
        return 'Something went wrong. Try again';
    }
  };

  const handleSignUp = async () => {
    console.log('SIGNUP CLICKED');

    // Clear previous general error
    setErrors(prevErrors => ({ ...prevErrors, general: '' }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await authInstance.createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      console.log('SUCCESS:', userCredential.user.email);
      // ✅ SET DISPLAY NAME HERE
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName || 'User',
      });
      setIsLoading(false);
      navigation.replace("HomeScreen");

    } catch (error: any) {
      console.log('FIREBASE ERROR:', error.code, error.message);
      const errorMessage = mapFirebaseError(error.code);
      setErrors(prevErrors => ({ ...prevErrors, general: errorMessage }));
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const scale = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale }] }]}> 
          <BrandHeader subtitle="Create your account to access premium AI features." />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create account</Text>
            <Text style={styles.sectionSubtitle}>
              Secure, simple signup with a clean and focused form.
            </Text>

            {errors.general ? (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              mode="outlined"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              outlineColor={errors.fullName ? COLORS.error : COLORS.border}
              activeOutlineColor={errors.fullName ? COLORS.error : COLORS.primary}
            />
            {errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              mode="outlined"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineColor={errors.email ? COLORS.error : COLORS.border}
              activeOutlineColor={errors.email ? COLORS.error : COLORS.primary}
            />
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              mode="outlined"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              outlineColor={errors.password ? COLORS.error : COLORS.border}
              activeOutlineColor={errors.password ? COLORS.error : COLORS.primary}
            />
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              mode="outlined"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
              outlineColor={errors.confirmPassword ? COLORS.error : COLORS.border}
              activeOutlineColor={errors.confirmPassword ? COLORS.error : COLORS.primary}
            />
            {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}

            <Pressable 
              onPress={handleSignUp} 
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryButton, 
                pressed && !isLoading && styles.buttonPressed,
                isLoading && styles.buttonDisabled
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>SIGN UP</Text>
              )}
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#ddd' }} />
              <Text style={{ marginHorizontal: 12, color: '#888' }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#ddd' }} />
            </View>

            <TouchableOpacity onPress={signInWithGoogle} style={styles.primaryButton}>
              <Text style={{ color: '#333' }}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.bodyText}>Already have an account?</Text>
              <Pressable onPress={handleLogin}>
                <Text style={styles.linkText}> Log In</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
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
  label: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
    backgroundColor: COLORS.surface,
    height: 52,
    borderRadius: 16,
  },
  generalErrorContainer: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#c62828',
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  fieldError: {
    color: '#c62828',
    fontSize: 12,
    marginBottom: 14,
    marginTop: -2,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '500',
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
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
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
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignupScreen;