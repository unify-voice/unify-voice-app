import { Check, Copy, Share2 } from '@tamagui/lucide-icons-2'
import React, { useState } from 'react'
import { Pressable, View } from 'react-native'

import { useLanguage } from '../context/Language'
import { useAppTheme } from '../context/Theme'
import { cueSuccess } from '../services/feedback'
import { copyText, shareResult } from '../services/shareText'

type Props = {
  text: string
  videoUrl?: string | null
}

const ResultActions = ({ text, videoUrl }: Props) => {
  const { t } = useLanguage()
  const { colors } = useAppTheme()
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  if (!text.trim() && !videoUrl) return null

  const iconBtn = {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.clay,
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {text.trim() ? (
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
      ) : null}
      <Pressable
        onPress={async () => {
          if (sharing) return
          setSharing(true)
          try {
            await shareResult({ text, videoUrl, title: 'Unify Voice' })
          } finally {
            setSharing(false)
          }
        }}
        disabled={sharing}
        accessibilityRole='button'
        accessibilityLabel={t('common.share')}
        hitSlop={8}
        style={[iconBtn, sharing && { opacity: 0.5 }]}
      >
        <Share2 size={16} color={colors.primary} />
      </Pressable>
    </View>
  )
}

export default ResultActions
