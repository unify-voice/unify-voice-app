import React from 'react'
import { Pressable, View } from 'react-native'
import { Text } from 'tamagui'

import ResultActions from '../../../components/ResultActions'
import {
  confidenceBand,
  displaySignPhrase,
  type ConfidenceBand,
} from '../../../constants/signToTextVocab'
import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import type { AppLanguage } from '../../../i18n/translations'
import type { SignPrediction } from '../../../services/signApi'
import { useThemedStyles } from '../../../theme'

import { createStyles } from '../styles.module'

type Props = {
  predictions: SignPrediction[]
  selectedIndex: number
  conversionLang: AppLanguage
  onSelect: (index: number) => void
}

const bandHintKey = (band: ConfidenceBand) => {
  if (band === 'high') return 's2t.confident'
  if (band === 'medium') return 's2t.likely'
  return 's2t.unsure'
}

/** Shows the top prediction, confidence band, and alternate “did you mean” chips. */
const PredictionResult = ({ predictions, selectedIndex, conversionLang, onSelect }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t } = useLanguage()

  const selected = predictions[selectedIndex] ?? predictions[0]
  if (!selected) return null

  const band = confidenceBand(selected.confidence)
  const label = displaySignPhrase(selected.word, conversionLang)
  const pct = Math.round(selected.confidence * 100)
  const showAlts = band !== 'high' && predictions.length > 1
  const alts = predictions.map((p, i) => ({ p, i })).filter(({ i }) => i !== selectedIndex)

  return (
    <View style={styles.outputCard}>
      <View style={styles.resultHead}>
        <Text style={[styles.outputLabel, { marginBottom: 0 }]}>{t(bandHintKey(band))}</Text>
        <ResultActions text={label} />
      </View>

      <Text style={styles.outputText} selectable maxFontSizeMultiplier={1.4}>
        {label}
      </Text>

      <View style={styles.confTrack} accessibilityRole='progressbar' accessibilityValue={{ min: 0, max: 100, now: pct }}>
        <View style={[styles.confFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={styles.confCaption}>{t('s2t.confidence').replace('{pct}', String(pct))}</Text>

      {showAlts && alts.length > 0 ? (
        <View style={styles.altBlock}>
          <Text style={styles.altLabel}>{t('s2t.didYouMean')}</Text>
          <View style={styles.altRow}>
            {alts.map(({ p, i }) => (
              <Pressable
                key={`${p.word}-${i}`}
                onPress={() => onSelect(i)}
                style={styles.altChip}
                accessibilityRole='button'
                accessibilityLabel={displaySignPhrase(p.word, conversionLang)}
              >
                <Text style={styles.altChipText} maxFontSizeMultiplier={1.25}>
                  {displaySignPhrase(p.word, conversionLang)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}

export default PredictionResult
