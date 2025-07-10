import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Workout, CreateWorkoutData, CreateWorkoutDetail } from '../src/services/workoutService';

interface WorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  workout?: Workout | null;
  onSave: (workoutData: CreateWorkoutData, workoutId?: number) => Promise<void>;
  onDelete: (workoutId: number) => Promise<void>;
}

interface ExerciseForm {
  exercise_id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

// Exercices prédéfinis avec catégories et types
const PREDEFINED_EXERCISES = [
  { exercise_id: 1, name: 'Pompes', category: 'Pectoraux', type: 'compound' },
  { exercise_id: 2, name: 'Squats', category: 'Jambes', type: 'compound' },
  { exercise_id: 3, name: 'Planche', category: 'Core', type: 'isolation' },
  { exercise_id: 4, name: 'Burpees', category: 'Cardio', type: 'compound' },
  { exercise_id: 5, name: 'Mountain Climbers', category: 'Cardio', type: 'compound' },
  { exercise_id: 6, name: 'Développé couché', category: 'Pectoraux', type: 'compound' },
  { exercise_id: 7, name: 'Tractions', category: 'Dos', type: 'compound' },
  { exercise_id: 8, name: 'Deadlift', category: 'Dos', type: 'compound' },
  { exercise_id: 9, name: 'Dips', category: 'Triceps', type: 'isolation' },
  { exercise_id: 10, name: 'Rowing', category: 'Dos', type: 'compound' },
  { exercise_id: 11, name: 'Fentes', category: 'Jambes', type: 'compound' },
  { exercise_id: 12, name: 'Gainage latéral', category: 'Core', type: 'isolation' }
];

// Modèles de séances pré-organisées logiquement
const WORKOUT_TEMPLATES = {
  'Haut du corps': [
    { exercise_id: 1, name: 'Pompes', sets: 3, reps: 12, weight: 0 },
    { exercise_id: 6, name: 'Développé couché', sets: 3, reps: 10, weight: 40 },
    { exercise_id: 7, name: 'Tractions', sets: 3, reps: 8, weight: 0 },
    { exercise_id: 10, name: 'Rowing', sets: 3, reps: 12, weight: 20 },
    { exercise_id: 9, name: 'Dips', sets: 2, reps: 10, weight: 0 }
  ],
  'Bas du corps': [
    { exercise_id: 2, name: 'Squats', sets: 4, reps: 12, weight: 30 },
    { exercise_id: 8, name: 'Deadlift', sets: 3, reps: 8, weight: 50 },
    { exercise_id: 11, name: 'Fentes', sets: 3, reps: 10, weight: 15 },
    { exercise_id: 3, name: 'Planche', sets: 3, reps: 30, weight: 0 }
  ],
  'Full Body': [
    { exercise_id: 4, name: 'Burpees', sets: 3, reps: 8, weight: 0 },
    { exercise_id: 2, name: 'Squats', sets: 3, reps: 12, weight: 20 },
    { exercise_id: 1, name: 'Pompes', sets: 3, reps: 10, weight: 0 },
    { exercise_id: 5, name: 'Mountain Climbers', sets: 3, reps: 15, weight: 0 },
    { exercise_id: 3, name: 'Planche', sets: 2, reps: 30, weight: 0 }
  ],
  'Cardio HIIT': [
    { exercise_id: 4, name: 'Burpees', sets: 4, reps: 12, weight: 0 },
    { exercise_id: 5, name: 'Mountain Climbers', sets: 4, reps: 20, weight: 0 },
    { exercise_id: 2, name: 'Squats', sets: 4, reps: 15, weight: 0 },
    { exercise_id: 1, name: 'Pompes', sets: 3, reps: 12, weight: 0 }
  ],
  'Core & Stabilité': [
    { exercise_id: 3, name: 'Planche', sets: 3, reps: 45, weight: 0 },
    { exercise_id: 12, name: 'Gainage latéral', sets: 3, reps: 30, weight: 0 },
    { exercise_id: 5, name: 'Mountain Climbers', sets: 3, reps: 20, weight: 0 },
    { exercise_id: 4, name: 'Burpees', sets: 2, reps: 8, weight: 0 }
  ]
};

export default function WorkoutModal({ 
  visible, 
  onClose, 
  selectedDate, 
  workout, 
  onSave, 
  onDelete 
}: WorkoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('30');
  const [caloriesBurned, setCaloriesBurned] = useState('200');
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Mode édition ou création
  const isEditing = !!workout;

  useEffect(() => {
    if (visible) {
      if (workout) {
        // Mode édition : charger les données existantes
        setWorkoutName(workout.name || '');
        setDuration(workout.duration.toString());
        setCaloriesBurned(workout.calories_burned.toString());
        
        const exercisesForms: ExerciseForm[] = workout.details.map(detail => ({
          exercise_id: detail.exercise_id,
          name: detail.exercise.name,
          sets: detail.sets,
          reps: detail.reps,
          weight: detail.weight
        }));
        setExercises(exercisesForms);
      } else {
        // Mode création : réinitialiser
        setWorkoutName('');
        setDuration('30');
        setCaloriesBurned('200');
        setExercises([{
          exercise_id: 1,
          name: 'Pompes',
          sets: 3,
          reps: 10,
          weight: 0
        }]);
      }
    }
  }, [visible, workout]);

  const applyTemplate = (templateName: string) => {
    const template = WORKOUT_TEMPLATES[templateName as keyof typeof WORKOUT_TEMPLATES];
    if (template) {
      setExercises([...template]);
      setShowTemplates(false);
      
      // Ajuster la durée et les calories selon le type de séance
      switch (templateName) {
        case 'Haut du corps':
        case 'Bas du corps':
          setDuration('45');
          setCaloriesBurned('250');
          break;
        case 'Full Body':
          setDuration('60');
          setCaloriesBurned('350');
          break;
        case 'Cardio HIIT':
          setDuration('30');
          setCaloriesBurned('300');
          break;
        case 'Core & Stabilité':
          setDuration('25');
          setCaloriesBurned('150');
          break;
        default:
          setDuration('45');
          setCaloriesBurned('250');
      }
    }
  };

  const addExercise = () => {
    setExercises([...exercises, {
      exercise_id: 1,
      name: 'Pompes',
      sets: 3,
      reps: 10,
      weight: 0
    }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    
    // Si on change l'exercice, mettre à jour le nom
    if (field === 'exercise_id') {
      const selectedExercise = PREDEFINED_EXERCISES.find(ex => ex.exercise_id === value);
      if (selectedExercise) {
        updated[index].name = selectedExercise.name;
      }
    }
    
    setExercises(updated);
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins un exercice');
      return;
    }

    if (!duration || !caloriesBurned) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const workoutData: CreateWorkoutData = {
        name: workoutName.trim() || undefined,
        date: selectedDate,
        duration: parseInt(duration),
        calories_burned: parseInt(caloriesBurned),
        details: exercises.map(ex => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight
        }))
      };

      await onSave(workoutData, workout?.workout_id);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la séance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workout) return;

