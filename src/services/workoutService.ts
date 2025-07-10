const API_BASE_URL = 'http://localhost:3000/api';

// Mapping des exercise_id vers les noms (correspond aux exercices prédéfinis du modal)
const EXERCISE_MAPPING: { [key: number]: { name: string; goal_type: string } } = {
  1: { name: 'Pompes', goal_type: 'strength' },
  2: { name: 'Squats', goal_type: 'strength' },
  3: { name: 'Planche', goal_type: 'core' },
  4: { name: 'Burpees', goal_type: 'cardio' },
  5: { name: 'Mountain Climbers', goal_type: 'cardio' },
  6: { name: 'Développé couché', goal_type: 'strength' },
  7: { name: 'Tractions', goal_type: 'strength' },
  8: { name: 'Deadlift', goal_type: 'strength' },
  9: { name: 'Dips', goal_type: 'strength' },
  10: { name: 'Rowing', goal_type: 'strength' },
  11: { name: 'Fentes', goal_type: 'strength' },
  12: { name: 'Gainage latéral', goal_type: 'core' },
};

const getExerciseName = (exerciseId: number): string => {
  return EXERCISE_MAPPING[exerciseId]?.name || 'Exercice inconnu';
};

const getExerciseGoalType = (exerciseId: number): string => {
  return EXERCISE_MAPPING[exerciseId]?.goal_type || 'strength';
};

export interface Exercise {
  exercise_id: number;
  name: string;
  description: string;
  video_url?: string;
  goal_type: string;
}

export interface WorkoutDetail {
  detail_id: number;
  workout_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight: number;
  exercise: Exercise;
}

export interface Workout {
  workout_id: number;
  user_id: number;
  name?: string;
  date: string;
  duration: number;
  calories_burned: number;
  details: WorkoutDetail[];
}

export interface WorkoutResponse {
  status: number;
  message: string;
  data: Workout[];
}

export const fetchUserWorkouts = async (token: string): Promise<Workout[]> => {
  try {
    console.log('[FETCH] Début fetchUserWorkouts');
    console.log('[AUTH] Token présent:', !!token);
    console.log('[URL] URL appelée:', `${API_BASE_URL}/workouts/userWorkouts/`);
    
    const response = await fetch(`${API_BASE_URL}/workouts/userWorkouts/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[RESPONSE] Status:', response.status);
    console.log('[RESPONSE] OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ERROR] Erreur réponse:', errorText);
      throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
    }

    const data: WorkoutResponse = await response.json();
    console.log('[DATA] Données reçues:', data);
    console.log('[COUNT] Nombre de workouts:', data.data?.length || 0);
    
    return data.data || [];
  } catch (error: any) {
    console.error('[ERROR] Erreur dans fetchUserWorkouts:', error);
    
    // Vérifier si c'est un problème de réseau
    if (error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 3000.');
    }
    
    throw new Error(error.message || 'Erreur lors de la récupération des workouts');
  }
};

export const formatDateForCalendar = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
};

export const groupWorkoutsByDate = (workouts: Workout[]): { [date: string]: Workout[] } => {
  return workouts.reduce((grouped, workout) => {
    const dateKey = formatDateForCalendar(workout.date);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(workout);
    return grouped;
  }, {} as { [date: string]: Workout[] });
};

// Interfaces pour les données de création/modification
export interface CreateWorkoutData {
  name?: string;
  date: string;
  duration: number;
  calories_burned: number;
  details: CreateWorkoutDetail[];
}

export interface CreateWorkoutDetail {
  exercise_id: number;
  sets: number;
  reps: number;
  weight: number;
}

export interface UpdateWorkoutData {
  date?: string;
  duration?: number;
  calories_burned?: number;
  details?: CreateWorkoutDetail[];
}

// Créer une nouvelle séance d'entraînement
export const createWorkout = async (token: string, workoutData: CreateWorkoutData): Promise<Workout> => {
  try {
    // Le backend attend un format plan avec un tableau
    const planFormat = {
      plan: [{
        name: workoutData.name,
        date: workoutData.date,
        duration: workoutData.duration,
        calories_burned: workoutData.calories_burned,
        details: workoutData.details.map(detail => ({
          sets: detail.sets,
          reps: detail.reps,
          weight: detail.weight,
          exercise: {
            name: getExerciseName(detail.exercise_id),
            description: 'Exercise description',
            goal_type: getExerciseGoalType(detail.exercise_id),
            video_url: null
          }
        }))
      }]
    };

    const response = await fetch(`${API_BASE_URL}/workouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planFormat),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur serveur'}`);
    }

    const data = await response.json();
    // Le backend retourne un tableau, on prend le premier élément
    return data.data[0];
  } catch (error: any) {
    console.error('Erreur création workout:', error);
    throw new Error(error.message || 'Erreur lors de la création du workout');
  }
};

// Mettre à jour une séance d'entraînement
export const updateWorkout = async (token: string, workoutId: number, workoutData: UpdateWorkoutData): Promise<Workout> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur serveur'}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Erreur mise à jour workout:', error);
    throw new Error(error.message || 'Erreur lors de la mise à jour du workout');
  }
};

// Supprimer une séance d'entraînement
export const deleteWorkout = async (token: string, workoutId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur serveur'}`);
    }
  } catch (error: any) {
    console.error('Erreur suppression workout:', error);
    throw new Error(error.message || 'Erreur lors de la suppression du workout');
  }
}; 