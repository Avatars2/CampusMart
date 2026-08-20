import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/index';
import ProductDetailScreen from '../screens/Home/ProductDetail';

const Stack = createNativeStackNavigator();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ headerShown: true, title: 'Item Details' }} 
      />
    </Stack.Navigator>
  );
}
