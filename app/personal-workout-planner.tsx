import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  TextInput,
  Modal,
  Switch
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../components';
import { isAuthenticated } from '../src/services/auth';
import { createWorkout } from '../src/services/workoutService';
import { saveReminder } from '../src/services/reminderService';

// Types pour les exercices
interface Exercise {
  exercise_id: number;
  name: string;
  category: string;
  type: string;
}

// Exercices prédéfinis (similaire à WorkoutModal)
const PREDEFINED_EXERCISES: Exercise[] = [
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

// Templates d'exercices pour démarrer rapidement
const WORKOUT_TEMPLATES = {
  'Haut du corps': [
    { exercise_id: 1, sets: 3, reps: 12, weight: 0 },
    { exercise_id: 6, sets: 3, reps: 10, weight: 40 },
    { exercise_id: 7, sets: 3, reps: 8, weight: 0 },
    { exercise_id: 10, sets: 3, reps: 12, weight: 20 },
  ],
  'Bas du corps': [
    { exercise_id: 2, sets: 4, reps: 12, weight: 30 },
    { exercise_id: 8, sets: 3, reps: 8, weight: 50 },
    { exercise_id: 11, sets: 3, reps: 10, weight: 15 },
    { exercise_id: 3, sets: 3, reps: 30, weight: 0 }
  ],
  'Full Body': [
    { exercise_id: 4, sets: 3, reps: 8, weight: 0 },
    { exercise_id: 2, sets: 3, reps: 12, weight: 20 },
    { exercise_id: 1, sets: 3, reps: 10, weight: 0 },
    { exercise_id: 5, sets: 3, reps: 15, weight: 0 },
  ],
  'Cardio HIIT': [
    { exercise_id: 4, sets: 4, reps: 12, weight: 0 },
    { exercise_id: 5, sets: 4, reps: 20, weight: 0 },
    { exercise_id: 2, sets: 4, reps: 15, weight: 0 },
    { exercise_id: 1, sets: 3, reps: 12, weight: 0 }
  ]
};

export default function PersonalWorkoutPlannerScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [exercises, setExercises] = useState<Array<{exercise_id: number, sets: number, reps: number, weight: number}>>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // États pour le rappel
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderPickerMode, setReminderPickerMode] = useState<'date' | 'time'>('date');

  const workoutTypes = [
    { id: 'force', name: 'Force', icon: 'fitness', color: '#ef4444' },
    { id: 'cardio', name: 'Cardio', icon: 'walk', color: '#3b82f6' },
    { id: 'flexibility', name: 'Étirements', icon: 'accessibility', color: '#10b981' },
    { id: 'mixed', name: 'Mixte', icon: 'refresh', color: '#8b5cf6' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
      }
    } else {
      // iOS - on garde le picker ouvert jusqu'à ce que l'utilisateur appuie sur OK
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
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

  const addExercise = (exerciseId: number) => {
    const newExercise = {
      exercise_id: exerciseId,
      sets: 3,
      reps: 10,
      weight: 0
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseModal(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: 'sets' | 'reps' | 'weight', value: number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const applyTemplate = (templateName: string) => {
    const template = WORKOUT_TEMPLATES[templateName as keyof typeof WORKOUT_TEMPLATES];
    if (template) {
      setExercises([...template]);
      setShowTemplateModal(false);
    }
  };

  const getExerciseName = (exerciseId: number): string => {
    return PREDEFINED_EXERCISES.find(ex => ex.exercise_id === exerciseId)?.name || 'Exercice inconnu';
  };

  const handleSaveWorkout = async () => {
    if (!isAuthenticated()) {
      Alert.alert('Erreur', 'Vous devez être connecté pour planifier une séance');
      return;
    }

    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type d\'entraînement');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un exercice');
      return;
    }

    try {
      setSaving(true);

      // Récupérer le token
      const authService = await import('../src/services/auth');
      const token = authService.default.getAuthToken();
      
      if (!token) {
        Alert.alert('Erreur', 'Token d\'authentification non trouvé');
        return;
      }

      // Préparer les données dans le format attendu par le service
      const workoutData = {
        name: workoutName.trim() || undefined,
        date: selectedDate.toISOString().split('T')[0],
        duration: 45,
        calories_burned: 250,
        details: exercises.map(exercise => ({
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight
        }))
      };

      // Sauvegarder la séance
      const savedWorkout = await createWorkout(token, workoutData);

      // Si le rappel est activé, le sauvegarder
      if (reminderEnabled && savedWorkout) {
        try {
          await saveReminder({
            workoutId: savedWorkout.workout_id, // Utiliser workout_id au lieu de id
            workoutName: workoutName || 'Séance d&apos;entraînement',
            date: reminderDate.toISOString(),
            enabled: true
          });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du rappel:', error);
          // On continue même si le rappel échoue
        }
      }
      
      Alert.alert(
        'Séance planifiée !',
        `Votre séance "${workoutName}" a été programmée pour le ${selectedDate.toLocaleDateString('fr-FR')} avec ${exercises.length} exercice(s).${
          reminderEnabled ? `\nUn rappel a été programmé pour le ${reminderDate.toLocaleDateString('fr-FR')} à ${reminderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.` : ''
        }`,
        [
          {
            text: 'Voir le calendrier',
            onPress: () => {
              router.replace('/statistics');
            }
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', `Impossible de sauvegarder la séance: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReminderDateTime = (date: Date) => {
    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-5 pb-3">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 flex-1 text-center">Planifier une séance</Text>
          <View className="w-10" />
        </View>

        <View className="px-5">
          {/* Sélecteur de date */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Date de la séance</Text>
            <TouchableOpacity
              className="bg-white p-4 rounded-xl border border-gray-200 flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#6b7280" />
                <Text className="text-gray-800 ml-3 font-medium">
                  {formatDate(selectedDate)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Nom de la séance */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Nom de la séance</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              placeholder="Ex: Séance du lundi, Cardio matinal..."
              value={workoutName}
              onChangeText={setWorkoutName}
              maxLength={50}
            />
          </View>

          {/* Type d'entraînement */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Type d&apos;entraînement</Text>
            <View className="space-y-3">
              {workoutTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  className={`bg-white p-4 rounded-xl border flex-row items-center ${
                    selectedType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onPress={() => setSelectedType(type.id)}
                >
                  <View 
                    className={`rounded-lg p-3 mr-4`}
                    style={{ backgroundColor: selectedType === type.id ? type.color : '#f3f4f6' }}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={selectedType === type.id ? '#ffffff' : '#6b7280'} 
                    />
                  </View>
                  <Text className={`font-medium ${
                    selectedType === type.id ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {type.name}
                  </Text>
                  {selectedType === type.id && (
                    <View className="ml-auto">
                      <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Exercices */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">Exercices ({exercises.length})</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className="bg-purple-500 px-3 py-2 rounded-lg"
                  onPress={() => setShowTemplateModal(true)}
                >
                  <Text className="text-white text-sm font-medium">Templates</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-blue-500 px-3 py-2 rounded-lg"
                  onPress={() => setShowExerciseModal(true)}
                >
                  <Text className="text-white text-sm font-medium">Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>

            {exercises.length === 0 ? (
              <View className="bg-white p-6 rounded-xl border border-gray-200 items-center">
                <Ionicons name="fitness" size={32} color="#9ca3af" />
                <Text className="text-gray-500 mt-2 text-center">
                  Aucun exercice ajouté{'\n'}Utilisez un template ou ajoutez manuellement
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {exercises.map((exercise, index) => (
                  <View key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="font-semibold text-gray-800">
                        {getExerciseName(exercise.exercise_id)}
                      </Text>
                      <TouchableOpacity
                        className="bg-red-100 p-2 rounded-lg"
                        onPress={() => removeExercise(index)}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row space-x-3">
                      <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Séries</Text>
                        <TextInput
                          value={exercise.sets.toString()}
                          onChangeText={(text) => updateExercise(index, 'sets', parseInt(text) || 0)}
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Reps</Text>
                        <TextInput
                          value={exercise.reps.toString()}
                          onChangeText={(text) => updateExercise(index, 'reps', parseInt(text) || 0)}
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Poids (kg)</Text>
                        <TextInput
                          value={exercise.weight.toString()}
                          onChangeText={(text) => updateExercise(index, 'weight', parseFloat(text) || 0)}
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center"
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>



          {/* Description (optionnelle) */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Description (optionnelle)</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 h-24"
              placeholder="Décrivez votre séance, vos objectifs..."
              value={workoutDescription}
              onChangeText={setWorkoutDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Section Rappel */}
          <View className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Rappel</Text>
            
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600">Activer le rappel</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              />
            </View>

            {reminderEnabled && (
              <TouchableOpacity
                onPress={() => {
                  setReminderPickerMode('date');
                  setShowReminderModal(true);
                }}
                className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <Text className="text-gray-600">Date et heure du rappel</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-800">{formatReminderDateTime(reminderDate)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#4b5563" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
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
                            // Vérifier si la date est dans le futur
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
          </View>

          {/* Bouton de sauvegarde */}
          <TouchableOpacity
            className={`rounded-xl py-4 mb-8 ${saving ? 'bg-gray-400' : 'bg-green-500'}`}
            onPress={handleSaveWorkout}
            disabled={saving}
          >
            <Text className="text-white text-center font-bold text-lg">
              {saving ? 'Sauvegarde...' : 'Planifier la séance'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal d'ajout d'exercice */}
      <Modal
        visible={showExerciseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">Choisir un exercice</Text>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PREDEFINED_EXERCISES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.exercise_id}
                  className="bg-gray-50 p-4 rounded-xl mb-3 flex-row items-center justify-between"
                  onPress={() => addExercise(exercise.exercise_id)}
                >
                  <View>
                    <Text className="font-semibold text-gray-800">{exercise.name}</Text>
                    <Text className="text-sm text-gray-600">{exercise.category}</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#3b82f6" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal des templates */}
      <Modal
        visible={showTemplateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">Templates de séances</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View className="space-y-3">
              {Object.keys(WORKOUT_TEMPLATES).map((templateName) => (
                <TouchableOpacity
                  key={templateName}
                  className="bg-purple-50 p-4 rounded-xl border border-purple-200"
                  onPress={() => applyTemplate(templateName)}
                >
                  <Text className="font-semibold text-purple-800 mb-1">{templateName}</Text>
                  <Text className="text-sm text-purple-600">
                    {WORKOUT_TEMPLATES[templateName as keyof typeof WORKOUT_TEMPLATES].length} exercices
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* DatePicker Modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-800">Choisir une date</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <View className="bg-blue-500 px-4 py-2 rounded-lg">
                    <Text className="text-white font-semibold">OK</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                maximumDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* DatePicker Android */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
        />
      )}
    </SafeAreaView>
  );
} 