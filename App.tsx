import 'react-native-gesture-handler'
import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import React from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TamaguiProvider } from 'tamagui'

import TabNavigator from './src/components/layouts/CustomTabBar/TabNavigator'
import { LoaderProvider } from './src/context/Loader'
import ForgotPasswordScreen from './src/screens/Auth/ForgotPassword'
import LoginScreen from './src/screens/Auth/Login'
import SignupScreen from './src/screens/Auth/Signup'
import OnboardingScreen from './src/screens/Onboarding'
import SignToTextScreen from './src/screens/SignToText'
import SpeechToSignScreen from './src/screens/SpeechToSign'
import SpeechToTextScreen from './src/screens/SpeechToText'
import SplashScreen from './src/screens/Splash'
import { colors } from './src/theme'
import type { RootStackParamList } from './src/types/navigation'
import config from './tamagui.config'

const Stack = createStackNavigator<RootStackParamList>()

function App() {
  const isDarkMode = useColorScheme() === 'dark'

  const navTheme: NavigationTheme = {
    dark: true,
    colors: {
      background: '#161616',
      card: '#161616',
      text: '#ECFDF5',
      border: '#374151',
      primary: '#22C55E',
      notification: '#22C55E',
    },
    fonts: {
      regular: {
        fontFamily: 'var(--font-poppins), sans-serif',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'var(--font-poppins), sans-serif',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'var(--font-poppins), sans-serif',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'var(--font-poppins), sans-serif',
        fontWeight: '800',
      },
    },
  }

  return (
    <TamaguiProvider config={config} defaultTheme='dark'>
      <SafeAreaProvider>
        <LoaderProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar backgroundColor={colors.background} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Stack.Navigator
              initialRouteName='Splash'
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                cardStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name='Splash' component={SplashScreen} />
              <Stack.Screen name='Onboarding' component={OnboardingScreen} />
              <Stack.Screen name='Login' component={LoginScreen} />
              <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen} />
              <Stack.Screen name='SignupScreen' component={SignupScreen} />

              <Stack.Screen name='MainTabs' component={TabNavigator} />

              {/* Features */}
              <Stack.Screen name='SignToTextScreen' component={SignToTextScreen} />
              <Stack.Screen name='SpeechToTextScreen' component={SpeechToTextScreen} />
              <Stack.Screen name='SpeechToSignScreen' component={SpeechToSignScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </LoaderProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  )
}

export default App
