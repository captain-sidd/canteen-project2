import React, { useState, useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;

const BANNERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    title: 'Burger Combo Offer',
    subtitle: 'Save up to 30%',
    cta: 'Order Now',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1623366302587-bcaabfc76814?q=80&w=800&auto=format&fit=crop',
    title: 'Student Discount',
    subtitle: 'Flat 15% OFF with ID',
    cta: 'Claim Offer',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    title: 'Trending Meal',
    subtitle: 'Try our bestseller today',
    cta: 'Taste It',
  },
];

const HeroCarousel = ({ onBannerPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setActiveIndex(nextIndex);
      }
    }, 4000); // 4 seconds loop

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (activeIndex !== roundIndex) {
      setActiveIndex(roundIndex);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.bannerOverlay}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => onBannerPress && onBannerPress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>{item.cta}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />
      <View style={styles.pagination}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: 10,
    position: 'relative',
  },
  bannerContainer: {
    width: width,
    paddingHorizontal: 20,
    height: 190,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 20, // matching paddingHorizontal
    right: 20,
    height: '100%',
    borderRadius: 20,
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerContent: {
    alignItems: 'flex-start',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: '#FF0844',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  ctaText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    width: '100%',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FF0844',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

export default memo(HeroCarousel);
