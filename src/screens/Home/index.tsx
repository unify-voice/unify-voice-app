import auth from '@react-native-firebase/auth'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ChevronRight } from '@tamagui/lucide-icons-2'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, ScrollView } from 'react-native'
import { Text, View, YStack } from 'tamagui'

import { useAuthUser } from '../../context/AuthUser'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { TourTarget, useTour } from '../../context/Tour'
import { countHistoryThisWeek, loadHistory, weekDayStats, type WeekDayStat } from '../../services/history'
import { hasCompletedTutorial } from '../../services/tutorial'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { TabParamList } from '../../types/tabs'
import { directionStyle } from '../../utils/rtl'

import WeekChart from './components/WeekChart'
import { FEATURES } from './const'
import { createStyles } from './styles.module'

const FEATURE_TOUR_ID = {
  'sign-to-text': 'signToText',
  'speech-to-sign': 'speechToSign',
  'speech-to-text': 'speechToText',
} as const

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'HomeScreen'>, NativeStackScreenProps<RootStackParamList>>

const HomeScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { displayName, refreshUser } = useAuthUser()
  const { startTour, active, stepId } = useTour()
  const [weekCount, setWeekCount] = useState(0)
  const [weekDays, setWeekDays] = useState<WeekDayStat[]>(() => weekDayStats([]))

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current
  const scrollRef = useRef<ScrollView>(null)
  const tourAskedRef = useRef(false)

  useFocusEffect(
    useCallback(() => {
      refreshUser()
      void loadHistory().then((items) => {
        setWeekCount(countHistoryThisWeek(items))
        setWeekDays(weekDayStats(items))
      })
      const uid = auth().currentUser?.uid
      if (!uid || tourAskedRef.current) return
      void hasCompletedTutorial(uid).then((done) => {
        if (done || tourAskedRef.current) return
        tourAskedRef.current = true
        setTimeout(() => startTour(), 500)
      })
    }, [refreshUser, startTour]),
  )

  useEffect(() => {
    if (!active) return
    if (stepId === 'welcome') scrollRef.current?.scrollTo({ y: 0, animated: true })
    if (stepId === 'signToText' || stepId === 'speechToSign' || stepId === 'speechToText') {
      scrollRef.current?.scrollToEnd({ animated: true })
    }
  }, [active, stepId])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return t('home.greeting.morning')
    if (h < 18) return t('home.greeting.afternoon')
    return t('home.greeting.evening')
  }

  return (
    <>
      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
          <TourTarget id='welcome'>
            <YStack px='$5' mt='$3'>
              <Text style={styles.greetingLabel} maxFontSizeMultiplier={1.3}>
                {getGreeting()}
              </Text>
              <Text style={styles.welcomeName} maxFontSizeMultiplier={1.4}>
                {displayName}
              </Text>
              <Text style={styles.welcomeSub} maxFontSizeMultiplier={1.35}>
                {t('home.welcomeSub')}
              </Text>
            </YStack>
          </TourTarget>

          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <WeekChart days={weekDays} total={weekCount} onPress={() => navigation.navigate('ActivityScreen')} />

            <View style={styles.hintCard}>
              <Text style={styles.hintText}>{t('home.signsHint')}</Text>
            </View>

            <Text style={styles.sectionLabel}>{t('home.features')}</Text>

            {FEATURES.map((f) => {
              const Icon = f.Icon
              const tourId = FEATURE_TOUR_ID[f.key as keyof typeof FEATURE_TOUR_ID]
              return (
                <TourTarget key={f.key} id={tourId}>
                  <Pressable
                    onPress={() => navigation.navigate(f.route)}
                    style={({ pressed }) => [styles.featureCard, pressed && styles.featureCardPressed]}
                    accessibilityRole='button'
                    accessibilityLabel={t(f.titleKey)}
                  >
                    <View style={styles.featureIcon}>
                      <Icon size={22} color={colors.primary} />
                    </View>
                    <YStack flex={1}>
                      <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
                      <Text style={styles.featureSub}>{t(f.subtitleKey)}</Text>
                    </YStack>
                    <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                      <ChevronRight size={20} color={colors.textDisabled} />
                    </View>
                  </Pressable>
                </TourTarget>
              )
            })}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  )
}

export default HomeScreen
