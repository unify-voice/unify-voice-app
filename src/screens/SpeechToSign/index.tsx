import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CircleStop, Mic, Pause, Play } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Image, Pressable, ScrollView, View } from 'react-native'
import Video, { type VideoRef } from 'react-native-video'
import { Text, XStack, YStack } from 'tamagui'

import defaultAvatar from '../../assets/speech-to-sign-avatar.png'
import Screen from '../../components/layouts/Screen'
import { SUPPORTED_SIGNS } from '../../constants/supportedSigns'
import { useLanguage } from '../../context/Language'
import { usePreferences } from '../../context/Preferences'
import { useAppTheme } from '../../context/Theme'
import { addHistoryItem } from '../../services/history'
import { ensureMicrophonePermission, openAppSettings } from '../../services/mic'
import { startAppRecorder, stopAppRecorder } from '../../services/recorder'
import { displaySpeechText, signVideoUrl, SpeechApiError, transcribeSpeechToSign } from '../../services/speechApi'
import { useThemedStyles } from '../../theme'
import { RootStackParamList } from '../../types/navigation'
import { directionStyle } from '../../utils/rtl'

import { createStyles } from './styles.modules'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToSignScreen'>
type Phase = 'idle' | 'listening' | 'processing' | 'success' | 'unsupported' | 'error' | 'denied'

const SpeechToSignScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, language, isRTL } = useLanguage()
  const { conversionLang } = usePreferences()

  const [phase, setPhase] = useState<Phase>('idle')
  const [spokenText, setSpokenText] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [lastAudioPath, setLastAudioPath] = useState('')

  const videoRef = useRef<VideoRef | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [fadeAnim])

  useEffect(() => {
    if (phase === 'listening') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
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
      const text = displaySpeechText(data)
      setSpokenText(text)

      if (data.found && data.video) {
        const url = signVideoUrl(data.video)
        setVideoUrl(url)
        setIsPaused(false)
        setVideoEnded(false)
        setPhase('success')
        await addHistoryItem({
          type: 'speech-to-sign',
          text: text || t('sts.title'),
          status: 'success',
          videoUrl: url || undefined,
          conversionLang,
        })
        return
      }

      setPhase('unsupported')
      setErrorMessage(data.message || t('sts.unsupportedBody'))
      await addHistoryItem({
        type: 'speech-to-sign',
        text: text || t('sts.unsupported'),
        status: 'unsupported',
        conversionLang,
      })
    } catch (err) {
      const message = err instanceof SpeechApiError ? err.message : t('sts.network')
      setErrorMessage(message)
      setPhase('error')
    }
  }

  const startRecording = async () => {
    const permission = await ensureMicrophonePermission()
    if (permission !== 'granted') {
      setPhase('denied')
      setErrorMessage(t('sts.permission'))
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
    } catch {
      setPhase('error')
      setErrorMessage(t('sts.network'))
    }
  }

  const stopRecordingAndSend = async () => {
    try {
      const audioPath = await stopAppRecorder()
      const path = audioPath || lastAudioPath
      setLastAudioPath(path)
      await processAudio(path)
    } catch {
      setPhase('error')
      setErrorMessage(t('sts.network'))
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

  return (
    <Screen padded={false}>
      <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
        <View style={styles.ambientGlow} />

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <YStack px='$5' pt='$3' pb='$2'>
            <Text style={styles.screenTitle}>{t('sts.title')}</Text>
            <Text style={styles.screenSub}>{t('sts.sub')}</Text>
          </YStack>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 12 }} keyboardShouldPersistTaps='handled'>
            <View style={styles.heroWrap}>
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
                    setErrorMessage(t('sts.videoFail'))
                    setVideoReady(false)
                    setPhase('error')
                  }}
                />
              ) : (
                <Image source={defaultAvatar} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode='contain' />
              )}
            </View>

            {phase === 'unsupported' || phase === 'error' || phase === 'denied' ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>
                  {phase === 'unsupported' ? t('sts.unsupported') : phase === 'denied' ? t('sts.permission') : t('common.retry')}
                </Text>
                <Text style={styles.errorBody}>{errorMessage}</Text>
              </View>
            ) : null}

            {spokenText ? (
              <View style={styles.spokenCard}>
                <XStack ai='center' jc='space-between'>
                  <Text style={styles.spokenLabel}>{t('sts.spoken')}</Text>
                  <Pressable onPress={resetResult} accessibilityRole='button'>
                    <Text style={styles.clearBtn}>{t('common.clear')}</Text>
                  </Pressable>
                </XStack>
                <Text style={[styles.spokenText, { marginTop: 10 }]}>{spokenText}</Text>
              </View>
            ) : null}

            {showSigns ? (
              <View style={styles.spokenCard}>
                <Text style={styles.spokenLabel}>{t('sts.supported')}</Text>
                <Text style={styles.sectionHint}>{t('sts.supportedHint')}</Text>
                <View style={styles.signsGrid}>
                  {SUPPORTED_SIGNS.map((sign) => (
                    <View key={sign.id} style={styles.signChip}>
                      <Text style={styles.signChipText}>{language === 'ur' ? sign.ur : sign.en}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.micCard}>
              <XStack ai='center' jc='center' gap='$4'>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Pressable
                    onPress={() => void toggleMic()}
                    disabled={micDisabled}
                    accessibilityRole='button'
                    accessibilityLabel={statusLabel}
                    style={[styles.micBtn, phase === 'listening' && styles.micBtnActive, micDisabled && { opacity: 0.35 }]}
                  >
                    {phase === 'listening' ? <CircleStop size={28} color={colors.primary} /> : <Mic size={28} color={colors.primary} />}
                  </Pressable>
                </Animated.View>

                {videoUrl ? (
                  <Pressable
                    onPress={handlePlayPause}
                    disabled={!videoReady}
                    style={[
                      styles.micBtn,
                      { backgroundColor: isPaused ? colors.accentBlueDark : colors.playGreen, borderColor: isPaused ? colors.accentBlue : colors.primary },
                    ]}
                  >
                    {isPaused ? <Play size={28} color={colors.white} /> : <Pause size={28} color={colors.white} />}
                  </Pressable>
                ) : null}
              </XStack>
              <Text style={[styles.micLabel, (phase === 'listening' || phase === 'processing') && { color: colors.primary }]}>{statusLabel}</Text>
            </View>

            {phase === 'error' || phase === 'unsupported' ? (
              <Pressable onPress={() => void retry()} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>{t('common.retry')}</Text>
              </Pressable>
            ) : null}

            {phase === 'success' ? (
              <Pressable
                onPress={() => {
                  resetResult()
                  setPhase('idle')
                }}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>{t('sts.newConversion')}</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={{ padding: 20 }}>
            <Pressable onPress={() => navigation.goBack()} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('sts.returnHome')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Screen>
  )
}

export default SpeechToSignScreen
