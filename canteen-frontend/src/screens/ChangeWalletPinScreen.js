import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const ChangeWalletPinScreen = ({ navigation }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePin = async () => {
    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('Validation Error', 'All PINs must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Validation Error', 'New PINs do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        current_pin: currentPin,
        new_pin: newPin,
        confirm_pin: confirmPin,
        account_password: password,
      };
      const response = await api.put('/wallet/change-pin', payload);
      Alert.alert('Success', 'Wallet PIN has been changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Change PIN Error:', error?.response?.data || error);
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to change wallet PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1E1E2C', '#2D2D44']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Wallet PIN</Text>
          <View style={{ width: 28 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.instructionText}>
              Update your secure 4-digit PIN for your wallet transactions.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current PIN</Text>
              <TextInput
                style={styles.input}
                value={currentPin}
                onChangeText={(val) => setCurrentPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="numeric"
                secureTextEntry
                placeholder="Enter current 4-digit PIN"
                placeholderTextColor="#666"
                maxLength={4}
                contextMenuHidden={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New PIN</Text>
              <TextInput
                style={styles.input}
                value={newPin}
                onChangeText={(val) => setNewPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="numeric"
                secureTextEntry
                placeholder="Enter new 4-digit PIN"
                placeholderTextColor="#666"
                maxLength={4}
                contextMenuHidden={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New PIN</Text>
              <TextInput
                style={styles.input}
                value={confirmPin}
                onChangeText={(val) => setConfirmPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="numeric"
                secureTextEntry
                placeholder="Re-enter new 4-digit PIN"
                placeholderTextColor="#666"
                maxLength={4}
                contextMenuHidden={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your account password"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleChangePin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Change Secure PIN</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  instructionText: {
    color: '#CCC',
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#383850',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFF',
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#383850',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#FF0844',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangeWalletPinScreen;
