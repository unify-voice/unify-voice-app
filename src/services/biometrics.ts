/**
 * Biometric sign-in via react-native-keychain.
 * Credentials and the enabled flag are stored on-device only (separate Keychain services).
 */
import { Platform } from 'react-native'
import * as Keychain from 'react-native-keychain'

const SERVICE = 'com.unifyvoice.biometrics'
const FLAG_SERVICE = 'com.unifyvoice.biometrics.flag'

export type BiometryKind = 'face' | 'fingerprint' | 'iris' | 'none'

/** Hardware biometry available on this device (not whether the user enabled the feature). */
export async function getBiometryKind(): Promise<BiometryKind> {
  try {
    const type = await Keychain.getSupportedBiometryType()
    if (!type) return 'none'
    if (type === Keychain.BIOMETRY_TYPE.FACE_ID || type === Keychain.BIOMETRY_TYPE.FACE) return 'face'
    if (type === Keychain.BIOMETRY_TYPE.IRIS) return 'iris'
    return 'fingerprint'
  } catch {
    return 'none'
  }
}

/** Localized-ish label for Profile / Login UI. */
export async function getBiometryLabel(): Promise<string> {
  const kind = await getBiometryKind()
  if (kind === 'face') return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock'
  if (kind === 'iris') return 'Iris'
  if (kind === 'fingerprint') return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint'
  return 'Biometrics'
}

export async function isBiometryAvailable(): Promise<boolean> {
  return (await getBiometryKind()) !== 'none'
}

/** Whether the user opted into biometric login. */
export async function isBiometricsEnabled(): Promise<boolean> {
  try {
    const result = await Keychain.getGenericPassword({ service: FLAG_SERVICE })
    return !!(result && result.password === '1')
  } catch {
    return false
  }
}

export async function setBiometricsEnabledFlag(enabled: boolean): Promise<void> {
  if (enabled) {
    await Keychain.setGenericPassword('enabled', '1', {
      service: FLAG_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    })
  } else {
    await Keychain.resetGenericPassword({ service: FLAG_SERVICE })
  }
}

/** Store email/password behind biometry; prompts the user to confirm. */
export async function saveBiometricCredentials(email: string, password: string): Promise<void> {
  await Keychain.setGenericPassword(email.trim(), password, {
    service: SERVICE,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationPrompt: {
      title: 'Enable biometric sign-in',
      subtitle: 'Confirm your identity to save credentials securely',
      cancel: 'Cancel',
    },
  })
  await setBiometricsEnabledFlag(true)
}

/** Prompt biometry and return stored credentials, or false if cancelled / missing. */
export async function loadBiometricCredentials(): Promise<false | { email: string; password: string }> {
  const result = await Keychain.getGenericPassword({
    service: SERVICE,
    authenticationPrompt: {
      title: 'Sign in',
      subtitle: 'Authenticate to continue',
      cancel: 'Cancel',
    },
  })
  if (!result) return false
  return { email: result.username, password: result.password }
}

export async function clearBiometricCredentials(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE })
  await setBiometricsEnabledFlag(false)
}

export async function hasBiometricCredentials(): Promise<boolean> {
  try {
    const enabled = await isBiometricsEnabled()
    if (!enabled) return false
    return Keychain.hasGenericPassword({ service: SERVICE })
  } catch {
    return false
  }
}
