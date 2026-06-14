import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { PermissionsAndroid, Platform, Animated, Pressable, ScrollView, View, Text as RNText, Image, Modal, StyleSheet } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import Video, { type VideoRef } from 'react-native-video'
import { Text, XStack, YStack } from 'tamagui'

import { API_BASE_URL } from '../../../config'
import defaultAvatar from '../../assets/speech-to-sign-avatar.png'
import Screen from '../../components/layouts/Screen'
import { RootStackParamList } from '../../types/navigation'

import { styles } from './styles.modules'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToSignScreen'>

const audioRecorderPlayer = new AudioRecorderPlayer()

const GREEN = '#22c55e'
const BLUE = '#3b82f6'
const CARD_BG = '#1e293b'
const BORDER = '#334155'

// ── Guide steps ──────────────────────────────────────────────────────────────
const GUIDE_STEPS = [
  {
    icon: '🎙️',
    title: 'Tap to speak',
    body: 'Press the microphone button and say a phrase — in English or Urdu. The button pulses while it listens.',
  },
  {
    icon: '⏹️',
    title: 'Tap again to stop',
    body: 'Tap the mic a second time to finish recording. Your audio is sent for transcription automatically.',
  },
  {
    icon: '🤟',
    title: 'Watch the sign',
    body: 'If a matching sign exists, the video plays instantly. Use ▶️ / ⏸️ to control it, or replay once it ends.',
  },
  {
    icon: '🔄',
    title: 'Try again',
    body: 'Tap Clear to reset and record a new phrase. Supported phrases are shown in both English and Urdu.',
  },
]

// ── Onboarding modal ─────────────────────────────────────────────────────────
const GuideModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
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
              <RNText style={guide.iconText}>{current.icon}</RNText>
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

// ── Guide styles ──────────────────────────────────────────────────────────────
const guide = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  skipBtn: {
    color: '#64748b',
    fontSize: 14,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: GREEN,
  },
  dotInactive: {
    width: 6,
    backgroundColor: BORDER,
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
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 38,
  },
  stepTitle: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  stepBody: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  counter: {
    color: '#475569',
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
    backgroundColor: GREEN,
  },
  btnPrimaryText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: BORDER,
  },
  btnSecondaryText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
})

// ── Main screen ───────────────────────────────────────────────────────────────
const SpeechToSignScreen: React.FC<Props> = ({ navigation }) => {
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

      const res = await fetch(`${API_BASE_URL}/transcribe`, { method: 'POST', body: formData })
      const data = await res.json()

      setSpokenText(data.text || '')
      if (data.found && data.video) {
        setVideoUrl(`${API_BASE_URL}${data.video}`)
        setIsPaused(false)
        setVideoEnded(false)
      } else {
        setMessage(data.message || 'Sign does not exist for this sentence')
      }
    } catch (e) {
      console.log('Error:', e)
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
  const playPauseIcon = isPaused ? '▶️' : '⏸️'
  const playPauseBg = isPaused ? '#1e40af' : '#15803d'
  const playPauseBorder = isPaused ? BLUE : GREEN

  const statusLabel = isListening
    ? 'Listening… tap to stop'
    : isUploading
      ? 'Processing…'
      : videoReady
        ? videoEnded
          ? 'Tap ▶️ to replay'
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
                backgroundColor: CARD_BG,
                borderWidth: 1,
                borderColor: BORDER,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RNText style={{ color: '#94a3b8', fontSize: 15, fontWeight: '700' }}>?</RNText>
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
              <RNText style={{ color: 'white', marginTop: 10 }}>{message}</RNText>
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
              <RNText style={{ color: 'white', marginTop: 10 }}>{spokenText}</RNText>
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
                  <RNText style={{ fontSize: 28 }}>🎙️</RNText>
                </Pressable>
              </Animated.View>

              {videoUrl ? (
                <Animated.View style={{ opacity: controlsAnim, transform: [{ scale: controlsAnim }] }}>
                  <Pressable
                    onPress={handlePlayPause}
                    disabled={!videoReady}
                    style={[styles.micBtn, { backgroundColor: playPauseBg, borderColor: playPauseBorder }]}
                  >
                    <RNText style={{ fontSize: 28 }}>{playPauseIcon}</RNText>
                  </Pressable>
                </Animated.View>
              ) : null}
            </XStack>

            <Text style={[styles.micLabel, isListening && { color: GREEN }]}>{statusLabel}</Text>
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
