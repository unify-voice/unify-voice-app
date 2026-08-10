import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import { weekDayLabelKey, type WeekDayStat } from '../../../services/history'
import { useThemedStyles } from '../../../theme'

import { createStyles } from '../styles.module'

type Props = {
  days: WeekDayStat[]
  total: number
  onPress?: () => void
}

/** Home week activity bars; tap navigates to Activity when `onPress` is provided. */
const WeekChart = ({ days, total, onPress }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t } = useLanguage()
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.count)), [days])

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={total > 0 ? t('home.weekCount').replace('{count}', String(total)) : t('home.weekEmpty')}
      style={({ pressed }) => [styles.weekBlock, pressed && { opacity: 0.78 }]}
    >
      <View style={styles.weekHead}>
        <Text style={styles.weekKicker}>{t('home.weekTitle')}</Text>
        <Text style={styles.weekTotal}>
          {total}
          <Text style={styles.weekUnit}>  {t('home.weekUnit')}</Text>
        </Text>
        <Text style={styles.weekHint}>{t('home.weekHint')}</Text>
      </View>
      <View style={styles.sparkRow}>
        {days.map((day) => {
          const h = day.count ? 18 + (70 * day.count) / max : 10
          return (
            <View key={day.startMs} style={styles.sparkSlot}>
              <View
                style={[
                  styles.spark,
                  {
                    height: h,
                    backgroundColor: day.isToday ? colors.primary : day.count ? colors.primary : colors.divider,
                    opacity: day.isToday ? 1 : day.count ? 0.72 : 1,
                    shadowColor: day.isToday ? colors.primary : 'transparent',
                    shadowOpacity: day.isToday ? 0.55 : 0,
                    shadowRadius: day.isToday ? 10 : 0,
                    shadowOffset: { width: 0, height: 4 },
                  },
                ]}
              />
              <Text style={[styles.sparkDay, day.isToday && { color: colors.primary }]}>
                {t(weekDayLabelKey(day.index)).slice(0, 1)}
              </Text>
            </View>
          )
        })}
      </View>
    </Pressable>
  )
}

export default WeekChart
