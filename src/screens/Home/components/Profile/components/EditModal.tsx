import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'

import { useLanguage } from '../../../../../context/Language'
import { useAppTheme } from '../../../../../context/Theme'
import { useThemedStyles } from '../../../../../theme'
import { directionStyle } from '../../../../../utils/rtl'
import { createStyles } from '../styles.module'

interface EditModalProps {
  visible: boolean
  title: string
  subtitle: string
  onClose: () => void
  onSave: () => void
  isLoading: boolean
  children: React.ReactNode
}

const EditModal: React.FC<EditModalProps> = ({ visible, title, subtitle, onClose, onSave, isLoading, children }) => {
  const styles = useThemedStyles(createStyles)
  const { colors } = useAppTheme()
  const { isRTL, t } = useLanguage()

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
          <Pressable style={[styles.modalCard, directionStyle(isRTL)]} onPress={() => {}}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSub}>{subtitle}</Text>
            {children}
            <XStack gap='$3' mt='$3'>
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable onPress={onSave} disabled={isLoading} style={[styles.saveBtn, isLoading && { opacity: 0.5 }]}>
                {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.saveBtnText}>{t('common.save')}</Text>}
              </Pressable>
            </XStack>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

export default EditModal
