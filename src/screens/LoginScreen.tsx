import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import BrandHeader from '../components/BrandHeader';
import { COLORS } from '../theme';

type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const mapFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'This email is not registered';

    case 'auth/wrong-password':
      return 'Incorrect password';

    case 'auth/invalid-credential':
      return 'Incorrect email or password'; // ✅ IMPORTANT FIX

    case 'auth/invalid-email':
      return 'Enter a valid email address';

    case 'auth/network-request-failed':
      return 'Network error, please try again';

    default:
      return 'Something went wrong. Try again';
  }
};
  const handleLogin = async () => {
    console.log('LOGIN CLICKED');

    // Clear previous general error
    setErrors(prevErrors => ({ ...prevErrors, general: '' }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password
      );

      console.log('LOGIN SUCCESS:', userCredential.user.email);
      setIsLoading(false);
      navigation.replace('HomeScreen');

    } catch (error: any) {
      console.log('FIREBASE ERROR:', error.code, error.message);
      const errorMessage = mapFirebaseError(error.code);
      setErrors(prevErrors => ({ ...prevErrors, general: errorMessage }));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordScreen');
  };

  const handleSignUp = () => {
    navigation.navigate('SignupScreen');
  };

  const scale = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale }] }]}> 
          <BrandHeader subtitle="Welcome back to your AI communication hub." />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sign in to continue</Text>
            <Text style={styles.sectionSubtitle}>
              Use your email and password to unlock the full experience.
            </Text>

            {errors.general ? (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              mode="outlined"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              outlineColor={errors.email ? COLORS.error : COLORS.border}
              activeOutlineColor={errors.email ? COLORS.error : COLORS.primary}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{
                colors: {
                  background: COLORS.surface,
                  text: COLORS.textPrimary,
                  placeholder: COLORS.textHint,
                },
              }}
            />
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter your password"
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
              theme={{
                colors: {
                  background: COLORS.surface,
                  text: COLORS.textPrimary,
                  placeholder: COLORS.textHint,
                },
              }}
            />
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

            <Pressable onPress={handleForgotPassword} style={({ pressed }) => [styles.linkButton, pressed && styles.buttonPressed]}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              onPress={handleLogin}
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
                <Text style={styles.primaryButtonText}>LOG IN</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.bodyText}>Don't have an account?</Text>
            <Pressable onPress={handleSignUp}>
              <Text style={styles.linkAccent}>Sign Up</Text>
            </Pressable>
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
  linkButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
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
  footer: {
    marginTop: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkAccent: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
