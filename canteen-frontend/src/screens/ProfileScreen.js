import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';
import { useProfile, useWalletBalance } from '../hooks/useApi';

const ProfileScreen = ({ navigation }) => {
  const { userProfile, setUserProfile, setWalletBalance } = useContext(CartContext);
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { balance, refetch: refetchBalance } = useWalletBalance();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile && profile.name) {
      setUserProfile(profile);
    }
  }, [profile, setUserProfile]);

  useEffect(() => {
    if (balance !== undefined && balance !== null) {
      setWalletBalance(balance);
    }
  }, [balance, setWalletBalance]);

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchBalance();
    }, [refetchProfile, refetchBalance])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchProfile();
    await refetchBalance();
    setRefreshing(false);
  }, [refetchProfile, refetchBalance]);

  const displayProfile = profile && profile.name ? profile : userProfile;

  return (
    <LinearGradient
      colors={['#FF9A44', '#FC6076', '#FF0844']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
          }
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBackground}>
              {profileLoading ? (
                 <ActivityIndicator size="large" color="#FF0844" />
              ) : displayProfile?.profile_image ? (
                 <Image source={{ uri: displayProfile.profile_image }} style={{ width: 120, height: 120, borderRadius: 60 }} />
              ) : (
                 <Ionicons name="person" size={60} color="#FF0844" />
              )}
            </View>
            <Text style={styles.userName}>{displayProfile.name || 'Loading...'}</Text>
            <Text style={styles.userEmail}>{displayProfile.email || displayProfile.phone || ''}</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="create-outline" size={22} color="#2196F3" />
                </View>
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={async () => {
                try {
                  await AsyncStorage.removeItem('access_token');
                  setUserProfile({});
                  setWalletBalance(0);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="log-out-outline" size={22} color="#F44336" />
                </View>
                <Text style={[styles.menuItemText, { color: '#F44336' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 16,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#FFEbee',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
});

export default ProfileScreen;
