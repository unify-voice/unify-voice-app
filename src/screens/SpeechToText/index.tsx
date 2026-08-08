import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CircleStop, Mic } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Pressable, ScrollView, View } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import Atmosphere from '../../components/Atmosphere'
import ClayControl from '../../components/ClayControl'
import GlassButton from '../../components/GlassButton'
import ResultActions from '../../components/ResultActions'
import Screen from '../../components/layouts/Screen'
import { useLanguage } from '../../context/Language'
import { usePreferences } from '../../context/Preferences'
import { useAppTheme } from '../../context/Theme'
import { useBusyLeaveGuard } from '../../hooks/useBusyLeaveGuard'
import { useKeepAwake } from '../../hooks/useKeepAwake'
import { cueError, cueListenStart, cueListenStop, cueSuccess } from '../../services/feedback'
import { addHistoryItem } from '../../services/history'
import { ensureMicrophonePermission, openAppSettings } from '../../services/mic'
import { discardAppRecorder, startAppRecorder, stopAppRecorder } from '../../services/recorder'
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
  const waveAnims = useRef([0.28, 0.5, 0.38, 0.82, 0.46, 0.7, 0.34, 0.62, 0.42].map((v) => new Animated.Value(v))).current
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      void discardAppRecorder()
    }
  }, [])

  const busy = phase === 'listening' || phase === 'processing'
  useKeepAwake(phase === 'listening' || phase === 'processing')
  useBusyLeaveGuard(navigation, busy, {
    title: t('session.leaveTitle'),
    message: phase === 'listening' ? t('session.leaveListening') : t('session.leaveProcessing'),
    stayLabel: t('session.stay'),
    leaveLabel: t('session.leave'),
    onDiscard: discardAppRecorder,
  })

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
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
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
      if (!mountedRef.current) return
      const displayText = displaySpeechText(result)
      if (!displayText) {
        setPhase('empty')
        setErrorMessage(t('stt.noText'))
        cueError()
        return
      }
      setTranscript((prev) => [...prev, displayText])
      setPhase('success')
      cueSuccess()
      await addHistoryItem({
        type: 'speech-to-text',
        text: displayText,
        status: 'success',
        conversionLang,
      })
    } catch (err) {
      if (!mountedRef.current) return
      setErrorMessage(err instanceof SpeechApiError ? err.message : t('stt.network'))
      setPhase('error')
      cueError()
    }
  }

  const startRecording = async () => {
    const permission = await ensureMicrophonePermission()
    if (permission !== 'granted') {
      setPhase('denied')
      setErrorMessage(t('stt.permission'))
      cueError()
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
      cueListenStart()
    } catch {
      setPhase('error')
      setErrorMessage(t('stt.network'))
      cueError()
    }
  }

  const stopRecording = async () => {
    try {
      const resultPath = await stopAppRecorder()
      const path = resultPath || lastAudioPath
      setLastAudioPath(path)
      cueListenStop()
      await processAudio(path)
    } catch {
      setPhase('error')
      setErrorMessage(t('stt.network'))
      cueError()
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
        <Atmosphere />

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <YStack px='$5' pt='$3' pb='$2'>
            <Text style={styles.screenTitle} maxFontSizeMultiplier={1.4}>
              {t('stt.title')}
            </Text>
            <Text style={styles.screenSub} maxFontSizeMultiplier={1.35}>
              {t('stt.sub')}
            </Text>
          </YStack>

          <View style={styles.stage}>
            <View style={styles.waveRow}>
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
            </View>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <ClayControl
                size={88}
                active={phase === 'listening'}
                disabled={phase === 'processing'}
                onPress={() => void toggleListening()}
                accessibilityLabel={statusLabel}
              >
                {phase === 'listening' ? (
                  <CircleStop size={30} color={colors.textOnPrimary} />
                ) : (
                  <Mic size={30} color={colors.primary} />
                )}
              </ClayControl>
            </Animated.View>

            <Text style={[styles.micLabel, (phase === 'listening' || phase === 'processing') && { color: colors.primary }]}>{statusLabel}</Text>
          </View>

          {phase === 'error' || phase === 'denied' || phase === 'empty' ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorTitle}>{phase === 'empty' ? t('stt.noText') : t('common.retry')}</Text>
              <Text style={styles.errorBody}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.transcriptSection}>
            <XStack ai='center' jc='space-between' mb='$3'>
              <Text style={styles.transcriptLabel}>{t('stt.transcript')}</Text>
              <XStack ai='center' gap='$2'>
                <ResultActions text={transcript.join('\n')} />
                {transcript.length > 0 ? (
                  <Pressable onPress={() => setTranscript([])} accessibilityRole='button' hitSlop={8} style={{ minHeight: 36, justifyContent: 'center' }}>
                    <Text style={styles.clearBtn}>{t('common.clear')}</Text>
                  </Pressable>
                ) : null}
              </XStack>
            </XStack>

            <ScrollView style={styles.transcriptScroll} contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              {transcript.length === 0 ? (
                <Text style={styles.transcriptEmpty}>{t('stt.empty')}</Text>
              ) : (
                transcript.map((line, i) => (
                  <Text key={`${line}-${i}`} style={styles.transcriptText} selectable maxFontSizeMultiplier={1.4}>
                    {line}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            {phase === 'error' || phase === 'empty' ? (
              <Pressable onPress={() => void retry()} style={styles.textAction}>
                <Text style={styles.textActionLabel}>{t('common.retry')}</Text>
              </Pressable>
            ) : null}
            {phase === 'success' ? (
              <Pressable onPress={() => void startRecording()} style={styles.textAction}>
                <Text style={styles.textActionLabel}>{t('stt.another')}</Text>
              </Pressable>
            ) : null}
            <GlassButton label={t('stt.returnHome')} onPress={() => navigation.goBack()} />
          </View>
        </Animated.View>
      </View>
    </Screen>
  )
}

export default SpeechToTextScreen
