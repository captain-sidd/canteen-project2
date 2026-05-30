import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/dataUtils';

const { width } = Dimensions.get('window');

const ComboDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { cart, setCart } = useContext(CartContext);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const originalPrice = parseFloat(item.original_price || item.price || 0);
  const currentPrice = parseFloat(item.discounted_price || item.discount_price || originalPrice);
  const savings = originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    const itemId = item.id || item._id;
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { 
          id: itemId, 
          name: item.name || 'Unknown Combo', 
          price: currentPrice,
          image_url: item.image_url,
          quantity: quantity
        }];
      }
    });
    navigation.goBack();
  };

  const galleryImages = item.gallery_images && item.gallery_images.length > 0 
    ? [item.image_url, ...item.gallery_images].filter(Boolean)
    : [item.image_url || 'https://images.unsplash.com/photo-1594212691516-7463f25c7e0d?q=80&w=800&auto=format&fit=crop'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
          >
            {galleryImages.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.foodImage} />
            ))}
          </ScrollView>
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent']}
            style={styles.imageTopOverlay}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                {item.is_featured && (
                  <View style={[styles.badge, { backgroundColor: '#FF9800', marginRight: 8 }]}>
                    <Ionicons name="star" size={12} color="#FFF" style={{marginRight: 2}}/>
                    <Text style={styles.badgeText}>FEATURED COMBO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.foodName}>{item.name}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>₹{currentPrice.toFixed(2)}</Text>
              {savings > 0 && (
                <Text style={styles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
              )}
            </View>
          </View>

          {savings > 0 && (
            <View style={styles.savingsBanner}>
              <Ionicons name="gift" size={20} color="#4CAF50" style={{marginRight: 8}} />
              <Text style={styles.savingsBannerText}>You save ₹{savings.toFixed(2)} on this combo!</Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.sectionTitle}>About this Combo</Text>
          <Text style={styles.descriptionText}>
            {item.description || 'A specially curated combination meal for the perfect experience.'}
          </Text>

          {/* Included Items */}
          {item.items && item.items.length > 0 && (
            <View style={styles.includedSection}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              {item.items.map((incItem, i) => (
                <View key={i} style={styles.includedItemRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#FF0844" />
                  <Text style={styles.includedItemText}>
                    {incItem.quantity ? `${incItem.quantity}x ` : ''}{incItem.name || incItem.menu_item_name}
                  </Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.qtyButton} onPress={handleDecrease}>
            <Ionicons name="remove" size={24} color="#FF0844" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={handleIncrease}>
            <Ionicons name="add" size={24} color="#FF0844" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartBtn} 
          onPress={handleAddToCart}
        >
          <LinearGradient
            colors={['#FF9A44', '#FF0844']}
            style={styles.gradientBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.addToCartText}>
              Add to Cart - ₹{(currentPrice * quantity).toFixed(2)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    position: 'relative',
  },
  foodImage: {
    width: width,
    height: width * 0.8,
  },
  imageTopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  contentContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  foodName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#333',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF0844',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '600',
    marginTop: 2,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  savingsBannerText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  includedSection: {
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  includedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  includedItemText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 12,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 30,
    padding: 4,
    marginRight: 16,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
  },
  addToCartBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComboDetailScreen;
