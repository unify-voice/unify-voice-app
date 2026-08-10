import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { Text } from 'tamagui'

import Atmosphere from '../../components/Atmosphere'
import ResultActions from '../../components/ResultActions'
import { useAuthUser } from '../../context/AuthUser'
import { useLanguage } from '../../context/Language'
import { useThemedStyles } from '../../theme'
import { clearHistory, historyTypeKey, loadHistory, type HistoryItem } from '../../services/history'
import type { RootStackParamList } from '../../types/navigation'
import type { TabParamList } from '../../types/tabs'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from './styles.module'

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'ActivityScreen'>, NativeStackScreenProps<RootStackParamList>>

const formatWhen = (ts: number) => {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ''
  }
}

/** Device-local conversion history for the signed-in user. */
const ActivityScreen = (_props: Props) => {
  const styles = useThemedStyles(createStyles)
  const { t, isRTL } = useLanguage()
  const { user } = useAuthUser()
  const [items, setItems] = useState<HistoryItem[]>([])

  const refresh = useCallback(async () => {
    setItems(await loadHistory())
  }, [user?.uid])

  useFocusEffect(
    useCallback(() => {
      void refresh()
    }, [refresh]),
  )

  const onClear = () => {
    Alert.alert(t('activity.clear'), t('activity.clearConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('activity.clear'),
        style: 'destructive',
        onPress: async () => {
          await clearHistory()
          await refresh()
        },
      },
    ])
  }

  return (
    <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
      <Atmosphere />
      <View style={styles.header}>
        <Text style={styles.title} maxFontSizeMultiplier={1.4}>
          {t('activity.title')}
        </Text>
        <Text style={styles.sub} maxFontSizeMultiplier={1.35}>
          {t('activity.sub')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {items.length > 0 ? (
          <Pressable onPress={onClear} style={styles.clearBtn} accessibilityRole='button'>
            <Text style={styles.clearText}>{t('activity.clear')}</Text>
          </Pressable>
        ) : null}

        {items.length === 0 ? (
          <Text style={styles.emptyText}>{t('activity.empty')}</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.rowType}>
                  {t(historyTypeKey(item.type))}
                  {item.status === 'unsupported' ? ` · ${t('activity.unsupported')}` : ''}
                </Text>
                <ResultActions text={item.text} videoUrl={item.videoUrl} />
              </View>
              <Text style={styles.rowText} selectable maxFontSizeMultiplier={1.4}>
                {item.text || '—'}
              </Text>
              <Text style={styles.rowMeta}>{formatWhen(item.createdAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default ActivityScreen
