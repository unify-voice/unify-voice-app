import auth from '@react-native-firebase/auth'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, ScrollView, View } from 'react-native'
import { Text, YStack } from 'tamagui'

import Atmosphere from '../../components/Atmosphere'
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
  const { displayName, refreshUser, user } = useAuthUser()
  const { startTour, active, stepId } = useTour()
  const [weekCount, setWeekCount] = useState(0)
  const [weekDays, setWeekDays] = useState<WeekDayStat[]>(() => weekDayStats([]))

  const fadeAnim = useRef(new Animated.Value(0)).current
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
    }, [refreshUser, startTour, user?.uid]),
  )

  useEffect(() => {
    if (!active) return
    if (stepId === 'welcome') scrollRef.current?.scrollTo({ y: 0, animated: true })
    if (stepId === 'signToText' || stepId === 'speechToSign' || stepId === 'speechToText') {
      scrollRef.current?.scrollToEnd({ animated: true })
    }
  }, [active, stepId])

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [fadeAnim])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return t('home.greeting.morning')
    if (h < 18) return t('home.greeting.afternoon')
    return t('home.greeting.evening')
  }

  return (
    <View style={styles.root}>
      <Atmosphere />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
          <TourTarget id='welcome'>
            <View style={styles.hero}>
              <Text style={styles.greetingLabel} maxFontSizeMultiplier={1.3}>
                {getGreeting()}
              </Text>
              <Text style={styles.welcomeName} maxFontSizeMultiplier={1.35}>
                {displayName}
              </Text>
              <Text style={styles.welcomeSub} maxFontSizeMultiplier={1.35}>
                {t('home.welcomeSub')}
              </Text>
            </View>
          </TourTarget>

          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <WeekChart days={weekDays} total={weekCount} onPress={() => navigation.navigate('ActivityScreen')} />

            <Text style={styles.hintLine}>{t('home.signsHint')}</Text>

            <Text style={styles.sectionLabel}>{t('home.features')}</Text>

            {FEATURES.map((f, index) => {
              const Icon = f.Icon
              const tourId = FEATURE_TOUR_ID[f.key as keyof typeof FEATURE_TOUR_ID]
              return (
                <TourTarget key={f.key} id={tourId}>
                  <Pressable
                    onPress={() => navigation.navigate(f.route)}
                    style={({ pressed }) => [styles.featureRow, pressed && { opacity: 0.7 }]}
                    accessibilityRole='button'
                    accessibilityLabel={t(f.titleKey)}
                  >
                    <View style={styles.featureOrb}>
                      <Icon size={26} color={colors.primary} />
                    </View>
                    <YStack flex={1}>
                      <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
                      <Text style={styles.featureSub}>{t(f.subtitleKey)}</Text>
                    </YStack>
                  </Pressable>
                  {index < FEATURES.length - 1 ? <View style={styles.featureRule} /> : null}
                </TourTarget>
              )
            })}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  )
}

export default HomeScreen
