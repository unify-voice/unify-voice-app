import { Clock3, Home, User } from '@tamagui/lucide-icons-2'
import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import { TourTarget, useOptionalTour } from '../../../context/Tour'
import { useThemedStyles } from '../../../theme'
import type { TourStepId, TourTab } from '../../../tour/steps'

import { createStyles } from './styles.module'

const TAB_TOUR_ID: Partial<Record<string, TourStepId>> = {
  ActivityScreen: 'activityTab',
}

const CustomTabBar = ({ navigation }: { navigation: any }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t } = useLanguage()
  const tour = useOptionalTour()
  const currentRoute = navigation.getState().routes[navigation.getState().index].name

  useEffect(() => {
    tour?.registerTabNavigation((tab: TourTab) => navigation.navigate(tab))
    return () => tour?.registerTabNavigation(null)
  }, [navigation, tour])

  const tabs = [
    { name: 'HomeScreen', Icon: Home, labelKey: 'tabs.home' },
    { name: 'ActivityScreen', Icon: Clock3, labelKey: 'tabs.activity' },
    { name: 'ProfileScreen', Icon: User, labelKey: 'tabs.profile' },
  ]

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.name
        const Icon = tab.Icon
        const color = isActive ? colors.primary : colors.textSecondary
        const tourId = TAB_TOUR_ID[tab.name]
        const item = (
          <Pressable
            onPress={() => navigation.navigate(tab.name)}
            style={styles.navItem}
            hitSlop={6}
            accessibilityRole='tab'
            accessibilityLabel={t(tab.labelKey)}
            accessibilityState={{ selected: isActive }}
          >
            <Icon size={20} color={color} opacity={isActive ? 1 : 0.45} />
            <Text
              style={[styles.navLabel, isActive && { color: colors.primary, opacity: 1 }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {t(tab.labelKey)}
            </Text>
            <View style={styles.dotContainer}>{isActive ? <View style={styles.navDot} /> : null}</View>
          </Pressable>
        )

        return tourId ? (
          <TourTarget key={tab.name} id={tourId} style={{ flex: 1 }}>
            {item}
          </TourTarget>
        ) : (
          <React.Fragment key={tab.name}>{item}</React.Fragment>
        )
      })}
    </View>
  )
}

export default CustomTabBar
