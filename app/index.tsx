import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from "../components";
import { isAuthenticated } from "../src/services/auth";
import "./globals.css";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'état d'authentification au démarrage
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Splash screen
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Redirection automatique si authentifié
  if (!loading && isAuthenticated()) {
    return <Redirect href="/(tabs)" />;
  }

  // Redirection vers la page de connexion si pas authentifié
  if (!loading && !isAuthenticated()) {
    return <Redirect href="/Login" />;
  }

  // Écran de chargement
  return (
    <SafeAreaView className="flex-1 bg-green-500">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      <View className="flex-1 items-center justify-center">
        <View className="bg-white rounded-full p-6 mb-6">
          <Ionicons name="fitness" size={72} color="#10b981" />
        </View>
        <Text className="text-white text-4xl font-bold mb-2">SparkFit</Text>
        <Text className="text-green-100 text-lg mb-8">Votre coach personnel</Text>
        <ActivityIndicator size="large" color="white" />
      </View>
    </SafeAreaView>
  );
}
