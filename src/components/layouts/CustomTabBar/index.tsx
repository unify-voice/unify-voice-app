import React from 'react'
import { Pressable, View, Text } from 'react-native'

import { colors } from '../../../theme'

import { styles } from './styles.module'

const CustomTabBar = ({ navigation }: { navigation: any }) => {
  const currentRoute = navigation.getState().routes[navigation.getState().index].name

  const tabs = [
    { name: 'HomeScreen', icon: '⌂', label: 'Home' },
    { name: 'ProfileScreen', icon: '◎', label: 'Profile' },
  ]

  return (
    <View style={[styles.bottomNav]}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.name

        return (
          <Pressable key={tab.name} onPress={() => navigation.navigate(tab.name)} style={styles.navItem}>
            <Text style={[styles.navIcon, !isActive && { opacity: 0.35 }]}>{tab.icon}</Text>

            <Text style={[styles.navLabel, isActive && { color: colors.primary, opacity: 1 }]}>{tab.label}</Text>

            <View style={styles.dotContainer}>{isActive && <View style={styles.navDot} />}</View>
          </Pressable>
        )
      })}
    </View>
  )
}

export default CustomTabBar
