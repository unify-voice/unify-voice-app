import auth from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, Image, View } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import uvLogo from '../../assets/logo.png'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>

const { width } = Dimensions.get('window')
const logoSize = Math.min(88, width * 0.2)

const SplashScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t } = useLanguage()
  const fade = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(16)).current
  const ringScale1 = useRef(new Animated.Value(0.94)).current
  const ringScale2 = useRef(new Animated.Value(0.94)).current
  const glowOpacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()

    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale1, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale1, { toValue: 0.96, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
        ]),
      ]),
    )
    const ringLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale2, { toValue: 1.06, duration: 2600, useNativeDriver: true }),
        Animated.timing(ringScale2, { toValue: 0.94, duration: 2600, useNativeDriver: true }),
      ]),
    )
    ringLoop.start()
    ringLoop2.start()

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let navigated = false

    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (navigated) return
        navigated = true
        if (user) {
          navigation.replace('MainTabs', { screen: 'HomeScreen' })
        } else {
          navigation.replace('Onboarding')
        }
      }, 1800)
    })

    return () => {
      unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
      ringLoop.stop()
      ringLoop2.stop()
    }
  }, [glowOpacity, fade, ringScale1, ringScale2, translateY, navigation])

  return (
    <YStack flex={1} bg={colors.background} jc='center' ai='center'>
      <Animated.View style={[styles.glowCore, { opacity: glowOpacity }]} />

      <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ringScale1 }] }]} />
      <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringScale2 }] }]} />
      <View style={[styles.ring, styles.ring3]} />

      <Animated.View style={{ opacity: fade, transform: [{ translateY }] }}>
        <YStack ai='center' gap='$5' px='$6'>
          <Image source={uvLogo} style={{ width: logoSize, height: logoSize }} />

          <YStack ai='center' gap='$1'>
            <XStack ai='center'>
              <Text fontSize={34} fontWeight='900' letterSpacing={1.5} color={colors.textPrimary}>
                Unify
              </Text>
              <Text
                fontSize={34}
                fontWeight='900'
                letterSpacing={1.5}
                color={colors.primary}
                style={{ textShadowColor: colors.primaryGlow, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } }}
              >
                Voice
              </Text>
            </XStack>
            <Text fontSize={10} letterSpacing={3.5} color={colors.textMuted} style={{ textTransform: 'uppercase', fontWeight: '300' }}>
              {t('app.tagline')}
            </Text>
          </YStack>

          <View style={styles.divider} />

          <Text fontSize={13} color={colors.textFaint} textAlign='center' maxWidth={230} lineHeight={22} fontWeight='300'>
            {t('app.subtitle')}
          </Text>
        </YStack>
      </Animated.View>
    </YStack>
  )
}

export default SplashScreen
