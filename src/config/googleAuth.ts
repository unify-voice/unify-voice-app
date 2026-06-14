import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

  const userInfo = await GoogleSignin.signIn()

  console.log(userInfo)

  const idToken = userInfo.data?.idToken
  if (!idToken) throw new Error('Missing ID token')

  const credential = auth.GoogleAuthProvider.credential(idToken)

  return auth().signInWithCredential(credential)
}
