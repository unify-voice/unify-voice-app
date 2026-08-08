import { ChevronRight } from '@tamagui/lucide-icons-2'
import React from 'react'
import { Pressable } from 'react-native'
import { Text, View, YStack } from 'tamagui'

import { useLanguage } from '../../../../../context/Language'
import { useAppTheme } from '../../../../../context/Theme'
import { useThemedStyles } from '../../../../../theme'
import { createStyles } from '../styles.module'

interface RowProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  danger?: boolean
  badge?: string
  onPress?: () => void
  noBorder?: boolean
}

const SettingRow: React.FC<RowProps> = ({ icon, title, subtitle, danger, badge, onPress, noBorder }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { isRTL } = useLanguage()

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, !noBorder && styles.rowBorder, pressed && onPress && { backgroundColor: colors.card }]}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>{icon}</View>
      <YStack flex={1}>
        <Text style={[styles.rowTitle, danger && { color: colors.errorText }]}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </YStack>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {onPress ? (
        <View style={[badge ? { marginStart: 4 } : undefined, isRTL && { transform: [{ scaleX: -1 }] }]}>
          <ChevronRight size={18} color={danger ? colors.errorBorder : colors.textDisabled} />
        </View>
      ) : null}
    </Pressable>
  )
}

export default SettingRow
