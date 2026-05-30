import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice, getSafeImageUri } from '../utils/dataUtils';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_COMBO_IMAGE = 'https://images.unsplash.com/photo-1594212691516-7463f25c7e0d?q=80&w=800&auto=format&fit=crop';

const ComboCard = ({ item, onPress, onAddToCart, style, index = 0 }) => {
  const [imageError, setImageError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: Math.min(index * 50, 500),
      useNativeDriver: true,
    }).start();
  }, []);

  if (!item) return null;

  const imageUrl = getSafeImageUri(item.image_url, DEFAULT_COMBO_IMAGE);
  const displayImageUrl = imageError ? DEFAULT_COMBO_IMAGE : imageUrl;

  const originalPrice = parseFloat(item.original_price || item.price || 0);
  const currentPrice = parseFloat(item.discounted_price || item.discount_price || originalPrice);
  const savings = originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const includedCount = Array.isArray(item.items) ? item.items.length : 0;

  return (
    <Animated.View style={[styles.cardWrapper, style, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onPress && onPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayImageUrl }}
            style={styles.cardImage}
            onError={() => setImageError(true)}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          >
            <View style={styles.badgeRow}>
              {item.is_featured && (
                <View style={[styles.badge, styles.featuredBadge]}>
                  <Ionicons name="star" size={10} color="#FFF" style={{marginRight: 2}} />
                  <Text style={styles.badgeText}>FEATURED</Text>
                </View>
              )}
              {item.is_trending && (
                <View style={[styles.badge, styles.trendingBadge]}>
                  <Ionicons name="flame" size={10} color="#FFF" style={{marginRight: 2}} />
                  <Text style={styles.badgeText}>TRENDING</Text>
                </View>
              )}
            </View>
            <View style={styles.itemsIncludedBadge}>
              <Ionicons name="restaurant" size={12} color="#FFF" />
              <Text style={styles.itemsIncludedText}>{includedCount} Items Included</Text>
            </View>
          </LinearGradient>
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.comboName} numberOfLines={2}>{item.name}</Text>
          
          <Text style={styles.comboDescription} numberOfLines={2}>
            {item.description || 'A delicious combination meal.'}
          </Text>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>₹{currentPrice.toFixed(2)}</Text>
              {savings > 0 && (
                <Text style={styles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
              )}
            </View>
            {onAddToCart && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => onAddToCart(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>ADD</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#E0E0E0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadge: {
    backgroundColor: '#FF9800',
  },
  trendingBadge: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  itemsIncludedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemsIncludedText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  comboName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginBottom: 6,
  },
  comboDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 16,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF0844',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#FF0844',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default memo(ComboCard);
