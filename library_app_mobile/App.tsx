import React, { useEffect } from 'react';
import { PaperProvider, useTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client';
import { useStore } from './src/state/store';
import { client } from './src/api/client';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { initDB } from './src/storage/db';
import { setupNetworkListener } from './src/utils/network';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

const App: React.FC = () => {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const theme = useStore((state) => state.theme);
  
  useEffect(() => {
    initDB();
    setupNetworkListener();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <PaperProvider theme={theme === 'dark' ? { dark: true } : { dark: false }}>
      {user ? (
        <NavigationContainer>
          <ApolloProvider client={client}>
            <MainTabNavigator />
          </ApolloProvider>
        </NavigationContainer>
      ) : (
        <LoginScreen />
      )}
    </PaperProvider>
  );
};

export default App;