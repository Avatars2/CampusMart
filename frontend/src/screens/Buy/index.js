import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import client from '../../api/client';
import styles from './styles';

export default function BuyScreen({ navigation }) {
  const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      await client.post('/orders/checkout', {
        items: cartItems,
        payment_method: 'Cash',
        delivery_address: 'Campus Pickup'
      });
      clearCart();
      Alert.alert('Success', 'Order placed successfully!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to checkout');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.iconBg}>
          <Ionicons name="cart-outline" size={52} color="#0052CC" />
        </View>
        <Text style={styles.title}>Your Cart is Empty</Text>
        <Text style={styles.subtitle}>
          Looks like you haven't added anything to your cart yet.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.browseButtonText}>Browse Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={20} color="#DC2626" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
      </View>
      
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.checkoutBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalAmount}>₹{cartTotal}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
