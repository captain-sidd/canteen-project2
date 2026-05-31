import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';

const CustomDrawer = (props) => {
  const { userProfile, setUserProfile, setWalletBalance } = useContext(CartContext);
  const { navigation } = props;

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      setUserProfile({});
      setWalletBalance(0);
      // Reset navigation stack to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
        {/* Profile Section */}
        <LinearGradient
          colors={['#FF512F', '#DD2476']}
          style={styles.profileSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={{ uri: userProfile?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{userProfile?.email || 'user@example.com'}</Text>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.customMenuItem} onPress={() => navigation.navigate('HomeTabs', { screen: 'Wallet' })}>
            <Ionicons name="wallet-outline" size={22} color="#888" style={styles.customMenuIcon} />
            <Text style={styles.customMenuText}>Wallet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.customMenuItem} onPress={() => navigation.navigate('SetWalletPin')}>
            <Ionicons name="keypad-outline" size={22} color="#888" style={styles.customMenuIcon} />
            <Text style={styles.customMenuText}>Set Wallet PIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.customMenuItem} onPress={() => navigation.navigate('ChangeWalletPin')}>
            <Ionicons name="lock-closed-outline" size={22} color="#888" style={styles.customMenuIcon} />
            <Text style={styles.customMenuText}>Change Wallet PIN</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Sign Out Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#FF0844" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C', // Soft dark drawer background
  },
  scrollContainer: {
    backgroundColor: '#1E1E2C',
    paddingTop: 0, // Remove default padding
  },
  profileSection: {
    padding: 20,
    paddingTop: 60, // Account for status bar
    paddingBottom: 30,
    alignItems: 'flex-start',
    borderBottomRightRadius: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: 12,
  },
  profileName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#FFEbee',
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  customMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  customMenuIcon: {
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  customMenuText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 8, 68, 0.1)',
    borderRadius: 12,
  },
  signOutText: {
    color: '#FF0844',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CustomDrawer;
