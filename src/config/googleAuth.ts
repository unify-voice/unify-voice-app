import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Platform } from 'react-native'

/** Web client ID (client_type 3) from google-services.json — required for Firebase ID tokens */
const WEB_CLIENT_ID = '146793157600-qkdgh6hd4cjui3q79osojdfbhrla26o3.apps.googleusercontent.com'

let configured = false

export function configureGoogleSignIn() {
  if (configured) return
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  })
  configured = true
}

export async function signInWithGoogle() {
  configureGoogleSignIn()

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  }

  const userInfo = await GoogleSignin.signIn()
  const idToken = userInfo.data?.idToken
  if (!idToken) throw new Error('Missing ID token from Google Sign-In')

  const credential = auth.GoogleAuthProvider.credential(idToken)
  return auth().signInWithCredential(credential)
}

export async function signOutGoogle() {
  try {
    configureGoogleSignIn()
    const isSignedIn = GoogleSignin.hasPreviousSignIn()
    if (isSignedIn) {
      await GoogleSignin.signOut()
    }
  } catch {
    // ignore — local Firebase sign-out should still proceed
  }
}
