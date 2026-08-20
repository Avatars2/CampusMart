import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SellScreen from '../screens/Sell/index';
import AddProductScreen from '../screens/Sell/AddProduct';
import EditProductScreen from '../screens/Sell/EditProduct';

const Stack = createNativeStackNavigator();

export default function SellNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellMain" component={SellScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
    </Stack.Navigator>
  );
}
