import { Clock3, Home, User } from '@tamagui/lucide-icons-2'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import { useThemedStyles } from '../../../theme'

import { createStyles } from './styles.module'

const CustomTabBar = ({ navigation }: { navigation: any }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t } = useLanguage()
  const currentRoute = navigation.getState().routes[navigation.getState().index].name

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

        return (
          <Pressable
            key={tab.name}
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
      })}
    </View>
  )
}

export default CustomTabBar
