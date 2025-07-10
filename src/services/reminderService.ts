import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { sendEmailNotification, sendSMSNotification, getNotificationPreferences } from './notificationService';
import { getCurrentUser } from './auth';

export interface Reminder {
  id: string;
  workoutId: number;
  workoutName: string;
  date: string;
  enabled: boolean;
  notificationId?: string;
}

const REMINDERS_STORAGE_KEY = '@sparkfit_reminders';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Les permissions de notification sont nécessaires pour créer un rappel');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    throw error;
  }
};

// Fonction pour nettoyer toutes les notifications programmées
const clearAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erreur lors du nettoyage des notifications:', error);
  }
};

export const saveReminder = async (reminder: Omit<Reminder, 'id'>) => {
  try {
    // Vérifier les permissions avant de continuer
    await requestNotificationPermissions();

    // Récupérer les rappels existants
    const existingReminders = await getReminders();
    
    // Créer un nouveau rappel
    const newReminder: Reminder = {
      ...reminder,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(reminder.date).toISOString(),
    };

    // Nettoyer toutes les notifications existantes
    await clearAllScheduledNotifications();

    // Programmer la notification si le rappel est activé
    if (reminder.enabled) {
      const notificationId = await scheduleNotification(newReminder);
      newReminder.notificationId = notificationId;
    }

    // Sauvegarder le rappel
    const updatedReminders = [...existingReminders, newReminder];
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));

    return newReminder;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du rappel:', error);
    throw error;
  }
};

export const getReminders = async (): Promise<Reminder[]> => {
  try {
    const reminders = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    return reminders ? JSON.parse(reminders) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des rappels:', error);
    return [];
  }
};

export const deleteReminder = async (reminderId: string) => {
  try {
    // Récupérer les rappels en une seule fois
    const remindersStr = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!remindersStr) return;

    const reminders: Reminder[] = JSON.parse(remindersStr);
    const reminder = reminders.find((r: Reminder) => r.id === reminderId);

    // Si le rappel a une notification, l'annuler en arrière-plan
    if (reminder?.notificationId) {
      Notifications.cancelScheduledNotificationAsync(reminder.notificationId)
        .catch(error => console.warn('Erreur lors de l\'annulation de la notification:', error));
    }

    // Mettre à jour le stockage immédiatement
    const updatedReminders = reminders.filter((r: Reminder) => r.id !== reminderId);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
  } catch (error) {
    console.error('Erreur lors de la suppression du rappel:', error);
    throw error;
  }
};

export const getReminderByWorkoutId = async (workoutId: number): Promise<Reminder | null> => {
  try {
    const reminders = await getReminders();
    return reminders.find(r => r.workoutId === workoutId) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rappel:', error);
    return null;
  }
};

export const updateReminder = async (workoutId: number, reminderData: Omit<Reminder, 'id' | 'workoutId'>) => {
  try {
    const reminders = await getReminders();
    const existingReminderIndex = reminders.findIndex(r => r.workoutId === workoutId);
    
    if (existingReminderIndex === -1) {
      throw new Error('Rappel non trouvé');
    }

    // Annuler l'ancienne notification si elle existe
    if (reminders[existingReminderIndex].notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminders[existingReminderIndex].notificationId);
    }

    // Créer le rappel mis à jour
    const updatedReminder: Reminder = {
      ...reminders[existingReminderIndex],
      ...reminderData,
      date: new Date(reminderData.date).toISOString(),
    };

    // Programmer la nouvelle notification si le rappel est activé
    if (reminderData.enabled) {
      const notificationId = await scheduleNotification(updatedReminder);
      updatedReminder.notificationId = notificationId;
    } else {
      updatedReminder.notificationId = undefined;
    }

    // Mettre à jour le tableau des rappels
    reminders[existingReminderIndex] = updatedReminder;
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    return updatedReminder;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rappel:', error);
    throw error;
  }
};

const scheduleNotification = async (reminder: Reminder): Promise<string> => {
  try {
    const triggerDate = new Date(reminder.date);
    
    // S'assurer que la date est dans le futur
    if (triggerDate <= new Date()) {
      throw new Error('La date du rappel doit être dans le futur');
    }

    // Réinitialiser les secondes et millisecondes à 0 pour déclencher au début de la minute
    triggerDate.setSeconds(0);
    triggerDate.setMilliseconds(0);

    // Si le rappel a déjà une notification programmée, l'annuler
    if (reminder.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      } catch (error) {
        console.warn('Erreur lors de l\'annulation de l\'ancienne notification:', error);
      }
    }

    console.log('Programmation de la notification push pour:', triggerDate.toISOString());

    // Programmer la notification push
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Rappel d'entraînement`,
        body: `Rappel pour votre séance "${reminder.workoutName}"`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { workoutId: reminder.workoutId },
      },
      trigger: {
        type: 'date',
        date: triggerDate,
        channelId: 'workout-reminders',
      } as any,
    });

    if (!notificationId) {
      throw new Error('Échec de la programmation de la notification push');
    }

    console.log('Notification push programmée avec succès, ID:', notificationId);

    // Récupérer les préférences de notification
    const { notificationsEnabled, notificationType } = await getNotificationPreferences();
    console.log('Préférences de notification récupérées:', { notificationsEnabled, notificationType });

    if (notificationsEnabled) {
      const currentUser = getCurrentUser();
      console.log('Utilisateur actuel:', currentUser);
      
      // Envoyer l'email si l'utilisateur a choisi l'email
      if (notificationType === 'email' && currentUser?.email) {
        console.log('Envoi de l\'email à:', currentUser.email);
        const emailSent = await sendEmailNotification(currentUser.email, reminder.workoutName, triggerDate);
        console.log('Résultat envoi email:', emailSent ? 'Succès' : 'Échec');
      }
      
      // Envoyer le SMS si l'utilisateur a choisi le SMS
      if (notificationType === 'sms' && currentUser?.phone) {
        console.log('Envoi du SMS au:', currentUser.phone);
        const smsSent = await sendSMSNotification(currentUser.phone, reminder.workoutName, triggerDate);
        console.log('Résultat envoi SMS:', smsSent ? 'Succès' : 'Échec');
      }
    } else {
      console.log('Les notifications sont désactivées dans les préférences');
    }

    return notificationId;
  } catch (error) {
    console.error('Erreur détaillée lors de la programmation de la notification:', error);
    throw error;
  }
}; 