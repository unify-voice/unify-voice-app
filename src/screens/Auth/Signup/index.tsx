import { getAuth, updateProfile } from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Eye, EyeOff } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text, View, YStack, XStack } from 'tamagui'

import Screen from '../../../components/layouts/Screen'
import { signInWithGoogle } from '../../../config/googleAuth'
import { colors } from '../../../theme'
import { RootStackParamList } from '../../../types/navigation'

import { styles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'SignupScreen'>

const INPUT_THEME = {
  colors: {
    text: '#ffffff',
    primary: colors.primary,
    background: 'rgba(255,255,255,0.04)',
    placeholder: 'rgba(255,255,255,0.4)',
    onSurface: '#ffffff',
    onSurfaceVariant: 'rgba(255,255,255,0.5)',
  },
}

const SignupScreen: React.FC<Props> = ({ navigation }) => {
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
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mapError = (code: string) =>
    ({
      'auth/email-already-in-use': 'This email is already registered',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/network-request-failed': 'Network error, please try again',
      'auth/invalid-email': 'Enter a valid email address',
    })[code] ?? 'Something went wrong. Try again'

  const handleSignUp = async () => {
    setErrors((e) => ({ ...e, general: undefined }))
    if (!validate()) return
    setIsLoading(true)
    try {
      const cred = await authInstance.createUserWithEmailAndPassword(email.trim(), password)
      await updateProfile(cred.user, { displayName: fullName || 'User' })
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
    setIsLoading(true)
    try {
      await signInWithGoogle()
      navigation.replace('MainTabs', {
        screen: 'HomeScreen',
      })
    } catch {
      setErrors((e) => ({ ...e, general: 'Google sign-in failed. Try again.' }))
    } finally {
      setIsLoading(false)
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
                onChangeText={(t) => {
                  setFullName(t)
                  setErrors((e) => ({ ...e, fullName: undefined }))
                }}
                outlineColor={errors.fullName ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}
                activeOutlineColor={errors.fullName ? '#f87171' : colors.primary}
                style={styles.input}
                placeholderTextColor='rgba(255,255,255,0.2)'
                theme={INPUT_THEME}
              />
              {errors.fullName ? <Text style={styles.fieldErr}>{errors.fullName}</Text> : null}

              <FieldLabel mt={14}>Email</FieldLabel>
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

              <FieldLabel mt={14}>Password</FieldLabel>
              <TextInput
                mode='flat'
                placeholder='Create a password'
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

              <FieldLabel mt={14}>Confirm Password</FieldLabel>
              <TextInput
                mode='flat'
                placeholder='Confirm your password'
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t)
                  setErrors((e) => ({ ...e, confirmPassword: undefined }))
                }}
                secureTextEntry={!showConfirm}
                right={
                  <TextInput.Icon
                    icon={() => (showConfirm ? <EyeOff size={18} /> : <Eye size={18} />)}
                    color='rgba(255,255,255,0.3)'
                    onPress={() => setShowConfirm((v) => !v)}
                  />
                }
                outlineColor={errors.confirmPassword ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}
                activeOutlineColor={errors.confirmPassword ? '#f87171' : colors.primary}
                style={styles.input}
                placeholderTextColor='rgba(255,255,255,0.2)'
                theme={INPUT_THEME}
              />
              {errors.confirmPassword ? <Text style={styles.fieldErr}>{errors.confirmPassword}</Text> : null}

              <Pressable
                onPress={handleSignUp}
                disabled={isLoading}
                style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: 'rgba(34,197,94,0.2)' }, isLoading && { opacity: 0.5 }]}
              >
                {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.primaryBtnText}>Sign Up</Text>}
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
