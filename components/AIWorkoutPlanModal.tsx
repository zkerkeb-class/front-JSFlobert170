import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AIWorkoutPlan, AIWorkoutDetail } from '../src/services/aiWorkoutService';
import { saveReminder } from '../src/services/reminderService';

// Fonction pour formater l'affichage des exercices
const formatExerciseDisplay = (detail: AIWorkoutDetail) => {
  const { exercise, sets, reps } = detail;
  
  // Pour les sprints et exercices cardio
  if (exercise.category === 'cardio') {
    if (exercise.name === 'Sprints') {
      return `${sets} séries × ${reps} mètres`;
    }
    // Pour les autres exercices cardio
    return `${sets} séries × ${reps} reps`;
  }
  
  // Pour les exercices de poids du corps
  if (exercise.bodyweight) {
    return `${sets} séries × ${reps} reps`;
  }
  
  // Pour les exercices avec poids
  return `${sets} séries × ${reps} reps - ${detail.weight}kg`;
};

interface AIWorkoutPlanModalProps {
  visible: boolean;
  aiPlan: AIWorkoutPlan[];
  loading: boolean;
  onClose: () => void;
  onValidate: () => void;
}

const AIWorkoutPlanModal: React.FC<AIWorkoutPlanModalProps> = ({
  visible,
  aiPlan,
  loading,
  onClose,
  onValidate,
}) => {
  // États pour le rappel
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderPickerMode, setReminderPickerMode] = useState<'date' | 'time'>('date');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReminderDateChange = (event: any, date?: Date) => {
    if (date) {
      if (reminderPickerMode === 'date') {
        // Garder l'heure actuelle
        const newDate = new Date(date);
        newDate.setHours(reminderDate.getHours());
        newDate.setMinutes(reminderDate.getMinutes());
        setReminderDate(newDate);
        // Passer au sélecteur d'heure sur Android
        if (Platform.OS === 'android') {
          setReminderPickerMode('time');
        }
      } else {
        // Garder la date actuelle
        const newDate = new Date(reminderDate);
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
        setReminderDate(newDate);
        if (Platform.OS === 'android') {
          setShowReminderModal(false);
          setReminderPickerMode('date');
        }
      }
    }
  };

  const handleValidate = async () => {
    try {
      // Sauvegarder d'abord le plan
      await onValidate();

      // Si le rappel est activé, créer un rappel pour chaque séance
      if (reminderEnabled) {
        for (let i = 0; i < aiPlan.length; i++) {
          const workout = aiPlan[i];
          const workoutDate = new Date(workout.date);
          // Utiliser l'heure sélectionnée pour chaque date de séance
          workoutDate.setHours(reminderDate.getHours());
          workoutDate.setMinutes(reminderDate.getMinutes());
          
          try {
            await saveReminder({
              workoutId: i + 1, // Utiliser un ID temporaire basé sur l'index
              workoutName: workout.name || `Séance Jour ${i + 1}/7`,
              date: workoutDate.toISOString(),
              enabled: true
            });
          } catch (error) {
            console.error('Erreur lors de la sauvegarde du rappel:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la validation du plan:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-primary-50">
        {/* Header moderne avec accent violet */}
        <View className="px-6 pt-8 pb-7 bg-primary-800 rounded-b-3xl mx-0 mb-6 border-t-4 border-profile shadow-header">
          <View className="flex-row items-center justify-between mb-4">
            <View className="bg-primary-700 border-2 border-profile rounded-2xl p-4 shadow-card">
              <Ionicons name="bulb" size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-2xl font-bold text-white mb-1 tracking-ultra">Plan IA</Text>
              <Text className="text-sm text-primary-300 opacity-90">Plan personnalisé généré selon votre profil</Text>
            </View>
            <View className="bg-profile rounded-2xl px-3 py-1.5 shadow-sm">
              <Text className="text-white text-xs font-semibold uppercase tracking-wider">AI Generated</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-primary-600 rounded-xl px-4 py-2 border border-primary-500"
              onPress={onClose}
            >
              <Text className="text-white font-medium text-sm">Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white rounded-2xl p-8 items-center shadow-card border border-primary-200">
              <View className="bg-profile-light rounded-full p-4 mb-4">
                <ActivityIndicator size="large" color="#8b5cf6" />
              </View>
              <Text className="text-xl font-bold text-primary-800 mb-2 text-center">
                Génération en cours...
              </Text>
              <Text className="text-primary-600 text-center mb-4">
                L&apos;IA analyse votre profil pour créer le meilleur plan
              </Text>
              <View className="bg-profile-light rounded-full h-1 w-32">
                <View className="bg-profile rounded-full h-1 w-20" />
              </View>
            </View>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {aiPlan.length > 0 ? (
              <>
                {/* Résumé du plan sportif */}
                <View className="bg-white rounded-xl p-6 mb-6 border border-primary-200 shadow-card">
                  <View className="flex-row items-center mb-4">
                    <View className="bg-profile-light rounded-lg p-3 mr-3">
                      <Ionicons name="analytics" size={20} color="#7c3aed" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-primary-800">
                        Plan d&apos;entraînement 7 jours
                      </Text>
                      <Text className="text-sm text-primary-600">Personnalisé par IA</Text>
                    </View>
                  </View>
                  
                  {/* Métriques sportives */}
                  <View className="flex-row justify-between mb-4">
                    <View className="items-center flex-1">
                      <View className="bg-activity-light rounded-full p-3 mb-2">
                        <Ionicons name="fitness" size={16} color="#1e40af" />
                      </View>
                      <Text className="text-2xl font-bold text-activity">
                        {aiPlan.length}
                      </Text>
                      <Text className="text-xs text-activity-dark font-medium">Séances</Text>
                    </View>
                    <View className="items-center flex-1">
                      <View className="bg-warning-light rounded-full p-3 mb-2">
                        <Ionicons name="time" size={16} color="#d97706" />
                      </View>
                      <Text className="text-2xl font-bold text-warning">
                        {aiPlan.reduce((total, workout) => total + workout.duration, 0)}
                      </Text>
                      <Text className="text-xs text-warning-dark font-medium">Minutes totales</Text>
                      <Text className="text-[10px] text-warning-dark/80">
                        ~{Math.round(aiPlan.reduce((total, workout) => total + workout.duration, 0) / aiPlan.length)} min/séance
                      </Text>
                    </View>
                    <View className="items-center flex-1">
                      <View className="bg-nutrition-light rounded-full p-3 mb-2">
                        <Ionicons name="flame" size={16} color="#047857" />
                      </View>
                      <Text className="text-2xl font-bold text-nutrition">
                        {aiPlan.reduce((total, workout) => total + workout.calories_burned, 0)}
                      </Text>
                      <Text className="text-xs text-nutrition-dark font-medium">Calories totales</Text>
                      <Text className="text-[10px] text-nutrition-dark/80">
                        ~{Math.round(aiPlan.reduce((total, workout) => total + workout.calories_burned, 0) / aiPlan.length)} kcal/séance
                      </Text>
                    </View>
                  </View>
                  
                  {/* Barre de progression sportive */}
                  <View className="bg-primary-100 rounded-lg p-3 border border-primary-200">
                    <Text className="text-sm text-profile font-semibold mb-2">
                      Progression hebdomadaire ({aiPlan.length}/7 jours)
                    </Text>
                    <View className="bg-primary-200 rounded-full h-2">
                      <View 
                        className="bg-profile rounded-full h-2" 
                        style={{ width: `${(aiPlan.length / 7) * 100}%` }}
                      />
                    </View>
                  </View>

                  {/* Section Rappel */}
                  <View className="bg-white rounded-xl p-6 mb-6 border border-primary-200 shadow-card">
                    <View className="flex-row items-center mb-4">
                      <View className="bg-profile-light rounded-lg p-3 mr-3">
                        <Ionicons name="notifications" size={20} color="#7c3aed" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-primary-800">
                          Rappels quotidiens
                        </Text>
                        <Text className="text-sm text-primary-600">
                          Soyez notifié avant chaque séance
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-gray-600">Activer les rappels</Text>
                      <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                      />
                    </View>

                    {reminderEnabled && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            setReminderPickerMode('date');
                            setShowReminderModal(true);
                          }}
                          className="flex-row items-center justify-between p-3 bg-primary-50 rounded-lg"
                        >
                          <Text className="text-gray-600">Heure des rappels</Text>
                          <View className="flex-row items-center">
                            <Text className="text-gray-800">
                              {reminderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#4b5563" style={{ marginLeft: 8 }} />
                          </View>
                        </TouchableOpacity>

                        <Text className="text-xs text-primary-600 mt-2 italic">
                          Les rappels seront programmés à cette heure pour chaque jour du plan
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Liste des séances d'entraînement */}
                {aiPlan.map((workout, index) => (
                  <View key={index} className="bg-white rounded-xl p-6 mb-4 border border-primary-200 shadow-card">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-xl font-bold text-primary-800">
                        Jour {index + 1}/7
                      </Text>
                      <Text className="text-sm text-primary-600">
                        {formatDate(workout.date)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between mb-2">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color="#4b5563" />
                        <Text className="ml-1 text-gray-600">{workout.duration} min</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="flame-outline" size={16} color="#4b5563" />
                        <Text className="ml-1 text-gray-600">{workout.calories_burned} kcal</Text>
                      </View>
                    </View>

                    <View className="mt-4">
                      <Text className="text-sm font-semibold text-primary-700 mb-2">
                        {workout.details.length} exercices
                      </Text>
                      {workout.details.map((detail, detailIndex) => (
                        <View key={detailIndex} className="flex-row justify-between items-center py-2 border-b border-primary-100">
                          <Text className="text-primary-900 flex-1">{detail.exercise.name}</Text>
                          <Text className="text-primary-600">{formatExerciseDisplay(detail)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View className="flex-1 justify-center items-center py-20">
                <View className="bg-white rounded-2xl p-8 items-center shadow-card border border-primary-200">
                  <View className="bg-error-light rounded-full p-4 mb-4">
                    <Ionicons name="alert-circle" size={32} color="#dc2626" />
                  </View>
                  <Text className="text-xl font-bold text-primary-800 mb-2 text-center">
                    Aucun plan généré
                  </Text>
                  <Text className="text-primary-600 text-center">
                    Veuillez réessayer
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Modal pour le sélecteur de date/heure */}
        <Modal
          visible={showReminderModal}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-800">
                  {reminderPickerMode === 'date' ? 'Sélectionner la date' : 'Sélectionner l&apos;heure'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowReminderModal(false);
                    setReminderPickerMode('date');
                  }}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={reminderDate}
                mode={reminderPickerMode}
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleReminderDateChange}
                style={{ width: '100%' }}
              />

              {Platform.OS === 'ios' && (
                <View className="mt-4 flex-row justify-between">
                  {reminderPickerMode === 'time' && (
                    <TouchableOpacity
                      onPress={() => {
                        setReminderPickerMode('date');
                      }}
                      className="flex-1 p-3 bg-gray-500 rounded-lg mr-2"
                    >
                      <Text className="text-white text-center font-semibold">Retour</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      if (reminderPickerMode === 'date') {
                        setReminderPickerMode('time');
                      } else {
                        if (reminderDate <= new Date()) {
                          Alert.alert('Erreur', 'La date du rappel doit être dans le futur');
                          return;
                        }
                        setShowReminderModal(false);
                        setReminderPickerMode('date');
                      }
                    }}
                    className="flex-1 p-3 bg-blue-500 rounded-lg ml-2"
                  >
                    <Text className="text-white text-center font-semibold">
                      {reminderPickerMode === 'date' ? 'Suivant' : 'Terminer'}
                    </Text>
                  </TouchableOpacity>
                  
                  
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Boutons d'action */}
        {!loading && aiPlan.length > 0 && (
          <View className="bg-white px-6 py-4 border-t border-primary-200 shadow-header">
            <View className="flex-row space-x-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-primary-200 py-4 rounded-xl border border-primary-300 mr-2"
                onPress={onClose}
              >
                <Text className="text-center font-bold text-primary-700 text-base">
                  Annuler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-profile py-4 rounded-xl ml-2"
                onPress={handleValidate}
              >
                <Text className="text-center font-bold text-white text-base">
                  Valider le plan
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text className="text-xs text-primary-500 text-center">
              En validant, ce plan sera ajouté à votre calendrier
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default AIWorkoutPlanModal; 