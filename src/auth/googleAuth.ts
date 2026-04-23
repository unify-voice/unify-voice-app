import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    const idToken = userInfo.data?.idToken;

    const credential = GoogleAuthProvider.credential(idToken);

    const userCredential = await signInWithCredential(auth, credential);

    console.log("User logged in:", userCredential.user);

    return userCredential.user;

  } catch (error) {
    console.log("Google Sign-In Error:", error);
  }
}