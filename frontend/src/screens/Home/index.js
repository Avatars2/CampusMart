import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Image, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import styles from './styles';

const CATEGORIES = [
  { name: 'All', icon: 'apps' },
  { name: 'Books', icon: 'book' },
  { name: 'Electronics', icon: 'laptop' },
  { name: 'Furniture', icon: 'bed' },
  { name: 'Stationery', icon: 'pencil' },
  { name: 'Clothing', icon: 'shirt' },
  { name: 'Others', icon: 'cube' }
];

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeListingType, setActiveListingType] = useState('all');

  const fetchItems = async (query = '', type = activeListingType) => {
    try {
      let url = `/items?listing_type=${type}`;
      if (query) {
        url += `&search=${encodeURIComponent(query)}`;
      }
      const response = await client.get(url);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems(searchQuery, activeListingType);
    }, [])
  );

  const handleSearch = () => {
    setLoading(true);
    fetchItems(searchQuery, activeListingType);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems(searchQuery, activeListingType);
  };

  const handleCategoryPress = (categoryName) => {
    setActiveCategory(categoryName);
    setLoading(true);
    if (categoryName === 'All') {
      setSearchQuery('');
      fetchItems('', activeListingType);
    } else {
      setSearchQuery(categoryName);
      fetchItems(categoryName, activeListingType);
    }
  };

  const handleListingTypeChange = (type) => {
    setActiveListingType(type);
    setLoading(true);
    fetchItems(searchQuery, type);
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150';
    const sellerImage = item.seller_image ? item.seller_image : 'https://via.placeholder.com/50';
    const condition = item.condition_rating ? item.condition_rating.replace('_', ' ') : '';

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate('ProductDetail', { item })}
        activeOpacity={0.9}
      >
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.itemImage} />
          {item.listing_type === 'rent' ? (
            <View style={[styles.conditionBadge, { backgroundColor: '#E53E3E', top: 8, right: 8, left: 'auto' }]}>
              <Text style={styles.conditionBadgeText}>For Rent</Text>
            </View>
          ) : null}
          {condition ? (
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionBadgeText}>{condition}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>

          <View style={styles.sellerContainer}>
            <Image source={{ uri: sellerImage }} style={styles.sellerAvatar} />
            <Text style={styles.sellerName} numberOfLines={1}>{item.seller_name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greetingText}>Welcome to</Text>
            <Text style={styles.headerTitle}>CampusMart 🎓</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8792A2" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, electronics..."
            placeholderTextColor="#A0A8B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setActiveCategory('All'); fetchItems('', activeListingType); }}>
              <Ionicons name="close-circle" size={20} color="#B0B7C3" />
            </TouchableOpacity>
          )}
        </View>

        {/* Listing Type Toggle */}
        <View style={styles.listingTypeToggle}>
          <TouchableOpacity
            style={[styles.listingTypeTab, activeListingType === 'all' && styles.listingTypeTabActive]}
            onPress={() => handleListingTypeChange('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.listingTypeText, activeListingType === 'all' && styles.listingTypeTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listingTypeTab, activeListingType === 'sell' && styles.listingTypeTabActive]}
            onPress={() => handleListingTypeChange('sell')}
            activeOpacity={0.8}
          >
            <Text style={[styles.listingTypeText, activeListingType === 'sell' && styles.listingTypeTextActive]}>For Sale</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listingTypeTab, activeListingType === 'rent' && styles.listingTypeTabActive]}
            onPress={() => handleListingTypeChange('rent')}
            activeOpacity={0.8}
          >
            <Text style={[styles.listingTypeText, activeListingType === 'rent' && styles.listingTypeTextActive]}>For Rent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[styles.categoryChip, activeCategory === cat.name && styles.categoryChipActive]}
            onPress={() => handleCategoryPress(cat.name)}
            activeOpacity={0.8}
          >
            <Ionicons name={`${cat.icon}${activeCategory === cat.name ? '' : '-outline'}`} size={16} color={activeCategory === cat.name ? '#FFF' : '#697386'} style={{ marginRight: 6 }} />
            <Text style={[styles.categoryChipText, activeCategory === cat.name && styles.categoryChipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeCategory === 'All' ? 'All Listings' : activeCategory}
        </Text>
        <Text style={styles.sectionCount}>{items.length} items</Text>
      </View>

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0052CC']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search-outline" size={44} color="#0052CC" />
              </View>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubText}>
                {searchQuery ? "Try a different search term" : "Check back later for new listings!"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
