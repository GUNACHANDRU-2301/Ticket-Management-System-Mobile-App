import React, { useContext } from 'react';
import * as DashboardScreenModule from '../screens/dashboard/DashboardScreen';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from '../context/AuthContext';
import NavigationDrawer from '../components/NavigationDrawer';

// Other screens
import ComplaintListScreen from '../screens/complaints/ComplaintListScreen';
import RaiseComplaintScreen from '../screens/complaints/RaiseComplaintScreen';
import ComplaintDetailScreen from '../screens/complaints/ComplaintDetailScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Master Hub
import MasterHubScreen from '../screens/masters/MasterHubScreen';

// Master screens
import DepartmentMasterScreen from '../screens/masters/DepartmentMasterScreen';
import ProgrammeMasterScreen from '../screens/masters/ProgrammeMasterScreen';
import BlockMasterScreen from '../screens/masters/BlockMasterScreen';
import RoomMasterScreen from '../screens/masters/RoomMasterScreen';
import RoleMasterScreen from '../screens/masters/RoleMasterScreen';
import UserMasterScreen from '../screens/masters/UserMasterScreen';

const DashboardScreen =
  DashboardScreenModule.default ||
  DashboardScreenModule.DashboardScreen;

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Complaints navigation stack
const ComplaintsStackScreen = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="ComplaintList"
      component={ComplaintListScreen}
    />

    <Stack.Screen
      name="ComplaintDetail"
      component={ComplaintDetailScreen}
    />
  </Stack.Navigator>
);

// Raise complaint navigation stack
const RaiseComplaintStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="RaiseComplaintForm"
      component={RaiseComplaintScreen}
    />
  </Stack.Navigator>
);

// Department master stack
const DepartmentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="DepartmentMaster"
      component={DepartmentMasterScreen}
    />
  </Stack.Navigator>
);

// Programme master stack
const ProgrammesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="ProgrammeMaster"
      component={ProgrammeMasterScreen}
    />
  </Stack.Navigator>
);

// Block master stack
const BlocksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="BlockMaster"
      component={BlockMasterScreen}
    />
  </Stack.Navigator>
);

// Room master stack
const RoomsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="RoomMaster"
      component={RoomMasterScreen}
    />
  </Stack.Navigator>
);

// User master stack
const UsersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="UserMaster"
      component={UserMasterScreen}
    />
  </Stack.Navigator>
);

// Role master stack
const RolesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="RoleMaster"
      component={RoleMasterScreen}
    />
  </Stack.Navigator>
);

const MainDrawerNavigator = () => {
  const { isAdmin, isSuperAdmin } = useContext(AuthContext);

  // Validate Dashboard component
  if (typeof DashboardScreen !== 'function') {
    console.error(
      'DashboardScreen is not a valid component. Check DashboardScreen.js export.'
    );

    return null;
  }

  const canManageMasters = Boolean(isSuperAdmin || isAdmin);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <NavigationDrawer {...props} />
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',

        drawerStyle: {
          width: 300,
          backgroundColor: 'transparent',
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },

        overlayColor: 'rgba(0, 0, 0, 0.6)',
        swipeEdgeWidth: 50,
        swipeMinDistance: 5,
      }}
    >
      {/* Main screens */}
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
      />

      <Drawer.Screen
        name="Complaints"
        component={ComplaintsStackScreen}
      />

      <Drawer.Screen
        name="RaiseComplaint"
        component={RaiseComplaintStack}
      />

      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
      />

      {/* Master screens: Admin and SuperAdmin only */}
      {canManageMasters && (
        <>
          <Drawer.Screen
            name="MasterHub"
            component={MasterHubScreen}
          />

          <Drawer.Screen
            name="Departments"
            component={DepartmentsStack}
          />

          <Drawer.Screen
            name="Programmes"
            component={ProgrammesStack}
          />

          <Drawer.Screen
            name="Blocks"
            component={BlocksStack}
          />

          <Drawer.Screen
            name="Rooms"
            component={RoomsStack}
          />

          <Drawer.Screen
            name="Users"
            component={UsersStack}
          />

          <Drawer.Screen
            name="Roles"
            component={RolesStack}
          />
        </>
      )}

      {/* Account screens */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Drawer.Navigator>
  );
};

export default MainDrawerNavigator;