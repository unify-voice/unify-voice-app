import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'
import { Text } from 'tamagui'

import { useLanguage } from '../../../context/Language'
import { useAppTheme } from '../../../context/Theme'
import { useThemedStyles } from '../../../theme'

import { createStyles } from '../styles.module'

const TiltPrompt = () => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { t } = useLanguage()
  const tilt = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(tilt, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.delay(280),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [tilt])

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] })

  return (
    <View style={styles.tiltOverlay} pointerEvents='auto'>
      <Animated.View style={[styles.tiltPhone, { transform: [{ rotate }] }]}>
        <View style={styles.tiltPhoneScreen} />
        <View style={styles.tiltPhoneBar} />
      </Animated.View>
      <Text style={[styles.tiltTitle, { color: colors.primary }]} maxFontSizeMultiplier={1.2}>
        {t('s2t.tiltTitle')}
      </Text>
      <Text style={styles.tiltBody} maxFontSizeMultiplier={1.25}>
        {t('s2t.tiltBody')}
      </Text>
    </View>
  )
}

export default TiltPrompt
