import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CircleStop, FileText, Mic, RefreshCw } from '@tamagui/lucide-icons-2'
import React, { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { Animated, Modal, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text as RNText, View } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { Text, XStack, YStack } from 'tamagui'

import { API_BASE_URLS } from '../../../config'
import Screen from '../../components/layouts/Screen'
import { useAppTheme } from '../../context/Theme'
import { useThemedStyles, type ThemeColors } from '../../theme'
import { RootStackParamList } from '../../types/navigation'

import { createStyles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'SpeechToTextScreen'>
type IconComponent = ComponentType<{ size?: number; color?: string }>

const audioRecorderPlayer = new AudioRecorderPlayer()

// ── Guide steps ───────────────────────────────────────────────────────────────
const GUIDE_STEPS: { Icon: IconComponent; title: string; body: string }[] = [
  {
    Icon: Mic,
    title: 'Tap to start',
    body: 'Press the microphone button and speak clearly. The waveform animates while it listens.',
  },
  {
    Icon: CircleStop,
    title: 'Tap again to stop',
    body: 'Tap the mic a second time when you are done. Your audio is transcribed automatically.',
  },
  {
    Icon: FileText,
    title: 'Read your transcript',
    body: 'Each recording appears as a new line below. You can record multiple times — they stack up.',
  },
  {
    Icon: RefreshCw,
    title: 'Start fresh anytime',
    body: 'Tap Clear to wipe the transcript and begin again. English and Urdu are both supported.',
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
    skipBtn: { color: c.slateTextMuted, fontSize: 14 },
    dot: { height: 6, borderRadius: 3 },
    dotActive: { width: 24, backgroundColor: c.primary },
    dotInactive: { width: 6, backgroundColor: c.slateBorder },
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
    btnPrimary: { backgroundColor: c.primary },
    btnPrimaryText: { color: c.black, fontSize: 15, fontWeight: '700' },
    btnSecondary: { backgroundColor: c.slate, borderWidth: 1, borderColor: c.slateBorder },
    btnSecondaryText: { color: c.slateTextMuted, fontSize: 15, fontWeight: '600' },
  })

// ── Guide modal ───────────────────────────────────────────────────────────────
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
              <current.Icon size={38} color={colors.primary} />
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

// ── Main screen ───────────────────────────────────────────────────────────────
const SpeechToTextScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
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
    const response = await fetch(`${API_BASE_URLS.speechToText}/transcribe`, { method: 'POST', body: formData })
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
      const displayText = result?.language === 'ur' ? result?.roman_urdu : result?.text

      if (displayText) {
        setTranscript((prev) => [...prev, displayText])
      }
    } catch {
      // Transcription failed — leave transcript unchanged
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
                    backgroundColor: isListening ? colors.primary : colors.divider,
                  },
                ]}
              />
            ))}
          </XStack>

          {/* Mic button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable onPress={toggleListening} style={[styles.micBtn, isListening && styles.micBtnActive]}>
              {isListening && <View style={styles.micBtnRing} />}
              <Mic size={28} color={colors.primary} />
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
