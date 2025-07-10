import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getReminderByWorkoutId, saveReminder, updateReminder } from '../src/services/reminderService';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  workoutId: number;
  workoutName: string;
  onUpdate?: () => void; // Nouveau callback pour la mise à jour
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  onClose,
  workoutId,
  workoutName,
  onUpdate,
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [existingReminder, setExistingReminder] = useState<boolean>(false);

  // Charger le rappel existant s'il y en a un
  useEffect(() => {
    if (visible) {
      loadExistingReminder();
    }
  }, [visible]);

  const loadExistingReminder = async () => {
    try {
      const reminder = await getReminderByWorkoutId(workoutId);
      if (reminder) {
        setExistingReminder(true);
        setIsEnabled(reminder.enabled);
        setDate(new Date(reminder.date));
      } else {
        setExistingReminder(false);
        setIsEnabled(true);
        setDate(new Date());
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rappel:', error);
    }
  };

  const handleSave = async () => {
    try {
      const reminderData = {
        enabled: isEnabled,
        date: date.toISOString(),
        workoutId,
        workoutName,
      };

      if (existingReminder) {
        await updateReminder(workoutId, {
          enabled: isEnabled,
          date: date.toISOString(),
          workoutName,
        });
        Alert.alert('Succès', 'Le rappel a été mis à jour avec succès !');
      } else {
        await saveReminder(reminderData);
        Alert.alert('Succès', 'Le rappel a été créé avec succès !');
      }
      
      // Appeler le callback de mise à jour si fourni
      onUpdate?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder le rappel');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (selectedDate) {
      const currentDate = new Date(date);
      if (pickerMode === 'date') {
        currentDate.setFullYear(selectedDate.getFullYear());
        currentDate.setMonth(selectedDate.getMonth());
        currentDate.setDate(selectedDate.getDate());
        
        if (Platform.OS === 'android') {
          setPickerMode('time');
          setShowTimePicker(true);
        }
      } else {
        currentDate.setHours(selectedDate.getHours());
        currentDate.setMinutes(selectedDate.getMinutes());
      }
      setDate(currentDate);
    }
  };

  const showPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    if (mode === 'date') {
      setShowDatePicker(true);
      setShowTimePicker(false);
    } else {
      setShowDatePicker(false);
      setShowTimePicker(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50"
        onPress={onClose}
        activeOpacity={1}
      >
        <View className="flex-1 justify-center items-center px-4">
          <View className="bg-white w-full max-w-md rounded-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-primary-800">
                {existingReminder ? 'Modifier le rappel' : 'Configurer le rappel'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-base text-primary-600 mb-2">{workoutName}</Text>
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base text-primary-800">Activer le rappel</Text>
                <Switch
                  value={isEnabled}
                  onValueChange={setIsEnabled}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={isEnabled ? '#2563eb' : '#9ca3af'}
                />
              </View>

              {isEnabled && (
                <>
                  <View className="bg-primary-50 rounded-xl p-4 mb-4">
                    <Text className="text-primary-800 font-medium mb-3">Date et heure du rappel</Text>
                    
                    <TouchableOpacity
                      onPress={() => showPicker('date')}
                      className="flex-row justify-between items-center bg-white p-3 rounded-lg mb-2"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="calendar" size={20} color="#4b5563" className="mr-2" />
                        <Text className="text-primary-800 ml-2">Date</Text>
                      </View>
                      <Text className="text-primary-600">
                        {date.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => showPicker('time')}
                      className="flex-row justify-between items-center bg-white p-3 rounded-lg"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={20} color="#4b5563" className="mr-2" />
                        <Text className="text-primary-800 ml-2">Heure</Text>
                      </View>
                      <Text className="text-primary-600">
                        {date.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={pickerMode}
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={handleSave}
                className="bg-primary-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-medium">
                  {existingReminder ? 'Mettre à jour' : 'Enregistrer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}; 