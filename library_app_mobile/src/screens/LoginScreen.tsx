import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Title, TextInput, HelperText, Text } from 'react-native-paper';
import { signInWithCredential, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../../firebaseConfig';
import { useStore } from '../state/store';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const setUser = useStore((state) => state.setUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Configure Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '515880385706-rf4ei2l53b6ktdtp6i7hevh0e7qhem9v.apps.googleusercontent.com', // From Firebase OAuth settings
    iosClientId: '1:515880385706:ios:0dafa1fbc16e168677e4d3', // Optional
    androidClientId: '1:515880385706:android:f50c9db6fb3d42da77e4d3', // Optional
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          const transformedUser = {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || undefined,
            photoURL: result.user.photoURL || undefined,
          };
          setUser(transformedUser);
        })
        .catch((error) => {
          setError('Google sign-in failed: ' + error.message);
        });
    }
  }, [response, setUser]);

  const handleGoogleSignIn = () => {
    setError('');
    promptAsync();
  };

  const handleEmailAuth = async () => {
    setError('');
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || undefined,
          photoURL: userCredential.user.photoURL || undefined,
        });
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || undefined,
          photoURL: userCredential.user.photoURL || undefined,
        });
      }
    } catch (error: any) {
      let errorMessage = 'Authentication failed';
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message || 'Authentication failed';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Title style={styles.title}>Library App</Title>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          disabled={loading}
        />
        
        {isSignUp && (
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            disabled={loading}
          />
        )}
        
        {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}
        
        <Button 
          mode="contained" 
          onPress={handleEmailAuth}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
        
        {!isSignUp && (
          <Button 
            mode="text" 
            onPress={handleForgotPassword}
            disabled={loading}
            style={styles.forgotPasswordButton}
          >
            Forgot Password?
          </Button>
        )}
        
        <Button 
          mode="text" 
          onPress={toggleAuthMode}
          disabled={loading}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Button>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <Button 
          mode="outlined" 
          onPress={handleGoogleSignIn}
          disabled={!request || loading}
          style={styles.googleButton}
          icon="google"
        >
          Sign in with Google
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: -8,
    marginBottom: 16,
  },
  googleButton: {
    marginTop: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#757575',
  },
});

export default LoginScreen;