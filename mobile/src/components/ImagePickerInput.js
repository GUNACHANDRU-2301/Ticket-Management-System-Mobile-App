import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

const ImagePickerInput = ({ imageUri, onImagePicked }) => {
  const { theme } = useTheme();
  const { colors, radius, shadows } = theme;

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Access to your media library is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImagePicked(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error choosing photo:', err);
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Camera permission is required to capture photos directly.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImagePicked(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Photo Proof Attachment (Optional)
      </Text>
      <Text style={[styles.sublabel, { color: colors.textMuted }]}>
        Add a photo to help technicians locate and diagnose the fault faster
      </Text>

      {imageUri ? (
        <View
          style={[
            styles.previewContainer,
            shadows.sm,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg
            }
          ]}
        >
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />

          <View style={[styles.previewOverlay, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
            <View style={[styles.badgeAttached, { backgroundColor: colors.successLight, borderRadius: radius.full }]}>
              <Text style={[styles.badgeText, { color: colors.successDark }]}>✓ Photo Attached</Text>
            </View>

            <TouchableOpacity
              style={[styles.removeBtn, { backgroundColor: colors.dangerLight, borderRadius: radius.sm }]}
              onPress={() => onImagePicked(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.removeBtnText, { color: colors.danger }]}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
                borderRadius: radius.md
              }
            ]}
            onPress={takePhoto}
            activeOpacity={0.82}
          >
            <View style={[styles.btnIconCircle, { backgroundColor: colors.surface }]}>
              <Text style={styles.btnIcon}>📸</Text>
            </View>
            <View style={styles.btnTextCol}>
              <Text style={[styles.btnTitle, { color: colors.text }]}>Take Photo</Text>
              <Text style={[styles.btnSub, { color: colors.textMuted }]}>Capture issue now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.backgroundSubtle,
                borderColor: colors.border,
                borderRadius: radius.md
              }
            ]}
            onPress={pickImage}
            activeOpacity={0.82}
          >
            <View style={[styles.btnIconCircle, { backgroundColor: colors.surface }]}>
              <Text style={styles.btnIcon}>🖼️</Text>
            </View>
            <View style={styles.btnTextCol}>
              <Text style={[styles.btnTitle, { color: colors.text }]}>Browse Gallery</Text>
              <Text style={[styles.btnSub, { color: colors.textMuted }]}>Select from device</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  sublabel: {
    fontSize: 12,
    marginBottom: 12
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.2,
    gap: 10
  },
  btnIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnIcon: {
    fontSize: 17
  },
  btnTextCol: {
    flex: 1
  },
  btnTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  btnSub: {
    fontSize: 11,
    marginTop: 2
  },
  previewContainer: {
    overflow: 'hidden',
    borderWidth: 1
  },
  previewImage: {
    width: '100%',
    height: 190
  },
  previewOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1
  },
  badgeAttached: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700'
  }
});

export default ImagePickerInput;
