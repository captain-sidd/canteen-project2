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

const FoodDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { cart, setCart } = useContext(CartContext);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

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
          name: item.name || 'Unknown', 
          price: item.discount_price || item.price || 0,
          image_url: item.image_url,
          quantity: quantity
        }];
      }
    });
    navigation.goBack();
  };

  const displayPrice = item.discount_price
    ? formatPrice(item.discount_price)
    : formatPrice(item.price);

  const galleryImages = item.gallery_images && item.gallery_images.length > 0 
    ? [item.image_url, ...item.gallery_images].filter(Boolean)
    : [item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'];

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
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <View style={[styles.vegIndicator, { borderColor: item.is_veg ? '#4CAF50' : '#F44336' }]}>
                  <View style={[styles.vegDot, { backgroundColor: item.is_veg ? '#4CAF50' : '#F44336' }]} />
                </View>
                <Text style={styles.foodName}>{item.name}</Text>
              </View>
              {item.category && (
                <Text style={styles.categoryText}>{item.category}</Text>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{displayPrice}</Text>
              {item.discount_price > 0 && (
                <Text style={styles.originalPrice}>₹{item.price.toFixed(2)}</Text>
              )}
            </View>
          </View>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.metaText}>{item.rating || '4.5'} ({item.rating_count || 120})</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{item.preparation_time || '15'} min</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="flame-outline" size={16} color="#FF512F" />
              <Text style={styles.metaText}>{item.calories || '350'} kcal</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>
            {item.description || 'A delicious and freshly prepared meal to satisfy your cravings.'}
          </Text>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.tagsWrapper}>
                {item.ingredients.map((ing, i) => (
                  <View key={i} style={styles.ingredientChip}>
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.sectionTitle}>Allergens</Text>
              <View style={styles.tagsWrapper}>
                {item.allergens.map((alg, i) => (
                  <View key={i} style={styles.allergenChip}>
                    <Text style={styles.allergenText}>{alg}</Text>
                  </View>
                ))}
              </View>
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
          style={[styles.addToCartBtn, !item.is_available && styles.addToCartDisabled]} 
          onPress={handleAddToCart}
          disabled={!item.is_available}
        >
          <LinearGradient
            colors={item.is_available ? ['#FF9A44', '#FF0844'] : ['#CCC', '#999']}
            style={styles.gradientBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.addToCartText}>
              {item.is_available ? `Add to Cart - ₹${(parseFloat(item.discount_price || item.price) * quantity).toFixed(2)}` : 'Out of Stock'}
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
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 3,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginLeft: 24, // aligns with text
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
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 24,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ingredientText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  allergenChip: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergenText: {
    color: '#C62828',
    fontSize: 13,
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
  addToCartDisabled: {
    shadowOpacity: 0,
    elevation: 0,
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

export default FoodDetailScreen;
