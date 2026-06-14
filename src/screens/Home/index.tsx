import { getAuth } from '@react-native-firebase/auth'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, ScrollView } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { colors } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { TabParamList } from '../../types/tabs'

import { FEATURES, WEEKLY_DATA } from './const'
import { styles } from './styles.module'

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'HomeScreen'>, NativeStackScreenProps<RootStackParamList>>

const HomeScreen = ({ navigation }: Props) => {
  const authInstance = getAuth()
  const user = authInstance.currentUser
  const displayName = user?.displayName || 'User'

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <>
      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <YStack px='$5' mt='$3'>
          <Text style={styles.greetingLabel}>{getGreeting()}</Text>
          <Text style={styles.welcomeName}>{displayName}</Text>
          <Text style={styles.welcomeSub}>Bridging communication gaps with modern AI.</Text>
        </YStack>

        <XStack px='$5' mt='$4' gap='$2'>
          {[
            { label: 'Sessions', value: '124', unit: 'total', trend: '↑ 12 this week', trendColor: colors.primary },
            { label: 'Words', value: '3.2k', unit: 'conv.', trend: '↑ 8% vs last', trendColor: colors.primary },
            { label: 'Accuracy', value: '97', unit: '%', trend: 'Stable', trendColor: 'rgba(255,255,255,0.3)' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <XStack ai='baseline' gap='$1'>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statUnit}>{s.unit}</Text>
              </XStack>
              <Text style={[styles.statTrend, { color: s.trendColor }]}>{s.trend}</Text>
            </View>
          ))}
        </XStack>

        <YStack px='$5' mt='$4'>
          <XStack jc='space-between' ai='center' mb='$2'>
            <Text style={styles.usageLabel}>Daily usage limit</Text>
            <Text style={styles.usagePct}>68%</Text>
          </XStack>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: '68%' }]} />
          </View>
        </YStack>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionCard}>
            <XStack jc='space-between' ai='center' mb='$3'>
              <Text style={styles.sectionCardTitle}>Weekly activity</Text>
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

          <Text style={styles.sectionLabel}>Communication modes</Text>

          {FEATURES.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => navigation.navigate(f.route as any)}
              style={({ pressed }) => [styles.featureCard, pressed && styles.featureCardPressed]}
            >
              <View style={styles.featureIcon}>
                <Text style={{ fontSize: 20 }}>{f.icon}</Text>
              </View>
              <YStack flex={1}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.subtitle}</Text>
              </YStack>
              <Text style={styles.featureArrow}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  )
}

export default HomeScreen
