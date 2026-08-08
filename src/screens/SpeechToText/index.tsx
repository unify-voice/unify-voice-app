import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CircleStop, Mic } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Pressable, ScrollView, View } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import Screen from '../../components/layouts/Screen'
import { useLanguage } from '../../context/Language'
import { usePreferences } from '../../context/Preferences'
import { useAppTheme } from '../../context/Theme'
import { addHistoryItem } from '../../services/history'
import { ensureMicrophonePermission, openAppSettings } from '../../services/mic'
import { startAppRecorder, stopAppRecorder } from '../../services/recorder'
import { displaySpeechText, SpeechApiError, transcribeSpeechToText } from '../../services/speechApi'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToTextScreen'>
type Phase = 'idle' | 'listening' | 'processing' | 'success' | 'empty' | 'error' | 'denied'

const SpeechToTextScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { conversionLang } = usePreferences()

  const [phase, setPhase] = useState<Phase>('idle')
  const [transcript, setTranscript] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [lastAudioPath, setLastAudioPath] = useState('')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const waveAnims = useRef([0.3, 0.6, 0.4, 0.8, 0.5].map((v) => new Animated.Value(v))).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [fadeAnim])

  useEffect(() => {
    if (phase !== 'listening') {
      pulseAnim.setValue(1)
      waveAnims.forEach((a) => a.setValue(0.3))
      return undefined
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    )
    pulse.start()

    const waves = waveAnims.map((anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 480, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 480, useNativeDriver: true }),
        ]),
      ),
    )
    waves.forEach((w) => w.start())

    return () => {
      pulse.stop()
      waves.forEach((w) => w.stop())
    }
  }, [phase, pulseAnim, waveAnims])

  const processAudio = async (path: string) => {
    setPhase('processing')
    try {
      const result = await transcribeSpeechToText(path, conversionLang)
      const displayText = displaySpeechText(result)
      if (!displayText) {
        setPhase('empty')
        setErrorMessage(t('stt.noText'))
        return
      }
      setTranscript((prev) => [...prev, displayText])
      setPhase('success')
      await addHistoryItem({
        type: 'speech-to-text',
        text: displayText,
        status: 'success',
        conversionLang,
      })
    } catch (err) {
      setErrorMessage(err instanceof SpeechApiError ? err.message : t('stt.network'))
      setPhase('error')
    }
  }

  const startRecording = async () => {
    const permission = await ensureMicrophonePermission()
    if (permission !== 'granted') {
      setPhase('denied')
      setErrorMessage(t('stt.permission'))
      if (permission === 'blocked') {
        Alert.alert(t('stt.permission'), '', [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('stt.openSettings'), onPress: () => void openAppSettings() },
        ])
      }
      return
    }

    setErrorMessage('')
    try {
      const uri = await startAppRecorder()
      setLastAudioPath(uri)
      setPhase('listening')
    } catch {
      setPhase('error')
      setErrorMessage(t('stt.network'))
    }
  }

  const stopRecording = async () => {
    try {
      const resultPath = await stopAppRecorder()
      const path = resultPath || lastAudioPath
      setLastAudioPath(path)
      await processAudio(path)
    } catch {
      setPhase('error')
      setErrorMessage(t('stt.network'))
    }
  }

  const toggleListening = async () => {
    if (phase === 'listening') await stopRecording()
    else if (phase !== 'processing') await startRecording()
  }

  const retry = async () => {
    if (lastAudioPath) await processAudio(lastAudioPath)
    else await startRecording()
  }

  const statusLabel =
    phase === 'processing'
      ? t('stt.processing')
      : phase === 'listening'
        ? t('stt.listening')
        : phase === 'denied'
          ? t('stt.permission')
          : t('stt.tapToSpeak')

  return (
    <Screen padded={false}>
      <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
        <View style={styles.ambientGlow} />

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <YStack px='$5' pt='$3' pb='$2'>
            <Text style={styles.screenTitle}>{t('stt.title')}</Text>
            <Text style={styles.screenSub}>{t('stt.sub')}</Text>
          </YStack>

          <View style={styles.micCard}>
            <XStack ai='center' jc='center' gap='$1' style={{ height: 48, marginBottom: 20 }}>
              {waveAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      transform: [{ scaleY: anim }],
                      backgroundColor: phase === 'listening' ? colors.primary : colors.divider,
                    },
                  ]}
                />
              ))}
            </XStack>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                onPress={() => void toggleListening()}
                disabled={phase === 'processing'}
                accessibilityRole='button'
                accessibilityLabel={statusLabel}
                style={[styles.micBtn, phase === 'listening' && styles.micBtnActive, phase === 'processing' && { opacity: 0.4 }]}
              >
                {phase === 'listening' ? <View style={styles.micBtnRing} /> : null}
                {phase === 'listening' ? <CircleStop size={28} color={colors.primary} /> : <Mic size={28} color={colors.primary} />}
              </Pressable>
            </Animated.View>

            <Text style={[styles.micLabel, (phase === 'listening' || phase === 'processing') && { color: colors.primary }]}>{statusLabel}</Text>
          </View>

          {phase === 'error' || phase === 'denied' || phase === 'empty' ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>{phase === 'empty' ? t('stt.noText') : t('common.retry')}</Text>
              <Text style={styles.errorBody}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.transcriptSection}>
            <XStack ai='center' jc='space-between' mb='$2'>
              <Text style={styles.transcriptLabel}>{t('stt.transcript')}</Text>
              {transcript.length > 0 ? (
                <Pressable onPress={() => setTranscript([])} accessibilityRole='button'>
                  <Text style={styles.clearBtn}>{t('common.clear')}</Text>
                </Pressable>
              ) : null}
            </XStack>

            <ScrollView style={styles.transcriptScroll} contentContainerStyle={{ padding: 14, flexGrow: 1 }}>
              {transcript.length === 0 ? (
                <Text style={styles.transcriptEmpty}>{t('stt.empty')}</Text>
              ) : (
                transcript.map((line, i) => (
                  <View key={`${line}-${i}`} style={styles.transcriptLine}>
                    <View style={styles.transcriptDot} />
                    <Text style={styles.transcriptText}>{line}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12 }}>
            {phase === 'error' || phase === 'empty' ? (
              <Pressable onPress={() => void retry()} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>{t('common.retry')}</Text>
              </Pressable>
            ) : null}
            {phase === 'success' ? (
              <Pressable onPress={() => void startRecording()} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>{t('stt.another')}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => navigation.goBack()} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('stt.returnHome')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Screen>
  )
}

export default SpeechToTextScreen
