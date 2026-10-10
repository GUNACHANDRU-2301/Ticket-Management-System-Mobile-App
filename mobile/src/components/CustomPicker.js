import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomPicker = ({
  label,
  items = [],
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find((item) => String(item.value) === String(selectedValue));

  const filteredItems = items.filter((item) =>
    (item.label || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: colors.surface,
            borderColor: selectedItem ? colors.primary : colors.border,
            borderRadius: radius.md
          },
          disabled && { backgroundColor: colors.backgroundSubtle, opacity: 0.6 }
        ]}
        onPress={() => {
          if (!disabled) {
            setSearch('');
            setModalVisible(true);
          }
        }}
        activeOpacity={disabled ? 1 : 0.75}
      >
        <Text
          style={[
            styles.pickerText,
            { color: selectedItem ? colors.text : colors.textMuted },
            !selectedItem && styles.placeholderText
          ]}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <View style={[styles.arrowBox, { backgroundColor: colors.backgroundSubtle }]}>
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>
            {disabled ? '🔒' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.backdropDismiss}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
            {/* Grab Bar Handle */}
            <View style={styles.grabBarContainer}>
              <View style={[styles.grabBar, { backgroundColor: colors.border }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {label || 'Select Option'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  {items.length} options available
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.doneBtnText, { color: colors.primary }]}>Close</Text>
              </TouchableOpacity>
            </View>

            {items.length > 5 && (
              <View style={[styles.searchContainer, { borderBottomColor: colors.borderLight }]}>
                <View style={[styles.searchBox, { backgroundColor: colors.backgroundSubtle, borderColor: colors.border, borderRadius: radius.md }]}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search options..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                  />
                  {search ? (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <Text style={[styles.clearSearchIcon, { color: colors.textMuted }]}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}

            <FlatList
              data={filteredItems}
              keyExtractor={(item, index) => item.value?.toString() || index.toString()}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = String(item.value) === String(selectedValue);
                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      { borderRadius: radius.md },
                      isSelected && { backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemLabelCol}>
                      <Text
                        style={[
                          styles.itemText,
                          { color: isSelected ? colors.primary : colors.text },
                          isSelected && { fontWeight: '800' }
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {isSelected ? (
                      <View style={[styles.checkPill, { backgroundColor: colors.primary, borderRadius: radius.full }]}>
                        <Text style={styles.checkText}>✓ Selected</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No matching options found
                  </Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8
  },
  placeholderText: {
    fontWeight: '400'
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrow: {
    fontSize: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end'
  },
  backdropDismiss: {
    flex: 1
  },
  modalContent: {
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20
  },
  grabBarContainer: {
    alignItems: 'center',
    paddingVertical: 10
  },
  grabBar: {
    width: 38,
    height: 4,
    borderRadius: 2
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '800'
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 14
  },
  clearSearchIcon: {
    fontSize: 14,
    padding: 4
  },
  listContent: {
    paddingHorizontal: 8
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginVertical: 2
  },
  itemLabelCol: {
    flex: 1
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500'
  },
  checkPill: {
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13
  }
});

export default CustomPicker;
