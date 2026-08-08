import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AudioLines, HandMetal, Mic } from '@tamagui/lucide-icons-2'
import React, { useCallback, useRef, useState, type ComponentType } from 'react'
import { Animated, FlatList, Pressable, useWindowDimensions } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import Screen from '../../components/layouts/Screen'
import { useAppTheme } from '../../context/Theme'
import { RootStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as new () => FlatList<Slide>)

type IconComponent = ComponentType<{ size?: number; color?: string }>

interface Slide {
  key: string
  tag: string
  title: string
  Icon: IconComponent
  description: string
}

const OnboardingScreen = ({ navigation }: Props) => {
  const { colors } = useAppTheme()
  const [activeIndex, setActiveIndex] = useState(0)
  const { width } = useWindowDimensions()
  const listRef = useRef<FlatList<Slide> | null>(null)
  const scrollX = useRef(new Animated.Value(0)).current

  const ringPulse = useRef(new Animated.Value(0.85)).current
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.0, duration: 2200, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0.85, duration: 2200, useNativeDriver: true }),
      ]),
    ).start()
  }, [ringPulse])

  const handleSkip = useCallback(() => {
    navigation.replace('Login')
  }, [navigation])

  const handleNext = useCallback(() => {
    if (activeIndex === slideData.length - 1) {
      navigation.replace('Login')
      return
    }
    const nextIndex = activeIndex + 1
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true })
    setActiveIndex(nextIndex)
  }, [activeIndex, navigation])

  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width)
      setActiveIndex(index)
    },
    [width],
  )

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.35, 1, 0.35],
      extrapolate: 'clamp',
    })

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp',
    })

    return (
      <Animated.View
        style={{
          width,
          opacity,
          transform: [{ translateY }],
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 36,
          paddingBottom: 16,
        }}
      >
        <View
          width={84}
          height={84}
          borderRadius={42}
          backgroundColor={colors.primaryMuted}
          borderWidth={1.5}
          borderColor={colors.primaryBorderStrong}
          alignItems='center'
          justifyContent='center'
          marginBottom='$5'
          style={{
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 18,
          }}
        >
          <item.Icon size={34} color={colors.primary} />
        </View>

        <YStack ai='center' gap='$2'>
          <Text fontSize={10} letterSpacing={3} color={colors.primary} opacity={0.8} style={{ textTransform: 'uppercase', fontWeight: '400' }}>
            {item.tag}
          </Text>

          <Text
            fontSize={28}
            fontWeight='900'
            color={colors.textPrimary}
            textAlign='center'
            letterSpacing={0.5}
            style={{
              textShadowColor: colors.primaryBorder,
              textShadowRadius: 20,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            {item.title}
          </Text>

          <View width={36} height={1} backgroundColor={colors.primaryBorderStrong} my='$1' />

          <Text fontSize={13} color={colors.textFaint} textAlign='center' lineHeight={22} maxWidth={260} fontWeight='300'>
            {item.description}
          </Text>
        </YStack>
      </Animated.View>
    )
  }

  return (
    <Screen padded={false}>
      <View
        position='absolute'
        width={360}
        height={360}
        borderRadius={180}
        top='10%'
        left='50%'
        style={{
          marginLeft: -180,
          backgroundColor: 'transparent',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 90,
        }}
      />

      <Animated.View
        style={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: 120,
          borderWidth: 1,
          borderColor: colors.primarySoft,
          top: '38%',
          left: '50%',
          marginLeft: -120,
          marginTop: -120,
          transform: [{ scale: ringPulse }],
        }}
      />
      <View
        position='absolute'
        width={360}
        height={360}
        borderRadius={180}
        borderWidth={1}
        borderColor={colors.primaryRing}
        top='38%'
        left='50%'
        style={{ marginLeft: -180, marginTop: -180 }}
      />

      <XStack jc='flex-end' px='$5' pt='$5' pb='$2'>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text fontSize={10} letterSpacing={2} color={colors.textMuted} style={{ textTransform: 'uppercase' }}>
            Skip
          </Text>
        </Pressable>
      </XStack>

      <AnimatedFlatList
        ref={listRef}
        // @ts-expect-error
        data={slideData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate='fast'
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.key}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
      />

      <XStack jc='space-between' ai='center' px='$6' pb='$7' pt='$3'>
        <XStack gap='$2' ai='center'>
          {slideData.map((_, index) => (
            <View
              key={index}
              height={4}
              borderRadius={2}
              backgroundColor={index === activeIndex ? colors.primary : colors.primarySoft}
              style={{
                width: index === activeIndex ? 24 : 8,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </XStack>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primarySoft : colors.primaryMuted,
            borderWidth: 1,
            borderColor: colors.primaryBorderStrong,
            borderRadius: 999,
            paddingHorizontal: 22,
            paddingVertical: 10,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          })}
        >
          <Text fontSize={11} fontWeight='700' letterSpacing={1.5} color={colors.primary} style={{ textTransform: 'uppercase' }}>
            {activeIndex === slideData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </XStack>
    </Screen>
  )
}

const slideData: Slide[] = [
  {
    key: 'sign-to-text',
    tag: 'Feature 01',
    title: 'Sign to Text',
    Icon: HandMetal,
    description: 'Instantly translate sign language gestures into text using advanced camera recognition technology.',
  },
  {
    key: 'speech-to-sign',
    tag: 'Feature 02',
    title: 'Speech to Sign',
    Icon: AudioLines,
    description: 'Convert spoken words into animated sign visuals in real time for seamless communication.',
  },
  {
    key: 'speech-to-text',
    tag: 'Feature 03',
    title: 'Speech to Text',
    Icon: Mic,
    description: 'Transform spoken Urdu and English speech into clear, accurate readable text instantly.',
  },
]

export default OnboardingScreen
