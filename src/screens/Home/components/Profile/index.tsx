import auth, { EmailAuthProvider, getAuth, updatePassword, verifyBeforeUpdateEmail } from '@react-native-firebase/auth'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CommonActions, CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AudioLines, BookOpen, Eye, EyeOff, Fingerprint, HelpCircle, Info, Languages, Lock, LogOut, Mail, Moon, Pencil, ScanFace, Shield, Sun, Trash2, User, Vibrate, Volume2 } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Image, Platform, Pressable, ScrollView } from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import { TextInput } from 'react-native-paper'
import { Text, View, YStack } from 'tamagui'

import { signInWithGoogle, signOutGoogle } from '../../../../config/googleAuth'
import { useAuthUser } from '../../../../context/AuthUser'
import { useLanguage } from '../../../../context/Language'
import { useLoader } from '../../../../context/Loader'
import { usePreferences } from '../../../../context/Preferences'
import { useAppTheme } from '../../../../context/Theme'
import { TourTarget, useTour } from '../../../../context/Tour'
import {
  ensurePhotoLibraryPermission,
  mapStorageError,
  setCachedAvatar,
  toDataUri,
  uploadAvatarFromAsset,
} from '../../../../services/avatar'
import type { AppLanguage } from '../../../../i18n/translations'
import {
  clearBiometricCredentials,
  getBiometryKind,
  getBiometryLabel,
  isBiometryAvailable,
  isBiometricsEnabled,
  saveBiometricCredentials,
} from '../../../../services/biometrics'
import { clearUserHistory } from '../../../../services/history'
import { useThemedStyles } from '../../../../theme'
import { directionStyle } from '../../../../utils/rtl'
import { RootStackParamList } from '../../../../types/navigation'
import { TabParamList } from '../../../../types/tabs'
import { mapAuthError } from '../../../../utils/authErrors'

import EditModal from './components/EditModal'
import SettingRow from './components/SettingRow'
import { createStyles } from './styles.module'

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'ProfileScreen'>, NativeStackScreenProps<RootStackParamList>>

type ModalType = 'name' | 'email' | 'password' | 'language' | 'conversion' | 'biometric' | null

const ProfileScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const { startTour, active, stepId } = useTour()
  const profileScrollRef = useRef<ScrollView>(null)
  const { colors, inputTheme, isDark, toggleDark } = useAppTheme()
  const { language, setLanguage, t, isRTL } = useLanguage()
  const { conversionLang, setConversionLang, hapticsEnabled, setHapticsEnabled, soundCuesEnabled, setSoundCuesEnabled } = usePreferences()
  const { show, hide } = useLoader()
  const { user, photoURL, refreshUser, setLocalPhotoURL } = useAuthUser()

  const authInstance = getAuth()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [avatarUri, setAvatarUri] = useState<string | null>(photoURL)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showCon, setShowCon] = useState(false)
  const [draftLanguage, setDraftLanguage] = useState<AppLanguage>(language)
  const [draftConversionLang, setDraftConversionLang] = useState<AppLanguage>(conversionLang)
  const [biometricPassword, setBiometricPassword] = useState('')
  const [showBioPass, setShowBioPass] = useState(false)
  const [deletePasswordVisible, setDeletePasswordVisible] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePass, setShowDeletePass] = useState(false)

  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [biometryLabel, setBiometryLabel] = useState('Biometrics')
  const [biometryKind, setBiometryKind] = useState<'face' | 'fingerprint' | 'iris' | 'none'>('none')
  const [biometricsOn, setBiometricsOn] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim])

  useEffect(() => {
    if (!active || stepId !== 'conversionLang') return
    const t = setTimeout(() => profileScrollRef.current?.scrollTo({ y: 260, animated: true }), 220)
    return () => clearTimeout(t)
  }, [active, stepId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [available, label, kind, enabled] = await Promise.all([isBiometryAvailable(), getBiometryLabel(), getBiometryKind(), isBiometricsEnabled()])
      if (!mounted) return
      setBiometryAvailable(available)
      setBiometryLabel(label)
      setBiometryKind(kind)
      setBiometricsOn(enabled)
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setDisplayName(user?.displayName || '')
    setAvatarUri(photoURL)
  }, [user?.displayName, photoURL])

  const hasPasswordProvider = !!user?.providerData.some((p) => p.providerId === 'password')

  const initials =
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  const openModal = (type: ModalType) => {
    setModalError('')
    if (type === 'name') setNewName(displayName)
    if (type === 'email') {
      setNewEmail('')
      setCurrentPassword('')
      setShowCur(false)
    }
    if (type === 'password') {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCur(false)
      setShowNew(false)
      setShowCon(false)
    }
    if (type === 'language') setDraftLanguage(language)
    if (type === 'conversion') setDraftConversionLang(conversionLang)
    if (type === 'biometric') {
      setBiometricPassword('')
      setShowBioPass(false)
    }
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
    setModalError('')
  }

  const resetToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    )
  }

  const handlePickAvatar = async () => {
    const current = auth().currentUser
    if (!current) return

    const allowed = await ensurePhotoLibraryPermission()
    if (!allowed) {
      Alert.alert('Permission needed', 'Please allow photo access to update your profile picture.')
      return
    }

    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        selectionLimit: 1,
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
        presentationStyle: 'pageSheet',
      })

      if (result.didCancel) return
      if (result.errorCode === 'permission') {
        Alert.alert('Permission needed', 'Please allow photo access to update your profile picture.')
        return
      }

      const asset = result.assets?.[0]
      if (!asset?.base64 && !asset?.uri) {
        Alert.alert('No image selected', 'Please select a photo and try again.')
        return
      }

      const mime = asset.type?.startsWith('image/') ? asset.type : 'image/jpeg'
      const preview = asset.base64 ? toDataUri(asset.base64, mime) : asset.uri || null
      if (preview) {
        setAvatarUri(preview)
        setLocalPhotoURL(preview)
        await setCachedAvatar(current.uid, preview)
      }

      show()
      try {
        const { remoteUrl } = await uploadAvatarFromAsset(current.uid, asset)
        await auth().currentUser?.updateProfile({ photoURL: remoteUrl })
        await setCachedAvatar(current.uid, remoteUrl)
        setLocalPhotoURL(remoteUrl)
        setAvatarUri(remoteUrl)
        await refreshUser()
      } catch (err) {
        Alert.alert('Upload failed', mapStorageError(err))
      } finally {
        hide()
      }
    } catch (err) {
      Alert.alert('Could not open photos', mapStorageError(err))
    }
  }

  const handleSaveName = async () => {
    const current = auth().currentUser
    if (!current) return
    if (!newName.trim()) {
      setModalError('Name cannot be empty.')
      return
    }
    setIsLoading(true)
    try {
      await current.updateProfile({ displayName: newName.trim() })
      await refreshUser()
      setDisplayName(auth().currentUser?.displayName?.trim() || newName.trim())
      closeModal()
    } catch (err: any) {
      setModalError(mapAuthError(err?.code, 'Failed to update name. Try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEmail = async () => {
    const current = auth().currentUser
    if (!current) return
    if (!hasPasswordProvider) {
      setModalError('Email cannot be changed for Google sign-in accounts this way.')
      return
    }
    if (!newEmail.trim()) {
      setModalError('Email cannot be empty.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setModalError('Enter a valid email.')
      return
    }
    if (!currentPassword) {
      setModalError('Current password is required.')
      return
    }
    if (!current.email) {
      setModalError('No email on this account.')
      return
    }
    setIsLoading(true)
    try {
      const cred = EmailAuthProvider.credential(current.email, currentPassword)
      await current.reauthenticateWithCredential(cred)
      await verifyBeforeUpdateEmail(current, newEmail.trim())
      await refreshUser()
      closeModal()
      Alert.alert('Verification sent', 'A verification link was sent to your new address. Confirm it to finish updating your email.')
    } catch (err: any) {
      setModalError(mapAuthError(err?.code, 'Failed to update email.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePassword = async () => {
    const current = auth().currentUser
    if (!current) return
    if (!hasPasswordProvider) {
      setModalError('Password cannot be changed for Google sign-in accounts.')
      return
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalError('All fields are required.')
      return
    }
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters.')
      return
    }
    if (!current.email) {
      setModalError('No email on this account.')
      return
    }
    setIsLoading(true)
    try {
      const cred = EmailAuthProvider.credential(current.email, currentPassword)
      await current.reauthenticateWithCredential(cred)
      await updatePassword(current, newPassword)
      await refreshUser()
      closeModal()
      Alert.alert('Password updated', 'Your password has been changed successfully.')
    } catch (err: any) {
      setModalError(mapAuthError(err?.code, 'Failed to update password.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveLanguage = async () => {
    setIsLoading(true)
    try {
      await setLanguage(draftLanguage)
      closeModal()
    } catch {
      setModalError('Failed to update language.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConversion = async () => {
    setIsLoading(true)
    try {
      await setConversionLang(draftConversionLang)
      closeModal()
    } catch {
      setModalError('Failed to update conversion language.')
    } finally {
      setIsLoading(false)
    }
  }

  const enableBiometricsWithPassword = async (password: string) => {
    if (!user?.email) {
      throw Object.assign(new Error('No email on this account.'), { code: 'auth/invalid-email' })
    }
    if (!password) {
      throw Object.assign(new Error('Password required'), { code: 'auth/wrong-password' })
    }
    const cred = EmailAuthProvider.credential(user.email, password)
    await user.reauthenticateWithCredential(cred)
    await saveBiometricCredentials(user.email, password)
    setBiometricsOn(true)
  }

  const handleToggleBiometrics = () => {
    if (!hasPasswordProvider) {
      Alert.alert('Unavailable', 'Biometric sign-in requires an email/password account.')
      return
    }
    if (biometricsOn) {
      Alert.alert(`Disable ${biometryLabel}?`, 'You will need your password to sign in next time.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearBiometricCredentials()
              setBiometricsOn(false)
            } catch {
              Alert.alert('Error', 'Could not disable biometrics.')
            }
          },
        },
      ])
      return
    }

    if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
      Alert.prompt(
        `Enable ${biometryLabel}`,
        'Enter your account password to save credentials securely.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: (password?: string) => {
              void (async () => {
                try {
                  show()
                  await enableBiometricsWithPassword(password || '')
                  Alert.alert('Enabled', `${biometryLabel} sign-in is now on.`)
                } catch (err: any) {
                  Alert.alert('Error', mapAuthError(err?.code, err?.message || 'Could not enable biometrics.'))
                } finally {
                  hide()
                }
              })()
            },
          },
        ],
        'secure-text',
      )
      return
    }

    openModal('biometric')
  }

  const handleSaveBiometric = async () => {
    if (!biometricPassword) {
      setModalError('Password is required.')
      return
    }
    setIsLoading(true)
    setModalError('')
    try {
      await enableBiometricsWithPassword(biometricPassword)
      closeModal()
      Alert.alert('Enabled', `${biometryLabel} sign-in is now on.`)
    } catch (err: any) {
      setModalError(mapAuthError(err?.code, err?.message || 'Could not enable biometrics.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailPress = () => {
    if (!hasPasswordProvider) {
      Alert.alert('Unavailable', 'Email cannot be changed for Google sign-in accounts this way.')
      return
    }
    openModal('email')
  }

  const handlePasswordPress = () => {
    if (!hasPasswordProvider) {
      Alert.alert('Unavailable', 'Password cannot be changed for Google sign-in accounts.')
      return
    }
    openModal('password')
  }

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            show()
            // Keep biometric credentials so Face ID / fingerprint login still works.
            await signOutGoogle()
            await authInstance.signOut()
            resetToLogin()
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Logout failed.')
          } finally {
            hide()
          }
        },
      },
    ])
  }

  const performDeleteAccount = async () => {
    const current = authInstance.currentUser
    if (!current) return
    try {
      show()
      const uid = current.uid
      await clearUserHistory(uid)
      await current.delete()
      await clearBiometricCredentials()
      await signOutGoogle()
      resetToLogin()
    } catch (err: any) {
      Alert.alert('Error', mapAuthError(err?.code, 'Failed to delete account.'))
    } finally {
      hide()
    }
  }

  const deleteWithPassword = async (password: string) => {
    const current = authInstance.currentUser
    if (!current?.email) {
      throw Object.assign(new Error('No email on this account.'), { code: 'auth/invalid-email' })
    }
    if (!password) {
      throw Object.assign(new Error('Password is required.'), { code: 'auth/wrong-password' })
    }
    const cred = EmailAuthProvider.credential(current.email, password)
    await current.reauthenticateWithCredential(cred)
    const uid = current.uid
    await clearUserHistory(uid)
    await current.delete()
    await clearBiometricCredentials()
    await signOutGoogle()
    setDeletePasswordVisible(false)
    resetToLogin()
  }

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account and all data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (hasPasswordProvider) {
            if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
              Alert.prompt(
                'Confirm password',
                'Enter your password to permanently delete your account.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: (password?: string) => {
                      void (async () => {
                        try {
                          show()
                          await deleteWithPassword(password || '')
                        } catch (err: any) {
                          Alert.alert('Error', mapAuthError(err?.code, err?.message || 'Failed to delete account.'))
                        } finally {
                          hide()
                        }
                      })()
                    },
                  },
                ],
                'secure-text',
              )
            } else {
              setDeletePassword('')
              setShowDeletePass(false)
              setModalError('')
              setDeletePasswordVisible(true)
            }
            return
          }

          void (async () => {
            try {
              show()
              await signInWithGoogle()
              await performDeleteAccount()
            } catch (err: any) {
              Alert.alert('Error', mapAuthError(err?.code, err?.message || 'Google re-authentication failed.'))
              hide()
            }
          })()
        },
      },
    ])
  }

  const handleSaveDeletePassword = async () => {
    if (!deletePassword) {
      setModalError('Password is required.')
      return
    }
    setIsLoading(true)
    setModalError('')
    try {
      await deleteWithPassword(deletePassword)
    } catch (err: any) {
      setModalError(mapAuthError(err?.code, err?.message || 'Failed to delete account.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const BiometricIcon = biometryKind === 'face' ? ScanFace : Fingerprint

  return (
    <>
      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[{ flex: 1 }, directionStyle(isRTL)]}>
        <ScrollView ref={profileScrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
          <YStack ai='center' mb='$6'>
            <View style={styles.avatarWrap}>
              {avatarUri ? (
                <View style={[styles.avatarCircle, { overflow: 'hidden' }]}>
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                </View>
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <Pressable style={styles.avatarEditBtn} onPress={handlePickAvatar}>
                <Pencil size={12} color={colors.textOnPrimary} />
              </Pressable>
            </View>
            <Text style={styles.avatarName}>{displayName || 'User'}</Text>
            <Text style={styles.avatarEmail}>{user.email}</Text>
          </YStack>

          <Text style={styles.sectionLabel}>{t('profile.account')}</Text>
          <View style={styles.groupCard}>
            <SettingRow
              icon={<User size={17} color={colors.primary} />}
              title={t('profile.fullName')}
              subtitle={displayName || t('profile.notSet')}
              onPress={() => openModal('name')}
            />
            <SettingRow icon={<Mail size={17} color={colors.primary} />} title={t('profile.email')} subtitle={user.email || ''} onPress={handleEmailPress} />
            <SettingRow
              icon={<Lock size={17} color={colors.primary} />}
              title={t('profile.changePassword')}
              subtitle='Update your account password'
              onPress={handlePasswordPress}
              noBorder
            />
          </View>

          <Text style={styles.sectionLabel}>{t('profile.preferences')}</Text>
          <View style={styles.groupCard}>
            <SettingRow
              icon={<Languages size={17} color={colors.primary} />}
              title={t('profile.language')}
              subtitle={language === 'ur' ? t('lang.urdu') : t('lang.english')}
              onPress={() => openModal('language')}
            />
            <TourTarget id='conversionLang'>
              <SettingRow
                icon={<AudioLines size={17} color={colors.primary} />}
                title={t('conv.title')}
                subtitle={conversionLang === 'ur' ? t('lang.urdu') : t('lang.english')}
                onPress={() => openModal('conversion')}
              />
            </TourTarget>
            <SettingRow
              icon={isDark ? <Moon size={17} color={colors.primary} /> : <Sun size={17} color={colors.primary} />}
              title={t('profile.darkMode')}
              subtitle={isDark ? t('profile.on') : t('profile.off')}
              badge={isDark ? t('profile.on') : t('profile.off')}
              onPress={toggleDark}
            />
            <SettingRow
              icon={<Vibrate size={17} color={colors.primary} />}
              title={t('profile.haptics')}
              subtitle={t('profile.hapticsSub')}
              badge={hapticsEnabled ? t('profile.on') : t('profile.off')}
              onPress={() => void setHapticsEnabled(!hapticsEnabled)}
            />
            <SettingRow
              icon={<Volume2 size={17} color={colors.primary} />}
              title={t('profile.soundCues')}
              subtitle={t('profile.soundCuesSub')}
              badge={soundCuesEnabled ? t('profile.on') : t('profile.off')}
              onPress={() => void setSoundCuesEnabled(!soundCuesEnabled)}
              noBorder={!biometryAvailable}
            />
            {biometryAvailable ? (
              <SettingRow
                icon={<BiometricIcon size={17} color={colors.primary} />}
                title={t('profile.biometrics')}
                subtitle={biometryLabel}
                badge={biometricsOn ? t('profile.on') : t('profile.off')}
                onPress={handleToggleBiometrics}
                noBorder
              />
            ) : null}
          </View>

          <Text style={styles.sectionLabel}>{t('profile.about')}</Text>
          <View style={styles.groupCard}>
            <SettingRow
              icon={<BookOpen size={17} color={colors.primary} />}
              title={t('profile.tutorial')}
              subtitle={t('profile.tutorialSub')}
              onPress={() => startTour()}
            />
            <SettingRow
              icon={<HelpCircle size={17} color={colors.primary} />}
              title={t('profile.help')}
              subtitle={t('profile.helpSub')}
              onPress={() => navigation.navigate('HelpScreen')}
            />
            <SettingRow
              icon={<Shield size={17} color={colors.primary} />}
              title={t('profile.privacy')}
              subtitle={t('profile.privacySub')}
              onPress={() => navigation.navigate('PrivacyScreen')}
            />
            <SettingRow icon={<Info size={17} color={colors.primary} />} title={t('profile.version')} subtitle='v1.0.0 (build 42)' noBorder />
          </View>

          <Text style={styles.sectionLabel}>{t('profile.actions')}</Text>
          <View style={styles.groupCard}>
            <SettingRow
              icon={<LogOut size={17} color={colors.errorText} />}
              title={t('profile.logOut')}
              subtitle='Sign out of your account'
              danger
              onPress={handleLogout}
            />
            <SettingRow
              icon={<Trash2 size={17} color={colors.errorText} />}
              title={t('profile.deleteAccount')}
              subtitle='Permanently remove your data'
              danger
              onPress={handleDeleteAccount}
              noBorder
            />
          </View>
        </ScrollView>
        </View>
      </Animated.View>

      <EditModal
        visible={activeModal === 'name'}
        title='Update name'
        subtitle='This is how your name appears across the app.'
        onClose={closeModal}
        onSave={handleSaveName}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Text style={styles.modalLabel}>Full Name</Text>
        <TextInput
          mode='outlined'
          placeholder='John Doe'
          value={newName}
          onChangeText={setNewName}
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
      </EditModal>

      <EditModal
        visible={activeModal === 'email'}
        title='Update email'
        subtitle='Re-enter your password, then we will send a verification link to the new address.'
        onClose={closeModal}
        onSave={handleSaveEmail}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Text style={styles.modalLabel}>Current Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCur}
          right={
            <TextInput.Icon icon={() => (showCur ? <EyeOff size={18} /> : <Eye size={18} />)} color={colors.textMuted} onPress={() => setShowCur((v) => !v)} />
          }
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
        <Text style={[styles.modalLabel, { marginTop: 8 }]}>New Email</Text>
        <TextInput
          mode='outlined'
          placeholder='new@email.com'
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
      </EditModal>

      <EditModal
        visible={activeModal === 'password'}
        title='Change password'
        subtitle="Choose a strong password you haven't used before."
        onClose={closeModal}
        onSave={handleSavePassword}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Text style={styles.modalLabel}>Current Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCur}
          right={
            <TextInput.Icon icon={() => (showCur ? <EyeOff size={18} /> : <Eye size={18} />)} color={colors.textMuted} onPress={() => setShowCur((v) => !v)} />
          }
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
        <Text style={[styles.modalLabel, { marginTop: 8 }]}>New Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNew}
          right={
            <TextInput.Icon icon={() => (showNew ? <EyeOff size={18} /> : <Eye size={18} />)} color={colors.textMuted} onPress={() => setShowNew((v) => !v)} />
          }
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
        <Text style={[styles.modalLabel, { marginTop: 8 }]}>Confirm Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showCon}
          right={
            <TextInput.Icon icon={() => (showCon ? <EyeOff size={18} /> : <Eye size={18} />)} color={colors.textMuted} onPress={() => setShowCon((v) => !v)} />
          }
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
      </EditModal>

      <EditModal
        visible={activeModal === 'language'}
        title={t('lang.title')}
        subtitle={t('lang.subtitle')}
        onClose={closeModal}
        onSave={handleSaveLanguage}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Pressable onPress={() => setDraftLanguage('en')} style={[styles.langOption, draftLanguage === 'en' && styles.langOptionSelected]}>
          <Text style={styles.langOptionText}>{t('lang.english')}</Text>
          {draftLanguage === 'en' ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
        <Pressable onPress={() => setDraftLanguage('ur')} style={[styles.langOption, draftLanguage === 'ur' && styles.langOptionSelected]}>
          <Text style={styles.langOptionText}>{t('lang.urdu')}</Text>
          {draftLanguage === 'ur' ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
      </EditModal>

      <EditModal
        visible={activeModal === 'conversion'}
        title={t('conv.title')}
        subtitle={t('conv.subtitle')}
        onClose={closeModal}
        onSave={handleSaveConversion}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Pressable onPress={() => setDraftConversionLang('en')} style={[styles.langOption, draftConversionLang === 'en' && styles.langOptionSelected]}>
          <Text style={styles.langOptionText}>{t('lang.english')}</Text>
          {draftConversionLang === 'en' ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
        <Text style={[styles.modalSub, { marginBottom: 10 }]}>{t('conv.englishHint')}</Text>
        <Pressable onPress={() => setDraftConversionLang('ur')} style={[styles.langOption, draftConversionLang === 'ur' && styles.langOptionSelected]}>
          <Text style={styles.langOptionText}>{t('lang.urdu')}</Text>
          {draftConversionLang === 'ur' ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
        <Text style={styles.modalSub}>{t('conv.urduHint')}</Text>
      </EditModal>

      <EditModal
        visible={activeModal === 'biometric'}
        title={`Enable ${biometryLabel}`}
        subtitle='Enter your account password to save credentials securely.'
        onClose={closeModal}
        onSave={handleSaveBiometric}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Text style={styles.modalLabel}>Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={biometricPassword}
          onChangeText={setBiometricPassword}
          secureTextEntry={!showBioPass}
          right={
            <TextInput.Icon
              icon={() => (showBioPass ? <EyeOff size={18} /> : <Eye size={18} />)}
              color={colors.textMuted}
              onPress={() => setShowBioPass((v) => !v)}
            />
          }
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
      </EditModal>

      <EditModal
        visible={deletePasswordVisible}
        title='Confirm password'
        subtitle='Enter your password to permanently delete your account.'
        onClose={() => {
          setDeletePasswordVisible(false)
          setModalError('')
        }}
        onSave={handleSaveDeletePassword}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Text style={styles.modalLabel}>Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={deletePassword}
          onChangeText={setDeletePassword}
          secureTextEntry={!showDeletePass}
          right={
            <TextInput.Icon
              icon={() => (showDeletePass ? <EyeOff size={18} /> : <Eye size={18} />)}
              color={colors.textMuted}
              onPress={() => setShowDeletePass((v) => !v)}
            />
          }
          outlineColor={colors.inputOutline}
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor={colors.textFaint}
          theme={inputTheme}
        />
      </EditModal>
    </>
  )
}

export default ProfileScreen
