import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator} from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../../components';
import { BodyParts, TopDecoration } from '../../components/ui';
import AIWorkoutPlanModal from '../../components/AIWorkoutPlanModal';
import { isAuthenticated } from '../../src/services/auth';
import { generateAIWorkoutPlan, saveAIWorkoutPlan, AIWorkoutPlan } from '../../src/services/aiWorkoutService';

const Activity = () => {
  const router = useRouter();
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIWorkoutPlan[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Référence pour annuler les requêtes en cours
  const abortControllerRef = useRef<AbortController | null>(null);

  const workoutCategories = [
    { id: 1, name: 'Force', iconName: 'fitness-center', description: 'Musculation et renforcement' },
    { id: 2, name: 'Cardio', iconName: 'walk', description: 'Course et endurance' },
    { id: 3, name: 'Étirements', iconName: 'accessibility', description: 'Mobilité et récupération' },
  ];

  const handleGenerateAIPlan = async () => {
    if (!isAuthenticated()) {
      Alert.alert('Erreur', 'Vous devez être connecté pour utiliser cette fonctionnalité');
      return;
    }

    try {
      // Créer un nouveau AbortController pour cette requête
      abortControllerRef.current = new AbortController();
      
      setGeneratingPlan(true);
      setShowAIModal(true);

      // Récupérer le token
      const authService = await import('../../src/services/auth');
      const token = authService.default.getAuthToken();
      
      if (!token) {
        Alert.alert('Erreur', 'Token d\'authentification non trouvé');
        return;
      }

      // Générer le plan avec l'IA
      const generatedPlan = await generateAIWorkoutPlan(token, abortControllerRef.current?.signal);
      console.log(generatedPlan)
      setAiPlan(generatedPlan);
      
      // Nettoyer la référence après succès
      abortControllerRef.current = null;
      
    } catch (error: any) {
      // Si l'erreur est due à l'annulation, ne pas afficher d'alerte
      if (error.name === 'AbortError') {
        console.log('Génération IA annulée par l\'utilisateur');
        return;
      }
      
      Alert.alert(
        'Erreur de génération',
        error.message || 'Impossible de générer le plan. Vérifiez que votre profil est complet dans les paramètres.'
      );
      setShowAIModal(false);
      abortControllerRef.current = null;
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleValidateAndSavePlan = async () => {
    if (!isAuthenticated() || aiPlan.length === 0) {
      return;
    }

    try {
      setSavingPlan(true);

      // Récupérer le token
      const authService = await import('../../src/services/auth');
      const token = authService.default.getAuthToken();
      
      if (!token) {
        Alert.alert('Erreur', 'Token d\'authentification non trouvé');
        return;
      }

      // Sauvegarder le plan dans le backend
      const savedCount = await saveAIWorkoutPlan(token, aiPlan);
      
      if (savedCount > 0) {
        Alert.alert(
          'Plan 7 jours enregistré avec succès !',
          `${savedCount} séance(s) sur 7 jours ont été ajoutées à votre calendrier. Consultez l'onglet Dashboard pour voir vos séances programmées.`,
          [
            {
              text: 'Voir le calendrier',
              onPress: () => {
                setShowAIModal(false);
                router.push('/statistics');
              }
            },
            {
              text: 'OK',
              onPress: () => setShowAIModal(false),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          'Erreur de sauvegarde',
          'Aucune séance n\'a pu être sauvegardée. Veuillez réessayer.'
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur de sauvegarde',
        error.message || 'Impossible de sauvegarder le plan. Veuillez réessayer.'
      );
    } finally {
      setSavingPlan(false);
    }
  };

  const handleCloseModal = () => {
    // Annuler la requête en cours si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Permettre la fermeture même pendant la génération/sauvegarde
    setShowAIModal(false);
    setAiPlan([]);
    
    // Réinitialiser les états de chargement si on ferme pendant une opération
    if (generatingPlan) {
      setGeneratingPlan(false);
    }
    if (savingPlan) {
      setSavingPlan(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    if (categoryName === 'Force') {
      setSelectedCategory(selectedCategory === 'Force' ? null : 'Force');
    } else if (categoryName === 'Cardio') {
      setSelectedCategory(selectedCategory === 'Cardio' ? null : 'Cardio');
    } else {
      // Pour les autres catégories, vous pouvez ajouter d'autres logiques ici
      setSelectedCategory(null);
      Alert.alert('Info', `Fonctionnalité ${categoryName} à venir`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView 
        className="flex-grow pb-24"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Décoration en haut */}
        <TopDecoration />
        
        {/* Header moderne avec accent bleu */}
        <View className="px-6 pt-8 pb-7 bg-primary-800 rounded-b-3xl mx-0 mb-6 border-t-4 border-activity shadow-header">
          <View className="flex-row items-center justify-between mb-6">
            <View className="bg-primary-700 border-2 border-activity rounded-2xl p-4 shadow-card">
              <Ionicons name="fitness" size={28} color="#3b82f6" />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-4xl font-bold text-white mb-1.5 tracking-ultra">Activities</Text>
              <Text className="text-base text-primary-300 mb-6 opacity-90">Choisissez votre entraînement</Text>
              <View className="bg-activity rounded-2xl px-3 py-1.5 self-start shadow-sm">
                <Text className="text-white text-xs font-semibold uppercase tracking-wider">Sport</Text>
              </View>
            </View>
            <View className="bg-primary-600 rounded-xl p-4 border border-primary-500 shadow-card min-w-20 items-center">
              <Text className="text-xl font-bold text-white">45</Text>
              <Text className="text-xs text-primary-200 mt-0.5 font-medium">min</Text>
            </View>
          </View>
          
          {/* Boutons de navigation */}
          <View className="bg-primary-700 rounded-2xl p-1.5 flex-row border border-primary-600 shadow-md">
            
            <TouchableOpacity className="flex-1 py-3.5 items-center rounded-xl bg-white shadow-sm">
              <View className="flex-row items-center justify-center">
                <Ionicons name="fitness" size={16} color="#1f2937" style={{ marginRight: 6 }} />
                <Text className="text-primary-800 font-semibold text-sm">Activities</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 py-3.5 items-center rounded-xl"
              onPress={() => router.push('/nutrition')}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="restaurant" size={16} color="#d1d5db" style={{ marginRight: 6 }} />
                <Text className="text-primary-300 font-medium text-sm">Meals</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Titre principal */}
        <View className="flex-row justify-between items-center mx-5 mb-6">
          <View>
            <Text 
              style={{ fontSize: hp(4.5) }}
              className="font-bold tracking-wider text-primary-400"
            >READY TO</Text>
            <Text 
              style={{ fontSize: hp(4.5) }}
              className="font-bold tracking-wider text-activity"
            >WORKOUT</Text>
          </View>
        </View>

        {/* Bouton IA Principal */}
        <View className="px-5 mb-6">
          <TouchableOpacity 
            className="bg-blue-400 rounded-xl p-5 border border-primary-300 shadow-card mb-4"
            onPress={handleGenerateAIPlan}
            disabled={generatingPlan || savingPlan}
          >
            <View className="flex-row items-center justify-between">
              <View className="bg-blue-500 rounded-lg p-3 mr-4">
                <Ionicons name="bulb" size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-white mb-1">Planifier avec l&apos;IA</Text>
                <Text className="text-sm text-primary-100">Plan d&apos;entraînement 7 jours personnalisé</Text>
              </View>
              <View className="bg-blue-500 rounded-lg p-2">
                {generatingPlan ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Bouton Planification Manuelle */}
          <TouchableOpacity 
            className="bg-white rounded-xl p-5 border-2 border-blue-500 shadow-card"
            onPress={() => router.push('/personal-workout-planner')}
          >
            <View className="flex-row items-center justify-between">
              <View className="bg-blue-500 rounded-lg p-3 mr-4">
                <Ionicons name="calendar" size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-blue-600 mb-1">Planifier manuellement</Text>
                <Text className="text-sm text-blue-500">Choisissez votre date et créez votre séance</Text>
              </View>
              <View className="bg-blue-500 rounded-lg p-2">
                <Ionicons name="chevron-forward" size={16} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contenu principal - Catégories d'exercices */}
        <View className="px-5">
          {workoutCategories.map((category, index) => (
            <TouchableOpacity 
              key={category.id}
              onPress={() => handleCategoryPress(category.name)}
              className={`rounded-xl p-5 mb-4 border ${
                selectedCategory === category.name 
                  ? 'border-activity bg-activity/10' 
                  : 'border-primary-200'
              } ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary-100'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`rounded-xl p-4 mr-4 ${
                    selectedCategory === category.name 
                      ? 'bg-activity' 
                      : 'bg-primary-50'
                  }`}>
                    {category.name === 'Force' ? 
                    <MaterialIcons 
                      name={category.iconName as any} 
                      size={24} 
                      color={selectedCategory === category.name ? "#ffffff" : "#6b7280"} 
                    /> : <Ionicons 
                      name={category.iconName as any} 
                      size={24} 
                      color={selectedCategory === category.name ? "#ffffff" : "#6b7280"} 
                    />}
                  </View>
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold mb-2 ${
                      selectedCategory === category.name 
                        ? 'text-activity' 
                        : 'text-primary-800'
                    }`}>{category.name}</Text>
                    <Text className="text-sm text-primary-500">{category.description}</Text>
                  </View>
                </View>
                <View className={`rounded-lg px-3 py-2 ml-3 ${
                  selectedCategory === category.name 
                    ? 'bg-activity' 
                    : 'bg-primary-500'
                }`}>
                  <Text className="text-white text-xs font-medium">
                    {selectedCategory === category.name ? 'Ouvert' : 'Ouvrir'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Affichage conditionnel du composant BodyParts */}
        {selectedCategory === 'Force' && (
          <View className="px-5 mt-4">
            <BodyParts selectedCategory={selectedCategory} />
          </View>
        )}

        {selectedCategory === 'Cardio' && (
          <View className="px-5 mt-4">
            <BodyParts selectedCategory={selectedCategory} />
        </View>
        )}

        {/* Section statistiques */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-semibold text-primary-800 mb-4">Vos performances</Text>
          <View className="bg-primary-100 rounded-xl p-5 border border-primary-200">
            <View className="flex-row justify-between items-center mb-4">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary-600">12</Text>
                <Text className="text-sm text-primary-500">Séances</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary-600">520</Text>
                <Text className="text-sm text-primary-500">Calories</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary-600">45</Text>
                <Text className="text-sm text-primary-500">Minutes</Text>
              </View>
            </View>
            <View className="bg-primary-300 rounded-full h-2">
              <View className="bg-primary-500 rounded-full h-2" style={{ width: '75%' }} />
            </View>
            <Text className="text-xs text-primary-500 mt-2 text-center">75% de votre objectif hebdomadaire</Text>
          </View>
        </View>

        {/* Modal IA */}
        <AIWorkoutPlanModal
          visible={showAIModal}
          onClose={handleCloseModal}
          onValidate={handleValidateAndSavePlan}
          aiPlan={aiPlan}
          loading={generatingPlan}
        />

        {/* <BodyParts /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Activity; 