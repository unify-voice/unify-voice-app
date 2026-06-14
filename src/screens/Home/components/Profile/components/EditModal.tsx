import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'

import { colors } from '../../../../../theme'
import { styles } from '../styles.module'

interface EditModalProps {
  visible: boolean
  title: string
  subtitle: string
  onClose: () => void
  onSave: () => void
  isLoading: boolean
  children: React.ReactNode
}

const EditModal: React.FC<EditModalProps> = ({ visible, title, subtitle, onClose, onSave, isLoading, children }) => (
  <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSub}>{subtitle}</Text>
          {children}
          <XStack gap='$3' mt='$3'>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} disabled={isLoading} style={[styles.saveBtn, isLoading && { opacity: 0.5 }]}>
              {isLoading ? <ActivityIndicator size='small' color={colors.primary} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </Pressable>
          </XStack>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  </Modal>
)

export default EditModal
