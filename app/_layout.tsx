import { Stack } from "expo-router";
import React, { useEffect } from "react";
import "./globals.css";
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';


// Définir la tâche de fond pour les notifications
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  if (error) {
    console.error('Erreur dans la tâche de fond:', error);
    return;
  }
  if (data) {
    console.log('Notification reçue en arrière-plan:', data);
  }
});

export default function RootLayout() {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // Nettoyer toutes les notifications existantes au démarrage
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Configuration du gestionnaire de notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => {
          const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
          console.log('Notifications en attente:', scheduledNotifications);
          
          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          };
        },
      });

      // Configuration du canal de notification pour Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('workout-reminders', {
          name: 'Rappels de séances',
          description: 'Notifications pour les rappels de séances d\'entraînement',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563eb',
          enableVibrate: true,
          enableLights: true,
        });
      }

      // Vérification et demande des permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissions requises',
          'Les notifications sont nécessaires pour recevoir les rappels de séances. Vous pouvez les activer dans les paramètres de votre téléphone.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Configuration des listeners de notification
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification reçue:', notification);
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Réponse à la notification:', response);
        const workoutId = response.notification.request.content.data?.workoutId;
        if (workoutId) {
          // Navigation vers la séance
          // router.push(`/workout/${workoutId}`);
        }
      });

      return () => {
        subscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index"
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }}
      />
      <Stack.Screen 
        name="Login"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="register"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="home"
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="(tabs)"
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="personal-info"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="settings"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="Execises"
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
    </Stack>
  );
}
