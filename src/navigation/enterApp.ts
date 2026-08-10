/** Replaces the auth stack with MainTabs after a successful sign-in. */
export async function enterAppAfterAuth(navigation: { replace: any }, _uid?: string | null) {
  navigation.replace('MainTabs', { screen: 'HomeScreen' })
}
