import auth from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text, View, XStack, YStack } from 'tamagui'

import Screen from '../../../components/layouts/Screen'
import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import { useThemedStyles } from '../../../theme'
import { RootStackParamList } from '../../../types/navigation'
import { mapAuthError } from '../../../utils/authErrors'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordScreen'>

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors, inputTheme } = useAppTheme()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [successMsg, setSuccessMsg] = useState<string | undefined>()
  const [sent, setSent] = useState(false)

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
      // Neutral copy: email enumeration protection may hide user-not-found
      setSuccessMsg(t('auth.resetSent'))
      setSent(true)
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        setSuccessMsg(t('auth.resetSent'))
        setSent(true)
      } else {
        setError(mapAuthError(err?.code))
      }
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
              <Text style={styles.brandSub}>{t('auth.brandForgotSub')}</Text>
            </YStack>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('auth.forgotTitle')}</Text>
              <Text style={styles.cardSub}>{t('auth.forgotSub')}</Text>

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

              <Text style={styles.fieldLabel}>{t('auth.email')}</Text>
              <TextInput
                mode='flat'
                placeholder='your@email.com'
                value={email}
                onChangeText={(txt) => {
                  setEmail(txt)
                  setError(undefined)
                }}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                editable={!sent}
                outlineColor={error ? colors.errorBorder : colors.inputOutline}
                activeOutlineColor={error ? colors.errorText : colors.primary}
                style={styles.input}
                placeholderTextColor={colors.textFaint}
                theme={inputTheme}
              />

              {!sent ? (
                <Pressable
                  onPress={handleSendResetLink}
                  disabled={isLoading}
                  style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: colors.primarySoft }, isLoading && { opacity: 0.5 }]}
                >
                  {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.primaryBtnText}>{t('auth.sendReset')}</Text>}
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => navigation.replace('Login')}
                  style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: colors.primarySoft }]}
                >
                  <Text style={styles.primaryBtnText}>{t('auth.backToLogin')}</Text>
                </Pressable>
              )}

              <XStack ai='center' gap='$3' my='$4'>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </XStack>

              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [styles.secondaryBtn, pressed && { borderColor: colors.controlBorder, backgroundColor: colors.controlBg }]}
              >
                <Text style={styles.secondaryBtnText}>{t('auth.backToLogin')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

export default ForgotPasswordScreen
