import { useIsFocused, useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native'
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera'
import { Text, XStack, YStack } from 'tamagui'

import ResultActions from '../../../components/ResultActions'
import { useLanguage } from '../../../context/Language'
import { usePreferences } from '../../../context/Preferences'
import { useAppTheme } from '../../../context/Theme'
import { useBusyLeaveGuard } from '../../../hooks/useBusyLeaveGuard'
import { cueError, cueRecordStart, cueRecordStop, cueSuccess } from '../../../services/feedback'
import { addHistoryItem } from '../../../services/history'
import { openAppSettings } from '../../../services/mic'
import { predictSignVideo, type SignPrediction } from '../../../services/signApi'
import { SpeechApiError } from '../../../services/speechApi'
import { useThemedStyles } from '../../../theme'
import { directionStyle } from '../../../utils/rtl'
import { createStyles } from '../styles.module'

type Phase = 'idle' | 'recording' | 'processing' | 'success' | 'empty' | 'error' | 'denied'

const RECORD_SECONDS = 8

const CameraStep = ({ onFinish }: { onFinish: () => void }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { conversionLang } = usePreferences()
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const cameraRef = useRef<Camera>(null)
  const recordingRef = useRef(false)
  const discardRef = useRef(false)
  const mountedRef = useRef(true)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(RECORD_SECONDS)
  const [predictions, setPredictions] = useState<SignPrediction[]>([])
  const [detectedText, setDetectedText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastVideoPath, setLastVideoPath] = useState('')

  const pulseAnim = useRef(new Animated.Value(1)).current
  const device = useCameraDevice(cameraPosition)
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission().then((ok) => {
        if (!ok) setPhase('denied')
      })
    }
  }, [hasPermission, requestPermission])

  useEffect(() => {
    if (phase === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      )
      loop.start()
      return () => loop.stop()
    }
    pulseAnim.setValue(1)
    return undefined
  }, [phase, pulseAnim])

  const clearTimers = () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
    stopTimerRef.current = null
    tickRef.current = null
  }

  const discardSession = useCallback(async () => {
    discardRef.current = true
    clearTimers()
    if (recordingRef.current) {
      try {
        await cameraRef.current?.stopRecording()
      } catch {
        // already stopped
      }
      recordingRef.current = false
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      void discardSession()
    }
  }, [discardSession])

  const sessionBusy = phase === 'recording' || phase === 'processing'
  useBusyLeaveGuard(navigation as any, sessionBusy, {
    title: t('session.leaveTitle'),
    message: phase === 'recording' ? t('session.leaveRecording') : t('session.leaveProcessing'),
    stayLabel: t('session.stay'),
    leaveLabel: t('session.leave'),
    onDiscard: discardSession,
  })

  const uploadVideo = async (videoPath: string) => {
    setPhase('processing')
    try {
      const preds = await predictSignVideo(videoPath)
      if (!mountedRef.current || discardRef.current) return
      const top = preds.slice(0, 3)
      setPredictions(top)
      const text = top[0]?.word?.trim() ?? ''
      if (!text) {
        setDetectedText('')
        setErrorMessage(t('s2t.empty'))
        setPhase('empty')
        cueError()
        return
      }
      setDetectedText(text)
      setErrorMessage('')
      setPhase('success')
      cueSuccess()
      await addHistoryItem({
        type: 'sign-to-text',
        text,
        status: 'success',
        conversionLang,
      })
    } catch (err) {
      if (!mountedRef.current || discardRef.current) return
      cueError()
      setErrorMessage(err instanceof SpeechApiError ? err.message : t('s2t.network'))
      setPhase('error')
    }
  }

  const startRecording = async () => {
    if (!hasPermission) {
      const ok = await requestPermission()
      if (!ok) {
        setPhase('denied')
        setErrorMessage(t('s2t.permission'))
        cueError()
        return
      }
    }
    if (!cameraRef.current || !device || recordingRef.current) return

    setPredictions([])
    setDetectedText('')
    setErrorMessage('')
    setSecondsLeft(RECORD_SECONDS)
    recordingRef.current = true
    setPhase('recording')
    cueRecordStart()

    try {
      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          recordingRef.current = false
          if (discardRef.current || !mountedRef.current) return
          setLastVideoPath(video.path)
          void uploadVideo(video.path)
        },
        onRecordingError: () => {
          recordingRef.current = false
          clearTimers()
          cueError()
          setPhase('error')
          setErrorMessage(t('s2t.recordFail'))
        },
      })
    } catch {
      recordingRef.current = false
      clearTimers()
      cueError()
      setPhase('error')
      setErrorMessage(t('s2t.recordFail'))
      return
    }

    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)

    stopTimerRef.current = setTimeout(() => {
      if (recordingRef.current) void stopRecording()
    }, RECORD_SECONDS * 1000)
  }

  const stopRecording = async () => {
    clearTimers()
    if (!recordingRef.current) return
    cueRecordStop()
    try {
      await cameraRef.current?.stopRecording()
    } catch {
      recordingRef.current = false
      setPhase('error')
      setErrorMessage(t('s2t.recordFail'))
      cueError()
    }
  }

  const toggleRecording = async () => {
    if (phase === 'processing') return
    if (phase === 'recording') await stopRecording()
    else await startRecording()
  }

  const retry = async () => {
    if (lastVideoPath) await uploadVideo(lastVideoPath)
    else await startRecording()
  }

  const statusLabel =
    phase === 'recording'
      ? t('s2t.recording')
      : phase === 'processing'
        ? t('s2t.processing')
        : phase === 'denied'
          ? t('s2t.permission')
          : t('s2t.tapToRecord')

  const busy = phase === 'processing'
  const showError = phase === 'error' || phase === 'denied' || phase === 'empty'

  return (
    <YStack flex={1} style={directionStyle(isRTL)}>
      <XStack px='$5' pt='$4' pb='$2' ai='center' jc='space-between'>
        <YStack flex={1} pr='$3'>
          <Text style={styles.screenTitle} maxFontSizeMultiplier={1.4}>
            {t('s2t.title')}
          </Text>
          <Text style={styles.screenSub} maxFontSizeMultiplier={1.35}>
            {t('s2t.sub')}
          </Text>
        </YStack>
        <Pressable
          onPress={() => setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))}
          disabled={phase === 'recording' || busy}
          style={[styles.flipBtn, (phase === 'recording' || busy) && { opacity: 0.4 }]}
          accessibilityRole='button'
          accessibilityLabel={t('s2t.flip')}
          hitSlop={8}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>{t('s2t.flipShort')}</Text>
        </Pressable>
      </XStack>

      <View style={styles.cameraWrap}>
        {!hasPermission || phase === 'denied' ? (
          <YStack flex={1} ai='center' jc='center' gap='$3' px='$4'>
            <Text style={styles.cameraPlaceholderText}>{t('s2t.permission')}</Text>
            <Pressable
              onPress={() => void requestPermission().then((ok) => (ok ? setPhase('idle') : openAppSettings()))}
              style={[styles.primaryBtn, { minHeight: 44, paddingHorizontal: 20 }]}
              accessibilityRole='button'
              accessibilityLabel={t('s2t.allowCamera')}
            >
              <Text style={styles.primaryBtnText}>{t('s2t.allowCamera')}</Text>
            </Pressable>
            <Pressable onPress={() => void openAppSettings()} style={{ minHeight: 44, justifyContent: 'center' }} accessibilityRole='button'>
              <Text style={styles.secondaryBtnText}>{t('s2t.openSettings')}</Text>
            </Pressable>
          </YStack>
        ) : device ? (
          <>
            <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={isFocused && !busy} video audio={false} />
            {phase === 'recording' ? (
              <View style={styles.recBadge} accessibilityLiveRegion='polite'>
                <View style={styles.recDot} />
                <Text style={styles.recText}>
                  REC 0:{String(secondsLeft).padStart(2, '0')}
                </Text>
              </View>
            ) : null}
            {phase === 'processing' ? (
              <View style={[StyleSheet.absoluteFill, styles.processingOverlay]}>
                <ActivityIndicator size='large' color={colors.primary} />
                <Text style={styles.processingText}>{t('s2t.processing')}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <YStack flex={1} ai='center' jc='center'>
            <Text style={styles.cameraPlaceholderText}>{t('s2t.noCamera')}</Text>
          </YStack>
        )}
      </View>

      {showError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{phase === 'empty' ? t('s2t.empty') : phase === 'denied' ? t('s2t.permission') : t('common.retry')}</Text>
          <Text style={styles.errorBody}>{errorMessage || t('s2t.network')}</Text>
        </View>
      ) : null}

      <View style={styles.outputCard}>
        <XStack ai='center' jc='space-between' mb='$1'>
          <Text style={[styles.outputLabel, { marginBottom: 0 }]}>{phase === 'processing' ? t('s2t.processing') : t('s2t.detected')}</Text>
          <ResultActions text={detectedText} />
        </XStack>
        <Text
          style={[styles.outputText, !detectedText && { opacity: 0.35 }]}
          selectable={!!detectedText}
          maxFontSizeMultiplier={1.4}
        >
          {detectedText || t('s2t.emptyHint')}
        </Text>
        {predictions.length > 0 ? (
          <XStack mt='$2' gap='$2' flexWrap='wrap'>
            {predictions.map((p, i) => (
              <Pressable
                key={`${p.word}-${i}`}
                onPress={() => setDetectedText(p.word)}
                hitSlop={6}
                accessibilityRole='button'
                accessibilityLabel={p.word}
                style={{
                  minHeight: 44,
                  backgroundColor: colors.primaryMuted,
                  borderRadius: 100,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>
                  {i + 1}. {p.word}
                  {p.confidence > 0 ? ` (${Math.round(p.confidence * 100)}%)` : ''}
                </Text>
              </Pressable>
            ))}
          </XStack>
        ) : null}
      </View>

      <XStack px='$5' pb='$3' gap='$3' ai='center' jc='center' mt='$2'>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={() => void toggleRecording()}
            disabled={busy || !hasPermission || !device}
            accessibilityRole='button'
            accessibilityLabel={statusLabel}
            accessibilityState={{ busy, disabled: busy }}
            style={[styles.recordBtn, phase === 'recording' && styles.recordBtnActive, busy && { opacity: 0.4 }]}
          >
            <View style={[styles.recordInner, phase === 'recording' && styles.recordInnerActive]} />
          </Pressable>
        </Animated.View>
      </XStack>
      <Text style={[styles.micStatus, (phase === 'recording' || phase === 'processing') && { color: colors.primary }]}>{statusLabel}</Text>

      <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}>
        {phase === 'error' || phase === 'empty' ? (
          <Pressable onPress={() => void retry()} style={[styles.secondaryBtn, { minHeight: 44 }]} accessibilityRole='button'>
            <Text style={styles.secondaryBtnText}>{t('common.retry')}</Text>
          </Pressable>
        ) : null}
        {phase === 'success' ? (
          <Pressable
            onPress={() => {
              setPredictions([])
              setDetectedText('')
              setErrorMessage('')
              setPhase('idle')
            }}
            style={[styles.secondaryBtn, { minHeight: 44 }]}
            accessibilityRole='button'
          >
            <Text style={styles.secondaryBtnText}>{t('s2t.another')}</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onFinish} style={[styles.primaryBtn, { minHeight: 44 }]} accessibilityRole='button'>
          <Text style={styles.primaryBtnText}>{t('s2t.returnHome')}</Text>
        </Pressable>
      </View>
    </YStack>
  )
}

export default CameraStep
