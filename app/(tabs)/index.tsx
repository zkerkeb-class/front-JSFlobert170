import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Alert, Dimensions, Image, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../../components';
import { getCurrentUser, logOut } from '../../src/services/auth';
import { getReminders, deleteReminder, Reminder } from '../../src/services/reminderService';
import { fetchUserWorkouts } from '../../src/services/workoutService';

const { width } = Dimensions.get('window');

// Fonction pour obtenir les dates de début et fin de la semaine courante
const getCurrentWeekDates = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Ajuster si on est dimanche
  
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
};

const Program = () => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    workouts: 0,
    calories: 0,
    progress: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const user = getCurrentUser();

  // Charger les rappels et les statistiques
  useFocusEffect(
    useCallback(() => {
      loadReminders();
      loadWeeklyStats();
    }, [refreshKey])
  );

  const loadWeeklyStats = async () => {
    try {
      const authService = await import('../../src/services/auth');
      const token = authService.default.getAuthToken();
      
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const workouts = await fetchUserWorkouts(token);
      const { monday, sunday } = getCurrentWeekDates();

      // Filtrer les workouts de la semaine en cours
      const weeklyWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= monday && workoutDate <= sunday;
      });

      // Calculer les statistiques
      const totalWorkouts = weeklyWorkouts.length;
      const totalCalories = weeklyWorkouts.reduce((sum, workout) => sum + workout.calories_burned, 0);

      // Calculer le progrès (basé sur un objectif de 5 séances par semaine)
      const weeklyGoal = 5;
      const progress = Math.min(Math.round((totalWorkouts / weeklyGoal) * 100), 100);

      setWeeklyStats({
        workouts: totalWorkouts,
        calories: totalCalories,
        progress: progress
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const loadedReminders = await getReminders();
      // Filtrer les rappels pour ne garder que ceux qui sont dans le futur
      const futureReminders = loadedReminders.filter(
        reminder => new Date(reminder.date) > new Date()
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setReminders(futureReminders);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await deleteReminder(reminderId);
      // Mettre à jour l'état local et forcer le rafraîchissement
      setReminders(currentReminders => currentReminders.filter(r => r.id !== reminderId));
      setRefreshKey(key => key + 1); // Force le rechargement des rappels
    } catch (error) {
      console.error('Erreur lors de la suppression du rappel:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le rappel');
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logOut();
              // Forcer la redirection vers la page de connexion
              router.replace('/Login');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              // En cas d'erreur, rediriger quand même
              router.replace('/Login');
            }
          }
        }
      ]
    );
  };

  const quickStats = [
    { label: 'Objectif calorique', value: '1,800', iconName: 'flag' },
    { label: 'Hydratation', value: '2.1L', iconName: 'water' },
    { label: 'Calories brûlées', value: '2,450', iconName: 'flame' },
    { label: 'Séances cette semaine', value: '12', iconName: 'fitness' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView 
        className="flex-grow pb-24"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Décoration moderne en haut */}
        <View className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-activity via-nutrition to-profile opacity-80" />
        
        {/* Header moderne avec gradient */}
        <View className="px-6 pt-8 pb-7 bg-primary-800 rounded-b-3xl mx-0 mb-6 border-t-4 border-primary-600 shadow-header">
          <View className="flex-row items-center justify-between mb-6">
            {/* Photo de profil avec menu déroulant */}
            <View className="relative">
              <TouchableOpacity onPress={() => setShowDropdown(true)}>
                <Image 
                  source={require("../../assets/images/avatar.png")} 
                  className="rounded-full border-2 border-white shadow-card"
                  style={{ width: hp(8), height: hp(8) }}
                />
                {/* Indicateur de menu */}
                <View className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 items-center justify-center shadow-sm">
                  <Ionicons name="chevron-down" size={14} color="#1f2937" />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Texte de bienvenue */}
            <View className="flex-1 items-center mx-5">
              <Text className="text-base text-primary-300 mb-1">Bonjour,</Text>
              <Text className="text-2xl font-bold text-white mb-2">John Doe</Text>
              <View className="bg-success rounded-2xl px-3 py-1 shadow-sm">
                <Text className="text-white text-xs font-semibold uppercase tracking-wider">En ligne</Text>
              </View>
            </View>
            
            {/* Bouton notifications */}
            <TouchableOpacity 
              className="bg-primary-700 rounded-xl p-3 border border-primary-600 shadow-card"
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications" size={24} color="#ffffff"/>
              {reminders.length > 0 && (
              <View className="absolute -top-2 -right-2 bg-error rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{reminders.length}</Text>
              </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Métriques rapides dans le header */}
          <View className="flex-row justify-between">
            <View className="bg-primary-600 rounded-xl p-4 flex-1 mr-2 border border-primary-500 shadow-card items-center">
              <Text className="text-xl font-bold text-white">{weeklyStats.workouts}</Text>
              <Text className="text-xs text-primary-200 mt-0.5 font-medium">Séances</Text>
            </View>
            <View className="bg-primary-600 rounded-xl p-4 flex-1 mx-1 border border-primary-500 shadow-card items-center">
              <Text className="text-xl font-bold text-white">{weeklyStats.calories}</Text>
              <Text className="text-xs text-primary-200 mt-0.5 font-medium">Calories</Text>
            </View>
            <View className="bg-primary-600 rounded-xl p-4 flex-1 ml-2 border border-primary-500 shadow-card items-center">
              <Text className="text-xl font-bold text-white">{weeklyStats.progress}%</Text>
              <Text className="text-xs text-primary-200 mt-0.5 font-medium">Objectif</Text>
            </View>
          </View>
        </View>

        {/* Menu déroulant modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity 
            className="flex-1 bg-black/50"
            onPress={() => setShowDropdown(false)}
          >
            <View className="absolute top-32 left-6 bg-white rounded-3xl shadow-xl border border-primary-200 min-w-56">
              {/* Header du menu */}
              <View className="p-5 border-b border-primary-200">
                <View className="flex-row items-center">
                  <Image 
                    source={require("../../assets/images/avatar.png")} 
                    className="rounded-full mr-4"
                    style={{ width: hp(5), height: hp(5) }}
                  />
                  <View>
                    <Text className="text-primary-800 font-bold text-lg">John Doe</Text>
                    <Text className="text-primary-500 text-sm">{user?.email}</Text>
                  </View>
                </View>
              </View>

              {/* Options du menu */}
              <View className="py-3">
                <TouchableOpacity 
                  className="flex-row items-center px-5 py-4 active:bg-primary-50"
                  onPress={() => {
                    setShowDropdown(false);
                    router.push('/profile');
                  }}
                >
                  <Ionicons name="person-outline" size={24} color="#6b7280" />
                  <Text className="text-primary-700 ml-4 font-medium text-base">Mon profil</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="flex-row items-center px-5 py-4 active:bg-primary-50"
                  onPress={() => {
                    setShowDropdown(false);
                    // Naviguer vers paramètres
                  }}
                >
                  <Ionicons name="settings-outline" size={24} color="#6b7280" />
                  <Text className="text-primary-700 ml-4 font-medium text-base">Paramètres</Text>
                </TouchableOpacity>

                <View className="border-t border-primary-200 mt-3 pt-3">
                  <TouchableOpacity 
                    className="flex-row items-center px-5 py-4 active:bg-error-light"
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                    <Text className="text-error ml-4 font-medium text-base">Déconnexion</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Menu déroulant des notifications */}
        <Modal
          visible={showNotifications}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNotifications(false)}
        >
          <TouchableOpacity 
            className="flex-1 bg-black/50"
            onPress={() => setShowNotifications(false)}
            activeOpacity={1}
          >
            <View className="absolute top-32 right-6 bg-white rounded-3xl shadow-xl border border-primary-200 w-80">
              <View className="p-5 border-b border-primary-200">
                <Text className="text-primary-800 font-bold text-lg">Rappels de séances</Text>
              </View>

              <ScrollView className="max-h-96">
                {reminders.length > 0 ? (
                  <>
                    {reminders.slice(0, 3).map((reminder) => (
                      <View key={reminder.id} className="p-4 border-b border-primary-100">
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <Text className="text-primary-800 font-medium mb-1">{reminder.workoutName}</Text>
                            <Text className="text-primary-500 text-sm">
                              {new Date(reminder.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </Text>
                            <Text className="text-primary-500 text-sm">
                              {new Date(reminder.date).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                          <TouchableOpacity 
                            onPress={() => handleDeleteReminder(reminder.id)}
                            className="bg-error-light rounded-full p-2"
                          >
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    {reminders.length > 3 && (
                      <TouchableOpacity 
                        className="p-4 bg-primary-50"
                        onPress={() => {
                          setShowNotifications(false);
                          router.push('/reminders');
                        }}
                      >
                        <Text className="text-primary-600 text-center font-medium">
                          Voir tous les rappels ({reminders.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View className="p-4">
                    <Text className="text-primary-500 text-center">Aucun rappel de séance</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Titre principal */}
        <View className="px-6 mb-8">
          <Text className="text-4xl font-bold text-primary-800 mb-2">Mon Programme</Text>
          <Text className="text-lg text-primary-600">Choisissez votre activité du jour</Text>
        </View>

        {/* Boutons de navigation principaux */}
        <View className="px-6 mb-8">

          <TouchableOpacity 
            className="bg-white rounded-xl p-6 border border-primary-200 shadow-card"
            onPress={() => router.push('/activity')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-activity-light rounded-xl p-4 mr-4">
                  <Ionicons name="fitness" size={32} color="#1e40af" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-primary-800 mb-1">Activities</Text>
                  <Text className="text-sm text-primary-600">Entraînements & Sports</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6b7280" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white rounded-xl p-6 mb-4 border border-primary-200 shadow-card"
            onPress={() => router.push('/nutrition')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-nutrition-light rounded-xl p-4 mr-4">
                  <Ionicons name="restaurant" size={32} color="#047857" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-primary-800 mb-1">Meals</Text>
                  <Text className="text-sm text-primary-600">Nutrition & Repas</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats rapides */}
        <View className="px-6 mb-8">
          <Text className="text-2xl font-bold text-primary-800 mb-5">Aperçu aujourd&apos;hui</Text>
          <View className="flex-row flex-wrap gap-4">
            {quickStats.map((stat, index) => (
              <View key={index} className="bg-white rounded-xl p-5 border border-primary-200 shadow-card" style={{ width: (width - 64) / 2 }}>
                <View className="items-center mb-3">
                  <View className="bg-primary-100 rounded-full p-3 mb-2">
                    <Ionicons name={stat.iconName as any} size={24} color="#6b7280" />
                  </View>
                  <Text className="text-xl font-bold text-primary-800 mb-1">{stat.value}</Text>
                  <Text className="text-xs text-primary-600 text-center font-medium">{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section motivation */}
        <View className="px-6 mb-8">
          <View className="bg-white p-6 rounded-xl border-l-4 border-success shadow-card">
            <View className="mb-5">
              <View className="flex-row items-center mb-3">
                <Ionicons name="flag" size={20} color="#1e5a3e" />
                <Text className="text-lg font-bold text-primary-800 ml-2">Objectif du jour</Text>
              </View>
              <Text className="text-base text-primary-600 leading-6">
                Vous êtes à 75% de votre objectif quotidien ! Continuez comme ça !
              </Text>
            </View>
            <View className="h-3 bg-primary-200 rounded-full overflow-hidden">
              <View className="h-full bg-success rounded-full" style={{ width: '75%' }} />
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View className="px-6">
          <Text className="text-2xl font-bold text-primary-800 mb-5">Actions rapides</Text>
          <View className="flex-row flex-wrap gap-4">
            <TouchableOpacity className="bg-white p-5 rounded-xl items-center shadow-card border border-primary-200" style={{ width: (width - 64) / 2 }}>
              <View className="bg-success-light rounded-full p-3 mb-3">
                <Ionicons name="add-circle" size={32} color="#047857" />
              </View>
              <Text className="text-sm text-primary-800 font-semibold text-center">Ajouter un repas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white p-5 rounded-xl items-center shadow-card border border-primary-200" style={{ width: (width - 64) / 2 }}>
              <View className="bg-profile-light rounded-full p-3 mb-3">
                <Ionicons name="play-circle" size={32} color="#7c3aed" />
              </View>
              <Text className="text-sm text-primary-800 font-semibold text-center">Démarrer séance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white p-5 rounded-xl items-center shadow-card border border-primary-200" style={{ width: (width - 64) / 2 }}>
              <View className="bg-activity-light rounded-full p-3 mb-3">
                <Ionicons name="water" size={32} color="#1e40af" />
              </View>
              <Text className="text-sm text-primary-800 font-semibold text-center">Boire de l&apos;eau</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white p-5 rounded-xl items-center shadow-card border border-primary-200" style={{ width: (width - 64) / 2 }}>
              <View className="bg-warning-light rounded-full p-3 mb-3">
                <Ionicons name="bar-chart" size={32} color="#d97706" />
              </View>
              <Text className="text-sm text-primary-800 font-semibold text-center">Voir progrès</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Program; 