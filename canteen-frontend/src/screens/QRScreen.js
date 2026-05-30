import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const QRScreen = ({ route, navigation }) => {
  // Extract qr_code from route params
  const { qr_code } = route.params || {};

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: 'MainApp', 
          params: { screen: 'HomeTabs', params: { screen: 'Home' } } 
        }
      ],
    });
  };

  const handleGoOrders = () => {
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: 'MainApp', 
          params: { screen: 'HomeTabs', params: { screen: 'Orders' } } 
        }
      ],
    });
  };

  return (
    <LinearGradient
      colors={['#FF9A44', '#FC6076', '#FF0844']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoHome}>
            <Ionicons name="home" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Show this QR at counter</Text>
          <Text style={styles.subtitle}>Your order is being prepared 🍔</Text>
          
          <View style={styles.qrCard}>
            {qr_code ? (
              <Image 
                source={{ uri: qr_code }} 
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="qr-code-outline" size={100} color="#CCC" />
                <Text style={styles.errorText}>No QR Code available</Text>
              </View>
            )}
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={handleGoHome}
            >
              <Text style={styles.doneButtonText}>Back to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.doneButton, styles.ordersButton]} 
              onPress={handleGoOrders}
            >
              <Text style={[styles.doneButtonText, styles.ordersButtonText]}>View Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFEbee',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  qrCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
    marginBottom: 40,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFF',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  ordersButton: {
    backgroundColor: '#FFF',
  },
  ordersButtonText: {
    color: '#FF0844',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRScreen;
