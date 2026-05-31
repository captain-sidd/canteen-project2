import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTrendingItems, useSpecials, useFeaturedItems, useFeaturedCombos } from '../hooks/useApi';
import { formatPrice, getSafeImageUri, getItemBadge } from '../utils/dataUtils';
import HeroCarousel from '../components/HeroCarousel';
import ComboCard from '../components/ComboCard';

// Banner handled in HeroCarousel

const CATEGORIES = [
  { id: '1', name: 'Snacks', icon: 'pizza-outline' },
  { id: '2', name: 'Drinks', icon: 'cafe-outline' },
  { id: '3', name: 'Meals', icon: 'restaurant-outline' },
  { id: '4', name: 'Desserts', icon: 'ice-cream-outline' },
];

const OFFERS = [
  { id: 'o1', title: '20% OFF', subtitle: 'On all Combos', color1: '#FF512F', color2: '#DD2476' },
  { id: 'o2', title: 'Free Drink', subtitle: 'With any Burger', color1: '#43cea2', color2: '#185a9d' },
];

const ItemCard = ({ item, onPress }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!item) return null;

  const originalUrl = getSafeImageUri(item.image_url || item.image);
  const fallbackUrl = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop';
  const imageUrl = imageError ? fallbackUrl : originalUrl;
  
  const badge = getItemBadge(item);
  const displayPrice = item.discount_price
    ? formatPrice(item.discount_price)
    : formatPrice(item.price);

  return (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          onError={() => setImageError(true)}
        />
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name || 'Unknown Item'}
        </Text>
        <Text style={styles.itemPrice}>{displayPrice}</Text>
      </View>
    </TouchableOpacity>
  );
};

const MemoizedItemCard = React.memo(ItemCard);

const LoadingSkeletons = ({ count = 3 }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <View key={`skeleton-${i}`} style={styles.itemCard}>
        <View style={[styles.cardImage, { backgroundColor: '#E0E0E0' }]} />
        <View style={styles.cardContent}>
          <View style={{ height: 16, backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 4 }} />
          <View style={{ height: 14, backgroundColor: '#E0E0E0', borderRadius: 4, width: '60%' }} />
        </View>
      </View>
    ))}
  </>
);

const HomeScreen = ({ navigation }) => {
  const { items: trending, loading: trendingLoading } = useTrendingItems();
  const { items: specials, loading: specialsLoading } = useSpecials();
  const { items: featuredCombos, loading: combosLoading } = useFeaturedCombos();

  const handleCategoryPress = (categoryName) => {
    navigation.navigate('Menu', { category: categoryName });
  };

  const handleItemPress = (item) => {
    navigation.navigate('FoodDetail', { item });
  };

  const handleComboPress = (combo) => {
    navigation.navigate('ComboDetail', { item: combo });
  };

  const renderHeader = () => (
    <View style={styles.topHeader}>
      <View style={styles.titleRow}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={32} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>FoodFest 🍔</Text>
          <Text style={styles.subtitle}>What are you craving today?</Text>
        </View>
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
        {renderHeader()}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* 1. Hero Banner */}
          <HeroCarousel onBannerPress={(banner) => navigation.navigate('Menu')} />

          {/* 2. Quick Categories */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ width: '100%' }}
              contentContainerStyle={styles.categoriesScroll}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(item.name)}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={item.icon} size={28} color="#FF0844" />
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* 3. Today's Special (from API) */}
          {specials && specials.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{"Today's Special"}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {specialsLoading ? (
                <View style={styles.horizontalScroll}>
                  <LoadingSkeletons count={3} />
                </View>
              ) : (
                <FlatList
                  data={specials}
                  keyExtractor={item => (item.id || item._id).toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                  renderItem={({ item, index }) => (
                    <View style={index === specials.length - 1 ? { marginRight: 0 } : {}}>
                      <MemoizedItemCard item={item} onPress={() => handleItemPress(item)} />
                    </View>
                  )}
                  initialNumToRender={5}
                />
              )}
            </View>
          )}

          {/* 4. Trending Items (from API) */}
          {trending && trending.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Menu', { category: '🔥 Trending' })}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {trendingLoading ? (
                <View style={styles.horizontalScroll}>
                  <LoadingSkeletons count={3} />
                </View>
              ) : (
                <FlatList
                  data={trending}
                  keyExtractor={item => (item.id || item._id).toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                  renderItem={({ item, index }) => (
                    <View style={index === trending.length - 1 ? { marginRight: 0 } : {}}>
                      <MemoizedItemCard item={item} onPress={() => handleItemPress(item)} />
                    </View>
                  )}
                  initialNumToRender={5}
                />
              )}
            </View>
          )}

          {/* 5. Featured Combos (from API) */}
          {featuredCombos && featuredCombos.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Combos 🍱</Text>
              </View>
              {combosLoading ? (
                <View style={styles.horizontalScroll}>
                  <LoadingSkeletons count={3} />
                </View>
              ) : (
                <FlatList
                  data={featuredCombos}
                  keyExtractor={item => (item.id || item._id).toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                  snapToInterval={280 + 16}
                  decelerationRate="fast"
                  renderItem={({ item, index }) => (
                    <ComboCard 
                      item={item} 
                      onPress={() => handleComboPress(item)} 
                      style={[{ width: 280, marginRight: 16 }, index === featuredCombos.length - 1 && { marginRight: 0 }]}
                    />
                  )}
                  initialNumToRender={4}
                />
              )}
            </View>
          )}

          {/* 6. Offers Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Offers</Text>
            </View>
            <FlatList
              data={OFFERS}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              renderItem={({ item, index }) => (
                <LinearGradient
                  colors={[item.color1, item.color2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.offerCard, index === OFFERS.length - 1 && { marginRight: 0 }]}
                >
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
                </LinearGradient>
              )}
            />
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
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFEbee',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 100, // Leave space for bottom tabs
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  seeAllText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  categoryCard: {
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryName: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  offerCard: {
    width: 260,
    height: 120,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  offerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  offerSubtitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  itemCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: '#E0E0E0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF0844',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0844',
  },
});

export default HomeScreen;
