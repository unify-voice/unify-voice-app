import { Check, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2'
import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, Mask, Rect } from 'react-native-svg'
import { Text } from 'tamagui'

import { useLanguage } from '../context/Language'
import { usePreferences } from '../context/Preferences'
import { useAppTheme } from '../context/Theme'
import { useOptionalTour } from '../context/Tour'
import type { AppLanguage } from '../i18n/translations'
import { TOUR_STEPS } from '../tour/steps'

const PAD = 10
const RADIUS = 18
const CARD_BG = 'rgba(16, 20, 28, 0.96)'

const TourOverlay = () => {
  const tour = useOptionalTour()
  const { t } = useLanguage()
  const { colors } = useAppTheme()
  const { conversionLang, setConversionLang } = usePreferences()
  const insets = useSafeAreaInsets()
  const pulse = useRef(new Animated.Value(0)).current
  const cardAnim = useRef(new Animated.Value(1)).current

  const active = !!tour?.active
  const stepIndex = tour?.stepIndex ?? 0

  useEffect(() => {
    if (!active) return undefined
    pulse.setValue(0)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [active, pulse])

  useEffect(() => {
    if (!active) return
    cardAnim.setValue(0)
    Animated.spring(cardAnim, { toValue: 1, friction: 8, tension: 76, useNativeDriver: true }).start()
  }, [active, stepIndex, cardAnim])

  const layout = useMemo(() => {
    const { width: sw, height: sh } = Dimensions.get('window')
    const hole = tour?.hole
    const hasHole = !!(hole && hole.width > 2 && hole.height > 2)
    const hx = hasHole ? Math.max(10, hole.x - PAD) : 0
    const hy = hasHole ? Math.max(insets.top + 6, hole.y - PAD) : 0
    const hw = hasHole ? Math.min(sw - hx - 10, hole.width + PAD * 2) : 0
    const hh = hasHole ? hole.height + PAD * 2 : 0
    const step = TOUR_STEPS[stepIndex]
    const cardH = step?.showLangPicker ? 286 : 208
    const tooltipWidth = Math.min(328, sw - 32)
    const holeCenterY = hasHole ? hy + hh / 2 : sh / 2
    const holeCenterX = hasHole ? hx + hw / 2 : sw / 2
    let tooltipBelow = holeCenterY < sh * 0.5
    if (hasHole && tooltipBelow && hy + hh + 24 + cardH > sh - insets.bottom - 20) tooltipBelow = false
    if (hasHole && !tooltipBelow && hy - 24 - cardH < insets.top + 48) tooltipBelow = true

    let tooltipLeft = holeCenterX - tooltipWidth / 2
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, sw - tooltipWidth - 16))

    const tooltipTop = hasHole
      ? tooltipBelow
        ? Math.min(hy + hh + 22, sh - cardH - insets.bottom - 16)
        : Math.max(insets.top + 52, hy - cardH - 22)
      : Math.max(insets.top + 96, sh * 0.28)

    const caretLeft = Math.max(22, Math.min(holeCenterX - tooltipLeft - 8, tooltipWidth - 38))

    return { sw, sh, hasHole, hx, hy, hw, hh, tooltipWidth, tooltipLeft, tooltipTop, tooltipBelow, caretLeft, step }
  }, [tour?.hole, stepIndex, insets.top, insets.bottom])

  if (!tour?.active || !layout.step) return null

  const { sw, sh, hasHole, hx, hy, hw, hh, tooltipWidth, tooltipLeft, tooltipTop, tooltipBelow, caretLeft, step } = layout
  const isLast = stepIndex >= TOUR_STEPS.length - 1

  return (
    <Modal visible transparent animationType='fade' statusBarTranslucent>
      <View style={styles.root}>
        <Svg width={sw} height={sh} style={StyleSheet.absoluteFill} pointerEvents='none'>
          <Defs>
            <Mask id='tourHole'>
              <Rect x={0} y={0} width={sw} height={sh} fill='#fff' />
              {hasHole ? <Rect x={hx} y={hy} width={hw} height={hh} rx={RADIUS} ry={RADIUS} fill='#000' /> : null}
            </Mask>
          </Defs>
          <Rect x={0} y={0} width={sw} height={sh} fill='rgba(4, 8, 14, 0.82)' mask='url(#tourHole)' />
        </Svg>

        {hasHole ? (
          <>
            <Animated.View
              pointerEvents='none'
              style={{
                position: 'absolute',
                top: hy - 10,
                left: hx - 10,
                width: hw + 20,
                height: hh + 20,
                borderRadius: RADIUS + 10,
                borderWidth: 1.5,
                borderColor: colors.primary,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] }) }],
              }}
            />
            <View
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
                shadowColor: colors.primary,
                shadowOpacity: 0.65,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
              }}
            />
          </>
        ) : null}

        <Pressable
          onPress={() => tour.skip()}
          style={[styles.skip, { top: insets.top + 12 }]}
          accessibilityRole='button'
          accessibilityLabel={t('tutorial.skip')}
        >
          <Text style={styles.skipText}>{t('tutorial.skip')}</Text>
        </Pressable>

        <View style={[styles.dotsWrap, { top: insets.top + 20 }]}>
          {TOUR_STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === stepIndex && [styles.dotActive, { backgroundColor: colors.primary }]]} />
          ))}
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              top: tooltipTop,
              left: tooltipLeft,
              width: tooltipWidth,
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: tooltipBelow ? [16, 0] : [-16, 0],
                  }),
                },
                { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
              ],
            },
          ]}
        >
          {hasHole ? (
            <View
              style={[
                styles.caret,
                tooltipBelow ? { top: -7 } : { bottom: -7 },
                { left: caretLeft, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: CARD_BG },
              ]}
            />
          ) : null}

          <View style={styles.cardHeader}>
            <View style={[styles.stepBadge, { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.stepBadgeText, { color: colors.primary }]}>
                {String(stepIndex + 1).padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.stepMeta}>
              {t('tutorial.counter').replace('{current}', String(stepIndex + 1)).replace('{total}', String(TOUR_STEPS.length))}
            </Text>
          </View>

          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            {t(step.titleKey)}
          </Text>
          <Text style={styles.body} maxFontSizeMultiplier={1.2}>
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
                    style={[styles.langPill, selected && { borderColor: colors.primary, backgroundColor: 'rgba(34,197,94,0.16)' }]}
                    accessibilityRole='button'
                    accessibilityState={{ selected }}
                  >
                    {selected ? <Check size={14} color={colors.primary} /> : null}
                    <Text style={[styles.langPillText, selected && { color: colors.primary }]}>
                      {lang === 'en' ? t('lang.english') : t('lang.urdu')}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ) : null}

          <View style={styles.actions}>
            {stepIndex > 0 ? (
              <Pressable
                onPress={() => tour.back()}
                style={styles.backBtn}
                accessibilityRole='button'
              >
                <ChevronLeft size={16} color='rgba(255,255,255,0.75)' />
                <Text style={styles.backText}>{t('tutorial.back')}</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              onPress={() => tour.next()}
              style={[styles.next, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              accessibilityRole='button'
              accessibilityLabel={isLast ? t('tutorial.finish') : t('tutorial.next')}
            >
              <Text style={[styles.nextText, { color: colors.textOnPrimary }]}>{isLast ? t('tutorial.finish') : t('tutorial.next')}</Text>
              {!isLast ? <ChevronRight size={16} color={colors.textOnPrimary} /> : null}
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
  skip: {
    position: 'absolute',
    right: 16,
    zIndex: 5,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dotsWrap: {
    position: 'absolute',
    left: 0,
    right: 80,
    zIndex: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    pointerEvents: 'none',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dotActive: {
    width: 18,
    borderRadius: 4,
  },
  card: {
    position: 'absolute',
    zIndex: 6,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  caret: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  stepBadge: {
    minWidth: 36,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  stepMeta: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  body: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  langPill: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  langPillText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  backBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  next: {
    flex: 1.15,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '800',
  },
})

export default TourOverlay
