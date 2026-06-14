import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Modal, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text as RNText, View } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { Text, XStack, YStack } from 'tamagui'

import { API_BASE_URL } from '../../../config'
import Screen from '../../components/layouts/Screen'
import { colors } from '../../theme'
import { RootStackParamList } from '../../types/navigation'

import { styles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToTextScreen'>

const audioRecorderPlayer = new AudioRecorderPlayer()

const CARD_BG = '#1e293b'
const BORDER = '#334155'
const GREEN = '#22c55e'

// ── Guide steps ───────────────────────────────────────────────────────────────
const GUIDE_STEPS = [
  {
    icon: '🎙️',
    title: 'Tap to start',
    body: 'Press the microphone button and speak clearly. The waveform animates while it listens.',
  },
  {
    icon: '⏹️',
    title: 'Tap again to stop',
    body: 'Tap the mic a second time when you are done. Your audio is transcribed automatically.',
  },
  {
    icon: '📝',
    title: 'Read your transcript',
    body: 'Each recording appears as a new line below. You can record multiple times — they stack up.',
  },
  {
    icon: '🔄',
    title: 'Start fresh anytime',
    body: 'Tap Clear to wipe the transcript and begin again. English and Urdu are both supported.',
  },
]

// ── Guide modal ───────────────────────────────────────────────────────────────
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

  const next = () => (step < GUIDE_STEPS.length - 1 ? animateToStep(step + 1) : onClose())
  const prev = () => step > 0 && animateToStep(step - 1)

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

          {/* Animated content */}
          <Animated.View style={[guide.stepContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={guide.iconBubble}>
              <RNText style={guide.iconText}>{current.icon}</RNText>
            </View>
            <RNText style={guide.stepTitle}>{current.title}</RNText>
            <RNText style={guide.stepBody}>{current.body}</RNText>
          </Animated.View>

          <RNText style={guide.counter}>
            {step + 1} of {GUIDE_STEPS.length}
          </RNText>

          {/* Nav buttons */}
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
  skipBtn: { color: '#64748b', fontSize: 14 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24, backgroundColor: GREEN },
  dotInactive: { width: 6, backgroundColor: BORDER },
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
  iconText: { fontSize: 38 },
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
  btnPrimary: { backgroundColor: GREEN },
  btnPrimaryText: { color: '#000', fontSize: 15, fontWeight: '700' },
  btnSecondary: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: BORDER },
  btnSecondaryText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
})

// ── Main screen ───────────────────────────────────────────────────────────────
const SpeechToTextScreen: React.FC<Props> = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [audioPath, setAudioPath] = useState<string>('')
  const [showGuide, setShowGuide] = useState(true)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const waveAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.6),
    new Animated.Value(0.4),
    new Animated.Value(0.8),
    new Animated.Value(0.5),
  ]).current

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
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start()

      waveAnims.forEach((anim) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
          ]),
        ).start()
      })
    } else {
      pulseAnim.setValue(1)
      waveAnims.forEach((a) => a.setValue(0.3))
    }
  }, [isListening, pulseAnim, waveAnims])

  const requestPermission = async () => {
    if (Platform.OS === 'ios') return true
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
    return granted === PermissionsAndroid.RESULTS.GRANTED
  }

  const uploadAudio = async (path: string) => {
    const formData = new FormData()
    formData.append('file', {
      uri: Platform.OS === 'ios' ? path : `file://${path}`,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any)
    const response = await fetch(`${API_BASE_URL}/transcribe`, { method: 'POST', body: formData })
    return response.json()
  }

  const startRecording = async () => {
    const ok = await requestPermission()
    if (!ok) return
    const path = Platform.OS === 'ios' ? 'recording.m4a' : undefined
    const uri = await audioRecorderPlayer.startRecorder(path as any)
    setAudioPath(uri)
    setIsListening(true)
  }

  const stopRecording = async () => {
    try {
      setIsListening(false)
      setIsUploading(true)
      const resultPath = await audioRecorderPlayer.stopRecorder()
      const result = await uploadAudio(resultPath || audioPath)
      if (result?.text) setTranscript((prev) => [...prev, result.text])
    } catch (e) {
      console.log('Stop recording error:', e)
    } finally {
      setIsUploading(false)
    }
  }

  const toggleListening = async () => {
    if (isListening) await stopRecording()
    else await startRecording()
  }

  const clearTranscript = () => setTranscript([])

  return (
    <Screen padded={false}>
      <GuideModal visible={showGuide} onClose={() => setShowGuide(false)} />

      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        {/* Header */}
        <YStack px='$5' pt='$3' pb='$2'>
          <XStack ai='center' jc='space-between'>
            <YStack>
              <Text style={styles.screenTitle}>Speech to Text</Text>
              <Text style={styles.screenSub}>Turn spoken words into accurate text instantly.</Text>
            </YStack>

            {/* Help button */}
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

        {/* Mic card */}
        <View style={styles.micCard}>
          {/* Waveform */}
          <XStack ai='center' jc='center' gap='$1' style={{ height: 48, marginBottom: 20 }}>
            {waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY: anim }],
                    backgroundColor: isListening ? colors.primary : 'rgba(255,255,255,0.12)',
                  },
                ]}
              />
            ))}
          </XStack>

          {/* Mic button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable onPress={toggleListening} style={[styles.micBtn, isListening && styles.micBtnActive]}>
              {isListening && <View style={styles.micBtnRing} />}
              <Text style={{ fontSize: 28 }}>🎙️</Text>
            </Pressable>
          </Animated.View>

          <Text style={[styles.micLabel, (isListening || isUploading) && { color: colors.primary }]}>
            {isUploading ? 'Transcribing…' : isListening ? 'Listening… tap to stop' : 'Tap to start speaking'}
          </Text>
        </View>

        {/* Transcript */}
        <View style={styles.transcriptSection}>
          <XStack ai='center' jc='space-between' mb='$2'>
            <Text style={styles.transcriptLabel}>Transcript</Text>
            {transcript.length > 0 && (
              <Pressable onPress={clearTranscript}>
                <Text style={styles.clearBtn}>Clear</Text>
              </Pressable>
            )}
          </XStack>

          <ScrollView style={styles.transcriptScroll} contentContainerStyle={{ padding: 14, flexGrow: 1 }}>
            {transcript.length === 0 ? (
              <Text style={styles.transcriptEmpty}>Your speech will appear here as text…</Text>
            ) : (
              transcript.map((line, i) => (
                <View key={i} style={styles.transcriptLine}>
                  <View style={styles.transcriptDot} />
                  <Text style={styles.transcriptText}>{line}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Return Home</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Screen>
  )
}

export default SpeechToTextScreen
