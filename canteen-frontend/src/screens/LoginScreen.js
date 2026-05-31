import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import apiService from '../services/apiService';

const LoginScreen = ({ navigation }) => {
  const { setUserProfile, setWalletBalance } = useContext(CartContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setLoading(true);
          const profile = await apiService.getProfile();
          const wallet = await apiService.getWalletBalance();
          if (profile) {
            setUserProfile(profile);
            setWalletBalance(wallet?.balance || 0);
            navigation.replace('MainApp');
          } else {
            await AsyncStorage.removeItem('access_token');
          }
        }
      } catch (error) {
        console.error('Session restore error:', error);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [navigation, setUserProfile, setWalletBalance]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please fill in all fields to satisfy your hunger');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      if (access_token) {
        await AsyncStorage.setItem('access_token', access_token);
        
        // Fetch profile and wallet details from the backend
        const profile = await apiService.getProfile();
        const wallet = await apiService.getWalletBalance();
        if (profile) {
          setUserProfile(profile);
          setWalletBalance(wallet?.balance || 0);
        }

        navigation.replace('MainApp');
      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FF9A44', '#FC6076', '#FF0844']} // Orange -> Red -> Pink gradient
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>FoodFest 🍕</Text>
          <Text style={styles.appSubtitle}>Your campus cravings, delivered!</Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.title}>Welcome Back 🍔</Text>
          <Text style={styles.subtitle}>Hungry? Let&apos;s get started</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#FF6A88" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#FF6A88" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#FF512F', '#DD2476']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: -40,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#FFEbee',
    fontWeight: '500',
    marginTop: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 50, // Pill style
    marginBottom: 16,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 50,
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerText: {
    color: '#777',
    fontSize: 15,
    fontWeight: '500',
  },
  registerLink: {
    color: '#FF0844',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
