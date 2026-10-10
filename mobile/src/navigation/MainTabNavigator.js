import React, { useContext } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PressableScale from '../components/PressableScale';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ComplaintListScreen from '../screens/complaints/ComplaintListScreen';
import RaiseComplaintScreen from '../screens/complaints/RaiseComplaintScreen';
import ComplaintDetailScreen from '../screens/complaints/ComplaintDetailScreen';

import MasterHubScreen from '../screens/masters/MasterHubScreen';
import DepartmentMasterScreen from '../screens/masters/DepartmentMasterScreen';
import ProgrammeMasterScreen from '../screens/masters/ProgrammeMasterScreen';
import BlockMasterScreen from '../screens/masters/BlockMasterScreen';
import RoomMasterScreen from '../screens/masters/RoomMasterScreen';
import RoleMasterScreen from '../screens/masters/RoleMasterScreen';
import UserMasterScreen from '../screens/masters/UserMasterScreen';

import ReportsScreen from '../screens/reports/ReportsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Complaints Stack Navigator
const ComplaintsStack = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  const stackHeaderOptions = {
    headerStyle: {
      backgroundColor: colors.headerBg
    },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: {
      fontWeight: '800',
      fontSize: 17
    },
    headerShadowVisible: false
  };

  return (
    <Stack.Navigator screenOptions={stackHeaderOptions}>
      <Stack.Screen
        name="ComplaintList"
        component={ComplaintListScreen}
        options={{ title: 'Complaints' }}
      />
      <Stack.Screen
        name="RaiseComplaint"
        component={RaiseComplaintScreen}
        options={{ title: 'Raise Complaint' }}
      />
      <Stack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: 'Complaint Details' }}
      />
    </Stack.Navigator>
  );
};

// Master Data Stack Navigator
const MastersStack = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  const stackHeaderOptions = {
    headerStyle: {
      backgroundColor: colors.headerBg
    },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: {
      fontWeight: '800',
      fontSize: 17
    },
    headerShadowVisible: false
  };

  return (
    <Stack.Navigator screenOptions={stackHeaderOptions}>
      <Stack.Screen
        name="MasterHub"
        component={MasterHubScreen}
        options={{ title: 'Administration' }}
      />
      <Stack.Screen
        name="DepartmentMaster"
        component={DepartmentMasterScreen}
        options={{ title: 'Departments' }}
      />
      <Stack.Screen
        name="ProgrammeMaster"
        component={ProgrammeMasterScreen}
        options={{ title: 'Programmes' }}
      />
      <Stack.Screen
        name="BlockMaster"
        component={BlockMasterScreen}
        options={{ title: 'Campus Blocks' }}
      />
      <Stack.Screen
        name="RoomMaster"
        component={RoomMasterScreen}
        options={{ title: 'Rooms' }}
      />
      <Stack.Screen
        name="RoleMaster"
        component={RoleMasterScreen}
        options={{ title: 'Roles' }}
      />
      <Stack.Screen
        name="UserMaster"
        component={UserMasterScreen}
        options={{ title: 'Users' }}
      />
    </Stack.Navigator>
  );
};

const CustomElevatedTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { colors, shadows } = theme;

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8);

  return (
    <View
      style={[
        styles.floatingBarWrapper,
        {
          paddingBottom: bottomInset
        }
      ]}
    >
      <View
        style={[
          styles.floatingBarContainer,
          shadows.lg,
          {
            backgroundColor: isDark ? '#111827' : colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border
          }
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key
            });
          };

          let iconName = 'ellipse-outline';
          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'ComplaintsTab') {
            iconName = isFocused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'MastersTab') {
            iconName = isFocused ? 'layers' : 'layers-outline';
          } else if (route.name === 'Reports') {
            iconName = isFocused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          return (
            <PressableScale
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              scaleTo={0.94}
              style={styles.tabButton}
            >
              <View
                style={[
                  styles.iconPill,
                  isFocused && {
                    backgroundColor: 'rgba(99, 102, 241, 0.16)'
                  }
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={19}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.textSecondary,
                    fontWeight: isFocused ? '700' : '600'
                  }
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
};

const MainTabNavigator = () => {
  const { isAdmin } = useContext(AuthContext);
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomElevatedTabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />

      <Tab.Screen
        name="ComplaintsTab"
        component={ComplaintsStack}
        options={{ tabBarLabel: 'Complaints' }}
      />

      {isAdmin && (
        <Tab.Screen
          name="MastersTab"
          component={MastersStack}
          options={{ tabBarLabel: 'Masters' }}
        />
      )}

      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          headerShown: true,
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerTitle: 'Reports'
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: true,
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerTitle: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    backgroundColor: 'transparent'
  },
  floatingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 14
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3
  },
  iconPill: {
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2
  }
});

export default MainTabNavigator;
