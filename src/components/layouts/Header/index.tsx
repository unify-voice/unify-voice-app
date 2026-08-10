import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

import { useAuthUser } from '../../../context/AuthUser'
import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import { useThemedStyles } from '../../../theme'
import { directionStyle } from '../../../utils/rtl'

import { createStyles } from './styles.module'

type HeaderProps = {
  onProfilePress?: () => void
}

/** Home brand row with avatar / initials shortcut into Profile. */
const Header = ({ onProfilePress }: HeaderProps) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { displayName, photoURL } = useAuthUser()
  const { isRTL } = useLanguage()

  const initials =
    displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: 'transparent',
        ...directionStyle(isRTL),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.brandUnify}>Unify</Text>
        <Text style={styles.brandVoice}>Voice</Text>
      </View>
      <Pressable
        onPress={onProfilePress}
        style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.7 }, photoURL ? { overflow: 'hidden', padding: 0 } : null]}
        accessibilityRole='button'
        accessibilityLabel='Go to profile'
      >
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={{ width: 38, height: 38, borderRadius: 19 }} />
        ) : (
          <Text style={styles.profileInitials}>{initials}</Text>
        )}
      </Pressable>
    </View>
  )
}

export default Header
