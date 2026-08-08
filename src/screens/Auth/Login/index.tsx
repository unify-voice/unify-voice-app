import auth from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Eye, EyeOff, Fingerprint, Globe, ScanFace } from '@tamagui/lucide-icons-2'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text, View, XStack, YStack } from 'tamagui'

import Screen from '../../../components/layouts/Screen'
import { signInWithGoogle } from '../../../config/googleAuth'
import { useLanguage } from '../../../context/Language'
import { useLoader } from '../../../context/Loader'
import { useAppTheme } from '../../../context/Theme'
import { getBiometryKind, getBiometryLabel, hasBiometricCredentials, loadBiometricCredentials, saveBiometricCredentials } from '../../../services/biometrics'
import { useThemedStyles } from '../../../theme'
import { RootStackParamList } from '../../../types/navigation'
import { mapAuthError } from '../../../utils/authErrors'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors, inputTheme } = useAppTheme()
  const { t } = useLanguage()
  const { show, hide } = useLoader()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [biometryLabel, setBiometryLabel] = useState('Biometrics')
  const [biometryKind, setBiometryKind] = useState<'face' | 'fingerprint' | 'iris' | 'none'>('none')
  const [canUseBiometrics, setCanUseBiometrics] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  useEffect(() => {
    ;(async () => {
      const [label, kind, hasCreds] = await Promise.all([getBiometryLabel(), getBiometryKind(), hasBiometricCredentials()])
      setBiometryLabel(label)
      setBiometryKind(kind)
      setCanUseBiometrics(kind !== 'none' && hasCreds)
    })()
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const offerBiometrics = useCallback(
    async (userEmail: string, userPassword: string) => {
      if (biometryKind === 'none') return
      const already = await hasBiometricCredentials()
      if (already) {
        await saveBiometricCredentials(userEmail, userPassword)
        return
      }
      Alert.alert(`Enable ${biometryLabel}?`, `Use ${biometryLabel} for faster sign-in next time.`, [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            try {
              await saveBiometricCredentials(userEmail, userPassword)
              setCanUseBiometrics(true)
            } catch {
              Alert.alert('Could not enable biometrics', 'You can enable this later from Profile.')
            }
          },
        },
      ])
    },
    [biometryKind, biometryLabel],
  )

  const handleLogin = async () => {
    setErrors((e) => ({ ...e, general: undefined }))
    if (!validate()) return
    setIsLoading(true)
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password)
      await offerBiometrics(email.trim(), password)
      navigation.replace('MainTabs', { screen: 'HomeScreen' })
    } catch (err: any) {
      setErrors((e) => ({ ...e, general: mapAuthError(err?.code) }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setErrors((e) => ({ ...e, general: undefined }))
    setIsLoading(true)
    try {
      const creds = await loadBiometricCredentials()
      if (!creds) {
        setErrors((e) => ({ ...e, general: 'No biometric credentials found. Sign in with email first.' }))
        return
      }
      await auth().signInWithEmailAndPassword(creds.email, creds.password)
      navigation.replace('MainTabs', { screen: 'HomeScreen' })
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.code === 'USER_CANCELED') return
      setErrors((e) => ({ ...e, general: mapAuthError(err?.code, 'Biometric sign-in failed. Try email instead.') }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    show()
    try {
      await signInWithGoogle()
      navigation.replace('MainTabs', { screen: 'HomeScreen' })
    } catch (err: any) {
      if (err?.code === 'SIGN_IN_CANCELLED' || err?.message?.includes('cancel')) return
      setErrors((e) => ({ ...e, general: err?.message || 'Google sign-in failed. Try again.' }))
    } finally {
      hide()
    }
  }

  const BiometricIcon = biometryKind === 'face' ? ScanFace : Fingerprint

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
              <Text style={styles.brandSub}>{t('auth.welcomeBack')}</Text>
            </YStack>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('auth.signInTitle')}</Text>
              <Text style={styles.cardSub}>{t('auth.signInSub')}</Text>

              {errors.general ? (
                <View style={styles.generalErr}>
                  <Text style={styles.errText}>{errors.general}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>{t('auth.email')}</Text>
              <TextInput
                mode='flat'
                placeholder='your@email.com'
                value={email}
                onChangeText={(txt) => {
                  setEmail(txt)
                  setErrors((e) => ({ ...e, email: undefined }))
                }}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                outlineColor={errors.email ? colors.errorBorder : colors.inputOutline}
                activeOutlineColor={errors.email ? colors.errorText : colors.primary}
                style={styles.input}
                placeholderTextColor={colors.textFaint}
                theme={inputTheme}
              />
              {errors.email ? <Text style={styles.fieldErr}>{errors.email}</Text> : null}

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t('auth.password')}</Text>
              <TextInput
                mode='flat'
                placeholder='Enter your password'
                value={password}
                onChangeText={(txt) => {
                  setPassword(txt)
                  setErrors((e) => ({ ...e, password: undefined }))
                }}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={() => (showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />)}
                    color={colors.textMuted}
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
                outlineColor={errors.password ? colors.errorBorder : colors.inputOutline}
                activeOutlineColor={errors.password ? colors.errorText : colors.primary}
                style={styles.input}
                placeholderTextColor={colors.textFaint}
                theme={inputTheme}
              />
              {errors.password ? <Text style={styles.fieldErr}>{errors.password}</Text> : null}

              <Pressable onPress={() => navigation.navigate('ForgotPasswordScreen')} style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 }}>
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: colors.primarySoft }, isLoading && { opacity: 0.5 }]}
              >
                {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.primaryBtnText}>{t('auth.logIn')}</Text>}
              </Pressable>

              <XStack ai='center' gap='$3' my='$4'>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.orContinue')}</Text>
                <View style={styles.dividerLine} />
              </XStack>

              <XStack gap='$3'>
                <Pressable onPress={handleGoogle} style={({ pressed }) => [styles.socialBtn, pressed && { backgroundColor: colors.cardPressed }]}>
                  <Globe size={16} color={colors.textSecondary} />
                  <Text style={styles.socialBtnText}>{t('auth.google')}</Text>
                </Pressable>

                <Pressable
                  onPress={canUseBiometrics ? handleBiometricLogin : undefined}
                  disabled={!canUseBiometrics || isLoading}
                  style={({ pressed }) => [
                    styles.socialBtn,
                    pressed && canUseBiometrics && { backgroundColor: colors.cardPressed },
                    !canUseBiometrics && { opacity: 0.4 },
                  ]}
                >
                  <BiometricIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.socialBtnText}>{biometryLabel}</Text>
                </Pressable>
              </XStack>

              <XStack ai='center' jc='center' gap='$2' mt='$4'>
                <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
                <Pressable onPress={() => navigation.navigate('SignupScreen')}>
                  <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
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
