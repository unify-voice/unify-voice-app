import { Check, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, Mask, Rect } from 'react-native-svg'
import { Text } from 'tamagui'

import { useLanguage } from '../context/Language'
import { usePreferences } from '../context/Preferences'
import { useAppTheme } from '../context/Theme'
import { useOptionalTour } from '../context/Tour'
import type { AppLanguage } from '../i18n/translations'
import { TOUR_STEPS } from '../tour/steps'
import { directionStyle } from '../utils/rtl'

const PAD = 8
const RADIUS = 20

const TourOverlay = () => {
  const tour = useOptionalTour()
  const { t, isRTL } = useLanguage()
  const { colors, isDark } = useAppTheme()
  const { conversionLang, setConversionLang } = usePreferences()
  const insets = useSafeAreaInsets()
  const pulse = useRef(new Animated.Value(0)).current
  const fade = useRef(new Animated.Value(1)).current
  const overlayRef = useRef<View>(null)
  const [frame, setFrame] = useState({ x: 0, y: 0, w: 0, h: 0 })

  const active = !!tour?.active
  const stepIndex = tour?.stepIndex ?? 0

  const syncFrame = useCallback(() => {
    overlayRef.current?.measureInWindow((x, y, w, h) => {
      if (w < 2 || h < 2) return
      setFrame((prev) => (prev.x === x && prev.y === y && prev.w === w && prev.h === h ? prev : { x, y, w, h }))
    })
  }, [])

  useEffect(() => {
    if (!active) return undefined
    pulse.setValue(0)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [active, pulse])

  useEffect(() => {
    if (!active) return
    fade.setValue(0)
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start()
    const t = setTimeout(syncFrame, Platform.OS === 'android' ? 50 : 0)
    return () => clearTimeout(t)
  }, [active, stepIndex, fade, syncFrame])

  const layout = useMemo(() => {
    const sw = frame.w || 1
    const sh = frame.h || 1
    const hole = tour?.hole
    const hasHole = !!(hole && hole.width > 2 && hole.height > 2)
    const hx = hasHole ? Math.max(6, hole.x - frame.x - PAD) : 0
    const hy = hasHole ? Math.max(6, hole.y - frame.y - PAD) : 0
    const hw = hasHole ? Math.min(sw - hx - 6, hole.width + PAD * 2) : 0
    const hh = hasHole ? hole.height + PAD * 2 : 0
    const holeMid = hasHole ? hy + hh / 2 : 0
    const dockTop = hasHole && holeMid > sh * 0.48
    const step = TOUR_STEPS[stepIndex]
    return { sw, sh, hasHole, hx, hy, hw, hh, dockTop, step }
  }, [tour?.hole, stepIndex, frame])

  if (!tour?.active || !layout.step) return null

  const { sw, sh, hasHole, hx, hy, hw, hh, dockTop, step } = layout
  const isLast = stepIndex >= TOUR_STEPS.length - 1

  return (
    <Modal visible transparent animationType='fade' onShow={syncFrame}>
      <View ref={overlayRef} style={[styles.root, directionStyle(isRTL)]} onLayout={syncFrame}>
        {sw > 1 ? (
          <Svg width={sw} height={sh} style={StyleSheet.absoluteFill} pointerEvents='none'>
            <Defs>
              <Mask id='tourHole'>
                <Rect x={0} y={0} width={sw} height={sh} fill='#fff' />
                {hasHole ? <Rect x={hx} y={hy} width={hw} height={hh} rx={RADIUS} ry={RADIUS} fill='#000' /> : null}
              </Mask>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={sw}
              height={sh}
              fill={isDark ? 'rgba(8, 12, 10, 0.62)' : 'rgba(17, 24, 19, 0.42)'}
              mask='url(#tourHole)'
            />
          </Svg>
        ) : null}

        {hasHole ? (
          <Animated.View
            pointerEvents='none'
            style={{
              position: 'absolute',
              top: hy,
              left: hx,
              width: hw,
              height: hh,
              borderRadius: RADIUS,
              borderWidth: 2,
              borderColor: colors.primary,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
            }}
          />
        ) : null}

        <Animated.View
          style={[
            styles.stage,
            {
              backgroundColor: colors.background,
              borderColor: colors.glassBorder,
              opacity: fade,
            },
            dockTop
              ? { top: 0, paddingTop: Math.max(insets.top, 12) + 8, borderBottomWidth: 1 }
              : { bottom: 0, paddingBottom: Math.max(insets.bottom, 16) + 8, borderTopWidth: 1 },
          ]}
        >
          <View style={styles.topRow}>
            <Text style={[styles.counter, { color: colors.textMuted }]} maxFontSizeMultiplier={1.2}>
              {t('tutorial.counter').replace('{current}', String(stepIndex + 1)).replace('{total}', String(TOUR_STEPS.length))}
            </Text>
            <Pressable onPress={() => tour.skip()} style={styles.skipRow} hitSlop={8} accessibilityRole='button'>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>{t('tutorial.skip')}</Text>
            </Pressable>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]} maxFontSizeMultiplier={1.2}>
            {t(step.titleKey)}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
            {t(step.bodyKey)}
          </Text>

          {step.showLangPicker ? (
            <View style={styles.langRow}>
              {(['en', 'ur'] as AppLanguage[]).map((lang) => {
                const selected = conversionLang === lang
                return (
                  <Pressable
                    key={lang}
                    onPress={() => void setConversionLang(lang)}
                    style={[styles.langChip, { backgroundColor: colors.clay }, selected && { backgroundColor: colors.primary }]}
                    accessibilityRole='button'
                    accessibilityState={{ selected }}
                  >
                    {selected ? <Check size={14} color={colors.textOnPrimary} /> : null}
                    <Text style={[styles.langChipText, { color: colors.textPrimary }, selected && { color: colors.textOnPrimary }]}>
                      {lang === 'en' ? t('lang.english') : t('lang.urdu')}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ) : null}

          <View style={styles.actions}>
            {stepIndex > 0 ? (
              <Pressable onPress={() => tour.back()} style={styles.backHit} accessibilityRole='button'>
                <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                  <ChevronLeft size={18} color={colors.textSecondary} />
                </View>
                <Text style={[styles.backText, { color: colors.textSecondary }]}>{t('tutorial.back')}</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              onPress={() => tour.next()}
              style={[styles.next, { backgroundColor: colors.primary }]}
              accessibilityRole='button'
              accessibilityLabel={isLast ? t('tutorial.finish') : t('tutorial.next')}
            >
              <Text style={[styles.nextText, { color: colors.textOnPrimary }]}>
                {isLast ? t('tutorial.finish') : t('tutorial.next')}
              </Text>
              {!isLast ? (
                <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                  <ChevronRight size={16} color={colors.textOnPrimary} />
                </View>
              ) : null}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stage: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 6,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  skipRow: {
    minHeight: 36,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  langChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backHit: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  next: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '800',
  },
})

export default TourOverlay
