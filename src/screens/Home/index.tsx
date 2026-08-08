import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ChevronRight } from '@tamagui/lucide-icons-2'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, ScrollView } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { useAuthUser } from '../../context/AuthUser'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { historyTypeKey, loadHistory, type HistoryItem } from '../../services/history'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { TabParamList } from '../../types/tabs'
import { directionStyle } from '../../utils/rtl'

import { FEATURES } from './const'
import { createStyles } from './styles.module'

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'HomeScreen'>, NativeStackScreenProps<RootStackParamList>>

const HomeScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { displayName, refreshUser } = useAuthUser()
  const [recents, setRecents] = useState<HistoryItem[]>([])

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useFocusEffect(
    useCallback(() => {
      refreshUser()
      void loadHistory().then((items) => setRecents(items.slice(0, 3)))
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

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>{t('home.signsHint')}</Text>
            </View>

            <XStack jc='space-between' ai='center' mb='$2'>
              <Text style={styles.sectionLabel}>{t('home.recents')}</Text>
              <Pressable onPress={() => navigation.navigate('ActivityScreen')} hitSlop={8}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{t('home.viewAll')}</Text>
              </Pressable>
            </XStack>

            {recents.length === 0 ? (
              <Text style={styles.emptyRecents}>{t('home.recentsEmpty')}</Text>
            ) : (
              recents.map((item) => (
                <View key={item.id} style={styles.recentRow}>
                  <Text style={styles.recentType}>{t(historyTypeKey(item.type))}</Text>
                  <Text style={styles.recentText} numberOfLines={2}>
                    {item.text}
                  </Text>
                </View>
              ))
            )}

            <Text style={styles.sectionLabel}>{t('home.features')}</Text>

            {FEATURES.map((f) => {
              const Icon = f.Icon
              return (
                <Pressable
                  key={f.key}
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
              )
            })}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  )
}

export default HomeScreen
