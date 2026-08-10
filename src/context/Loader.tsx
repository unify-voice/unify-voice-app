import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { YStack, Spinner } from 'tamagui'

import { useAppTheme } from './Theme'

type LoaderContextType = {
  show: () => void
  hide: () => void
}

const LoaderContext = createContext<LoaderContextType>({
  show: () => {},
  hide: () => {},
})

/** Global blocking spinner show/hide. */
export const useLoader = () => useContext(LoaderContext)

/** Full-screen animated loader overlay controlled via `useLoader`. */
export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false)
  const { colors } = useAppTheme()

  // Fix: useRef to avoid Animated.Value recreation
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.9)).current

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
        }),
      ]).start()
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Optionally reset scale for next show
        scale.setValue(0.9)
      })
    }
  }, [visible, opacity, scale])

  return (
    <LoaderContext.Provider value={{ show, hide }}>
      {children}

      {visible && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.overlay,
            opacity,
            zIndex: 999,
          }}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          <Animated.View
            style={{
              transform: [{ scale }],
            }}
          >
            <YStack bg={colors.surfaceElevated} p='$5' br='$6' ai='center' jc='center' borderWidth={1} borderColor={colors.divider} gap='$3'>
              <Spinner size='large' color={colors.primary} />
            </YStack>
          </Animated.View>
        </Animated.View>
      )}
    </LoaderContext.Provider>
  )
}
