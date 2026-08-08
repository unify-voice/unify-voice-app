import { getAuth, updateProfile } from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Eye, EyeOff, Globe } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text, View, XStack, YStack } from 'tamagui'

import Screen from '../../../components/layouts/Screen'
import { signInWithGoogle } from '../../../config/googleAuth'
import { useLoader } from '../../../context/Loader'
import { useAppTheme } from '../../../context/Theme'
import { getBiometryKind, getBiometryLabel, saveBiometricCredentials } from '../../../services/biometrics'
import { useThemedStyles } from '../../../theme'
import { RootStackParamList } from '../../../types/navigation'
import { mapAuthError } from '../../../utils/authErrors'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'SignupScreen'>

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors, inputTheme } = useAppTheme()
  const { show, hide } = useLoader()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    general?: string
  }>({})

  const authInstance = getAuth()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start()
    return () => fadeAnim.stopAnimation()
  }, [fadeAnim, scaleAnim])

  useEffect(() => {
    if (password && confirmPassword && password === confirmPassword) {
      setErrors((e) => {
        const n = { ...e }
        delete n.confirmPassword
        return n
      })
    }
  }, [password, confirmPassword])

  const validate = () => {
    const e: typeof errors = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const offerBiometrics = async (userEmail: string, userPassword: string) => {
    const kind = await getBiometryKind()
    if (kind === 'none') return
    const label = await getBiometryLabel()
    Alert.alert(`Enable ${label}?`, `Use ${label} for faster sign-in next time.`, [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Enable',
        onPress: async () => {
          try {
            await saveBiometricCredentials(userEmail, userPassword)
          } catch {
            // optional
          }
        },
      },
    ])
  }

  const handleSignUp = async () => {
    setErrors((e) => ({ ...e, general: undefined }))
    if (!validate()) return
    setIsLoading(true)
    try {
      const cred = await authInstance.createUserWithEmailAndPassword(email.trim(), password)
      try {
        await updateProfile(cred.user, { displayName: fullName.trim() })
      } catch {
        // Account exists; name can be updated later in Profile
      }
      await offerBiometrics(email.trim(), password)
      navigation.replace('MainTabs', { screen: 'HomeScreen' })
    } catch (err: any) {
      setErrors((e) => ({ ...e, general: mapAuthError(err?.code) }))
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

  const FieldLabel = ({ children, mt }: { children: string; mt?: number }) => <Text style={[styles.fieldLabel, mt ? { marginTop: mt } : {}]}>{children}</Text>

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
              <Text style={styles.brandSub}>Create your account to access premium AI features.</Text>
            </YStack>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create account</Text>
              <Text style={styles.cardSub}>Secure, simple signup with a clean and focused form.</Text>

              {errors.general ? (
                <View style={styles.generalErr}>
                  <Text style={styles.errText}>{errors.general}</Text>
                </View>
              ) : null}

              <FieldLabel>Full Name</FieldLabel>
              <TextInput
                mode='flat'
                placeholder='John Doe'
                value={fullName}
                onChangeText={(txt) => {
                  setFullName(txt)
                  setErrors((e) => ({ ...e, fullName: undefined }))
                }}
                outlineColor={errors.fullName ? colors.errorBorder : colors.inputOutline}
                activeOutlineColor={errors.fullName ? colors.errorText : colors.primary}
                style={styles.input}
                placeholderTextColor={colors.textFaint}
                theme={inputTheme}
              />
              {errors.fullName ? <Text style={styles.fieldErr}>{errors.fullName}</Text> : null}

              <FieldLabel mt={14}>Email</FieldLabel>
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

              <FieldLabel mt={14}>Password</FieldLabel>
              <TextInput
                mode='flat'
                placeholder='Create a password'
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

              <FieldLabel mt={14}>Confirm Password</FieldLabel>
              <TextInput
                mode='flat'
                placeholder='Confirm your password'
                value={confirmPassword}
                onChangeText={(txt) => {
                  setConfirmPassword(txt)
                  setErrors((e) => ({ ...e, confirmPassword: undefined }))
                }}
                secureTextEntry={!showConfirm}
                right={
                  <TextInput.Icon
                    icon={() => (showConfirm ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />)}
                    color={colors.textMuted}
                    onPress={() => setShowConfirm((v) => !v)}
                  />
                }
                outlineColor={errors.confirmPassword ? colors.errorBorder : colors.inputOutline}
                activeOutlineColor={errors.confirmPassword ? colors.errorText : colors.primary}
                style={styles.input}
                placeholderTextColor={colors.textFaint}
                theme={inputTheme}
              />
              {errors.confirmPassword ? <Text style={styles.fieldErr}>{errors.confirmPassword}</Text> : null}

              <Pressable
                onPress={handleSignUp}
                disabled={isLoading}
                style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: colors.primarySoft }, isLoading && { opacity: 0.5 }]}
              >
                {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.primaryBtnText}>Sign Up</Text>}
              </Pressable>

              <XStack ai='center' gap='$3' my='$4'>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </XStack>

              <Pressable onPress={handleGoogle} style={({ pressed }) => [styles.socialBtn, { flex: 1 }, pressed && { backgroundColor: colors.cardPressed }]}>
                <Globe size={16} color={colors.textSecondary} />
                <Text style={styles.socialBtnText}>Google</Text>
              </Pressable>

              <XStack ai='center' jc='center' gap='$2' mt='$4'>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Log In</Text>
                </Pressable>
              </XStack>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

export default SignupScreen