    Alert.alert(
      'Supprimer la séance',
      'Êtes-vous sûr de vouloir supprimer cette séance d\'entraînement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onDelete(workout.workout_id);
              onClose();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la séance');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-800">
              {isEditing ? 'Modifier la séance' : 'Nouvelle séance'}
            </Text>
            
            {isEditing && (
              <TouchableOpacity onPress={handleDelete} className="p-2">
                <Ionicons name="trash" size={24} color="#ef4444" />
              </TouchableOpacity>
            )}
            
            {!isEditing && <View className="w-10" />}
          </View>
          
          <Text className="text-sm text-gray-600 mt-2 text-center">
            {new Date(selectedDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Informations générales */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Informations générales</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Nom de la séance (optionnel)</Text>
              <TextInput
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Ex: Séance du lundi, Cardio matinal..."
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-800"
                maxLength={50}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Durée (minutes)</Text>
              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="numeric"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Calories brûlées</Text>
              <TextInput
                value={caloriesBurned}
                onChangeText={setCaloriesBurned}
                placeholder="200"
                keyboardType="numeric"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>
          </View>

          {/* Modèles de séances */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Modèles de séances</Text>
              <TouchableOpacity
                onPress={() => setShowTemplates(!showTemplates)}
                className="bg-purple-500 rounded-lg px-3 py-2 flex-row items-center"
              >
                <Ionicons name={showTemplates ? "chevron-up" : "chevron-down"} size={16} color="white" />
                <Text className="text-white font-medium ml-1">
                  {showTemplates ? 'Masquer' : 'Voir modèles'}
                </Text>
              </TouchableOpacity>
            </View>

            {showTemplates && (
              <View>
                <Text className="text-sm text-gray-600 mb-3">
                  Choisissez un modèle pré-organisé pour commencer rapidement :
                </Text>
                {Object.keys(WORKOUT_TEMPLATES).map((templateName) => (
                  <TouchableOpacity
                    key={templateName}
                    onPress={() => applyTemplate(templateName)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-800">{templateName}</Text>
                      <Text className="text-xs text-gray-600">
                        {WORKOUT_TEMPLATES[templateName as keyof typeof WORKOUT_TEMPLATES].length} exercices
                      </Text>
                    </View>
                    <View className="bg-purple-100 rounded-full p-2">
                      <Ionicons name="fitness" size={16} color="#8b5cf6" />
                    </View>
                  </TouchableOpacity>
                ))}
                <View className="bg-blue-50 rounded-lg p-3 mt-2">
                  <Text className="text-xs text-blue-800 font-medium">💡 Conseil</Text>
                  <Text className="text-xs text-blue-700 mt-1">
                    Les modèles sont pré-organisés selon les principes d&apos;entraînement. Vous pouvez les modifier après sélection.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Exercices */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Exercices</Text>
              <TouchableOpacity
                onPress={addExercise}
                className="bg-blue-500 rounded-lg px-3 py-2 flex-row items-center"
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-medium ml-1">Ajouter</Text>
              </TouchableOpacity>
            </View>

            {exercises.map((exercise, index) => {
              const exerciseInfo = PREDEFINED_EXERCISES.find(ex => ex.exercise_id === exercise.exercise_id);
              return (
                <View key={index} className="bg-gray-50 rounded-lg p-3 mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700">Exercice {index + 1}</Text>
                      {exerciseInfo && (
                        <View className="flex-row items-center mt-1">
                          <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
                            <Text className="text-xs text-blue-800 font-medium">{exerciseInfo.category}</Text>
                          </View>
                          <View className={`rounded-full px-2 py-1 ${exerciseInfo.type === 'compound' ? 'bg-green-100' : 'bg-orange-100'}`}>
                            <Text className={`text-xs font-medium ${exerciseInfo.type === 'compound' ? 'text-green-800' : 'text-orange-800'}`}>
                              {exerciseInfo.type === 'compound' ? 'Composé' : 'Isolation'}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    {exercises.length > 1 && (
                      <TouchableOpacity onPress={() => removeExercise(index)}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Sélection d'exercice */}
                  <View className="mb-2">
                    <Text className="text-xs text-gray-600 mb-1">Type d&apos;exercice</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                      {PREDEFINED_EXERCISES.map((ex) => (
                        <TouchableOpacity
                          key={ex.exercise_id}
                          onPress={() => updateExercise(index, 'exercise_id', ex.exercise_id)}
                          className={`mr-2 px-3 py-2 rounded-lg ${
                            exercise.exercise_id === ex.exercise_id 
                              ? 'bg-blue-500' 
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${
                            exercise.exercise_id === ex.exercise_id ? 'text-white' : 'text-gray-700'
                          }`}>
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Détails */}
                  <View className="flex-row space-x-2">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Séries</Text>
                      <TextInput
                        value={exercise.sets.toString()}
                        onChangeText={(text) => updateExercise(index, 'sets', parseInt(text) || 0)}
                        keyboardType="numeric"
                        className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Reps</Text>
                      <TextInput
                        value={exercise.reps.toString()}
                        onChangeText={(text) => updateExercise(index, 'reps', parseInt(text) || 0)}
                        keyboardType="numeric"
                        className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Poids (kg)</Text>
                      <TextInput
                        value={exercise.weight.toString()}
                        onChangeText={(text) => updateExercise(index, 'weight', parseFloat(text) || 0)}
                        keyboardType="numeric"
                        className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs"
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer avec boutons */}
        <View className="bg-white border-t border-gray-200 px-6 py-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`rounded-xl py-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                {isEditing ? 'Modifier la séance' : 'Créer la séance'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 