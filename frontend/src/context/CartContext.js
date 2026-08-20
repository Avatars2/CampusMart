import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    // Check if already in cart
    const exists = cartItems.find(i => i.id === item.id);
    if (exists) {
      Alert.alert('Already in Cart', 'This item is already in your cart.');
      return false;
    }
    setCartItems([...cartItems, item]);
    return true;
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + Number(item.price), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
