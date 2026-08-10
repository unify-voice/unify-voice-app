import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ChevronRight } from '@tamagui/lucide-icons-2'
import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Text } from 'tamagui'

import Atmosphere from '../../components/Atmosphere'
import Screen from '../../components/layouts/Screen'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { useThemedStyles } from '../../theme'
import type { RootStackParamList } from '../../types/navigation'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'HelpScreen'>

const FAQ_KEYS = [
  ['help.q1', 'help.a1'],
  ['help.q2', 'help.a2'],
  ['help.q3', 'help.a3'],
  ['help.q4', 'help.a4'],
  ['help.q5', 'help.a5'],
  ['help.q6', 'help.a6'],
  ['help.q7', 'help.a7'],
  ['help.q8', 'help.a8'],
] as const

const HelpScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Screen padded={false}>
      <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
        <Atmosphere />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backHit} accessibilityRole='button' hitSlop={8}>
            <Text style={[styles.backText, { color: colors.primary }]}>{t('common.back')}</Text>
          </Pressable>
          <Text style={styles.title} maxFontSizeMultiplier={1.35}>
            {t('help.title')}
          </Text>
          <Text style={styles.sub} maxFontSizeMultiplier={1.3}>
            {t('help.sub')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {FAQ_KEYS.map(([q, a], i) => {
            const expanded = open === i
            return (
              <View key={q} style={styles.card}>
                <Pressable
                  onPress={() => setOpen(expanded ? null : i)}
                  style={styles.qRow}
                  accessibilityRole='button'
                  accessibilityState={{ expanded }}
                >
                  <Text style={styles.qText} maxFontSizeMultiplier={1.3}>
                    {t(q)}
                  </Text>
                  <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}>
                    <ChevronRight size={18} color={colors.textDisabled} />
                  </View>
                </Pressable>
                {expanded ? (
                  <Text style={styles.aText} maxFontSizeMultiplier={1.3}>
                    {t(a)}
                  </Text>
                ) : null}
              </View>
            )
          })}
        </ScrollView>
      </View>
    </Screen>
  )
}

export default HelpScreen
