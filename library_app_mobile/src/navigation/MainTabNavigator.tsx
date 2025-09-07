import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './AppNavigator';
import OverdueBooks from '../screens/OverdueBooks';
import ProfileScreen from '../screens/ProfileScreen';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Function to get icon name
const getTabIcon = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
  switch (routeName) {
    case 'Catalog':
      return focused ? 'library' : 'library-outline';
    case 'Overdue':
      return focused ? 'alert-circle' : 'alert-circle-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'library-outline'; // Default icon
  }
};

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Catalog" component={AppNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Overdue" component={OverdueBooks} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;