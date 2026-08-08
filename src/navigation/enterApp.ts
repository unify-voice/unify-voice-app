import { hasCompletedTutorial } from '../services/tutorial'

export async function enterAppAfterAuth(navigation: { replace: any }, uid?: string | null) {
  try {
    if (uid && !(await hasCompletedTutorial(uid))) {
      navigation.replace('AppTutorial')
      return
    }
  } catch {
    // continue into the app if storage is unavailable
  }
  navigation.replace('MainTabs', { screen: 'HomeScreen' })
}
