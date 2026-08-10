import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Text } from 'tamagui'

import Atmosphere from '../../components/Atmosphere'
import Screen from '../../components/layouts/Screen'
import { useLanguage } from '../../context/Language'
import { useAppTheme } from '../../context/Theme'
import { useThemedStyles } from '../../theme'
import type { RootStackParamList } from '../../types/navigation'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from '../Help/styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyScreen'>

const SECTIONS = [
  ['privacy.localTitle', 'privacy.localBody'],
  ['privacy.firebaseTitle', 'privacy.firebaseBody'],
  ['privacy.apiTitle', 'privacy.apiBody'],
  ['privacy.notTitle', 'privacy.notBody'],
] as const

const PrivacyScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()

  return (
    <Screen padded={false}>
      <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
        <Atmosphere />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backHit} accessibilityRole='button' hitSlop={8}>
            <Text style={[styles.backText, { color: colors.primary }]}>{t('common.back')}</Text>
          </Pressable>
          <Text style={styles.title} maxFontSizeMultiplier={1.35}>
            {t('privacy.title')}
          </Text>
          <Text style={styles.sub} maxFontSizeMultiplier={1.3}>
            {t('privacy.sub')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {SECTIONS.map(([titleKey, bodyKey]) => (
            <View key={titleKey} style={styles.card}>
              <Text style={styles.sectionTitle}>{t(titleKey)}</Text>
              <Text style={styles.aText} maxFontSizeMultiplier={1.3}>
                {t(bodyKey)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  )
}

export default PrivacyScreen
