import { Pressable } from 'react-native'
import { Text, View, YStack } from 'tamagui'

import { styles } from '../styles.module'

interface RowProps {
  icon: string
  title: string
  subtitle: string
  danger?: boolean
  badge?: string
  onPress?: () => void
  noBorder?: boolean
}

const SettingRow: React.FC<RowProps> = ({ icon, title, subtitle, danger, badge, onPress, noBorder }) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress && !badge}
    style={({ pressed }) => [styles.row, !noBorder && styles.rowBorder, pressed && onPress && { backgroundColor: 'rgba(255,255,255,0.03)' }]}
  >
    <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <YStack flex={1}>
      <Text style={[styles.rowTitle, danger && { color: '#f87171' }]}>{title}</Text>
      <Text style={styles.rowSub}>{subtitle}</Text>
    </YStack>
    {badge ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    ) : onPress ? (
      <Text style={[styles.rowArrow, danger && { color: 'rgba(220,38,38,0.5)' }]}>›</Text>
    ) : null}
  </Pressable>
)

export default SettingRow
