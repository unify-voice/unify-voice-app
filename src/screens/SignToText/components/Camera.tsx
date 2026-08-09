import { useIsFocused, useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, type Orientation } from 'react-native-vision-camera'
import { Text, XStack, YStack } from 'tamagui'

import GlassButton from '../../../components/GlassButton'
import {
  SIGN_TO_TEXT_PHRASES,
  confidenceBand,
  displaySignPhrase,
} from '../../../constants/signToTextVocab'
import { useLanguage } from '../../../context/Language'
import { usePreferences } from '../../../context/Preferences'
import { useAppTheme } from '../../../context/Theme'
import { useBusyLeaveGuard } from '../../../hooks/useBusyLeaveGuard'
import { useKeepAwake } from '../../../hooks/useKeepAwake'
import { cueError, cueRecordStart, cueRecordStop, cueSuccess } from '../../../services/feedback'
import { addHistoryItem, updateHistoryItem } from '../../../services/history'
import { dismissS2tTips, hasDismissedS2tTips } from '../../../services/s2tTips'
import { openAppSettings } from '../../../services/mic'
import { predictSignVideo, type SignPrediction } from '../../../services/signApi'
import { SpeechApiError } from '../../../services/speechApi'
import { useThemedStyles } from '../../../theme'
import { directionStyle } from '../../../utils/rtl'
import { createStyles } from '../styles.module'

import PredictionResult from './PredictionResult'
import TiltPrompt from './TiltPrompt'

type Phase = 'idle' | 'recording' | 'processing' | 'success' | 'uncertain' | 'empty' | 'error' | 'denied'

const RECORD_SECONDS = 8
/** Only this landscape matches the model / laptop webcam. The other tilt stays locked. */
const REQUIRED_HOLD: Orientation = 'landscape-left'

