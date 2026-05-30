import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/apiService';
import { CartContext } from '../context/CartContext';
import { formatPrice, normalizeMenuItem } from '../utils/dataUtils';
import ComboCard from '../components/ComboCard';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop';

const CATEGORIES = ['All', 'Snacks', 'Drinks', 'Meals', 'Desserts', '🔥 Trending', '🍱 Combos'];

const MenuCard = ({ item, index, onAddToCart, navigation }) => {
  const [imageError, setImageError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: Math.min(index * 50, 500),
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,
        delay: Math.min(index * 50, 500),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const normalized = normalizeMenuItem(item);
  if (!normalized) return null;

  const displayPrice = normalized.discount_price
    ? formatPrice(normalized.discount_price)
    : formatPrice(normalized.price);

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('FoodDetail', { item: normalized })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageError ? DEFAULT_FOOD_IMAGE : (normalized.image_url || DEFAULT_FOOD_IMAGE) }}
            style={styles.cardImage}
            onError={() => setImageError(true)}
          />
          {normalized.is_special && (
            <View style={styles.specialBadge}>
              <Text style={styles.specialText}>Special</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.nameRow}>
              <View style={[styles.vegIndicator, { borderColor: normalized.is_veg ? '#4CAF50' : '#F44336' }]}>
                <View style={[styles.vegDot, { backgroundColor: normalized.is_veg ? '#4CAF50' : '#F44336' }]} />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{normalized.name}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.metaText}>{normalized.rating || '4.5'}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.metaText}>{normalized.preparation_time || '15'} min</Text>
            </View>
          </View>

          <Text style={styles.itemDescription} numberOfLines={2}>
            {normalized.description || 'Delicious food item'}
          </Text>

          <View style={styles.tagsScroll}>
            {normalized.tags && normalized.tags.slice(0,3).map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <View>
              <View style={styles.priceRow}>
                <Text style={styles.itemPrice}>{displayPrice}</Text>
                {normalized.discount_price > 0 && (
                  <Text style={styles.originalPrice}>₹{normalized.price.toFixed(2)}</Text>
                )}
              </View>
              <Text style={[styles.itemAvailability, { color: normalized.is_available ? '#4CAF50' : '#F44336' }]}>
                {normalized.is_available ? 'Available' : 'Out of stock'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, !normalized.is_available && styles.addButtonDisabled]} 
              disabled={!normalized.is_available}
              onPress={() => onAddToCart(normalized)}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>ADD +</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MenuScreen = ({ route, navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [activeTab, setActiveTab] = useState('Foods');
  const [combos, setCombos] = useState([]);
  
  const { cart, setCart } = useContext(CartContext);

  // When coming from Home screen, route.params might have category
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
      setPage(1);
      setMenuItems([]);
    }
  }, [route.params?.category]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, page, activeTab]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'Foods') {
        const category = (selectedCategory === 'All' || selectedCategory === '🔥 Trending') ? '' : selectedCategory;
        const response = await apiService.getMenuItems(page, 20, '', category);
        
        if (page === 1) {
          setMenuItems(response?.items || []);
        } else {
          setMenuItems(prev => [...prev, ...(response?.items || [])]);
        }
        
        setHasMore(response?.hasMore || false);
      } else {
        const response = await apiService.getCombos(page, 20);
        
        if (page === 1) {
          setCombos(response?.items || []);
        } else {
          setCombos(prev => [...prev, ...(response?.items || [])]);
        }
        
        setHasMore(response?.hasMore || false);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('Could not load data right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, page]);

  const handleAddToCart = useCallback((item) => {
    const itemId = item.id || item._id;
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { 
          id: itemId, 
          name: item.name || 'Unknown', 
          price: item.price || 0,
          image_url: item.image_url,
          quantity: 1
        }];
      }
    });
  }, [setCart]);

  const handleAddComboToCart = useCallback((item) => {
    const itemId = item.id || item._id;
    const currentPrice = parseFloat(item.discounted_price || item.discount_price || item.original_price || item.price || 0);
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { 
          id: itemId, 
          name: item.name || 'Unknown Combo', 
          price: currentPrice,
          image_url: item.image_url,
          quantity: 1
        }];
      }
    });
  }, [setCart]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    setPage(1);
  }, []);

  const filteredItems = menuItems.filter((item) => {
    if (!item) return false;
    const itemName = (item.name || '').toLowerCase();
    const itemDesc = (item.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || itemName.includes(query) || itemDesc.includes(query);
    
    if (selectedCategory === '🔥 Trending') {
      return matchesSearch && item.is_trending === true;
    }

    const itemCategory = (item.category || '').toLowerCase();
    const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredCombos = combos.filter((item) => {
    if (!item) return false;
    const itemName = (item.name || '').toLowerCase();
    const itemDesc = (item.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return !searchQuery || itemName.includes(query) || itemDesc.includes(query);
  });

  const displayItems = activeTab === 'Foods' ? filteredItems : filteredCombos;

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={32} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Menu 🍔</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Foods' && styles.activeTabButton]}
          onPress={() => setActiveTab('Foods')}
        >
          <Text style={[styles.tabText, activeTab === 'Foods' && styles.activeTabText]}>Foods</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Combos' && styles.activeTabButton]}
          onPress={() => setActiveTab('Combos')}
        >
          <Text style={[styles.tabText, activeTab === 'Combos' && styles.activeTabText]}>Combos</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Foods' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            editable={!loading}
          />
          <TouchableOpacity 
            style={[styles.filterButton, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={() => setPage(1)}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'Foods' && (
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip, 
                  selectedCategory === category && styles.categoryChipActive,
                  index === CATEGORIES.length - 1 && { marginRight: 0 }
                ]}
                onPress={() => {
                  if (category === '🍱 Combos') {
                    setActiveTab('Combos');
                    setSelectedCategory('All');
                  } else {
                    setSelectedCategory(category);
                  }
                }}
              >
                <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['#FF9A44', '#FC6076']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Fetching menu...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#FFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={[{ id: 'header' }, ...displayItems]}
              keyExtractor={(item, index) => item.id ? (item.id.toString() + index) : ('item-' + index)}
              stickyHeaderIndices={[0]}
              renderItem={({ item, index }) => {
                if (item.id === 'header') return renderHeader();
                
                if (activeTab === 'Combos') {
                  return (
                    <View style={{ paddingHorizontal: 20 }}>
                      <ComboCard 
                        item={item} 
                        index={index - 1} 
                        onAddToCart={handleAddComboToCart}
                        onPress={(item) => navigation.navigate('ComboDetail', { item })}
                      />
                    </View>
                  );
                }

                return <MenuCard item={item} index={index - 1} onAddToCart={handleAddToCart} navigation={navigation} />;
              }}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              onEndReached={() => hasMore && setPage(page + 1)}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() => (
                hasMore && !loading ? (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                ) : null
              )}
              ListEmptyComponent={() => (
                displayItems.length === 0 && !loading ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name={activeTab === 'Foods' ? 'fast-food-outline' : 'restaurant-outline'} size={50} color="#FFF" />
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found 🍔</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => { setPage(1); setSearchQuery(''); }}
                    >
                      <Text style={styles.retryText}>Clear Filters</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              )}
            />

            {cart && cart.length > 0 && (
              <TouchableOpacity 
                style={styles.floatingCartButton} 
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.7}
              >
                <Ionicons name="cart" size={24} color="#FFF" />
                <Text style={styles.floatingCartText}>Cart ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</Text>
              </TouchableOpacity>
            )}
          </>
        )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 80,
  },
  headerSection: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,154,68,0.95)', // matches top of gradient
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FF0844',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 40,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  filterButton: {
    backgroundColor: '#FF0844',
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  categoriesWrapper: {
    marginBottom: 12,
    marginHorizontal: -20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryChipActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryChipText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  categoryChipTextActive: {
    color: '#FF0844',
  },
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  specialBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF0844',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specialText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  vegIndicator: {
    width: 12,
    height: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 2,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  tagsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#1976D2',
    fontSize: 9,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FF0844',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF0844',
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  itemAvailability: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#FF512F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF512F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FF0844',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 12,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default MenuScreen;
