import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CircleStop, HandMetal, Mic, Pause, Play, RefreshCw } from '@tamagui/lucide-icons-2'
import React, { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { PermissionsAndroid, Platform, Animated, Pressable, ScrollView, View, Text as RNText, Image, Modal, StyleSheet } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import Video, { type VideoRef } from 'react-native-video'
import { Text, XStack, YStack } from 'tamagui'

import { API_BASE_URLS } from '../../../config'
import defaultAvatar from '../../assets/speech-to-sign-avatar.png'
import Screen from '../../components/layouts/Screen'
import { useAppTheme } from '../../context/Theme'
import { useThemedStyles, type ThemeColors } from '../../theme'
import { RootStackParamList } from '../../types/navigation'

import { createStyles } from './styles.modules'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToSignScreen'>
type IconComponent = ComponentType<{ size?: number; color?: string }>

const audioRecorderPlayer = new AudioRecorderPlayer()

// ── Guide steps ──────────────────────────────────────────────────────────────
const GUIDE_STEPS: { Icon: IconComponent; title: string; body: string }[] = [
  {
    Icon: Mic,
    title: 'Tap to speak',
    body: 'Press the microphone button and say a phrase — in English or Urdu. The button pulses while it listens.',
  },
  {
    Icon: CircleStop,
    title: 'Tap again to stop',
    body: 'Tap the mic a second time to finish recording. Your audio is sent for transcription automatically.',
  },
  {
    Icon: HandMetal,
    title: 'Watch the sign',
    body: 'If a matching sign exists, the video plays instantly. Use play / pause to control it, or replay once it ends.',
  },
  {
    Icon: RefreshCw,
    title: 'Try again',
    body: 'Tap Clear to reset and record a new phrase. Supported phrases are shown in both English and Urdu.',
  },
]

const createGuideStyles = (c: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.overlayStrong,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.slate,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 36,
      borderTopWidth: 1,
      borderColor: c.slateBorder,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerLabel: {
      color: c.slateTextMuted,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    skipBtn: {
      color: c.slateTextMuted,
      fontSize: 14,
    },
    dot: {
      height: 6,
      borderRadius: 3,
    },
    dotActive: {
      width: 24,
      backgroundColor: c.primary,
    },
    dotInactive: {
      width: 6,
      backgroundColor: c.slateBorder,
    },
    stepContent: {
      alignItems: 'center',
      paddingHorizontal: 8,
      minHeight: 210,
    },
    iconBubble: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.slateMuted,
      borderWidth: 2,
      borderColor: c.slateBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    stepTitle: {
      color: c.slateText,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: -0.3,
    },
    stepBody: {
      color: c.slateTextMuted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
    counter: {
      color: c.slateTextMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 18,
    },
    btn: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: {
      backgroundColor: c.primary,
    },
    btnPrimaryText: {
      color: c.black,
      fontSize: 15,
      fontWeight: '700',
    },
    btnSecondary: {
      backgroundColor: c.slate,
      borderWidth: 1,
      borderColor: c.slateBorder,
    },
    btnSecondaryText: {
      color: c.slateTextMuted,
      fontSize: 15,
      fontWeight: '600',
    },
  })

// ── Onboarding modal ─────────────────────────────────────────────────────────
const GuideModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useAppTheme()
  const guide = useMemo(() => createGuideStyles(colors), [colors])
  const [step, setStep] = useState(0)
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current

  const animateToStep = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next)
      slideAnim.setValue(30)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start()
    })
  }

  const next = () => {
    if (step < GUIDE_STEPS.length - 1) animateToStep(step + 1)
    else onClose()
  }

  const prev = () => {
    if (step > 0) animateToStep(step - 1)
  }

  const current = GUIDE_STEPS[step]
  const isLast = step === GUIDE_STEPS.length - 1

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <View style={guide.overlay}>
        <View style={guide.sheet}>
          {/* Header */}
          <View style={guide.header}>
            <RNText style={guide.headerLabel}>How it works</RNText>
            <Pressable onPress={onClose} hitSlop={12}>
              <RNText style={guide.skipBtn}>Skip</RNText>
            </Pressable>
          </View>

          {/* Step dots */}
          <XStack jc='center' gap='$2' mb='$5'>
            {GUIDE_STEPS.map((_, i) => (
              <View key={i} style={[guide.dot, i === step ? guide.dotActive : guide.dotInactive]} />
            ))}
          </XStack>

          {/* Animated step content */}
          <Animated.View style={[guide.stepContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {/* Icon bubble */}
            <View style={guide.iconBubble}>
              <current.Icon size={38} color={colors.primary} />
            </View>

            <RNText style={guide.stepTitle}>{current.title}</RNText>
            <RNText style={guide.stepBody}>{current.body}</RNText>
          </Animated.View>

          {/* Step counter */}
          <RNText style={guide.counter}>
            {step + 1} of {GUIDE_STEPS.length}
          </RNText>

          {/* Navigation buttons */}
          <XStack gap='$3' mt='$4'>
            {step > 0 ? (
              <Pressable onPress={prev} style={[guide.btn, guide.btnSecondary]}>
                <RNText style={guide.btnSecondaryText}>Back</RNText>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <Pressable onPress={next} style={[guide.btn, guide.btnPrimary]}>
              <RNText style={guide.btnPrimaryText}>{isLast ? 'Get started' : 'Next'}</RNText>
            </Pressable>
          </XStack>
        </View>
      </View>
    </Modal>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
const SpeechToSignScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [showGuide, setShowGuide] = useState(true) // show on first visit

  const videoRef = useRef<VideoRef | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const controlsAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isListening, pulseAnim])

  useEffect(() => {
    if (videoReady) {
      Animated.timing(controlsAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
    } else {
      controlsAnim.setValue(0)
    }
  }, [videoReady, controlsAnim])

  const requestPermission = async () => {
    if (Platform.OS === 'ios') return true
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
    return granted === PermissionsAndroid.RESULTS.GRANTED
  }

  const startRecording = async () => {
    const ok = await requestPermission()
    if (!ok) return
    setVideoUrl(null)
    setVideoReady(false)
    setVideoEnded(false)
    setIsPaused(false)
    setMessage('')
    setIsListening(true)
    await audioRecorderPlayer.startRecorder()
  }

  const stopRecordingAndSend = async () => {
    try {
      setIsListening(false)
      setIsUploading(true)
      const audioPath = await audioRecorderPlayer.stopRecorder()

      const formData = new FormData()
      formData.append('file', {
        uri: Platform.OS === 'ios' ? audioPath : `file://${audioPath}`,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any)

      const res = await fetch(`${API_BASE_URLS.speechToSign}/transcribe`, { method: 'POST', body: formData })
      const data = await res.json()

      const displayText = data?.detected_language === 'ur' ? data?.roman_urdu : data?.text

      setSpokenText(displayText || '')

      if (data.found && data.video) {
        setVideoUrl(`${API_BASE_URLS.speechToSign}${data.video}`)
        setIsPaused(false)
        setVideoEnded(false)
      } else {
        setMessage(data.message || 'Sign does not exist for this sentence')
      }
    } catch {
      // Request failed — surface message below
      setMessage('Something went wrong')
    } finally {
      setIsUploading(false)
    }
  }

  const toggleMic = async () => {
    if (isListening) await stopRecordingAndSend()
    else await startRecording()
  }

  const clearAll = () => {
    setSpokenText('')
    setVideoUrl(null)
    setVideoReady(false)
    setVideoEnded(false)
    setIsPaused(false)
    setMessage('')
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

  const micDisabled = isUploading || videoReady
  const playPauseBg = isPaused ? colors.accentBlueDark : colors.playGreen
  const playPauseBorder = isPaused ? colors.accentBlue : colors.primary

  const statusLabel = isListening
    ? 'Listening… tap to stop'
    : isUploading
      ? 'Processing…'
      : videoReady
        ? videoEnded
          ? 'Tap play to replay'
          : isPaused
            ? 'Paused'
            : 'Playing'
        : 'Tap to speak'

  return (
    <Screen padded={false}>
      {/* Guide modal */}
      <GuideModal visible={showGuide} onClose={() => setShowGuide(false)} />

      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <YStack px='$5' pt='$3' pb='$2'>
          <XStack ai='center' jc='space-between'>
            <YStack>
              <Text style={styles.screenTitle}>Speech to Sign</Text>
              <Text style={styles.screenSub}>Convert speech into real sign language videos</Text>
            </YStack>
            {/* Help button to re-open the guide */}
            <Pressable
              onPress={() => setShowGuide(true)}
              hitSlop={10}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.slate,
                borderWidth: 1,
                borderColor: colors.slateBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RNText style={{ color: colors.slateTextMuted, fontSize: 15, fontWeight: '700' }}>?</RNText>
            </Pressable>
          </XStack>
        </YStack>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {videoUrl ? (
            <View style={{ height: 250, marginBottom: 20 }}>
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={{ flex: 1, borderRadius: 12 }}
                resizeMode='contain'
                paused={isPaused}
                onLoad={() => setVideoReady(true)}
                onEnd={handleVideoEnd}
                onError={() => {
                  setMessage('Failed to load video')
                  setVideoReady(false)
                }}
              />
            </View>
          ) : (
            <View style={{ height: 250, marginBottom: 20 }}>
              <Image source={defaultAvatar} style={{ flex: 1, borderRadius: 12, width: '100%', height: '100%' }} resizeMode='contain' />
            </View>
          )}

          {message ? (
            <View style={styles.spokenCard}>
              <Text style={styles.spokenLabel}>Result</Text>
              <RNText style={{ color: colors.textPrimary, marginTop: 10 }}>{message}</RNText>
            </View>
          ) : null}

          {spokenText ? (
            <View style={styles.spokenCard}>
              <XStack ai='center' jc='space-between'>
                <Text style={styles.spokenLabel}>Spoken Text</Text>
                <Pressable onPress={clearAll}>
                  <Text style={styles.clearBtn}>Clear</Text>
                </Pressable>
              </XStack>
              <RNText style={{ color: colors.textPrimary, marginTop: 10 }}>{spokenText}</RNText>
            </View>
          ) : null}

          {/* ── Controls row ───────────────────────────────────────────── */}
          <View style={styles.micCard}>
            <XStack ai='center' jc='center' gap='$4'>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  onPress={toggleMic}
                  disabled={micDisabled}
                  style={[styles.micBtn, isListening && styles.micBtnActive, micDisabled && { opacity: 0.35 }]}
                >
                  <Mic size={28} color={colors.primary} />
                </Pressable>
              </Animated.View>

              {videoUrl ? (
                <Animated.View style={{ opacity: controlsAnim, transform: [{ scale: controlsAnim }] }}>
                  <Pressable
                    onPress={handlePlayPause}
                    disabled={!videoReady}
                    style={[styles.micBtn, { backgroundColor: playPauseBg, borderColor: playPauseBorder }]}
                  >
                    {isPaused ? <Play size={28} color={colors.white} /> : <Pause size={28} color={colors.white} />}
                  </Pressable>
                </Animated.View>
              ) : null}
            </XStack>

            <Text style={[styles.micLabel, isListening && { color: colors.primary }]}>{statusLabel}</Text>
          </View>
        </ScrollView>

        <View style={{ padding: 20 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Return Home</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Screen>
  )
}

export default SpeechToSignScreen