const CameraStep = ({ onFinish }: { onFinish: () => void }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t, isRTL } = useLanguage()
  const { conversionLang } = usePreferences()
  const { height: windowH } = useWindowDimensions()
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const cameraRef = useRef<Camera>(null)
  const recordingRef = useRef(false)
  const discardRef = useRef(false)
  const mountedRef = useRef(true)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const historyIdRef = useRef<string | null>(null)

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front')
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(RECORD_SECONDS)
  const [predictions, setPredictions] = useState<SignPrediction[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastVideoPath, setLastVideoPath] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 })
  const [sessionKey, setSessionKey] = useState(0)
  const [deviceHold, setDeviceHold] = useState<Orientation>('portrait')

  const pulseAnim = useRef(new Animated.Value(1)).current
  const preferredDevice = useCameraDevice(cameraPosition, { physicalDevices: ['wide-angle-camera'] })
  const fallbackDevice = useCameraDevice(cameraPosition)
  const device = preferredDevice ?? fallbackDevice
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 30 },
  ])
  const { hasPermission, requestPermission } = useCameraPermission()
  const guide =
    previewSize.w > 10 && previewSize.h > 10
      ? (() => {
          const width = previewSize.w * 0.9
          const height = Math.min(width * (9 / 16), previewSize.h * 0.58)
          return {
            width,
            height,
            left: (previewSize.w - width) / 2,
            top: (previewSize.h - height) / 2,
          }
        })()
      : null

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission().then((ok) => {
        if (!ok) setPhase('denied')
      })
    }
  }, [hasPermission, requestPermission])

  useEffect(() => {
    void hasDismissedS2tTips().then((done) => {
      if (!done) setShowTips(true)
    })
  }, [])

  const cameraOpen = isFocused && hasPermission && !!device && phase !== 'denied'
  useKeepAwake(cameraOpen && (phase === 'recording' || phase === 'processing'))

  const refreshPreview = useCallback(() => {
    setTimeout(() => {
      if (mountedRef.current) setSessionKey((k) => k + 1)
    }, 80)
  }, [])

  const isLandscape = deviceHold === REQUIRED_HOLD
  const landscapeRef = useRef(isLandscape)
  landscapeRef.current = isLandscape

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
      setSelectedIndex(0)
      historyIdRef.current = null

      const best = top[0]
      if (!best) {
        setErrorMessage(t('s2t.empty'))
        setPhase('empty')
        cueError()
        return
      }

      const label = displaySignPhrase(best.word, conversionLang)
      const band = confidenceBand(best.confidence)
      setErrorMessage('')

      if (band === 'low') {
        setPhase('uncertain')
        return
      }

      setPhase('success')
      cueSuccess()
      const entry = await addHistoryItem({
        type: 'sign-to-text',
        text: label,
        status: 'success',
        conversionLang,
        confidence: best.confidence,
      })
      if (mountedRef.current) historyIdRef.current = entry.id
    } catch (err) {
      if (!mountedRef.current || discardRef.current) return
      cueError()
      setErrorMessage(err instanceof SpeechApiError ? err.message : t('s2t.network'))
      setPhase('error')
    }
  }

  const choosePrediction = async (index: number) => {
    const pred = predictions[index]
    if (!pred) return
    setSelectedIndex(index)
    const label = displaySignPhrase(pred.word, conversionLang)
    if (historyIdRef.current) {
      await updateHistoryItem(historyIdRef.current, { text: label, confidence: pred.confidence, status: 'success' })
      return
    }
    const entry = await addHistoryItem({
      type: 'sign-to-text',
      text: label,
      status: 'success',
      conversionLang,
      confidence: pred.confidence,
    })
    if (!mountedRef.current) return
    historyIdRef.current = entry.id
    setPhase('success')
    cueSuccess()
  }

  const startRecording = async () => {
    if (!landscapeRef.current) return
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

    discardRef.current = false
    setPredictions([])
    setSelectedIndex(0)
    setErrorMessage('')
    setSecondsLeft(RECORD_SECONDS)
    historyIdRef.current = null
    recordingRef.current = true
    setPhase('recording')
    cueRecordStart()

    try {
      await cameraRef.current.startRecording({
        fileType: 'mp4',
        videoCodec: 'h264',
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
      refreshPreview()
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
    else if (landscapeRef.current) await startRecording()
  }

  useEffect(() => {
    if (isLandscape || phase !== 'recording' || !recordingRef.current) return
    discardRef.current = true
    void stopRecording().then(() => {
      if (!mountedRef.current) return
      discardRef.current = false
      setPhase('idle')
    })
  }, [isLandscape, phase])

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
          : !isLandscape
            ? t('s2t.tiltToRecord')
            : t('s2t.tapToRecord')

  const busy = phase === 'processing'
  const showError = phase === 'error' || phase === 'denied' || phase === 'empty'
  const hasResult = predictions.length > 0 && (phase === 'success' || phase === 'uncertain')
  const compactCamera = phase === 'success' || phase === 'uncertain'
  const showTilt =
    !!device && hasPermission && phase !== 'denied' && !isLandscape && (phase === 'idle' || phase === 'error' || phase === 'empty' || phase === 'recording')
  const cameraHeight = compactCamera
    ? Math.round(Math.max(280, Math.min(windowH * 0.4, 380)))
    : Math.round(Math.max(420, Math.min(windowH * 0.58, 620)))

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }}
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
    >
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
            disabled={phase === 'recording'}
            style={[styles.flipBtn, phase === 'recording' && { opacity: 0.4 }]}
            accessibilityRole='button'
            accessibilityLabel={t('s2t.flip')}
            hitSlop={8}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>{t('s2t.flipShort')}</Text>
          </Pressable>
        </XStack>

        {showTips ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>{t('s2t.tipsTitle')}</Text>
            <Text style={styles.tipBody}>{t('s2t.tipsBody')}</Text>
            <View style={styles.vocabRow}>
              {SIGN_TO_TEXT_PHRASES.map((phrase) => (
                <View key={phrase.id} style={styles.vocabChip}>
                  <Text style={styles.vocabChipText} maxFontSizeMultiplier={1.2}>
                    {conversionLang === 'ur' ? phrase.ur : phrase.en}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => {
                setShowTips(false)
                void dismissS2tTips()
              }}
              style={styles.tipBtn}
              accessibilityRole='button'
              accessibilityLabel={t('s2t.tipsGotIt')}
            >
              <Text style={styles.tipBtnText}>{t('s2t.tipsGotIt')}</Text>
            </Pressable>
          </View>
        ) : null}

        <View
          style={[styles.cameraWrap, { height: cameraHeight }]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout
            setPreviewSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }))
          }}
        >
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
              <Camera
                key={`${cameraPosition}-${sessionKey}`}
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                fps={format && format.minFps <= 30 && format.maxFps >= 30 ? 30 : undefined}
                video
                audio={false}
                isActive={isFocused && hasPermission && phase !== 'denied'}
                resizeMode='cover'
                outputOrientation='device'
                isMirrored={false}
                videoBitRate='high'
                enableBufferCompression={false}
                lowLightBoost={!!device.supportsLowLightBoost}
                androidPreviewViewType='texture-view'
                zoom={device.neutralZoom}
                onOutputOrientationChanged={setDeviceHold}
              />
              {showTilt ? <TiltPrompt /> : null}
              {guide && !compactCamera && !showTilt ? (
                <View pointerEvents='none' style={[styles.guideBox, guide]}>
                  <View style={[styles.guideCorner, styles.guideTL]} />
                  <View style={[styles.guideCorner, styles.guideTR]} />
                  <View style={[styles.guideCorner, styles.guideBL]} />
                  <View style={[styles.guideCorner, styles.guideBR]} />
                </View>
              ) : null}
              {!compactCamera && !showTilt ? (
                <Text style={styles.guideHint} maxFontSizeMultiplier={1.2}>
                  {t('s2t.frameHint')}
                </Text>
              ) : null}
              {phase === 'recording' ? (
                <View style={styles.recBadge} accessibilityLiveRegion='polite'>
                  <View style={styles.recDot} />
                  <Text style={styles.recText}>REC 0:{String(secondsLeft).padStart(2, '0')}</Text>
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

        {hasResult ? (
          <PredictionResult
            predictions={predictions}
            selectedIndex={selectedIndex}
            conversionLang={conversionLang}
            onSelect={(i) => void choosePrediction(i)}
          />
        ) : phase !== 'processing' && !showError ? (
          <View style={styles.outputCard}>
            <Text style={styles.outputLabel}>{t('s2t.detected')}</Text>
            <Text style={styles.outputPlaceholder}>{t('s2t.emptyHint')}</Text>
          </View>
        ) : null}

        {phase === 'uncertain' ? (
          <Text style={[styles.screenSub, { marginHorizontal: 24, marginTop: 8 }]}>{t('s2t.uncertainBody')}</Text>
        ) : null}

        <XStack px='$5' pb='$3' gap='$3' ai='center' jc='center' mt='$2'>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={() => void toggleRecording()}
              disabled={busy || !hasPermission || !device || !isLandscape}
              accessibilityRole='button'
              accessibilityLabel={statusLabel}
              accessibilityState={{ busy, disabled: busy }}
              style={[styles.recordBtn, phase === 'recording' && styles.recordBtnActive, (busy || !isLandscape) && { opacity: 0.4 }]}
            >
              <View style={[styles.recordInner, phase === 'recording' && styles.recordInnerActive]} />
            </Pressable>
          </Animated.View>
        </XStack>
        <Text style={[styles.micStatus, (phase === 'recording' || phase === 'processing') && { color: colors.primary }]}>{statusLabel}</Text>

        <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}>
          {phase === 'error' || phase === 'empty' || phase === 'uncertain' ? (
            <Pressable onPress={() => void retry()} style={styles.textAction} accessibilityRole='button'>
              <Text style={styles.textActionLabel}>{t('common.retry')}</Text>
            </Pressable>
          ) : null}
          {phase === 'success' ? (
            <Pressable
              onPress={() => {
                setPredictions([])
                setSelectedIndex(0)
                setErrorMessage('')
                historyIdRef.current = null
                setPhase('idle')
              }}
              style={styles.textAction}
              accessibilityRole='button'
            >
              <Text style={styles.textActionLabel}>{t('s2t.another')}</Text>
            </Pressable>
          ) : null}
          <GlassButton label={t('s2t.returnHome')} onPress={onFinish} />
        </View>
      </YStack>
    </ScrollView>
  )
}

export default CameraStep
