import React from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

import { useLanguage } from '../context/Language'
import { useNetwork } from '../context/Network'
import { useAppTheme } from '../context/Theme'

const OfflineBanner = () => {
  const { isOffline, retryConnection } = useNetwork()
  const { t } = useLanguage()
  const { colors } = useAppTheme()
  const insets = useSafeAreaInsets()

  if (!isOffline) return null

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.errorMuted,
      }}
    >
      <View
        style={{
          backgroundColor: colors.errorMuted,
          borderBottomWidth: 1,
          borderBottomColor: colors.errorBorder,
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
        accessibilityRole='alert'
        accessibilityLiveRegion='polite'
      >
        <Text style={{ color: colors.errorText, fontSize: 13, fontWeight: '600', flex: 1 }} maxFontSizeMultiplier={1.35}>
          {t('network.offline')}
        </Text>
        <Pressable
          onPress={() => void retryConnection()}
          hitSlop={8}
          style={{ minHeight: 44, minWidth: 64, justifyContent: 'center' }}
          accessibilityRole='button'
          accessibilityLabel={t('common.retry')}
        >
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default OfflineBanner
