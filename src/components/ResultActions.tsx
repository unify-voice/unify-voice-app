import { Check, Copy, Share2 } from '@tamagui/lucide-icons-2'
import React, { useState } from 'react'
import { Pressable, View } from 'react-native'

import { useLanguage } from '../context/Language'
import { useAppTheme } from '../context/Theme'
import { cueSuccess } from '../services/feedback'
import { copyText, shareText } from '../services/shareText'

type Props = {
  text: string
}

const ResultActions = ({ text }: Props) => {
  const { t } = useLanguage()
  const { colors } = useAppTheme()
  const [copied, setCopied] = useState(false)

  if (!text.trim()) return null

  const iconBtn = {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable
        onPress={async () => {
          const ok = await copyText(text)
          if (!ok) return
          cueSuccess()
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
        accessibilityRole='button'
        accessibilityLabel={copied ? t('common.copied') : t('common.copy')}
        hitSlop={8}
        style={iconBtn}
      >
        {copied ? <Check size={16} color={colors.primary} /> : <Copy size={16} color={colors.primary} />}
      </Pressable>
      <Pressable
        onPress={() => void shareText(text)}
        accessibilityRole='button'
        accessibilityLabel={t('common.share')}
        hitSlop={8}
        style={iconBtn}
      >
        <Share2 size={16} color={colors.primary} />
      </Pressable>
    </View>
  )
}

export default ResultActions
