import 'react-native-gesture-handler'
import { NavigationContainer, Theme as NavigationTheme, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useEffect, useMemo } from 'react'
import { I18nManager, StatusBar, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TamaguiProvider, Theme } from 'tamagui'

import TabNavigator from './src/components/layouts/CustomTabBar/TabNavigator'
import { configureGoogleSignIn } from './src/config/googleAuth'
import { AuthUserProvider } from './src/context/AuthUser'
import { LanguageProvider, useLanguage } from './src/context/Language'
import { LoaderProvider } from './src/context/Loader'
import { PreferencesProvider } from './src/context/Preferences'
import { ThemeProvider, useAppTheme } from './src/context/Theme'
import ForgotPasswordScreen from './src/screens/Auth/ForgotPassword'
import LoginScreen from './src/screens/Auth/Login'
import SignupScreen from './src/screens/Auth/Signup'
import AppTutorialScreen from './src/screens/AppTutorial'
import OnboardingScreen from './src/screens/Onboarding'
import SignToTextScreen from './src/screens/SignToText'
import SpeechToSignScreen from './src/screens/SpeechToSign'
import SpeechToTextScreen from './src/screens/SpeechToText'
import SplashScreen from './src/screens/Splash'
import { darkColors } from './src/theme/colors'
import type { RootStackParamList } from './src/types/navigation'
import config from './tamagui.config'

// Keep native layout LTR. RTL is applied in JS so tab screens do not collapse.
I18nManager.allowRTL(false)
I18nManager.forceRTL(false)

const Stack = createNativeStackNavigator<RootStackParamList>()

const navFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  heavy: { fontFamily: 'System', fontWeight: '800' as const },
}

function AppNavigator() {
  const { colors, isDark, isReady } = useAppTheme()
  const { isRTL } = useLanguage()

  useEffect(() => {
    configureGoogleSignIn()
  }, [])

  const navTheme: NavigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      dark: isDark,
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.surfaceElevated,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.primary,
        notification: colors.primary,
      },
      fonts: navFonts,
    }),
    [colors, isDark],
  )

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: darkColors.background }} />
  }

  return (
    <Theme name={isDark ? 'dark' : 'light'}>
      <NavigationContainer theme={navTheme}>
        <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} animated />
        <Stack.Navigator
          initialRouteName='Splash'
          screenOptions={{
            headerShown: false,
            animation: isRTL ? 'slide_from_left' : 'slide_from_right',
            gestureEnabled: true,
            contentStyle: { backgroundColor: colors.background },
            freezeOnBlur: true,
          }}
        >
          <Stack.Screen name='Splash' component={SplashScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name='Onboarding' component={OnboardingScreen} />
          <Stack.Screen name='Login' component={LoginScreen} />
          <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen} />
          <Stack.Screen name='SignupScreen' component={SignupScreen} />
          <Stack.Screen name='AppTutorial' component={AppTutorialScreen} options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name='MainTabs' component={TabNavigator} options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name='SignToTextScreen' component={SignToTextScreen} />
          <Stack.Screen name='SpeechToTextScreen' component={SpeechToTextScreen} />
          <Stack.Screen name='SpeechToSignScreen' component={SpeechToSignScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Theme>
  )
}

function App() {
  return (
    <TamaguiProvider config={config} defaultTheme='dark'>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <PreferencesProvider>
              <AuthUserProvider>
                <LoaderProvider>
                  <AppNavigator />
                </LoaderProvider>
              </AuthUserProvider>
            </PreferencesProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  )
}

export default App
