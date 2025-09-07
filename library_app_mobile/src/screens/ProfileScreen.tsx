import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Title, Caption, Button, Card, useTheme } from 'react-native-paper';
import { useStore } from '../state/store';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const ProfileScreen: React.FC = () => {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const theme = useTheme();
  const toggleTheme = useStore((state) => state.toggleTheme);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.userInfo}>
          <Avatar.Image 
            size={100} 
            source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }} 
          />
          <Title style={styles.title}>{user?.displayName || 'User'}</Title>
          <Caption style={styles.email}>{user?.email || 'No email'}</Caption>
        </Card.Content>
      </Card>
      
      <View style={styles.buttons}>
        <Button 
          mode="outlined" 
          onPress={toggleTheme}
          style={styles.button}
        >
          Switch to {theme.dark ? 'Light' : 'Dark'} Theme
        </Button>
        
        <Button 
          mode="contained" 
          onPress={handleSignOut}
          style={styles.button}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 30,
  },
  userInfo: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 15,
    fontSize: 24,
  },
  email: {
    fontSize: 16,
    marginTop: 5,
  },
  buttons: {
    marginTop: 20,
  },
  button: {
    marginBottom: 15,
  },
});

export default ProfileScreen;