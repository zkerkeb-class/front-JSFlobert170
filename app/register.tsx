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
    View,
    ScrollView
} from 'react-native';
import { StatusBarOverlay } from '../components';
import { signUp } from '../src/services/auth';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        username,
        email,
        password,
        phone: phone || undefined,
      });
      Alert.alert(
        'Inscription réussie !', 
        'Votre compte a été créé avec succès. Vous pouvez maintenant compléter votre profil de santé.',
        [{ text: 'OK', onPress: () => router.replace('/personal-info' as any) }]
      );
    } catch (err: any) {
      Alert.alert('Erreur d&apos;inscription', err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <View className="flex-1 justify-center px-6">
        {/* Logo et titre */}
        <View className="items-center mb-8">
          <Ionicons name="fitness" size={64} color="#059669" />
          <Text className="text-2xl font-bold text-primary-800 mt-4">Créer un compte</Text>
        </View>

                 {/* Formulaire */}
         <View className="space-y-4">
           <View>
             <Text className="text-gray-700 font-medium mb-2">Nom d&apos;utilisateur *</Text>
             <TextInput
               placeholder="Votre nom d'utilisateur"
               placeholderTextColor="#9ca3af"
               autoCapitalize="none"
               onChangeText={setUsername}
               value={username}
               className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
             />
           </View>

           <View>
             <Text className="text-gray-700 font-medium mb-2">Email *</Text>
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
             <Text className="text-gray-700 font-medium mb-2">Mot de passe *</Text>
            <TextInput
              placeholder="Au moins 6 caractères"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            />
          </View>

                     <View>
             <Text className="text-gray-700 font-medium mb-2">Téléphone (optionnel)</Text>
             <TextInput
               placeholder="+33 6 12 34 56 78"
               placeholderTextColor="#9ca3af"
               keyboardType="phone-pad"
               onChangeText={setPhone}
               value={phone}
               className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
             />
           </View>

           <View>
             <Text className="text-gray-700 font-medium mb-2">Confirmer le mot de passe *</Text>
             <TextInput
               placeholder="Répétez votre mot de passe"
               placeholderTextColor="#9ca3af"
               secureTextEntry
               onChangeText={setConfirmPassword}
               value={confirmPassword}
               className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
             />
           </View>

          {/* Bouton d'inscription */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="bg-purple-500 rounded-xl py-4 mt-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                S&apos;inscrire
              </Text>
            )}
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Déjà un compte ? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-purple-500 font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note sur les données */}
        <View className="mt-8 p-4 bg-green-50 rounded-xl flex-row items-center">
          <Ionicons name="shield-checkmark" size={24} color="#047857" />
          <View className="ml-3 flex-1">
            <Text className="text-green-800 font-semibold mb-1">Vos données sont sécurisées</Text>
            <Text className="text-green-700 text-sm">
              Nous protégeons vos informations personnelles et ne les partageons jamais.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
