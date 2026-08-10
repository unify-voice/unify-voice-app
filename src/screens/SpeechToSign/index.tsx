import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CircleStop, Mic, Pause, Play } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Image, Pressable, ScrollView, View } from 'react-native'
import Video, { type VideoRef } from 'react-native-video'
import { Text, YStack } from 'tamagui'

import defaultAvatar from '../../assets/speech-to-sign-avatar.png'
import Atmosphere from '../../components/Atmosphere'
import ClayControl from '../../components/ClayControl'
import GlassButton from '../../components/GlassButton'
import ResultActions from '../../components/ResultActions'
import Screen from '../../components/layouts/Screen'
import { SUPPORTED_SIGNS } from '../../constants/supportedSigns'
import { useLanguage } from '../../context/Language'
import { usePreferences } from '../../context/Preferences'
import { useAppTheme } from '../../context/Theme'
import { useBusyLeaveGuard } from '../../hooks/useBusyLeaveGuard'
import { useKeepAwake } from '../../hooks/useKeepAwake'
import { translate } from '../../i18n/translations'
import { cueError, cueListenStart, cueListenStop, cueSuccess } from '../../services/feedback'
import { addHistoryItem } from '../../services/history'
import { ensureMicrophonePermission, openAppSettings } from '../../services/mic'
import { discardAppRecorder, startAppRecorder, stopAppRecorder } from '../../services/recorder'
import { displaySpeechText, signVideoUrl, SpeechApiError, transcribeSpeechToSign } from '../../services/speechApi'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from './styles.modules'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToSignScreen'>
type Phase = 'idle' | 'listening' | 'processing' | 'success' | 'unsupported' | 'error' | 'denied'

