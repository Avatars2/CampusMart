import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './Landing.styles';

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>CM</Text>
          </View>
          <Text style={styles.title}>CampusMart</Text>
          <Text style={styles.subtitle}>Student Marketplace</Text>

          {/* Feature Highlights */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBg}>
                <Ionicons name="shield-checkmark" size={22} color="#FFF" />
              </View>
              <Text style={styles.featureLabel}>Verified</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBg}>
                <Ionicons name="school" size={22} color="#FFF" />
              </View>
              <Text style={styles.featureLabel}>Campus</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBg}>
                <Ionicons name="flash" size={22} color="#FFF" />
              </View>
              <Text style={styles.featureLabel}>Easy</Text>
            </View>
          </View>
        </View>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          <Text style={styles.collegeName}>Birla Vishvakarma Mahavidyalaya</Text>
          <Text style={styles.location}>V.V. Nagar, Anand</Text>
          <Text style={styles.description}>
            Buy, sell, and trade textbooks, electronics, and essentials securely with your campus peers.
          </Text>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>For BVM Engineering Students Only</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
