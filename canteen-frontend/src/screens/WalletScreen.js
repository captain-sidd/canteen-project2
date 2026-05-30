import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import { useWalletBalance, useWalletHistory } from '../hooks/useApi';
import apiService from '../services/apiService';

const WalletScreen = ({ navigation }) => {
  const { setWalletBalance } = useContext(CartContext);
  const { balance, loading, refetch } = useWalletBalance();
  const { transactions, loading: historyLoading, refetch: refetchHistory } = useWalletHistory();
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    await refetchHistory();
    setRefreshing(false);
  }, [refetch, refetchHistory]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchHistory();
    }, [refetch, refetchHistory])
  );

  const handleAddMoney = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to add.');
      return;
    }

    setAdding(true);
    try {
      const response = await apiService.addWalletBalance(value, 'upi');
      if (response && response.new_balance !== undefined) {
        setWalletBalance(response.new_balance);
        refetch();
        refetchHistory();
        Alert.alert('Success', `₹${value.toFixed(2)} added to your wallet!`);
        setAmount('');
      } else {
        setWalletBalance(prev => prev + value);
        refetch();
        refetchHistory();
        Alert.alert('Success', `₹${value.toFixed(2)} added to your wallet!`);
        setAmount('');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not add money to wallet. Try again.');
    } finally {
      setAdding(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.topSection}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <Text style={styles.balanceAmount}>₹{(balance || 0).toFixed(2)}</Text>
        )}
      </View>

      <View style={styles.addMoneyCard}>
        <Text style={styles.addMoneyTitle}>Top Up Wallet</Text>
        <Text style={styles.addMoneySubtitle}>Add funds to speed up your checkout</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.quickAddContainer}>
          {[100, 200, 500].map((val) => (
            <TouchableOpacity 
              key={val} 
              style={styles.quickAddButton}
              onPress={() => setAmount(val.toString())}
            >
              <Text style={styles.quickAddText}>+₹{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.addButton, adding && { opacity: 0.7 }]} 
          onPress={handleAddMoney}
          disabled={adding}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {adding ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.addButtonText}>ADD MONEY</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Recent Transactions</Text>
    </View>
  );

  const renderTransaction = ({ item }) => {
    const isCredit = item.type === 'credit';
    const dateObj = new Date(item.created_at || Date.now());
    
    return (
      <View style={styles.transactionCard}>
        <View style={[styles.txIconContainer, { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' }]}>
          <Ionicons name={isCredit ? 'arrow-down' : 'arrow-up'} size={20} color={isCredit ? '#4CAF50' : '#F44336'} />
        </View>
        <View style={styles.txDetails}>
          <Text style={styles.txDescription} numberOfLines={1}>
            {item.description || (isCredit ? 'Wallet Top-up' : 'Payment')}
          </Text>
          <Text style={styles.txDate}>
            {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.txAmountContainer}>
          <Text style={[styles.txAmount, { color: isCredit ? '#4CAF50' : '#333' }]}>
            {isCredit ? '+' : '-'}₹{(item.amount || 0).toFixed(2)}
          </Text>
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
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.content}>
          <FlatList
            data={transactions}
            keyExtractor={(item, index) => item.transaction_id || item.id || item._id || index.toString()}
            ListHeaderComponent={renderHeader}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
            }
            ListEmptyComponent={() => (
              !historyLoading && (
                <View style={styles.emptyHistory}>
                  <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.emptyHistoryText}>No transactions yet</Text>
                </View>
              )
            )}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  content: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  topSection: { paddingTop: 10 },
  balanceCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 20 },
  balanceLabel: { fontSize: 18, color: '#666', fontWeight: '600', marginBottom: 8 },
  balanceAmount: { fontSize: 48, fontWeight: '900', color: '#4CAF50' },
  addMoneyCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, paddingVertical: 32, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 24 },
  addMoneyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  addMoneySubtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 16, marginBottom: 20, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#EFEFEF' },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', color: '#333', marginRight: 10 },
  input: { flex: 1, fontSize: 22, color: '#333', fontWeight: 'bold' },
  quickAddContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickAddButton: { backgroundColor: '#E8F5E9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#C8E6C9', flex: 1, marginHorizontal: 4, alignItems: 'center' },
  quickAddText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 16 },
  addButton: { borderRadius: 50, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8, overflow: 'hidden' },
  gradientButton: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 50 },
  addButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1.2 },
  historyTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 16, marginLeft: 4, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  transactionCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  txIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDetails: { flex: 1, marginRight: 12 },
  txDescription: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#888', fontWeight: '500' },
  txAmountContainer: { alignItems: 'flex-end' },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyHistory: { alignItems: 'center', paddingVertical: 30 },
  emptyHistoryText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', marginTop: 12 },
});

export default WalletScreen;