/** Maps spoken phrases to supported sign videos when the phrase is in vocabulary. */
const SpeechToSignScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { conversionLang } = usePreferences()

  const [phase, setPhase] = useState<Phase>('idle')
  const [spokenText, setSpokenText] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [lastAudioPath, setLastAudioPath] = useState('')
  const [practiceId, setPracticeId] = useState<string | null>(null)

  const videoRef = useRef<VideoRef | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
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
    if (phase === 'listening') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      )
      loop.start()
      return () => loop.stop()
    }
    pulseAnim.setValue(1)
    return undefined
  }, [phase, pulseAnim])

  const resetResult = () => {
    setSpokenText('')
    setVideoUrl(null)
    setVideoReady(false)
    setVideoEnded(false)
    setIsPaused(false)
    setErrorMessage('')
  }

  const processAudio = async (audioPath: string) => {
    setPhase('processing')
    try {
      const data = await transcribeSpeechToSign(audioPath, conversionLang)
      if (!mountedRef.current) return
      const text = displaySpeechText(data, conversionLang)
      setSpokenText(text)

      if (data.found && data.video) {
        const url = signVideoUrl(data.video)
        setVideoUrl(url)
        setIsPaused(false)
        setVideoEnded(false)
        setPhase('success')
        cueSuccess()
        await addHistoryItem({
          type: 'speech-to-sign',
          text: text || translate(conversionLang, 'sts.title'),
          status: 'success',
          videoUrl: url || undefined,
          conversionLang,
        })
        return
      }

      setPhase('unsupported')
      setErrorMessage(translate(conversionLang, 'sts.unsupportedBody'))
      cueError()
      await addHistoryItem({
        type: 'speech-to-sign',
        text: text || translate(conversionLang, 'sts.unsupported'),
        status: 'unsupported',
        conversionLang,
      })
    } catch (err) {
      if (!mountedRef.current) return
      const network = err instanceof SpeechApiError && err.kind === 'network'
      setErrorMessage(translate(conversionLang, network ? 'sts.network' : 'sts.failed'))
      setPhase('error')
      cueError()
    }
  }

  const startRecording = async () => {
    const permission = await ensureMicrophonePermission()
    if (permission !== 'granted') {
      setPhase('denied')
      setErrorMessage(t('sts.permission'))
      cueError()
      if (permission === 'blocked') {
        Alert.alert(t('sts.permission'), '', [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('sts.openSettings'), onPress: () => void openAppSettings() },
        ])
      }
      return
    }

    resetResult()
    try {
      const uri = await startAppRecorder()
      setLastAudioPath(uri)
      setPhase('listening')
      cueListenStart()
    } catch {
      setPhase('error')
      setErrorMessage(t('sts.recordFail'))
      cueError()
    }
  }

  const stopRecordingAndSend = async () => {
    try {
      const audioPath = await stopAppRecorder()
      const path = audioPath || lastAudioPath
      setLastAudioPath(path)
      cueListenStop()
      await processAudio(path)
    } catch {
      setPhase('error')
      setErrorMessage(t('sts.recordFail'))
      cueError()
    }
  }

  const toggleMic = async () => {
    if (phase === 'listening') await stopRecordingAndSend()
    else if (phase !== 'processing') await startRecording()
  }

  const retry = async () => {
    if (lastAudioPath) await processAudio(lastAudioPath)
    else await startRecording()
  }

  const handleVideoEnd = () => {
    setVideoEnded(true)
    setIsPaused(true)
  }

  const handlePlayPause = () => {
    if (videoEnded) {
      videoRef.current?.seek?.(0)
      setVideoEnded(false)
      setIsPaused(false)
    } else {
      setIsPaused((prev) => !prev)
    }
  }

  const statusLabel =
    phase === 'listening'
      ? t('sts.listening')
      : phase === 'processing'
        ? t('sts.processing')
        : phase === 'denied'
          ? t('sts.permission')
          : videoReady
            ? videoEnded
              ? t('sts.replay')
              : isPaused
                ? t('sts.paused')
                : t('sts.playing')
            : t('sts.tapToSpeak')

  const micDisabled = phase === 'processing'
  const showSigns = phase === 'idle' || phase === 'unsupported' || phase === 'denied' || phase === 'error'
  const practiceSign = SUPPORTED_SIGNS.find((s) => s.id === practiceId)
  const phraseLabel = (sign: { en: string; ur: string }) => (conversionLang === 'ur' ? sign.ur : sign.en)

  return (
    <Screen padded={false}>
      <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
        <Atmosphere />

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <YStack px='$5' pt='$3' pb='$2'>
            <Text style={styles.screenTitle} maxFontSizeMultiplier={1.4}>
              {t('sts.title')}
            </Text>
            <Text style={styles.screenSub} maxFontSizeMultiplier={1.35}>
              {t('sts.sub')}
            </Text>
          </YStack>

          <ScrollView contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
            <View style={styles.stage}>
              {videoUrl ? (
                <Video
                  ref={videoRef}
                  source={{ uri: videoUrl }}
                  style={{ flex: 1 }}
                  resizeMode='contain'
                  paused={isPaused}
                  onLoad={() => setVideoReady(true)}
                  onEnd={handleVideoEnd}
                  onError={() => {
                    setErrorMessage(translate(conversionLang, 'sts.videoFail'))
                    setVideoReady(false)
                    setPhase('error')
                  }}
                />
              ) : (
                <Image source={defaultAvatar} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode='contain' />
              )}
              {spokenText ? (
                <View style={styles.caption}>
                  <Text style={styles.captionKicker}>{t('sts.spoken')}</Text>
                  <Text style={styles.captionText} numberOfLines={2} selectable>
                    {spokenText}
                  </Text>
                </View>
              ) : null}
            </View>

            {spokenText ? (
              <View style={styles.spokenActions}>
                <ResultActions text={spokenText} videoUrl={videoUrl} />
                <Pressable onPress={resetResult} accessibilityRole='button' hitSlop={8}>
                  <Text style={styles.clearBtn}>{t('common.clear')}</Text>
                </Pressable>
              </View>
            ) : null}

            {phase === 'unsupported' || phase === 'error' || phase === 'denied' ? (
              <View style={styles.errorBlock}>
                <Text style={styles.errorTitle}>
                  {phase === 'unsupported'
                    ? translate(conversionLang, 'sts.unsupported')
                    : phase === 'denied'
                      ? t('sts.permission')
                      : t('common.retry')}
                </Text>
                <Text style={styles.errorBody}>{errorMessage}</Text>
              </View>
            ) : null}

            {showSigns ? (
              <View style={styles.signsBlock}>
                <Text style={styles.signsKicker}>{t('sts.supported')}</Text>
                <Text style={styles.sectionHint}>{t('sts.supportedHint')}</Text>
                {practiceSign ? (
                  <View style={styles.practiceBlock}>
                    <Text style={styles.practiceLabel}>{t('sts.practice')}</Text>
                    <Text style={styles.practiceEn} maxFontSizeMultiplier={1.4}>
                      {phraseLabel(practiceSign)}
                    </Text>
                    <Text style={styles.sectionHint}>{t('sts.practiceSay')}</Text>
                  </View>
                ) : null}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.signRail}>
                  {SUPPORTED_SIGNS.map((sign) => {
                    const selected = practiceId === sign.id
                    const label = phraseLabel(sign)
                    return (
                      <Pressable
                        key={sign.id}
                        onPress={() => setPracticeId(selected ? null : sign.id)}
                        style={[styles.signPill, selected && styles.signPillOn]}
                        accessibilityRole='button'
                        accessibilityState={{ selected }}
                        accessibilityLabel={label}
                      >
                        <Text style={[styles.signPillText, selected && { color: colors.primary }]}>{label}</Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.controls}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <ClayControl
                  size={84}
                  active={phase === 'listening'}
                  disabled={micDisabled}
                  onPress={() => void toggleMic()}
                  accessibilityLabel={statusLabel}
                >
                  {phase === 'listening' ? <CircleStop size={28} color={colors.textOnPrimary} /> : <Mic size={28} color={colors.primary} />}
                </ClayControl>
              </Animated.View>
              {videoUrl ? (
                <ClayControl size={64} onPress={handlePlayPause} disabled={!videoReady} accessibilityLabel={isPaused ? t('sts.replay') : t('sts.playing')}>
                  {isPaused ? <Play size={24} color={colors.primary} /> : <Pause size={24} color={colors.primary} />}
                </ClayControl>
              ) : null}
            </View>
            <Text style={[styles.micLabel, (phase === 'listening' || phase === 'processing') && { color: colors.primary }]}>{statusLabel}</Text>

            {phase === 'error' || phase === 'unsupported' ? (
              <Pressable onPress={() => void retry()} style={styles.textAction}>
                <Text style={styles.textActionLabel}>{t('common.retry')}</Text>
              </Pressable>
            ) : null}

            {phase === 'success' ? (
              <Pressable
                onPress={() => {
                  resetResult()
                  setPhase('idle')
                }}
                style={styles.textAction}
              >
                <Text style={styles.textActionLabel}>{t('sts.newConversion')}</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={{ paddingBottom: 20, paddingTop: 4 }}>
            <GlassButton label={t('sts.returnHome')} onPress={() => navigation.goBack()} />
          </View>
        </Animated.View>
      </View>
    </Screen>
  )
}

export default SpeechToSignScreen
