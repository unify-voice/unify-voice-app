import auth, { getAuth, updateEmail, updatePassword, updateProfile } from '@react-native-firebase/auth'
// import storage from '@react-native-firebase/storage'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Eye, EyeOff } from '@tamagui/lucide-icons-2'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Pressable, ScrollView } from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import { TextInput } from 'react-native-paper'
import { Text, View, YStack } from 'tamagui'

import { useLoader } from '../../../../context/Loader'
import { colors, INPUT_THEME } from '../../../../theme'
import { RootStackParamList } from '../../../../types/navigation'
import { TabParamList } from '../../../../types/tabs'

import EditModal from './components/EditModal'
import SettingRow from './components/SettingRow'
import { styles } from './styles.module'

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'ProfileScreen'>, NativeStackScreenProps<RootStackParamList>>

const ProfileScreen = ({ navigation }: Props) => {
  const authInstance = getAuth()
  const user = authInstance.currentUser

  const { show, hide } = useLoader()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.photoURL || '')
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

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim])

  if (!user) return null

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
    if (type === 'email') setNewEmail('')
    if (type === 'password') {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setActiveModal(type)
  }
  const closeModal = () => {
    setActiveModal(null)
    setModalError('')
  }

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 1,
        quality: 0.8,
      })

      if (!result.assets || result.assets.length === 0) {
        return
      }

      const uri = result.assets[0].uri
      if (!uri) {
        Alert.alert('No image selected', 'Please select a photo.')
        return
      }

      setAvatarUri(uri)

      // try {
      //   const ref = storage().ref(`avatars/${user.uid}.jpg`)
      //   await ref.putFile(uri)
      //   const url = await ref.getDownloadURL()
      //   await updateProfile(user, { photoURL: url })
      // } catch {
      //   Alert.alert('Upload failed', 'Could not upload photo. Try again.')
      // }
    } catch (err) {
      Alert.alert('Permission needed', `Please allow photo access to update your avatar in your device settings. ${err}`)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setModalError('Name cannot be empty.')
      return
    }
    setIsLoading(true)
    try {
      await updateProfile(user, { displayName: newName.trim() })
      setDisplayName(newName.trim())
      closeModal()
    } catch {
      setModalError('Failed to update name. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEmail = async () => {
    if (!newEmail.trim()) {
      setModalError('Email cannot be empty.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setModalError('Enter a valid email.')
      return
    }
    setIsLoading(true)
    try {
      await updateEmail(user, newEmail.trim())
      closeModal()
      Alert.alert('Email updated', 'A verification link was sent to your new address.')
    } catch (err: any) {
      setModalError(err.code === 'auth/requires-recent-login' ? 'Please re-login and try again.' : 'Failed to update email.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePassword = async () => {
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
    setIsLoading(true)
    try {
      const cred = auth.EmailAuthProvider.credential(user.email!, currentPassword)
      await user.reauthenticateWithCredential(cred)
      await updatePassword(user, newPassword)
      closeModal()
      Alert.alert('Password updated', 'Your password has been changed successfully.')
    } catch (err: any) {
      setModalError(err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.')
    } finally {
      setIsLoading(false)
    }
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

            await authInstance.signOut()

            navigation.replace('Login')
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Logout failed.')
          } finally {
            hide()
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account and all data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await user.delete()
            navigation.replace('Login')
          } catch (err: any) {
            if (err.code === 'auth/requires-recent-login') {
              Alert.alert('Re-login required', 'Please log out and log back in to delete your account.')
            } else {
              Alert.alert('Error', 'Failed to delete account.')
            }
          }
        },
      },
    ])
  }

  return (
    <>
      <View style={styles.ambientGlow} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
          <YStack ai='center' mb='$6'>
            <View style={styles.avatarWrap}>
              {avatarUri ? (
                <View style={[styles.avatarCircle, { overflow: 'hidden' }]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <Pressable style={styles.avatarEditBtn} onPress={handlePickAvatar}>
                <Text style={{ fontSize: 12, color: '#0d0d0d' }}>✎</Text>
              </Pressable>
            </View>
            <Text style={styles.avatarName}>{displayName || 'User'}</Text>
            <Text style={styles.avatarEmail}>{user.email}</Text>
          </YStack>

          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.groupCard}>
            <SettingRow icon='👤' title='Full Name' subtitle={displayName || 'Not set'} onPress={() => openModal('name')} />
            <SettingRow icon='✉️' title='Email Address' subtitle={user.email || ''} onPress={() => openModal('email')} />
            <SettingRow icon='🔑' title='Change Password' subtitle='Last changed 30 days ago' onPress={() => openModal('password')} noBorder />
          </View>

          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.groupCard}>
            <SettingRow icon='🌐' title='Language' subtitle='English, Urdu' onPress={() => openModal('language')} />

            <SettingRow icon='🌙' title='Dark Mode' subtitle='Always on' badge='On' noBorder />
          </View>

          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.groupCard}>
            <SettingRow icon='ℹ️' title='App Version' subtitle='v1.0.0 (build 42)' />
          </View>

          <Text style={styles.sectionLabel}>Account actions</Text>
          <View style={styles.groupCard}>
            <SettingRow icon='🚪' title='Log Out' subtitle='Sign out of your account' danger onPress={handleLogout} />
            <SettingRow icon='🗑️' title='Delete Account' subtitle='Permanently remove your data' danger onPress={handleDeleteAccount} noBorder />
          </View>
        </ScrollView>
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
          outlineColor='rgba(255,255,255,0.1)'
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor='rgba(255,255,255,0.2)'
          theme={INPUT_THEME}
        />
      </EditModal>

      <EditModal
        visible={activeModal === 'email'}
        title='Update email'
        subtitle='A verification link will be sent to your new address.'
        onClose={closeModal}
        onSave={handleSaveEmail}
        isLoading={isLoading}
      >
        {modalError ? (
          <View style={styles.modalErr}>
            <Text style={styles.modalErrText}>{modalError}</Text>
          </View>
        ) : null}
        <Text style={styles.modalLabel}>New Email</Text>
        <TextInput
          mode='outlined'
          placeholder='new@email.com'
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          outlineColor='rgba(255,255,255,0.1)'
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor='rgba(255,255,255,0.2)'
          theme={INPUT_THEME}
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
            <TextInput.Icon
              icon={() => (showCur ? <EyeOff size={18} /> : <Eye size={18} />)}
              color='rgba(255,255,255,0.3)'
              onPress={() => setShowCur((v) => !v)}
            />
          }
          outlineColor='rgba(255,255,255,0.1)'
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor='rgba(255,255,255,0.2)'
          theme={INPUT_THEME}
        />
        <Text style={[styles.modalLabel, { marginTop: 8 }]}>New Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNew}
          right={
            <TextInput.Icon
              icon={() => (showNew ? <EyeOff size={18} /> : <Eye size={18} />)}
              color='rgba(255,255,255,0.3)'
              onPress={() => setShowNew((v) => !v)}
            />
          }
          outlineColor='rgba(255,255,255,0.1)'
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor='rgba(255,255,255,0.2)'
          theme={INPUT_THEME}
        />
        <Text style={[styles.modalLabel, { marginTop: 8 }]}>Confirm Password</Text>
        <TextInput
          mode='outlined'
          placeholder='••••••••'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showCon}
          right={
            <TextInput.Icon
              icon={() => (showCon ? <EyeOff size={18} /> : <Eye size={18} />)}
              color='rgba(255,255,255,0.3)'
              onPress={() => setShowCon((v) => !v)}
            />
          }
          outlineColor='rgba(255,255,255,0.1)'
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor='rgba(255,255,255,0.2)'
          theme={INPUT_THEME}
        />
      </EditModal>

      <EditModal
        visible={activeModal === 'language'}
        title='Language'
        subtitle='Select your preferred communication languages.'
        onClose={closeModal}
        onSave={closeModal}
        isLoading={false}
      >
        <Text style={styles.modalLabel}>Language</Text>
        <TextInput
          mode='outlined'
          placeholder='e.g. English, Urdu'
          outlineColor='rgba(255,255,255,0.1)'
          activeOutlineColor={colors.primary}
          style={styles.modalInput}
          placeholderTextColor='rgba(255,255,255,0.2)'
          theme={INPUT_THEME}
        />
      </EditModal>
    </>
  )
}

type ModalType = 'name' | 'email' | 'password' | 'language' | null

export default ProfileScreen
