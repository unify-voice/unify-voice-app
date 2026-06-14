import { NavigatorScreenParams } from '@react-navigation/native'

import { TabParamList } from './tabs'

export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  Login: undefined
  HomeScreen: undefined
  ForgotPasswordScreen: undefined
  SignupScreen: undefined
  SignToTextScreen: undefined
  CameraPermissionScreen: undefined
  CameraScreen: undefined
  SpeechToSignScreen: undefined
  SpeechToTextScreen: undefined
  ProfileScreen: undefined
  MainTabs: NavigatorScreenParams<TabParamList>
}
