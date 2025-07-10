import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../components';
import { logOut } from '../src/services/auth';
import { saveNotificationPreferences, getNotificationPreferences } from '../src/services/notificationService';

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationType, setNotificationType] = useState<'email' | 'sms'>('email');

  // Charger les préférences au démarrage
  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setNotificationsEnabled(prefs.notificationsEnabled);
      setNotificationType(prefs.notificationType);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  };

  // Sauvegarder les préférences quand elles changent
  const handleNotificationChange = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);
      await saveNotificationPreferences({
        notificationsEnabled: enabled,
        notificationType
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences de notification.');
    }
  };

  const handleNotificationTypeChange = async (type: 'email' | 'sms') => {
    try {
      setNotificationType(type);
      await saveNotificationPreferences({
        notificationsEnabled,
        notificationType: type
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences de notification.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNavigateToPersonalInfo = () => {
    router.push('/personal-info' as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'default',
          onPress: async () => {
            await logOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et supprimera toutes vos données.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirmation finale',
      'Cette action supprimera définitivement votre compte et toutes vos données. Êtes-vous absolument certain ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Je confirme la suppression',
          style: 'destructive',
          onPress: executeDeleteAccount
        }
      ]
    );
  };

  const executeDeleteAccount = async () => {
    setLoading(true);
    try {
      // Pour l'instant, on simule la suppression
      // Dans une vraie implémentation, on appellerait l'API de suppression
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Compte supprimé',
        'Votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir.',
        [
          {
            text: 'OK',
            onPress: () => {
              logOut();
              router.replace('/');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la suppression du compte. Veuillez réessayer ou contacter le support.',
        [{ text: 'OK' }]
      );
      console.log('error:', error);
    } finally {
      setLoading(false);
    }
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    children 
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    children?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      className={`bg-white p-4 rounded-xl mb-3 flex-row items-center ${!onPress ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-1">
        <Text className="text-gray-800 font-semibold text-base mb-1">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm">{subtitle}</Text>
        )}
      </View>
      {children}
      {showArrow && onPress && (
        <Text className="text-gray-400 text-xl ml-2">›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-5 pb-3">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Text className="text-blue-500 text-base font-medium">← Retour</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 flex-1 text-center">Paramètres</Text>
          <View className="w-16" />
        </View>

        <View className="px-5">
          {/* Profil */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="person" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-800 ml-2">Profil</Text>
            </View>
            
            <SettingItem
              title="Mes informations"
              subtitle="Données personnelles et de santé"
              onPress={handleNavigateToPersonalInfo}
            />
          </View>

          {/* Notifications */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="notifications" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-800 ml-2">Notifications</Text>
            </View>
            
            <SettingItem
              title="Notifications"
              subtitle="Activer/désactiver toutes les notifications"
              showArrow={false}
            >
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationChange}
                trackColor={{ false: '#E1E1E1', true: '#007AFF' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </SettingItem>
            
            <SettingItem
              title="Type de notification"
              subtitle="Choisir entre email ou SMS"
              showArrow={false}
            >
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => handleNotificationTypeChange('email')}
                  className={`px-3 py-1 rounded-l-lg ${notificationType === 'email' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  disabled={!notificationsEnabled}
                >
                  <Text className={notificationType === 'email' ? 'text-white' : 'text-gray-500'}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleNotificationTypeChange('sms')}
                  className={`px-3 py-1 rounded-r-lg ${notificationType === 'sms' ? 'bg-blue-500' : 'bg-gray-200'}`}
                disabled={!notificationsEnabled}
                >
                  <Text className={notificationType === 'sms' ? 'text-white' : 'text-gray-500'}>SMS</Text>
                </TouchableOpacity>
              </View>
            </SettingItem>
          </View>

          {/* Support */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">❓ Support</Text>
            
            <SettingItem
              title="Centre d&apos;aide"
              subtitle="FAQ et guides"
              onPress={() => {
                Alert.alert(
                  'Centre d&apos;aide',
                  'Cette fonctionnalité sera disponible dans une prochaine mise à jour.',
                  [{ text: 'OK' }]
                );
              }}
            />
            
            <SettingItem
              title="Contacter le support"
              subtitle="Besoin d&apos;aide ?"
              onPress={() => {
                Alert.alert(
                  'Contacter le support',
                  'Email: support@sparkfit.com\nTéléphone: +33 1 23 45 67 89',
                  [{ text: 'OK' }]
                );
              }}
            />
            
            <SettingItem
              title="À propos de SparkFit"
              subtitle="Version 1.0.0"
              onPress={() => {
                Alert.alert(
                  'À propos de SparkFit',
                  'SparkFit v1.0.0\n\nVotre compagnon fitness et nutrition personnalisé.\n\n© 2024 SparkFit. Tous droits réservés.',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>

          {/* Actions du compte */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">🚪 Compte</Text>
            
            <TouchableOpacity 
              className="bg-orange-500 p-4 rounded-xl mb-3 flex-row items-center justify-center"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold text-base">Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          {/* Zone de danger */}
          <View className="bg-red-50 p-5 rounded-xl mb-8 border border-red-200">
                            <View className="flex-row items-center mb-4">
                  <Ionicons name="warning" size={20} color="#dc2626" />
                  <Text className="text-lg font-semibold text-red-800 ml-2">Zone de danger</Text>
                </View>
            
            <TouchableOpacity 
              className={`p-4 rounded-xl flex-row items-center justify-center ${
                loading ? 'bg-red-300' : 'bg-red-500'
              }`}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-semibold text-base">Supprimer mon compte</Text>
              )}
            </TouchableOpacity>
            
            <Text className="text-red-600 text-sm text-center mt-3 italic">
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </Text>
          </View>

          {/* Note de confidentialité */}
          <View className="bg-blue-50 p-4 rounded-xl mb-6">
            <Text className="text-blue-800 font-semibold mb-2">🔒 Confidentialité</Text>
            <Text className="text-blue-700 text-sm">
              Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement explicite.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 