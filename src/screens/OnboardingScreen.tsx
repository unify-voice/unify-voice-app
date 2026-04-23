import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

type Props = {
  navigation: OnboardingNavigationProp;
};

type Slide = {
  key: string;
  title: string;
  description: string;
  accent: string;
};

const slideData: Slide[] = [
  {
    key: 'sign-to-text',
    title: 'Sign to Text',
    description:
      'Instantly translate sign language gestures into text using advanced camera recognition technology.',
    accent: '#1FB34B',
  },
  {
    key: 'speech-to-sign',
    title: 'Speech to Sign',
    description:
      'Convert spoken words into animated sign visuals in real time for seamless communication.',
    accent: '#29D674',
  },
  {
    key: 'speech-to-text',
    title: 'Speech to Text',
    description:
      'Transform spoken Urdu and English speech into clear, accurate readable text instantly.',
    accent: '#0CB64B',
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as new () => FlatList<Slide>);

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide> | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSkip = useCallback(() => {
    navigation.replace('Login');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (activeIndex === slideData.length - 1) {
      navigation.replace('Login');
      return;
    }
    const nextIndex = activeIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  }, [activeIndex, navigation]);

  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width],
  );

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [24, 0, 24],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.slide,
          { width, opacity, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.heroArea}>
          <View style={[styles.logoShell, { borderColor: item.accent }]}> 
            <Text style={styles.logoText}>UV</Text>
          </View>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backgroundDot} />
        <View style={styles.backgroundCurve} />
        <View style={styles.headerRow}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <AnimatedFlatList
          ref={listRef}
          data={slideData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          contentContainerStyle={styles.flatListContent}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slideData.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          <Pressable style={styles.actionButton} onPress={handleNext}>
            <Text style={styles.actionButtonText}>
              {activeIndex === slideData.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  backgroundDot: {
    position: 'absolute',
    top: 80,
    left: 20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1FB34B',
    opacity: 0.06,
  },
  backgroundCurve: {
    position: 'absolute',
    bottom: 160,
    right: 10,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: '#1FB34B',
    opacity: 0.07,
  },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: 50,
    paddingHorizontal: 8,
  },
  skipText: {
    color: '#1FB34B',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  flatListContent: {
    flexGrow: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  heroArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoShell: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    borderColor: '#1FB34B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#1FB34B',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 6,
  },
  textArea: {
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    color: '#1FB34B',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 14,
    letterSpacing: 0.8,
  },
  description: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#1FB34B',
    width: 14,
    height: 14,
  },
  inactiveDot: {
    backgroundColor: '#CCCCCC',
  },
  actionButton: {
    backgroundColor: '#1FB34B',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default OnboardingScreen;
