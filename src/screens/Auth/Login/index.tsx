import auth from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Eye, EyeOff } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text, View, YStack, XStack } from 'tamagui'

import Screen from '../../../components/layouts/Screen'
import { signInWithGoogle } from '../../../config/googleAuth'
import { useLoader } from '../../../context/Loader'
import { colors, INPUT_THEME } from '../../../theme'
import { RootStackParamList } from '../../../types/navigation'

import { styles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { show, hide } = useLoader()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mapError = (code: string) =>
    ({
      'auth/user-not-found': 'This email is not registered',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Incorrect email or password',
      'auth/network-request-failed': 'Network error, please try again',
    })[code] ?? 'Something went wrong. Try again'

  const handleLogin = async () => {
    setErrors((e) => ({ ...e, general: undefined }))
    if (!validate()) return
    setIsLoading(true)
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password)
      navigation.replace('MainTabs', {
        screen: 'HomeScreen',
      })
    } catch (err: any) {
      setErrors((e) => ({ ...e, general: mapError(err.code) }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    show()
    try {
      await signInWithGoogle()
      navigation.replace('MainTabs', {
        screen: 'HomeScreen',
      })
    } catch {
      setErrors((e) => ({ ...e, general: 'Google sign-in failed. Try again.' }))
    } finally {
      hide()
    }
  }

  return (
    <Screen padded={false}>
      <View style={styles.ambientGlow} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <YStack mb='$5'>
              <XStack ai='center'>
                <Text style={styles.brandUnify}>Unify</Text>
                <Text style={styles.brandVoice}>Voice</Text>
              </XStack>
              <Text style={styles.brandSub}>Welcome back to your AI communication hub.</Text>
            </YStack>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign in to continue</Text>
              <Text style={styles.cardSub}>Use your email and password to unlock the full experience.</Text>

              {errors.general ? (
                <View style={styles.generalErr}>
                  <Text style={styles.errText}>{errors.general}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                mode='flat'
                placeholder='your@email.com'
                value={email}
                onChangeText={(t) => {
                  setEmail(t)
                  setErrors((e) => ({ ...e, email: undefined }))
                }}
                keyboardType='email-address'
                autoCapitalize='none'
                outlineColor={errors.email ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}
                activeOutlineColor={errors.email ? '#f87171' : colors.primary}
                style={styles.input}
                placeholderTextColor='rgba(255,255,255,0.2)'
                theme={INPUT_THEME}
              />
              {errors.email ? <Text style={styles.fieldErr}>{errors.email}</Text> : null}

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Password</Text>
              <TextInput
                mode='flat'
                placeholder='Enter your password'
                value={password}
                onChangeText={(t) => {
                  setPassword(t)
                  setErrors((e) => ({ ...e, password: undefined }))
                }}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={() => (showPassword ? <EyeOff size={18} /> : <Eye size={18} />)}
                    color='rgba(255,255,255,0.3)'
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
                outlineColor={errors.password ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}
                activeOutlineColor={errors.password ? '#f87171' : colors.primary}
                style={styles.input}
                placeholderTextColor='rgba(255,255,255,0.2)'
                theme={INPUT_THEME}
              />
              {errors.password ? <Text style={styles.fieldErr}>{errors.password}</Text> : null}

              <Pressable onPress={() => navigation.navigate('ForgotPasswordScreen')} style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 }}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: 'rgba(34,197,94,0.2)' }, isLoading && { opacity: 0.5 }]}
              >
                {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.primaryBtnText}>Log In</Text>}
              </Pressable>

              <XStack ai='center' gap='$3' my='$4'>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </XStack>

              <XStack gap='$3'>
                <Pressable onPress={handleGoogle} style={({ pressed }) => [styles.socialBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
                  <Text style={{ fontSize: 15 }}>🌐</Text>
                  <Text style={styles.socialBtnText}>Google</Text>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
                  <Text style={{ fontSize: 16 }}>⬡</Text>
                  <Text style={styles.socialBtnText}>Face ID</Text>
                </Pressable>
              </XStack>

              <XStack ai='center' jc='center' gap='$2' mt='$4'>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <Pressable onPress={() => navigation.navigate('SignupScreen')}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </Pressable>
              </XStack>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

export default LoginScreen
