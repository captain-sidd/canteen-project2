import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const OrderDetailScreen = ({ route, navigation }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [viewMode, setViewMode] = useState('receipt'); // 'receipt' or 'qr'
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    const orderId = order.id || order._id;
    if (!orderId) return;

    const fetchStatus = async () => {
      try {
        const response = await api.get(`/orders/${orderId}/status`);
        if (response.data && response.data.status) {
          setOrder(prev => ({ ...prev, status: response.data.status }));
          if (response.data.status.toLowerCase() === 'completed') {
            setIsPolling(false);
          }
        }
      } catch (err) {
        console.warn('Failed to poll status', err);
      }
    };

    let interval;
    if (isPolling) {
      interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [order.id, order._id, isPolling]);

  const orderId = order.id || order._id || 'Unknown';
  const shortId = orderId.toString().slice(-6).toUpperCase();
  
  const totalAmount = order.total_amount || 
    (order.items ? order.items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0) : 0);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'ready':
        return '#2196F3';
      case 'preparing':
      case 'processing':
        return '#FFC107';
      case 'pending':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const renderReceiptView = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>Order Receipt</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20', flexDirection: 'row', alignItems: 'center' }]}>
            {isPolling && (
              <ActivityIndicator size="small" color={getStatusColor(order.status)} style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status ? order.status.toUpperCase() : 'PENDING'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {order.items && order.items.map((item, index) => (
          <View key={index} style={styles.receiptItem}>
            <View style={styles.itemMainInfo}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.menu_item_name || item.name || 'Menu Item'}
              </Text>
            </View>
            <Text style={styles.itemPrice}>
              ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalAmount}>₹{parseFloat(totalAmount).toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderQRView = () => (
    <View style={styles.qrContainer}>
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Show this QR at counter</Text>
        
        <View style={styles.qrBox}>
          {order.qr_code ? (
            <Image 
              source={{ uri: order.qr_code }} 
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="qr-code-outline" size={80} color="#CCC" />
              <Text style={styles.errorText}>QR Code not generated yet</Text>
            </View>
          )}
        </View>

        <Text style={styles.qrSubtitle}>Order #{shortId}</Text>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Order #{shortId}</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'receipt' && styles.activeToggleButton]}
            onPress={() => setViewMode('receipt')}
          >
            <Ionicons name="receipt-outline" size={20} color={viewMode === 'receipt' ? '#FF0844' : '#FFF'} />
            <Text style={[styles.toggleText, viewMode === 'receipt' && styles.activeToggleText]}>
              Receipt
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'qr' && styles.activeToggleButton]}
            onPress={() => setViewMode('qr')}
          >
            <Ionicons name="qr-code-outline" size={20} color={viewMode === 'qr' ? '#FF0844' : '#FFF'} />
            <Text style={[styles.toggleText, viewMode === 'qr' && styles.activeToggleText]}>
              QR Code
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'receipt' ? renderReceiptView() : renderQRView()}

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
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 26,
  },
  activeToggleButton: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeToggleText: {
    color: '#FF0844',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  receiptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 40,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemMainInfo: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 16,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0844',
    width: 30,
  },
  itemName: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF0844',
  },
  qrContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrBox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginTop: 12,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default OrderDetailScreen;
