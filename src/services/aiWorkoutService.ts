// Configuration des URLs pour les services
const getBaseURL = (port: number) => {
  // Utilisation de localhost pour l'accès local
  const baseHost = 'localhost';
  return `http://${baseHost}:${port}/api`;
};

const AI_API_BASE_URL = getBaseURL(3002);
const BACKEND_API_BASE_URL = getBaseURL(3000);

export interface AIWorkoutDetail {
  sets: number;
  reps: number;
  weight: number;
  completed?: boolean;
  completed_sets?: number;
  completed_reps?: number;
  completed_weight?: number;
  exercise: {
    name: string;
    description: string;
    goal_type: string;
    category: string;
    unit?: string;
    bodyweight?: boolean;
  };
}

export interface AIWorkoutPlan {
  date: string;
  name?: string;
  duration: number;
  calories_burned: number;
  details: AIWorkoutDetail[];
}

export interface AIWorkoutResponse {
  plan: AIWorkoutPlan[];
}

// Interface supprimée - nous utilisons maintenant le format original de l'IA

// Générer un plan avec l'IA pour 7 jours
export const generateAIWorkoutPlan = async (token: string, abortSignal?: AbortSignal): Promise<AIWorkoutPlan[]> => {
  try {
    console.log('Génération plan IA 7 jours sur:', AI_API_BASE_URL);
    
    // Utiliser le signal externe si fourni, sinon créer un controller pour le timeout
    let controller: AbortController | null = null;
    let signal = abortSignal;
    let timeoutId: number | null = null;
    
    if (!signal) {
      controller = new AbortController();
      signal = controller.signal;
      timeoutId = setTimeout(() => controller!.abort(), 45000) as any; // 45 secondes timeout pour 7 jours
    }

    const response = await fetch(`${AI_API_BASE_URL}/workout/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: signal,
    });

    console.log('response:', JSON.stringify(response, null, 2));

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API IA:', response.status, errorText);
      throw new Error(`Erreur serveur IA (${response.status}): ${errorText || 'Service indisponible'}`);
    }

    const data: AIWorkoutResponse = await response.json();
    console.log('Plan IA reçu:', data);
    
    const plan = data.plan || [];
    console.log(`Plan généré avec ${plan.length} jours sur 7 demandés`);
    
    if (plan.length < 7) {
      console.warn(`Attention: Seulement ${plan.length} jours générés au lieu de 7`);
    }
    
    return plan;
  } catch (error: any) {
    console.error('Erreur génération plan IA:', error);
    
    // if (error.name === 'AbortError') {
    //   throw new Error('Délai d\'attente dépassé. Vérifiez que le service IA (port 3002) est démarré et accessible.');
    // }
    
    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le service IA. Vérifiez la connexion réseau et que le service sur le port 3002 est démarré.');
    }
    
    throw new Error(error.message || 'Erreur lors de la génération du plan d\'entraînement');
  }
};

// Sauvegarder un plan complet dans le backend principal
export const saveWorkoutPlanToBackend = async (token: string, aiPlan: AIWorkoutPlan[]): Promise<boolean> => {
  try {
    console.log('Sauvegarde du plan complet:', aiPlan.length, 'séances');
    console.log('Plan à sauvegarder:', JSON.stringify(aiPlan, null, 2));
    
    // Préparer tous les workouts avec les champs de suivi
    const workoutsToSave = aiPlan.map(workout => ({
      name: workout.name,
      date: new Date(workout.date).toISOString(),
      duration: workout.duration,
      calories_burned: workout.calories_burned,
      details: workout.details.map(detail => ({
        sets: detail.sets,
        reps: detail.reps,
        weight: detail.weight,
        completed: false,
        completed_sets: 0,
        completed_reps: 0,
        completed_weight: 0,
        exercise: {
          name: detail.exercise.name,
          description: detail.exercise.description || '',
          goal_type: detail.exercise.goal_type,
          video_url: ''
        }
      }))
    }));

    console.log('Données formatées à envoyer:', JSON.stringify(workoutsToSave, null, 2));

    // Envoyer tous les workouts en une seule requête
    const response = await fetch(`${BACKEND_API_BASE_URL}/workouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: workoutsToSave }),
    });

    console.log('Réponse sauvegarde:', response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur sauvegarde plan:', response.status, errorText);
      throw new Error(`Erreur lors de la sauvegarde du plan: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Réponse sauvegarde:', responseData);
    
    if (responseData.status !== 201) {
      throw new Error(`Erreur lors de la sauvegarde: ${responseData.message}`);
    }

    return true;
  } catch (error: any) {
    console.error('Erreur sauvegarde plan complet:', error);
    throw new Error(error.message || 'Erreur lors de la sauvegarde du plan');
  }
};

// Fonction de conversion supprimée - nous utilisons maintenant le format original de l'IA directement

// Sauvegarder tous les workouts d'un plan IA (en une seule fois)
export const saveAIWorkoutPlan = async (token: string, aiPlan: AIWorkoutPlan[]): Promise<number> => {
  try {
    const saved = await saveWorkoutPlanToBackend(token, aiPlan);
    if (saved) {
      console.log(`${aiPlan.length} séances sauvegardées avec succès`);
      return aiPlan.length; // Toutes les séances sauvegardées
    } else {
      console.error('Échec de la sauvegarde du plan');
      return 0;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du plan complet:', error);
    throw error; // Remonter l'erreur pour affichage à l'utilisateur
  }
}; 