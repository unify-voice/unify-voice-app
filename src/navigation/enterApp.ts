export async function enterAppAfterAuth(navigation: { replace: any }, _uid?: string | null) {
  navigation.replace('MainTabs', { screen: 'HomeScreen' })
}
