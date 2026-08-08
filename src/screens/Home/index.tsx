import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ArrowUpRight, ChevronRight } from '@tamagui/lucide-icons-2'
import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Pressable, ScrollView } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { useAuthUser } from '../../context/AuthUser'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { useThemedStyles } from '../../theme'
import { directionStyle } from '../../utils/rtl'
import { RootStackParamList } from '../../types/navigation'
import { TabParamList } from '../../types/tabs'

import { FEATURES, WEEKLY_DATA } from './const'
import { createStyles } from './styles.module'

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'HomeScreen'>, NativeStackScreenProps<RootStackParamList>>

const HomeScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { displayName, refreshUser } = useAuthUser()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useFocusEffect(
    useCallback(() => {
      refreshUser()
    }, [refreshUser]),
  )

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
        <YStack px='$5' mt='$3'>
          <Text style={styles.greetingLabel}>{getGreeting()}</Text>
          <Text style={styles.welcomeName}>{displayName}</Text>
          <Text style={styles.welcomeSub}>{t('home.welcomeSub')}</Text>
        </YStack>

        <XStack px='$5' mt='$4' gap='$2'>
          {[
            { label: 'Sessions', value: '124', unit: 'total', trend: '12 this week', trendColor: colors.primary, up: true },
            { label: 'Words', value: '3.2k', unit: 'conv.', trend: '8% vs last', trendColor: colors.primary, up: true },
            { label: 'Accuracy', value: '97', unit: '%', trend: 'Stable', trendColor: colors.textMuted, up: false },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <XStack ai='baseline' gap='$1'>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statUnit}>{s.unit}</Text>
              </XStack>
              <XStack ai='center' gap='$1' mt={2}>
                {s.up ? <ArrowUpRight size={10} color={s.trendColor} /> : null}
                <Text style={[styles.statTrend, { color: s.trendColor }]}>{s.trend}</Text>
              </XStack>
            </View>
          ))}
        </XStack>

        <YStack px='$5' mt='$4'>
          <XStack jc='space-between' ai='center' mb='$2'>
            <Text style={styles.usageLabel}>{t('home.usage')}</Text>
            <Text style={styles.usagePct}>68%</Text>
          </XStack>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: '68%' }]} />
          </View>
        </YStack>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionCard}>
            <XStack jc='space-between' ai='center' mb='$3'>
              <Text style={styles.sectionCardTitle}>{t('home.weekly')}</Text>
              <Text style={styles.sectionCardPeriod}>This week</Text>
            </XStack>
            <XStack ai='flex-end' gap='$2' style={{ height: 68 }}>
              {WEEKLY_DATA.map((bar) => (
                <YStack key={bar.day} flex={1} ai='center' gap='$1' jc='flex-end'>
                  <View style={[styles.barCol, { height: bar.height }, bar.active && styles.barColActive]} />
                  <Text style={styles.barDayLabel}>{bar.day}</Text>
                </YStack>
              ))}
            </XStack>
          </View>

          <Text style={styles.sectionLabel}>{t('home.features')}</Text>

          {FEATURES.map((f) => {
            const Icon = f.Icon
            return (
              <Pressable
                key={f.key}
                onPress={() => navigation.navigate(f.route)}
                style={({ pressed }) => [styles.featureCard, pressed && styles.featureCardPressed]}
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
            )
          })}
        </ScrollView>
        </View>
      </Animated.View>
    </>
  )
}

export default HomeScreen
