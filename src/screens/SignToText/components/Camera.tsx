import { useIsFocused } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet, View, Alert } from 'react-native'
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera'
import { Text, XStack, YStack } from 'tamagui'

import { API_BASE_URLS } from '../../../../config'
import { useAppTheme } from '../../../context/Theme'
import { useThemedStyles } from '../../../theme'
import { createStyles } from '../styles.module'

// --------------------------------------------------------
// Types
// --------------------------------------------------------
type Prediction = {
  word: string
  confidence: number
}

// --------------------------------------------------------
// Component
// --------------------------------------------------------
const CameraStep = ({ onFinish }: { onFinish: () => void }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const isFocused = useIsFocused()
  const cameraRef = useRef<Camera>(null)

  // ------ Camera states ------
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // ------ Prediction states ------
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [detectedText, setDetectedText] = useState('')

  // ------ Animations ------
  const pulseAnim = useRef(new Animated.Value(1)).current

  const device = useCameraDevice(cameraPosition)
  const { hasPermission, requestPermission } = useCameraPermission()

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) requestPermission()
  }, [hasPermission, requestPermission])

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [isRecording, pulseAnim])

  // ---------------------------------------------------------------
  // Recording & Upload
  // ---------------------------------------------------------------
  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return
    setIsRecording(true)
    setPredictions([]) // clear old predictions

    try {
      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          // Video saved; upload continues below
          // Auto‑stop after 3 seconds -> handled by toggleRecording
          uploadVideo(video.path)
        },
        onRecordingError: (error) => {
          console.error(error)
          Alert.alert('Recording failed', error.message)
          setIsRecording(false)
        },
      })
    } catch (e) {
      console.error(e)
      setIsRecording(false)
    }
  }, [])

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current) return
    await cameraRef.current.stopRecording()
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
      // Automatically stop recording after 3 seconds
      setTimeout(() => {
        if (cameraRef.current) {
          stopRecording()
        }
      }, 8000)
    }
  }, [isRecording, startRecording, stopRecording])

  // ---------------------------------------------------------------
  // Upload video to Flask API
  // ---------------------------------------------------------------
  const uploadVideo = async (videoPath: string) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      const uri = videoPath.startsWith('file://') ? videoPath : `file://${videoPath}`
      formData.append('video', {
        uri,
        type: 'video/mp4',
        name: 'sign.mp4',
      })

      const response = await fetch(`${API_BASE_URLS.signToText}/predict`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        Alert.alert('Prediction error', data.error)
        return
      }

      // data.predictions: [{ word, confidence }, ...]
      const topWords = data.predictions.slice(0, 3)
      setPredictions(topWords)
      setDetectedText(topWords[0]?.word ?? '')
    } catch (error) {
      Alert.alert('Network error', 'Could not reach the server. Check your connection and firewall.')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  // ---------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------
  const handleSelectWord = (word: string) => {
    // You can build a sentence here if needed.
    // For now, we just display the selected word.
    setDetectedText((prev) => prev + ' ' + word)
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <YStack flex={1}>
      {/* Header */}
      <XStack px='$5' pt='$4' pb='$2' ai='center' jc='space-between'>
        <YStack>
          <Text style={styles.screenTitle}>Sign to Text</Text>
          <Text style={styles.screenSub}>Position your hands in frame</Text>
        </YStack>
        <Pressable onPress={() => setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))} style={styles.flipBtn}>
          <Text style={{ fontSize: 16 }}>🔄</Text>
        </Pressable>
      </XStack>

      {/* Camera view */}
      <View style={styles.cameraWrap}>
        {!hasPermission ? (
          <YStack flex={1} ai='center' jc='center' gap='$3'>
            <Text style={{ fontSize: 32 }}>📷</Text>
            <Text style={styles.cameraPlaceholderText}>Camera permission required</Text>
            <Pressable onPress={requestPermission} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Allow Camera</Text>
            </Pressable>
          </YStack>
        ) : device ? (
          <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={isFocused} video={true} audio={false} />
        ) : (
          <YStack flex={1} ai='center' jc='center'>
            <Text style={styles.cameraPlaceholderText}>Loading camera…</Text>
          </YStack>
        )}
      </View>

      {/* Output card */}
      <View style={styles.outputCard}>
        <Text style={styles.outputLabel}>{isUploading ? 'Analysing…' : 'Detected text'}</Text>
        {isUploading ? (
          <ActivityIndicator size='small' color={colors.successBright} style={{ marginTop: 8 }} />
        ) : (
          <>
            <Text style={[styles.outputText, !detectedText && { opacity: 0.25 }]}>{detectedText || 'Start signing to see output here…'}</Text>
            {/* Top‑3 predictions */}
            {predictions.length > 0 && (
              <XStack mt='$2' gap='$2' flexWrap='wrap'>
                {predictions.map((p, i) => (
                  <Pressable
                    key={p.word}
                    onPress={() => handleSelectWord(p.word)}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? colors.primarySoft : colors.primaryMuted,
                      borderRadius: 100,
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                    })}
                  >
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                      {i + 1}. {p.word} ({(p.confidence * 100).toFixed(0)}%)
                    </Text>
                  </Pressable>
                ))}
              </XStack>
            )}
          </>
        )}
      </View>

      {/* Record button */}
      <XStack px='$5' pb='$6' gap='$3' ai='center' jc='center' mt='$2'>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable onPress={toggleRecording} style={[styles.recordBtn, isRecording && styles.recordBtnActive]}>
            <View style={[styles.recordInner, isRecording && styles.recordInnerActive]} />
          </Pressable>
        </Animated.View>
        {isRecording && <Text style={{ color: colors.errorText, fontWeight: '600' }}>Recording…</Text>}
        {isUploading && <Text style={{ color: colors.warning, fontWeight: '600' }}>Uploading…</Text>}
      </XStack>

      {/* Finish button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <Pressable onPress={onFinish} style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: colors.primarySoft }]}>
          <Text style={styles.primaryBtnText}>Finish</Text>
        </Pressable>
      </View>
    </YStack>
  )
}

export default CameraStep
