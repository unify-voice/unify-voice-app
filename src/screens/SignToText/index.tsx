import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

import Screen from '../../components/layouts/Screen'
import { RootStackParamList } from '../../types/navigation'

import CameraStep from './components/Camera'
import { styles } from './styles.module'

type Props = NativeStackScreenProps<RootStackParamList, 'SignToTextScreen'>

const SignToTextScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.98)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  return (
    <Screen padded={false}>
      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <CameraStep onFinish={() => navigation.goBack()} />
      </Animated.View>
    </Screen>
  )
}

export default SignToTextScreen
