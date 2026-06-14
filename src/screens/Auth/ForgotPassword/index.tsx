import auth from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text, View, XStack, YStack } from 'tamagui'

import Screen from '../../../components/layouts/Screen'
import { colors, INPUT_THEME } from '../../../theme'
import { RootStackParamList } from '../../../types/navigation'

import { styles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordScreen'>

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [successMsg, setSuccessMsg] = useState<string | undefined>()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address')
      return false
    }
    return true
  }

  const handleSendResetLink = async () => {
    setError(undefined)
    setSuccessMsg(undefined)
    if (!validate()) return
    setIsLoading(true)
    try {
      await auth().sendPasswordResetEmail(email.trim())
      setSuccessMsg('A reset link has been sent to your email address.')
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/network-request-failed': 'Network error, please try again.',
        'auth/invalid-email': 'Enter a valid email address.',
      }
      setError(msg[err.code] ?? 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
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
              <Text style={styles.brandSub}>Enter your email to reset your password securely.</Text>
            </YStack>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Forgot Password</Text>
              <Text style={styles.cardSub}>We'll send a secure reset link to your email address.</Text>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {successMsg ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                mode='flat'
                placeholder='your@email.com'
                value={email}
                onChangeText={(t) => {
                  setEmail(t)
                  setError(undefined)
                }}
                keyboardType='email-address'
                autoCapitalize='none'
                outlineColor={error ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}
                activeOutlineColor={error ? '#f87171' : colors.primary}
                style={styles.input}
                placeholderTextColor='rgba(255,255,255,0.2)'
                theme={INPUT_THEME}
              />

              <Pressable
                onPress={handleSendResetLink}
                disabled={isLoading}
                style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: 'rgba(34,197,94,0.2)' }, isLoading && { opacity: 0.5 }]}
              >
                {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.primaryBtnText}>Send Reset Link</Text>}
              </Pressable>

              <XStack ai='center' gap='$3' my='$4'>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </XStack>

              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [styles.secondaryBtn, pressed && { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }]}
              >
                <Text style={styles.secondaryBtnText}>Back to Login</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

export default ForgotPasswordScreen
