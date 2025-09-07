import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookCatalog from '../screens/BookCatalog';
import BookDetail from '../screens/BookDetail';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#000000',
      }}
    >
      <Stack.Screen
        name="BookCatalog"
        component={BookCatalog}
        options={{ title: 'Book Catalog' }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetail}
        options={{ title: 'Book Details' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;