import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'danger',
  icon = '⚠️'
}) => {
  const { theme } = useTheme();
  const { colors, radius, shadows } = theme;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />

        <View
          style={[
            styles.dialogBox,
            shadows.lg,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
              borderRadius: radius.xl
            }
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.backgroundSubtle }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>

          <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.messageText, { color: colors.textMuted }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <Button
              title={cancelText}
              variant="secondary"
              onPress={onCancel}
              style={styles.dialogBtn}
            />
            <Button
              title={confirmText}
              variant={confirmVariant}
              onPress={onConfirm}
              style={styles.dialogBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  dialogBox: {
    width: '100%',
    maxWidth: 380,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center'
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  iconText: {
    fontSize: 24
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  messageText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  dialogBtn: {
    flex: 1
  }
});

export default ConfirmDialog;
