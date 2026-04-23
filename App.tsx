import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SignupScreen from './src/screens/SignupScreen';
import CameraPermissionScreen from './src/screens/CameraPermissionScreen';
import CameraScreen from './src/screens/CameraScreen';
import SpeechToSignScreen from './src/screens/SpeechToSignScreen';
import SpeechToTextScreen from './src/screens/SpeechToTextScreen';
import type { RootStackParamList } from './src/types/navigation';
import { COLORS } from './src/theme';

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="CameraPermissionScreen" component={CameraPermissionScreen} />
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
          <Stack.Screen name="SpeechToSignScreen" component={SpeechToSignScreen} />
          <Stack.Screen name="SpeechToTextScreen" component={SpeechToTextScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
  