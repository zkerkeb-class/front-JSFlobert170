import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getReminders, deleteReminder, Reminder } from '../src/services/reminderService';
import { StatusBarOverlay } from '../components/layout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatReminderDate = (date: string) => {
  const reminderDate = new Date(date);
  return {
    date: format(reminderDate, 'EEEE d MMMM yyyy', { locale: fr }),
    time: format(reminderDate, 'HH:mm', { locale: fr })
  };
};

const isReminderPassed = (date: string) => {
  return new Date(date) < new Date();
};

export default function RemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const allReminders = await getReminders();
      const sortedReminders = allReminders.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setReminders(sortedReminders);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
      Alert.alert('Erreur', 'Impossible de charger les rappels');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setReminders(currentReminders => currentReminders.filter(r => r.id !== reminderId));
      fadeAnim.setValue(1);
    });
    
    deleteReminder(reminderId).catch(error => {
      console.error('Erreur lors de la suppression du rappel:', error);
      loadReminders();
      Alert.alert('Erreur', 'Impossible de supprimer le rappel');
    });
  };

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const { date, time } = formatReminderDate(reminder.date);
    const isPassed = isReminderPassed(reminder.date);
    const cardFadeAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View 
        style={{ 
          opacity: cardFadeAnim,
          transform: [{
            translateX: cardFadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            })
          }]
        }}
      >
        <View className={`bg-white rounded-xl p-4 mb-3 shadow-md border ${
          isPassed ? 'border-red-200' : 'border-green-200'
        }`}>
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">{reminder.workoutName}</Text>
              <View className={`flex-row items-center mt-1 ${
                isPassed ? 'bg-red-50' : 'bg-green-50'
              } rounded-full px-3 py-1 self-start`}>
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  isPassed ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <Text className={`text-sm ${
                  isPassed ? 'text-red-600' : 'text-green-600'
                } font-medium`}>
                  {isPassed ? 'Passé' : 'À venir'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteReminder(reminder.id)}
              className="p-2 bg-red-50 rounded-full"
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-3 bg-gray-50 rounded-lg p-3">
            <View className="flex-row items-center mr-4">
              <View className="bg-blue-100 p-2 rounded-full mr-2">
                <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
              </View>
              <Text className="text-gray-700">{date}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-purple-100 p-2 rounded-full mr-2">
                <Ionicons name="time-outline" size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-700">{time}</Text>
            </View>
          </View>

          {!reminder.enabled && (
            <View className="mt-3 bg-yellow-50 rounded-lg p-3 flex-row items-center">
              <Ionicons name="warning-outline" size={20} color="#F59E0B" />
              <Text className="text-yellow-800 text-sm ml-2">
                Ce rappel est désactivé
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <View className="flex-row items-center justify-between p-5 pb-3">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 bg-white rounded-full shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1 text-center mr-10">
          Mes rappels
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Chargement des rappels...</Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-5" 
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          {reminders.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <View className="bg-gray-100 p-6 rounded-full mb-4">
                <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-gray-700 text-lg font-semibold mt-4 text-center">
                Aucun rappel planifié
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center px-6">
                Créez des rappels pour vos entraînements depuis la page d&apos;entraînement
              </Text>
            </View>
          ) : (
            <>
              <View className="mb-4 bg-white rounded-lg p-3 shadow-sm">
                <Text className="text-sm font-medium text-gray-600">
                  {reminders.length} rappel{reminders.length > 1 ? 's' : ''} planifié{reminders.length > 1 ? 's' : ''}
                </Text>
              </View>
              {reminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
              <View className="h-6" />
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 