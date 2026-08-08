import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, Pressable, View } from 'react-native'
import { Text, XStack } from 'tamagui'

import { useLanguage } from '../../../context/Language'
import { weekDayLabelKey, type WeekDayStat } from '../../../services/history'
import { useThemedStyles } from '../../../theme'

import { createStyles } from '../styles.module'

const CHART_H = 88
const STUB_H = 6

type Props = {
  days: WeekDayStat[]
  total: number
  onPress?: () => void
}

const WeekChart = ({ days, total, onPress }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { t } = useLanguage()
  const grow = useRef(new Animated.Value(0)).current
  const signature = days.map((d) => d.count).join('-')

  useEffect(() => {
    grow.setValue(0)
    Animated.spring(grow, { toValue: 1, friction: 7, tension: 60, useNativeDriver: false }).start()
  }, [grow, signature])

  const max = useMemo(() => Math.max(1, ...days.map((d) => d.count)), [days])

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.statsCard, pressed && onPress ? styles.statsCardPressed : null]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        total > 0 ? t('home.weekCount').replace('{count}', String(total)) : t('home.weekEmpty')
      }
    >
      <XStack ai='flex-end' jc='space-between' mb={14}>
        <View>
          <Text style={styles.statsLabel}>{t('home.weekTitle')}</Text>
          <Text style={styles.statsHint}>{t('home.weekHint')}</Text>
        </View>
        <View style={styles.statsTotalWrap}>
          <Text style={styles.statsTotal} maxFontSizeMultiplier={1.2}>
            {total}
          </Text>
          <Text style={styles.statsUnit}>{t('home.weekUnit')}</Text>
        </View>
      </XStack>

      <View style={styles.chartTrack}>
        {days.map((day) => {
          const target = day.count <= 0 ? STUB_H : STUB_H + ((CHART_H - STUB_H) * day.count) / max
          const height = grow.interpolate({
            inputRange: [0, 1],
            outputRange: [STUB_H, target],
          })
          return (
            <View key={day.startMs} style={styles.barSlot}>
              <Text style={[styles.barValue, !day.count && styles.barValueHidden]}>{day.count || ' '}</Text>
              <View style={styles.barWell}>
                <Animated.View
                  style={[
                    styles.barCol,
                    day.isToday && styles.barColActive,
                    day.count > 0 && !day.isToday && styles.barColFilled,
                    { height },
                  ]}
                />
              </View>
              <Text
                style={[styles.barDayLabel, day.isToday && styles.barDayLabelToday]}
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1.2}
              >
                {t(weekDayLabelKey(day.index))}
              </Text>
            </View>
          )
        })}
      </View>
    </Pressable>
  )
}

export default WeekChart
