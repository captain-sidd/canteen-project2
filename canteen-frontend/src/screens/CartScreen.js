import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import apiService from '../services/apiService';
import { formatPrice, getSafeImageUri } from '../utils/dataUtils';

const CartScreen = ({ navigation }) => {
  const { cart, setCart, walletBalance, setWalletBalance } = useContext(CartContext);
  
  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('selection'); // 'selection', 'wallet_pin', 'upi_id', 'processing', 'success', 'error'
  const [walletPin, setWalletPin] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  // Success Animation Value
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paymentStep === 'success') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [paymentStep]);

  const handleIncrease = (item) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  const handleDecrease = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.name === item.name);
      if (existingItem.quantity === 1) {
        return prevCart.filter((cartItem) => cartItem.name !== item.name);
      }
      return prevCart.map((cartItem) =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const processOrder = async (paymentMethod, paymentId = null) => {
    try {
      const subtotal = parseFloat(calculateTotal());
      const payload = {
        items: cart.map(item => ({
          menu_item_id: item.id || item._id,
          quantity: item.quantity || 1,
        })),
        total_amount: subtotal,
        payment_method: paymentMethod || 'upi',
        payment_status: "paid",
        payment_id: paymentId,
        order_type: "dine_in",
        notes: "",
      };

      console.log("ORDER PAYLOAD", payload);

      const response = await api.post('/orders', payload);
      const data = response.data || response;
      
      if (data && (data.id || data._id || data.qr_code)) {
        setCart([]);
        setShowPaymentModal(false);
        if (data.qr_code) {
           navigation.navigate('QR', { qr_code: data.qr_code });
        } else {
           Alert.alert(
             'Order Placed Successfully!',
             `Order #${data.order_number || 'N/A'}\n\nTotal: ₹${subtotal.toFixed(2)}\n\nYour order is being prepared.`,
             [{ text: 'OK', onPress: () => navigation.navigate('Orders') }]
           );
        }
      } else {
        setPaymentStep('error');
        setPaymentError('Order creation failed after payment. Please contact support.');
      }
    } catch (error) {
      console.error('Order Error:', error);
      setPaymentStep('error');
      setPaymentError('Failed to place order. Please contact support.');
    }
  };

  const handleWalletPayment = async () => {
    if (walletPin.length !== 4) {
      setPaymentError('Please enter a 4-digit PIN');
      return;
    }
    
    setPaymentStep('processing');
    try {
      const subtotal = parseFloat(calculateTotal());
      const payload = {
        order_items: cart.map(item => ({
          menu_item_id: item.id || item._id,
          quantity: item.quantity || 1,
        })),
        subtotal: subtotal,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: subtotal,
        wallet_pin: walletPin,
        notes: "App Wallet Checkout",
      };

      console.log("PAYMENT PAYLOAD (WALLET):", JSON.stringify(payload, null, 2));

      const res = await apiService.processWalletPayment(payload);
      if (res && res.payment) {
        setWalletBalance(res.wallet_balance);
        setPaymentStep('success');
        setTimeout(() => processOrder('wallet', res.payment.payment_id), 2000);
      } else {
        setPaymentStep('error');
        setPaymentError('Payment failed. Please check your PIN and balance.');
      }
    } catch (error) {
      setPaymentStep('error');
      setPaymentError(error?.response?.data?.detail || 'Network error. Try again.');
    }
  };

  const handleUpiPayment = async () => {
    if (upiId.length < 5 || !upiId.includes('@')) {
      setPaymentError('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    
    setPaymentStep('processing');
    try {
      const subtotal = parseFloat(calculateTotal());
      const payload = {
        order_items: cart.map(item => ({
          menu_item_id: item.id || item._id,
          quantity: item.quantity || 1,
        })),
        subtotal: subtotal,
        total_amount: subtotal,
        upi_id: upiId,
        notes: "App UPI Checkout",
      };

      console.log("PAYMENT PAYLOAD (UPI):", JSON.stringify(payload, null, 2));

      const res = await apiService.processUpiPayment(payload);
      if (res && res.status === 'success') {
        setPaymentStep('success');
        setTimeout(() => processOrder('upi', res.payment?.payment_id), 2000);
      } else {
        setPaymentStep('error');
        setPaymentError('UPI payment declined.');
      }
    } catch (error) {
      setPaymentStep('error');
      setPaymentError(error?.response?.data?.detail || 'Network error. Try again.');
    }
  };

  const handlePaymentSelection = (method) => {
    const totalAmount = parseFloat(calculateTotal());
    if (method === 'wallet') {
      if (walletBalance < totalAmount) {
        Alert.alert('Insufficient Funds', 'You do not have enough balance in your wallet. Please top up or use UPI.');
        return;
      }
      setPaymentStep('wallet_pin');
      setWalletPin('');
      setPaymentError('');
    } else if (method === 'upi') {
      setPaymentStep('upi_id');
      setUpiId('');
      setPaymentError('');
    }
  };

  const renderCartItem = ({ item }) => {
    const itemId = item.id || item._id;
    const imageUrl = getSafeImageUri(item.image_url);
    const price = parseFloat(item.price || 0);
    const displayPrice = formatPrice(price);
    
    return (
      <View style={styles.cartItemCard}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name || 'Unknown Item'}</Text>
          <Text style={styles.itemPrice}>{displayPrice}</Text>
          <Text style={styles.itemSubtotal}>x{item.quantity || 1} = {formatPrice(price * (item.quantity || 1))}</Text>
        </View>
        <View style={styles.quantityController}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => handleDecrease(item)}
            disabled={paymentStep === 'processing'}
          >
            <Ionicons name="remove" size={18} color="#FF0844" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity || 1}</Text>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => handleIncrease(item)}
            disabled={paymentStep === 'processing'}
          >
            <Ionicons name="add" size={18} color="#FF0844" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FF9A44', '#FC6076', '#FF0844']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 28 }} /> 
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="rgba(255,255,255,0.7)" />
            <Text style={styles.emptyText}>Your cart is empty!</Text>
            <TouchableOpacity style={styles.startOrderingButton} onPress={() => navigation.goBack()}>
              <Text style={styles.startOrderingText}>Start Ordering</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cartContainer}>
            <FlatList
              data={cart}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              renderItem={renderCartItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.footer}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>₹{calculateTotal()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tax</Text>
                <Text style={styles.breakdownValue}>₹0.00</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Discount</Text>
                <Text style={styles.breakdownValue}>₹0.00</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalPrice}>₹{calculateTotal()}</Text>
              </View>
              <TouchableOpacity 
                style={styles.checkoutButton} 
                onPress={() => {
                  setPaymentStep('selection');
                  setShowPaymentModal(true);
                }}
              >
                <Text style={styles.checkoutText}>Proceed to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Modal */}
        <Modal
          visible={showPaymentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => paymentStep !== 'processing' && setShowPaymentModal(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {paymentStep === 'selection' ? 'Select Payment' : 
                   paymentStep === 'wallet_pin' ? 'Wallet Payment' : 
                   paymentStep === 'upi_id' ? 'UPI Payment' : 
                   paymentStep === 'processing' ? 'Processing...' : 
                   paymentStep === 'success' ? 'Payment Successful' : 'Payment Failed'}
                </Text>
                {paymentStep !== 'processing' && paymentStep !== 'success' && (
                  <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                    <Ionicons name="close" size={28} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {paymentStep !== 'success' && paymentStep !== 'processing' && paymentStep !== 'error' && (
                <View style={styles.modalAmountContainer}>
                  <Text style={styles.modalAmountLabel}>Amount to Pay</Text>
                  <Text style={styles.modalAmountValue}>₹{calculateTotal()}</Text>
                </View>
              )}

              {paymentError !== '' && paymentStep !== 'processing' && paymentStep !== 'success' && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color="#F44336" />
                  <Text style={styles.errorText}>{paymentError}</Text>
                </View>
              )}

              {paymentStep === 'selection' && (
                <View style={styles.paymentOptions}>
                  <TouchableOpacity style={[styles.paymentButton, styles.walletButton]} onPress={() => handlePaymentSelection('wallet')}>
                    <View style={styles.paymentButtonContent}>
                      <Ionicons name="wallet" size={24} color="#4CAF50" />
                      <Text style={styles.paymentButtonText}>Pay with Wallet</Text>
                    </View>
                    <Text style={styles.walletBalanceText}>(Bal: ₹{walletBalance.toFixed(2)})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.paymentButton, styles.upiButton]} onPress={() => handlePaymentSelection('upi')}>
                    <View style={styles.paymentButtonContent}>
                      <Ionicons name="qr-code" size={24} color="#2196F3" />
                      <Text style={styles.paymentButtonText}>Pay with UPI</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {paymentStep === 'wallet_pin' && (
                <View style={styles.inputStepContainer}>
                  <Text style={styles.inputLabel}>Enter 4-Digit Wallet PIN</Text>
                  <View style={styles.pinDisplayContainer}>
                    {[0, 1, 2, 3].map((i) => (
                      <View key={i} style={[styles.pinDot, walletPin.length > i && styles.pinDotFilled]} />
                    ))}
                  </View>
                  <TextInput
                    style={styles.hiddenPinInput}
                    value={walletPin}
                    onChangeText={(val) => setWalletPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                    keyboardType="numeric"
                    autoFocus
                    maxLength={4}
                    secureTextEntry
                  />
                  <TouchableOpacity 
                    style={[styles.payNowButton, walletPin.length !== 4 && styles.payNowButtonDisabled]} 
                    onPress={handleWalletPayment}
                    disabled={walletPin.length !== 4}
                  >
                    <Text style={styles.payNowText}>Pay ₹{calculateTotal()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.backLink} onPress={() => setPaymentStep('selection')}>
                    <Text style={styles.backLinkText}>Change Payment Method</Text>
                  </TouchableOpacity>
                </View>
              )}

              {paymentStep === 'upi_id' && (
                <View style={styles.inputStepContainer}>
                  <Text style={styles.inputLabel}>Enter UPI ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="e.g. name@bank"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={[styles.payNowButton, (upiId.length < 5 || !upiId.includes('@')) && styles.payNowButtonDisabled]} 
                    onPress={handleUpiPayment}
                    disabled={upiId.length < 5 || !upiId.includes('@')}
                  >
                    <Text style={styles.payNowText}>Verify & Pay ₹{calculateTotal()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.backLink} onPress={() => setPaymentStep('selection')}>
                    <Text style={styles.backLinkText}>Change Payment Method</Text>
                  </TouchableOpacity>
                </View>
              )}

              {paymentStep === 'processing' && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#FF0844" />
                  <Text style={styles.processingText}>Processing Payment securely...</Text>
                  <Text style={styles.processingSubText}>Please do not close this screen.</Text>
                </View>
              )}

              {paymentStep === 'success' && (
                <Animated.View style={[styles.successContainer, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.successIconCircle}>
                    <Ionicons name="checkmark" size={50} color="#FFF" />
                  </View>
                  <Text style={styles.successTitle}>Payment Successful!</Text>
                  <Text style={styles.successSubText}>Generating your order...</Text>
                </Animated.View>
              )}

              {paymentStep === 'error' && (
                <View style={styles.errorStateContainer}>
                  <Ionicons name="close-circle" size={64} color="#F44336" />
                  <Text style={styles.errorStateTitle}>Payment Failed</Text>
                  <TouchableOpacity style={styles.retryPaymentButton} onPress={() => setPaymentStep('selection')}>
                    <Text style={styles.retryPaymentText}>Try Another Method</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 24 },
  startOrderingButton: { backgroundColor: '#FFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, elevation: 5 },
  startOrderingText: { color: '#FF0844', fontSize: 16, fontWeight: 'bold' },
  cartContainer: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  cartItemCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between', elevation: 4 },
  itemImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12, backgroundColor: '#EEE' },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#FF0844' },
  itemSubtotal: { fontSize: 12, color: '#666', marginTop: 2, fontWeight: '600' },
  quantityController: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 20, padding: 4 },
  controlButton: { backgroundColor: '#FFF', borderRadius: 16, padding: 6, elevation: 2 },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 12 },
  footer: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  breakdownValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalPrice: { fontSize: 26, fontWeight: '900', color: '#FF0844' },
  checkoutButton: { backgroundColor: '#FF0844', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 6 },
  checkoutText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, minHeight: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  modalAmountContainer: { alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, marginBottom: 20 },
  modalAmountLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  modalAmountValue: { fontSize: 32, fontWeight: '900', color: '#FF0844' },
  paymentOptions: { gap: 16 },
  paymentButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#F0F0F0', backgroundColor: '#FFF' },
  walletButton: { borderColor: '#E8F5E9', backgroundColor: '#FAFAFA' },
  upiButton: { borderColor: '#E3F2FD', backgroundColor: '#FAFAFA' },
  paymentButtonContent: { flexDirection: 'row', alignItems: 'center' },
  paymentButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 12 },
  walletBalanceText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  errorBox: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  errorText: { color: '#F44336', marginLeft: 8, flex: 1, fontSize: 13, fontWeight: '600' },
  inputStepContainer: { alignItems: 'center' },
  inputLabel: { fontSize: 16, color: '#333', fontWeight: '600', marginBottom: 20 },
  pinDisplayContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
  pinDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E0E0E0' },
  pinDotFilled: { backgroundColor: '#FF0844' },
  hiddenPinInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  textInput: { width: '100%', height: 56, backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, fontSize: 18, marginBottom: 24, textAlign: 'center', fontWeight: '500' },
  payNowButton: { width: '100%', backgroundColor: '#FF0844', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 4 },
  payNowButtonDisabled: { backgroundColor: '#CCC', elevation: 0 },
  payNowText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backLink: { marginTop: 20 },
  backLinkText: { color: '#666', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  processingContainer: { alignItems: 'center', paddingVertical: 40 },
  processingText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#333' },
  processingSubText: { marginTop: 8, fontSize: 14, color: '#666' },
  successContainer: { alignItems: 'center', paddingVertical: 30 },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 8 },
  successSubText: { fontSize: 16, color: '#666', fontWeight: '500' },
  errorStateContainer: { alignItems: 'center', paddingVertical: 30 },
  errorStateTitle: { fontSize: 24, fontWeight: 'bold', color: '#F44336', marginTop: 16, marginBottom: 24 },
  retryPaymentButton: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F44336', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  retryPaymentText: { color: '#F44336', fontSize: 16, fontWeight: 'bold' },
});

export default CartScreen;
