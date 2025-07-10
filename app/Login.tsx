import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../components';
import { signIn } from '../src/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      router.replace('/(tabs)/activity');
    } catch (err: any) {
      Alert.alert('Erreur de connexion', err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <View className="flex-1 justify-center px-6">
        {/* Logo et titre */}
        <View className="items-center mb-8">
          <View className="bg-green-500 rounded-full p-4 mb-4">
            <Ionicons name="fitness" size={48} color="#7c3aed" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">SparkFit</Text>
          <Text className="text-gray-600 text-center">
            Connectez-vous pour accéder à votre programme
          </Text>
        </View>

        {/* Formulaire */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              placeholder="votre@email.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Mot de passe</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            />
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-green-500 rounded-xl py-4 mt-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Se connecter
              </Text>
            )}
          </TouchableOpacity>

          {/* Lien vers inscription */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-green-500 font-semibold">S&apos;inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
