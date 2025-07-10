import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../components';
import authService, { getCurrentUser, updateUser, updateProfile } from '../src/services/auth';

const FITNESS_GOALS = [
  { value: 'lose_weight', label: 'Perdre du poids' },
  { value: 'gain_muscle', label: 'Prendre de la masse musculaire' },
  { value: 'maintain', label: 'Maintenir ma forme actuelle' },
  { value: 'gain_weight', label: 'Prendre du poids' },
  { value: 'improve_endurance', label: 'Améliorer mon endurance' },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [editMode, setEditMode] = useState(false); // Mode édition contrôlé
  
  // Données personnelles
  const [personalData, setPersonalData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // Données de santé
  const [healthData, setHealthData] = useState({
    age: user?.profile?.age?.toString() || '',
    weight: user?.profile?.weight?.toString() || '',
    height: user?.profile?.height?.toString() || '',
    fitness_goal: user?.profile?.fitness_goal || '',
    goal_detail: user?.profile?.goal_detail || '',
    intensity: user?.profile?.intensity || '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fonction pour récupérer les données utilisateur depuis le backend
  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      await authService.fetchUserProfile();
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur');
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    // Récupérer les données fraîches depuis le backend au chargement
    fetchUserData();
  }, []);

  // Fonction pour basculer le mode édition
  const toggleEditMode = () => {
    if (editMode) {
      // Si on annule l'édition, remettre les données originales
      if (user) {
        setPersonalData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
        });
        
        setHealthData({
          age: user.profile?.age?.toString() || '',
          weight: user.profile?.weight?.toString() || '',
          height: user.profile?.height?.toString() || '',
          fitness_goal: user.profile?.fitness_goal || '',
          goal_detail: user.profile?.goal_detail || '',
          intensity: user.profile?.intensity || 'Low',
        });
      }
      setErrors({});
    }
    setEditMode(!editMode);
  };

  useEffect(() => {
    if (user) {
      setPersonalData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      
      setHealthData({
        age: user.profile?.age?.toString() || '',
        weight: user.profile?.weight?.toString() || '',
        height: user.profile?.height?.toString() || '',
        fitness_goal: user.profile?.fitness_goal || '',
        goal_detail: user.profile?.goal_detail || '',
        intensity: user.profile?.intensity || 'Low',
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Validation données personnelles
    if (!personalData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!personalData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(personalData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (personalData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(personalData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format de téléphone invalide';
    }
    
    // Validation données de santé - OBLIGATOIRES
    if (!healthData.age || isNaN(Number(healthData.age)) || Number(healthData.age) < 12 || Number(healthData.age) > 120) {
      newErrors.age = 'L\'âge est requis (12-120 ans)';
    }
    
    if (!healthData.weight || isNaN(Number(healthData.weight)) || Number(healthData.weight) < 30 || Number(healthData.weight) > 300) {
      newErrors.weight = 'Le poids est requis (30-300 kg)';
    }
    
    if (!healthData.height || isNaN(Number(healthData.height)) || Number(healthData.height) < 100 || Number(healthData.height) > 250) {
      newErrors.height = 'La taille est requise (100-250 cm)';
    }

    if (!healthData.intensity) {
      newErrors.intensity = 'L\'intensité est requise';
    }
    
    if (!healthData.fitness_goal) {
      newErrors.fitness_goal = 'L\'objectif fitness est requis';
    }

    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let userUpdateSuccess = false;
      let profileUpdateSuccess = false;

      // Mettre à jour les données personnelles si elles ont changé
      const currentPhone = user?.phone || '';
      const newPhone = personalData.phone || '';
      
      if (user && (
        personalData.username !== user.username ||
        personalData.email !== user.email ||
        currentPhone !== newPhone
      )) {
        console.log('Mise à jour des données utilisateur:', personalData);
        console.log('Téléphone actuel:', currentPhone, 'Nouveau téléphone:', newPhone);
        userUpdateSuccess = await updateUser({
          username: personalData.username,
          email: personalData.email,
          phone: personalData.phone || undefined,
        });
        console.log('Résultat mise à jour utilisateur:', userUpdateSuccess);
      }
      
      // Mettre à jour les données de santé si elles ont changé
      const currentGoalDetail = user?.profile?.goal_detail || '';
      const newGoalDetail = healthData.goal_detail || '';
      const currentFitnessGoal = user?.profile?.fitness_goal || '';
      const newFitnessGoal = healthData.fitness_goal || '';
      const currentIntensity = user?.profile?.intensity || '';
      const newIntensity = healthData.intensity || '';
      
      if (user && (
        Number(healthData.age) !== user.profile?.age ||
        Number(healthData.weight) !== user.profile?.weight ||
        Number(healthData.height) !== user.profile?.height ||
        currentFitnessGoal !== newFitnessGoal ||
        currentGoalDetail !== newGoalDetail
      )) {
        console.log('Mise à jour du profil de santé:', healthData);
        console.log('Description actuelle:', currentGoalDetail, 'Nouvelle description:', newGoalDetail);
        console.log('Objectif actuel:', currentFitnessGoal, 'Nouvel objectif:', newFitnessGoal);
        profileUpdateSuccess = await updateProfile({
          age: healthData.age ? Number(healthData.age) : undefined,
          weight: healthData.weight ? Number(healthData.weight) : undefined,
          height: healthData.height ? Number(healthData.height) : undefined,
          fitness_goal: healthData.fitness_goal || undefined,
          goal_detail: healthData.goal_detail || undefined,
          intensity: healthData.intensity || undefined,
        });
        console.log('Résultat mise à jour profil:', profileUpdateSuccess);
      }
      
      // Si aucune modification n'a été faite
      if (!userUpdateSuccess && !profileUpdateSuccess) {
        setEditMode(false);
        Alert.alert('Information', 'Aucune modification détectée');
        return;
      }
      
      if (userUpdateSuccess || profileUpdateSuccess) {
        // Récupérer les données mises à jour depuis le backend
        await fetchUserData();
        setEditMode(false);
        Alert.alert(
          'Succès !', 
          'Vos informations ont été mises à jour avec succès.',
          [{ 
            text: 'OK', 
            style: 'default'
          }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour vos informations. Veuillez réessayer.');
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };



  const calculateBMI = (): string => {
    const bmi = authService.calculateBMI();
    return bmi ? bmi.toString() : 'Non calculé';
  };

  const getBMICategory = (): string => {
    return authService.getBMICategory();
  };

  const getRecommendedCalories = (): string => {
    const calories = authService.getRecommendedCalories();
    return calories ? `${calories} kcal/jour` : 'Non calculé';
  };

  const getFitnessGoalLabel = (goal: string): string => {
    const goalObj = FITNESS_GOALS.find(g => g.value === goal);
    return goalObj ? goalObj.label : goal;
  };

  // Écran de chargement pendant la récupération des données
  if (loadingUserData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        {Platform.OS === 'android' && <StatusBarOverlay />}
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4 text-center">
          Récupération de vos informations...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 pb-3">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Text className="text-blue-500 text-base font-medium">← Retour</Text>
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-800 flex-1 text-center">
              Mon profil
            </Text>
            
            {editMode ? (
              <View className="flex-row space-x-2">
                <TouchableOpacity 
                  onPress={toggleEditMode}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-gray-500"
                >
                  <Text className="text-white text-sm font-semibold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-400' : 'bg-green-500'}`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">Sauvegarder</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={toggleEditMode}
                className="px-4 py-2 rounded-lg bg-blue-500"
              >
                <Text className="text-white text-sm font-semibold">Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="px-5">
            {/* Message d'information */}
            {editMode ? (
              <View className="bg-blue-50 p-4 rounded-xl mb-6 flex-row items-center">
                <Ionicons name="create" size={20} color="#1e40af" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-800 font-semibold mb-1">
                    Mode édition
                  </Text>
                  <Text className="text-blue-700 text-sm">
                    Modifiez vos informations et cliquez sur &quot;Sauvegarder&quot; pour les enregistrer
                  </Text>
                </View>
              </View>
            ) : (
              <View className="bg-green-50 p-4 rounded-xl mb-6 flex-row items-center">
                <Ionicons name="person" size={20} color="#047857" />
                <View className="ml-3 flex-1">
                  <Text className="text-green-800 font-semibold mb-1">
                    Votre profil
                  </Text>
                  <Text className="text-green-700 text-sm">
                    Consultez vos informations personnelles et de santé
                  </Text>
                </View>
              </View>
            )}

            {/* Informations Personnelles */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Ionicons name="person" size={20} color="#374151" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">
                  Informations Personnelles
                </Text>
              </View>
              
              <View className="bg-white rounded-xl p-4 space-y-4">
                {/* Username */}
                <View>
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Nom d&apos;utilisateur *
                  </Text>
                  {editMode ? (
                    <TextInput
                      value={personalData.username}
                      onChangeText={(text) => setPersonalData(prev => ({ ...prev, username: text }))}
                      className={`border rounded-lg px-3 py-3 text-gray-800 ${
                        errors.username ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Votre nom d'utilisateur"
                      editable={!loading}
                    />
                  ) : (
                    <Text className="text-gray-800 py-1">{personalData.username || 'Non défini'}</Text>
                  )}
                  {errors.username && (
                    <Text className="text-red-500 text-xs mt-1">{errors.username}</Text>
                  )}
                </View>

                {/* Email */}
                <View>
                  <Text className="text-sm font-medium text-gray-600 mb-2">Email *</Text>
                  {editMode ? (
                    <TextInput
                      value={personalData.email}
                      onChangeText={(text) => setPersonalData(prev => ({ ...prev, email: text }))}
                      className={`border rounded-lg px-3 py-3 text-gray-800 ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="votre@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  ) : (
                    <Text className="text-gray-800 py-1">{personalData.email || 'Non défini'}</Text>
                  )}
                  {errors.email && (
                    <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                  )}
                </View>

                {/* Téléphone */}
                <View>
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Téléphone (optionnel)
                  </Text>
                  {editMode ? (
                    <TextInput
                      value={personalData.phone}
                      onChangeText={(text) => setPersonalData(prev => ({ ...prev, phone: text }))}
                      className={`border rounded-lg px-3 py-3 text-gray-800 ${
                        errors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="+33 6 12 34 56 78"
                      keyboardType="phone-pad"
                      editable={!loading}
                    />
                  ) : (
                    <Text className="text-gray-800 py-1">{personalData.phone || 'Non défini'}</Text>
                  )}
                  {errors.phone && (
                    <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Informations de Santé */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Ionicons name="medical" size={20} color="#374151" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">
                  Profil de Santé
                </Text>
              </View>
              
              <View className="bg-white rounded-xl p-4 space-y-4">
                {/* Âge et données physiques */}
                <View className="flex-row justify-between space-x-3">
                                   <View className="flex-1">
                   <Text className="text-sm font-medium text-gray-600 mb-2">Âge *</Text>
                   <TextInput
                     value={healthData.age}
                     onChangeText={(text) => setHealthData(prev => ({ ...prev, age: text }))}
                     className={`border rounded-lg px-3 py-3 text-gray-800 ${
                       errors.age ? 'border-red-500' : 'border-gray-200'
                     }`}
                     placeholder="25"
                     keyboardType="numeric"
                     editable={!loading}
                   />
                   {errors.age && (
                     <Text className="text-red-500 text-xs mt-1">{errors.age}</Text>
                   )}
                 </View>

                  <View className="flex-1">
                   <Text className="text-sm font-medium text-gray-600 mb-2">Poids *</Text>
                   <TextInput
                     value={healthData.weight}
                     onChangeText={(text) => setHealthData(prev => ({ ...prev, weight: text }))}
                     className={`border rounded-lg px-3 py-3 text-gray-800 ${
                       errors.weight ? 'border-red-500' : 'border-gray-200'
                     }`}
                     placeholder="70"
                     keyboardType="numeric"
                     editable={!loading}
                   />
                   {errors.weight && (
                     <Text className="text-red-500 text-xs mt-1">{errors.weight}</Text>
                   )}
                 </View>

                                   <View className="flex-1">
                   <Text className="text-sm font-medium text-gray-600 mb-2">Taille *</Text>
                   <TextInput
                     value={healthData.height}
                     onChangeText={(text) => setHealthData(prev => ({ ...prev, height: text }))}
                     className={`border rounded-lg px-3 py-3 text-gray-800 ${
                       errors.height ? 'border-red-500' : 'border-gray-200'
                     }`}
                     placeholder="175"
                     keyboardType="numeric"
                     editable={!loading}
                   />
                   {errors.height && (
                     <Text className="text-red-500 text-xs mt-1">{errors.height}</Text>
                   )}
                 </View>
                </View>

                {/* Objectif fitness */}
                                 <View>
                   <Text className="text-sm font-medium text-gray-600 mb-2">
                     Objectif fitness *
                   </Text>
                   <View className={`border rounded-lg ${errors.fitness_goal ? 'border-red-500' : 'border-gray-200'}`}>
                     <Picker
                       selectedValue={healthData.fitness_goal}
                       onValueChange={(value) => setHealthData(prev => ({ ...prev, fitness_goal: value }))}
                       enabled={!loading}
                     >
                       <Picker.Item label="Sélectionnez votre objectif" value="" />
                       {FITNESS_GOALS.map((goal) => (
                         <Picker.Item key={goal.value} label={goal.label} value={goal.value} />
                       ))}
                     </Picker>
                   </View>
                   {errors.fitness_goal && (
                     <Text className="text-red-500 text-xs mt-1">{errors.fitness_goal}</Text>
                   )}
                 </View>

                 {/* Intensité */}
                 <View>
                   <Text className="text-sm font-medium text-gray-600 mb-2">Intensité *</Text>
                   <Picker
                     selectedValue={healthData.intensity}
                     onValueChange={(value) => setHealthData(prev => ({ ...prev, intensity: value }))}
                     enabled={!loading}
                   >
                     <Picker.Item label="Sélectionnez votre intensité" value="" />
                     <Picker.Item label="Faible" value="Low" />
                     <Picker.Item label="Moyenne" value="Medium" />
                     <Picker.Item label="Élevée" value="High" />
                   </Picker>
                 </View>
                {/* Description de l'objectif */}
                                 <View>
                   <Text className="text-sm font-medium text-gray-600 mb-2">
                     Description de l&apos;objectif (optionnel)
                   </Text>
                   <TextInput
                     value={healthData.goal_detail}
                     onChangeText={(text) => setHealthData(prev => ({ ...prev, goal_detail: text }))}
                     className="border border-gray-200 rounded-lg px-3 py-3 text-gray-800 h-20"
                     placeholder="Décrivez votre objectif en détail..."
                     multiline
                     numberOfLines={3}
                     textAlignVertical="top"
                     editable={!loading}
                   />
                 </View>

                  {/* Aperçu des calculs en temps réel */}
                 {healthData.weight && healthData.height && healthData.age && (
                   <View className="bg-green-50 p-3 rounded-lg mt-4">
                     <View className="flex-row items-center justify-center mb-2">
                       <Ionicons name="stats-chart" size={16} color="#047857" />
                       <Text className="text-green-800 font-semibold ml-2">
                         Aperçu de vos statistiques
                       </Text>
                     </View>
                     <Text className="text-green-700 text-sm text-center">
                       IMC: {calculateBMI()} ({getBMICategory()})
                     </Text>
                     <Text className="text-green-700 text-sm text-center">
                       Calories recommandées: {getRecommendedCalories()}
                     </Text>
                   </View>
                 )}
              </View>
            </View>

            {/* Informations calculées */}
            {!editMode && user?.profile?.weight && user?.profile?.height && user?.profile?.age && (
              <View className="bg-purple-50 p-4 rounded-xl mb-6">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="stats-chart" size={20} color="#7c3aed" />
                  <Text className="text-purple-800 font-semibold ml-2">
                    Vos statistiques
                  </Text>
                </View>
                <Text className="text-purple-700 text-sm">
                  IMC: {calculateBMI()} ({getBMICategory()})
                </Text>
                <Text className="text-purple-700 text-sm">
                  Calories recommandées: {getRecommendedCalories()}
                </Text>
                {user?.profile?.fitness_goal && (
                  <Text className="text-purple-700 text-sm">
                    Objectif: {getFitnessGoalLabel(user.profile.fitness_goal)}
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 