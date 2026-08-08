import auth from '@react-native-firebase/auth'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AudioLines, Languages, Mic, Sparkles, User } from '@tamagui/lucide-icons-2'
import React, { useRef, useState, type ComponentType } from 'react'
import { Animated, Pressable, View } from 'react-native'
import { Text } from 'tamagui'

import Screen from '../../components/layouts/Screen'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { markTutorialComplete } from '../../services/tutorial'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'AppTutorial'>
type IconComponent = ComponentType<{ size?: number; color?: string }>

const STEP_KEYS = [
  { Icon: Sparkles, title: 'tutorial.welcomeTitle', body: 'tutorial.welcomeBody' },
  { Icon: Mic, title: 'tutorial.sttTitle', body: 'tutorial.sttBody' },
  { Icon: AudioLines, title: 'tutorial.stsTitle', body: 'tutorial.stsBody' },
  { Icon: Languages, title: 'tutorial.langTitle', body: 'tutorial.langBody' },
  { Icon: User, title: 'tutorial.profileTitle', body: 'tutorial.profileBody' },
] as const

const AppTutorialScreen = ({ navigation, route }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const replay = !!route.params?.replay
  const [step, setStep] = useState(0)
  const fade = useRef(new Animated.Value(1)).current
  const slide = useRef(new Animated.Value(0)).current

  const animateTo = (next: number) => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slide, { toValue: isRTL ? 24 : -24, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setStep(next)
      slide.setValue(isRTL ? -24 : 24)
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start()
    })
  }

  const finish = async () => {
    const uid = auth().currentUser?.uid
    if (uid) await markTutorialComplete(uid)
    if (replay) navigation.goBack()
    else navigation.replace('MainTabs', { screen: 'HomeScreen' })
  }

  const next = () => {
    if (step < STEP_KEYS.length - 1) animateTo(step + 1)
    else void finish()
  }

  const current = STEP_KEYS[step]
  const Icon = current.Icon as IconComponent
  const isLast = step === STEP_KEYS.length - 1
  const progress = ((step + 1) / STEP_KEYS.length) * 100

  return (
    <Screen>
      <View style={[styles.root, directionStyle(isRTL)]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => void finish()} hitSlop={12} accessibilityRole='button' accessibilityLabel={t('tutorial.skip')}>
            <Text style={styles.skip}>{t('tutorial.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateX: slide }] }]}>
          <View style={styles.iconBubble}>
            <Icon size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t(current.title)}</Text>
          <Text style={styles.copy}>{t(current.body)}</Text>
        </Animated.View>

        <Text style={styles.counter}>
          {t('tutorial.counter').replace('{current}', String(step + 1)).replace('{total}', String(STEP_KEYS.length))}
        </Text>

        <View style={styles.actions}>
          {step > 0 ? (
            <Pressable onPress={() => animateTo(step - 1)} style={[styles.btn, styles.btnSecondary]}>
              <Text style={styles.btnSecondaryText}>{t('tutorial.back')}</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable onPress={next} style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnPrimaryText}>{isLast ? t('tutorial.finish') : t('tutorial.next')}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}

export default AppTutorialScreen
