import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetail.styles';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { addToCart } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);

  const handleAddToCart = () => {
    const added = addToCart(item);
    if (added) {
      Alert.alert('Success', 'Added to Cart!');
    }
  };

  const handleBuyNow = () => {
    addToCart(item);
    navigation.navigate('Buy');
  };

  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://via.placeholder.com/400'];

  const sellerImage = item.seller_image
    ? { uri: item.seller_image }
    : { uri: 'https://via.placeholder.com/100' };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setActiveSlide(index);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.carouselImage} />
            ))}
          </ScrollView>

          {/* Image Counter */}
          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{activeSlide + 1}/{images.length}</Text>
            </View>
          )}

          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.paginationContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.paginationDot,
                    i === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.titlePriceRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          <View style={styles.badgesRow}>
            {item.listing_type && (
              <View style={[styles.badge, { backgroundColor: item.listing_type === 'rent' ? '#FEF2F2' : '#F0FDF4', borderColor: item.listing_type === 'rent' ? '#FECACA' : '#BBF7D0' }]}>
                <Text style={[styles.badgeText, { color: item.listing_type === 'rent' ? '#DC2626' : '#16A34A' }]}>
                  {item.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                </Text>
              </View>
            )}
            {item.condition_rating && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.condition_rating.replace('_', ' ')}</Text>
              </View>
            )}
            {item.category_name && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category_name}</Text>
              </View>
            )}
            {item.created_at && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatDate(item.created_at)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{item.description || 'No description provided.'}</Text>

          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.sellerCard}>
            <Image source={sellerImage} style={styles.sellerAvatar} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{item.seller_name}</Text>
              <Text style={styles.sellerSubtitle}>Campus Seller · Verified Student</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B7C3" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          activeOpacity={0.85}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color="#0052CC" />
          <Text style={styles.secondaryButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.primaryButton} 
          activeOpacity={0.85}
          onPress={handleBuyNow}
        >
          <Ionicons name="flash-outline" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
