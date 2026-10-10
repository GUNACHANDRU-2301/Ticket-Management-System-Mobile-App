import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';

const MASTER_ITEMS = [
  {
    id: 'DepartmentMaster',
    title: 'Departments',
    icon: 'business-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
    desc: 'Manage academic departments & faculties'
  },
  {
    id: 'ProgrammeMaster',
    title: 'Programmes',
    icon: 'school-outline',
    color: '#6366F1',
    bg: '#EEF2FF',
    desc: 'Manage degree programmes & specializations'
  },
  {
    id: 'BlockMaster',
    title: 'Blocks',
    icon: 'cube-outline',
    color: '#F59E0B',
    bg: '#FFFBEB',
    desc: 'Manage campus infrastructure blocks & towers'
  },
  {
    id: 'RoomMaster',
    title: 'Rooms',
    icon: 'door-open-outline', // we will use fallback or custom ionic
    iconName: 'key-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    desc: 'Manage classrooms, labs & facility room numbers'
  },
  {
    id: 'UserMaster',
    title: 'Users',
    icon: 'people-outline',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    desc: 'Manage system users, staff & technician profiles'
  },
  {
    id: 'RoleMaster',
    title: 'Roles',
    icon: 'shield-checkmark-outline',
    color: '#EC4899',
    bg: '#FDF2F8',
    desc: 'Manage access roles & system permissions'
  }
];

const MasterHubScreen = ({ navigation }) => {
  const { isSuperAdmin, isAdmin } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  return (
    <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBox}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Administration
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Manage system configuration and foundational master records
          </Text>
        </View>

        <View style={styles.cardsList}>
          {MASTER_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                },
                theme.shadows.sm
              ]}
              onPress={() => navigation.navigate(item.id)}
              activeOpacity={0.78}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isDark ? theme.colors.card : item.bg
                  }
                ]}
              >
                <Ionicons
                  name={item.iconName || item.icon}
                  size={24}
                  color={item.color}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.cardDesc, { color: theme.colors.textMuted }]}
                  numberOfLines={2}
                >
                  {item.desc}
                </Text>
              </View>

              <View
                style={[
                  styles.arrowCircle,
                  { backgroundColor: isDark ? theme.colors.card : '#F1F5F9' }
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1
  },
  headerBox: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  cardsList: {
    gap: 12
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  textContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  cardDesc: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 17
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  }
});

export default MasterHubScreen;
