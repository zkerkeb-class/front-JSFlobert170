import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../../components';
import { TopDecoration } from '../../components/ui';
import { getCurrentUser, logOut } from '../../src/services/auth';

const Profile = () => {
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleOptionPress = (index: number) => {
    switch (index) {
      case 0: // Informations personnelles
        router.push('/personal-info' as any);
        break;
      case 1: // Paramètres
        router.push('/settings' as any);
        break;
      case 2: // Aide & Support
        Alert.alert('Aide & Support', 'Contactez-nous à support@sparkfit.com');
        break;
    }
  };

  const profileOptions = [
    { icon: 'person-outline', title: 'Mes informations', subtitle: 'Données personnelles et de santé' },
    { icon: 'settings-outline', title: 'Paramètres', subtitle: 'Configuration de l&apos;app' },
    { icon: 'help-circle-outline', title: 'Aide & Support', subtitle: 'Besoin d&apos;aide ?' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView 
        className="flex-grow pb-24"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Décoration en haut */}
        <TopDecoration />

        {/* Header Profile moderne avec accent violet */}
        <View className="px-6 pt-8 pb-7 bg-primary-800 rounded-b-3xl mb-6 border-t-4 border-profile shadow-header">
          <View className="items-center">
            <Image 
              source={require("../../assets/images/avatar.png")} 
              className="rounded-full mb-4 border-4 border-white shadow-card"
              style={{ width: hp(12), height: hp(12) }}
            />
            <Text className="text-3xl font-bold text-white text-center mb-1">John Doe</Text>
            <Text className="text-base text-primary-300 text-center mb-4">
              {user?.email || 'user@example.com'}
            </Text>
            <View className="bg-profile rounded-2xl px-4 py-2 shadow-sm">
              <Text className="text-white text-sm font-semibold uppercase tracking-wider">Premium</Text>
            </View>
          </View>
        </View>


        <View className="px-5">
          {/* Stats rapides 
          <View className="flex-row justify-between mb-6">
            <View className="bg-white rounded-xl p-5 flex-1 mr-2 border border-primary-200 shadow-card items-center">
              <Text className="text-2xl font-bold text-primary-800">127</Text>
              <Text className="text-xs text-primary-600 font-medium">Séances</Text>
            </View>
            <View className="bg-white rounded-xl p-5 flex-1 mx-1 border border-primary-200 shadow-card items-center">
              <Text className="text-2xl font-bold text-primary-800">45kg</Text>
              <Text className="text-xs text-primary-600 font-medium">Perdus</Text>
            </View>
            <View className="bg-white rounded-xl p-5 flex-1 ml-2 border border-primary-200 shadow-card items-center">
              <Text className="text-2xl font-bold text-primary-800">8</Text>
              <Text className="text-xs text-primary-600 font-medium">Mois</Text>
            </View>
          </View>
          */}

          {/* Options du profil */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-primary-800 mb-4">Paramètres</Text>
            
            {profileOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                className="bg-white rounded-xl p-5 flex-row items-center mb-3 border border-primary-200 shadow-card"
                onPress={() => handleOptionPress(index)}
              >
                <View className="bg-primary-100 rounded-xl p-3 mr-4">
                  <Ionicons name={option.icon as any} size={24} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-primary-800 mb-1">{option.title}</Text>
                  <Text className="text-sm text-primary-600">{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Bouton de déconnexion */}
          <View className="mb-8">
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-error rounded-xl p-5 flex-row items-center justify-center shadow-card"
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          {/* Version de l'app */}
          <View className="items-center pb-8">
            <Text className="text-xs text-primary-500 text-center opacity-70">
              SparkFit v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;