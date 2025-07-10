import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const NOTIFICATION_PREFS_KEY = '@notification_preferences';

// Types pour les préférences de notification
export interface NotificationPreferences {
  notificationsEnabled: boolean;
  notificationType: 'email' | 'sms';
}

// Récupérer l'URL du service de notification depuis la configuration
const NOTIFICATION_API_URL = `${Constants.expoConfig?.extra?.notificationServiceUrl}/api/notifications`;

// Fonction pour normaliser la date au début de la minute
function normalizeToStartOfMinute(date: Date): Date {
  const normalized = new Date(date);
  normalized.setSeconds(0);
  normalized.setMilliseconds(0);
  return normalized;
}

// Fonction pour sauvegarder les préférences de notification
export const saveNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
    console.log('Préférences de notification sauvegardées:', preferences);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
    throw error;
  }
};

// Fonction pour récupérer les préférences de notification
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const prefs = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (prefs) {
      return JSON.parse(prefs);
    }
    // Valeurs par défaut
    return {
      notificationsEnabled: true,
      notificationType: 'email'
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    // Retourner les valeurs par défaut en cas d'erreur
    return {
      notificationsEnabled: true,
      notificationType: 'email'
    };
  }
};

export const sendEmailNotification = async (
  to: string,
  workoutName: string,
  date: Date
) => {
  try {
    // Normaliser la date au début de la minute
    const normalizedDate = normalizeToStartOfMinute(date);

    const formattedDate = normalizedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const formattedTime = normalizedDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('Configuration service notification:', {
      baseUrl: Constants.expoConfig?.extra?.notificationServiceUrl,
      fullUrl: NOTIFICATION_API_URL,
      originalDate: date.toISOString(),
      normalizedDate: normalizedDate.toISOString()
    });

    const response = await fetch(`${NOTIFICATION_API_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        to,
        subject: `Rappel d'entraînement - ${workoutName}`,
        text: `Rappel pour votre séance "${workoutName}" prévue le ${formattedDate} à ${formattedTime}.`,
        html: `
          <h2>Rappel d'entraînement</h2>
          <p>Bonjour,</p>
          <p>Ceci est un rappel pour votre séance <strong>${workoutName}</strong>.</p>
          <p>Date : <strong>${formattedDate}</strong></p>
          <p>Heure : <strong>${formattedTime}</strong></p>
          <p>Bonne séance !</p>
        `,
        scheduledDate: normalizedDate.toISOString()
      })
    });

    const responseText = await response.text();
    console.log('Réponse du serveur:', responseText);

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status} - ${responseText}`);
    }

    console.log('Email programmé avec succès pour:', normalizedDate.toISOString());
    return true;
  } catch (error) {
    console.error('Erreur détaillée:', error);
    return false;
  }
};

export const sendSMSNotification = async (
  phone: string,
  workoutName: string,
  date: Date
) => {
  try {
    // Normaliser la date au début de la minute
    const normalizedDate = normalizeToStartOfMinute(date);

    const formattedDate = normalizedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const formattedTime = normalizedDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('Configuration service notification SMS:', {
      baseUrl: Constants.expoConfig?.extra?.notificationServiceUrl,
      fullUrl: NOTIFICATION_API_URL,
      originalDate: date.toISOString(),
      normalizedDate: normalizedDate.toISOString(),
      phone
    });

    const response = await fetch(`${NOTIFICATION_API_URL}/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        to: phone,
        body: `Rappel: Votre séance "${workoutName}" est prévue le ${formattedDate} à ${formattedTime}.`,
        scheduledDate: normalizedDate.toISOString()
      })
    });

    const responseText = await response.text();
    console.log('Réponse du serveur SMS:', responseText);

    if (!response.ok) {
      throw new Error(`Erreur serveur SMS: ${response.status} - ${responseText}`);
    }

    console.log('SMS programmé avec succès pour:', normalizedDate.toISOString());
    return true;
  } catch (error) {
    console.error('Erreur détaillée SMS:', error);
    return false;
  }
}; 