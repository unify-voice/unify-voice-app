import { getAuth } from '@react-native-firebase/auth'
import React from 'react'
import { View, Text, Pressable } from 'react-native'

import { styles } from './styles.module'

type HeaderProps = {
  onProfilePress?: () => void
}

const Header = ({ onProfilePress }: HeaderProps) => {
  const authInstance = getAuth()
  const user = authInstance.currentUser
  const displayName = user?.displayName || 'User'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.brandUnify}>Unify</Text>
        <Text style={styles.brandVoice}>Voice</Text>
      </View>
      <Pressable
        onPress={onProfilePress}
        style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.7 }]}
        accessibilityRole='button'
        accessibilityLabel='Go to profile'
      >
        <Text style={styles.profileInitials}>{initials}</Text>
      </Pressable>
    </View>
  )
}

export default Header
