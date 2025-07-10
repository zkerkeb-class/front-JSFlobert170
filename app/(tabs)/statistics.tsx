import React, { useState, useEffect, useCallback } from 'react'
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform, Dimensions } from 'react-native'
import { Calendar, DateData } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { StatusBarOverlay, WorkoutModal } from '../../components'
import { ReminderModal } from '../../components/ReminderModal'
import { TopDecoration } from '../../components/ui'
import { isAuthenticated } from '../../src/services/auth'
import { 
  fetchUserWorkouts, 
  groupWorkoutsByDate, 
  createWorkout,
  updateWorkout,
  deleteWorkout,
  Workout, 
  CreateWorkoutData 
} from '../../src/services/workoutService'
import { getReminderByWorkoutId } from '../../src/services/reminderService'

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  activeOpacity?: number;
  selected?: boolean;
  disableTouchEvent?: boolean;
  selectedDotColor?: string;
}

interface MarkedDates {
  [key: string]: MarkedDate;
}

interface MonthlyStatsProps {
  workouts: Workout[];
}

interface YearlyStatsProps {
  workouts: Workout[];
}

interface MonthlyStatsData {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageDuration: number;
  averageCalories: number;
  mostFrequentExercise: { [key: string]: number };
}

interface YearlyStatsData {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  monthlyStats: Array<{
    workouts: number;
    duration: number;
    calories: number;
  }>;
}

// Ajout des nouvelles interfaces
interface WeeklyStatsData {
  labels: string[];
  workouts: number[];
  durations: number[];
  calories: number[];
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

const WorkoutItem: React.FC<{ workout: Workout; onOpenReminderModal: (workout: Workout) => void; onOpenEditModal: (workout: Workout) => void }> = ({ workout, onOpenReminderModal, onOpenEditModal }) => {
  const [reminderStatus, setReminderStatus] = useState<{ exists: boolean; enabled: boolean } | null>(null);

  // Vérifier si un rappel existe pour cette séance et son état
  useEffect(() => {
    const checkReminder = async () => {
      const reminder = await getReminderByWorkoutId(workout.workout_id);
      setReminderStatus(reminder ? { exists: true, enabled: reminder.enabled } : null);
    };
    checkReminder();
  }, [workout.workout_id]);

  // Fonction pour obtenir les styles du bouton de rappel
  const getReminderButtonStyle = () => {
    if (!reminderStatus) {
      return "bg-gray-200"; // Pas de rappel planifié
    }
    return reminderStatus.enabled ? "bg-statistics" : "bg-primary-200"; // Activé ou désactivé
  };

  // Fonction pour obtenir la couleur de l'icône
  const getReminderIconColor = () => {
    if (!reminderStatus) {
      return "#9ca3af"; // Gris pour désactivé
    }
    return reminderStatus.enabled ? "#ffffff" : "#4f46e5"; // Blanc pour activé, bleu pour désactivé
  };

  return (
    <View className="bg-primary-100 rounded-xl p-4 mb-3 border border-primary-200">
      <View className='flex-row justify-between items-start mb-2'>
        <View className='flex-1'>
          <Text className="text-lg font-bold text-primary-800 mb-1">
            {workout.name ? workout.name : `Séance #${workout.workout_id}`}
          </Text>
          <Text className="text-sm text-primary-600">
            {new Date(workout.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View className='items-end'>
          <View className="bg-statistics rounded-lg px-3 py-1 mb-1">
            <Text className="text-white text-xs font-bold">{workout.duration}min</Text>
          </View>
          <View className="bg-statistics-light rounded-lg px-3 py-1 mb-2">
            <Text className="text-statistics-dark text-xs font-medium">{workout.calories_burned} kcal</Text>
          </View>
        </View>
      </View>

      {/* Liste des exercices */}
      {workout.details && workout.details.length > 0 && (
        <View className="mt-2">
          <Text className="text-sm font-semibold text-primary-700 mb-2">
            {workout.details.length} exercices
          </Text>
          {workout.details.map((detail, index) => (
            <View key={index} className="flex-row justify-between items-center py-2 border-b border-primary-100">
              <View className="flex-1">
                <Text className="text-primary-900">{detail.exercise.name}</Text>
                <Text className="text-xs text-primary-600">
                  {detail.sets} séries × {detail.reps} reps
                  {detail.weight > 0 ? ` - ${detail.weight}kg` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Boutons d'action */}
      <View className="flex-row justify-end mt-3">
        <TouchableOpacity
          onPress={() => onOpenReminderModal(workout)}
          className={`rounded-lg p-2 mr-2 ${getReminderButtonStyle()}`}
        >
          <Ionicons 
            name={reminderStatus ? "notifications" : "notifications-outline"} 
            size={20} 
            color={getReminderIconColor()} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onOpenEditModal(workout)}
          className="bg-primary-200 rounded-lg p-2"
        >
          <Ionicons name="create-outline" size={20} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface StatsViewProps {
  workouts: Workout[];
}

type ViewMode = 'monthly' | 'yearly';

const StatsView: React.FC<StatsViewProps> = ({ workouts }) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const screenWidth = Dimensions.get('window').width - 40;

  // Configuration des graphiques
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4f46e5'
    }
  };

  // Calcul des statistiques hebdomadaires
  const getWeeklyStats = useCallback((): WeeklyStatsData => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const stats = {
      labels: weekDays,
      workouts: Array(7).fill(0),
      durations: Array(7).fill(0),
      calories: Array(7).fill(0)
    };

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      if (workoutDate >= startOfWeek && workoutDate <= now) {
        const dayIndex = workoutDate.getDay();
        stats.workouts[dayIndex]++;
        stats.durations[dayIndex] += workout.duration;
        stats.calories[dayIndex] += workout.calories_burned;
      }
    });

    return stats;
  }, [workouts]);

  // Calcul des données pour les graphiques
  const getChartData = useCallback((): { progression: ChartData; intensity: ChartData } => {
    let labels: string[] = [];
    let workoutCounts: number[] = [];
    let intensityData: number[] = [];

    if (viewMode === 'weekly') {
      const weeklyStats = getWeeklyStats();
      labels = weeklyStats.labels;
      workoutCounts = weeklyStats.workouts;
      intensityData = weeklyStats.calories.map((cal, idx) => 
        weeklyStats.workouts[idx] ? Math.round(cal / weeklyStats.workouts[idx]) : 0
      );
    } else if (viewMode === 'monthly') {
      // Données pour le mois en cours
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      labels = Array.from({length: daysInMonth}, (_, i) => `${i + 1}`);
      workoutCounts = Array(daysInMonth).fill(0);
      intensityData = Array(daysInMonth).fill(0);

      workouts.forEach(workout => {
        const workoutDate = new Date(workout.date);
        if (workoutDate.getMonth() === selectedMonth && workoutDate.getFullYear() === selectedYear) {
          const day = workoutDate.getDate() - 1;
          workoutCounts[day]++;
          intensityData[day] = workout.calories_burned;
        }
      });
    } else {
      // Données annuelles
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      workoutCounts = Array(12).fill(0);
      intensityData = Array(12).fill(0);

      workouts.forEach(workout => {
        const workoutDate = new Date(workout.date);
        if (workoutDate.getFullYear() === selectedYear) {
          const month = workoutDate.getMonth();
          workoutCounts[month]++;
          intensityData[month] += workout.calories_burned;
        }
      });

      // Calculer la moyenne d'intensité par mois
      intensityData = intensityData.map((cal, idx) => 
        workoutCounts[idx] ? Math.round(cal / workoutCounts[idx]) : 0
      );
    }

    return {
      progression: {
        labels,
        datasets: [{
          data: workoutCounts,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          strokeWidth: 2
        }]
      },
      intensity: {
        labels,
        datasets: [{
          data: intensityData,
          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
          strokeWidth: 2
        }]
      }
    };
  }, [workouts, viewMode, selectedYear, selectedMonth, selectedWeek]);

  // Calculer les statistiques pour le mois sélectionné
  const getMonthStats = useCallback((): MonthlyStatsData => {
    const monthWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.getFullYear() === selectedYear && workoutDate.getMonth() === selectedMonth;
    });

    return {
      totalWorkouts: monthWorkouts.length,
      totalDuration: monthWorkouts.reduce((acc: number, curr: Workout) => acc + curr.duration, 0),
      totalCalories: monthWorkouts.reduce((acc: number, curr: Workout) => acc + curr.calories_burned, 0),
      averageDuration: monthWorkouts.length ? Math.round(monthWorkouts.reduce((acc: number, curr: Workout) => acc + curr.duration, 0) / monthWorkouts.length) : 0,
      averageCalories: monthWorkouts.length ? Math.round(monthWorkouts.reduce((acc: number, curr: Workout) => acc + curr.calories_burned, 0) / monthWorkouts.length) : 0,
      mostFrequentExercise: monthWorkouts.reduce((acc: { [key: string]: number }, curr: Workout) => {
        curr.details?.forEach(detail => {
          const exerciseName = detail.exercise.name;
          acc[exerciseName] = (acc[exerciseName] || 0) + 1;
        });
        return acc;
      }, {})
    };
  }, [workouts, selectedYear, selectedMonth]);

  // Calculer les statistiques pour l'année sélectionnée
  const getYearStats = useCallback((): YearlyStatsData => {
    const yearWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.getFullYear() === selectedYear;
    });

    const monthlyStats = Array(12).fill(0).map((_, month) => {
      const monthWorkouts = yearWorkouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.getMonth() === month;
      });

      return {
        workouts: monthWorkouts.length,
        duration: monthWorkouts.reduce((acc: number, curr: Workout) => acc + curr.duration, 0),
        calories: monthWorkouts.reduce((acc: number, curr: Workout) => acc + curr.calories_burned, 0)
      };
    });

    return {
      totalWorkouts: yearWorkouts.length,
      totalDuration: yearWorkouts.reduce((acc: number, curr: Workout) => acc + curr.duration, 0),
      totalCalories: yearWorkouts.reduce((acc: number, curr: Workout) => acc + curr.calories_burned, 0),
      monthlyStats
    };
  }, [workouts, selectedYear]);

  const monthStats = getMonthStats();
  const yearStats = getYearStats();

  // Après les statistiques principales et avant le graphique existant
  const chartData = getChartData();

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 border border-primary-200 shadow-card">
      {/* Header avec titre et sélecteur de vue */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-statistics-light rounded-xl p-3 mr-3">
              <Ionicons name="analytics" size={24} color="#d97706" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-primary-800 mb-1">Dashboard</Text>
              <Text className="text-sm text-primary-500">Vue d&apos;ensemble de vos performances</Text>
            </View>
          </View>
        </View>

        {/* Sélecteur de vue amélioré */}
        <View className="bg-primary-50 rounded-xl p-1.5 mb-6">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setViewMode('weekly')}
              className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                viewMode === 'weekly' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Ionicons 
                name="calendar-outline" 
                size={18} 
                color={viewMode === 'weekly' ? '#1e40af' : '#6b7280'} 
              />
              <Text className={`ml-2 font-medium ${
                viewMode === 'weekly' ? 'text-primary-800' : 'text-primary-600'
              }`}>
                Semaine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('monthly')}
              className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                viewMode === 'monthly' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Ionicons 
                name="calendar-outline" 
                size={18} 
                color={viewMode === 'monthly' ? '#1e40af' : '#6b7280'} 
              />
              <Text className={`ml-2 font-medium ${
                viewMode === 'monthly' ? 'text-primary-800' : 'text-primary-600'
              }`}>
                Mois
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('yearly')}
              className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                viewMode === 'yearly' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Ionicons 
                name="stats-chart-outline" 
                size={18} 
                color={viewMode === 'yearly' ? '#1e40af' : '#6b7280'} 
              />
              <Text className={`ml-2 font-medium ${
                viewMode === 'yearly' ? 'text-primary-800' : 'text-primary-600'
              }`}>
                Année
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Navigation temporelle améliorée */}
      <View className="bg-primary-50 rounded-xl p-4 mb-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              if (viewMode === 'monthly') {
                const newDate = new Date(selectedYear, selectedMonth - 1);
                setSelectedYear(newDate.getFullYear());
                setSelectedMonth(newDate.getMonth());
              } else {
                setSelectedYear(prev => prev - 1);
              }
            }}
            className="bg-white rounded-lg p-3 shadow-sm"
          >
            <Ionicons name="chevron-back" size={20} color="#1e40af" />
          </TouchableOpacity>
          <View className="bg-white px-6 py-3 rounded-xl shadow-sm">
            <Text className="text-primary-800 font-semibold text-lg text-center">
              {viewMode === 'monthly' 
                ? new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                : selectedYear
              }
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (viewMode === 'monthly') {
                const newDate = new Date(selectedYear, selectedMonth + 1);
                setSelectedYear(newDate.getFullYear());
                setSelectedMonth(newDate.getMonth());
              } else {
                setSelectedYear(prev => prev + 1);
              }
            }}
            className="bg-white rounded-lg p-3 shadow-sm"
          >
            <Ionicons name="chevron-forward" size={20} color="#1e40af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques principales avec design amélioré */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="bg-primary-50 rounded-xl p-4 w-[48%] mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-activity-light rounded-xl p-2 mr-2">
              <Ionicons name="fitness" size={18} color="#1e40af" />
            </View>
            <Text className="text-sm text-primary-600 font-medium">Séances</Text>
          </View>
          <Text className="text-2xl font-bold text-primary-800 mb-1">
            {viewMode === 'monthly' ? monthStats.totalWorkouts : yearStats.totalWorkouts}
          </Text>
          {viewMode === 'yearly' && (
            <Text className="text-xs text-primary-500">
              {Math.round(yearStats.totalWorkouts / 12 * 10) / 10} séances/mois en moyenne
            </Text>
          )}
        </View>

        <View className="bg-primary-50 rounded-xl p-4 w-[48%] mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-nutrition-light rounded-xl p-2 mr-2">
              <Ionicons name="time" size={18} color="#047857" />
            </View>
            <Text className="text-sm text-primary-600 font-medium">Durée</Text>
          </View>
          <Text className="text-2xl font-bold text-primary-800 mb-1">
            {viewMode === 'monthly' ? monthStats.totalDuration : yearStats.totalDuration} min
          </Text>
          {viewMode === 'monthly' && (
            <Text className="text-xs text-primary-500">
              ~{monthStats.averageDuration} min/séance en moyenne
            </Text>
          )}
        </View>

        <View className="bg-primary-50 rounded-xl p-4 w-[48%] shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-statistics-light rounded-xl p-2 mr-2">
              <Ionicons name="flame" size={18} color="#d97706" />
            </View>
            <Text className="text-sm text-primary-600 font-medium">Calories</Text>
          </View>
          <Text className="text-2xl font-bold text-primary-800 mb-1">
            {viewMode === 'monthly' ? monthStats.totalCalories : yearStats.totalCalories}
          </Text>
          {viewMode === 'monthly' && (
            <Text className="text-xs text-primary-500">
              ~{monthStats.averageCalories} kcal/séance en moyenne
            </Text>
          )}
        </View>

        <View className="bg-primary-50 rounded-xl p-4 w-[48%] shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-primary-200 rounded-xl p-2 mr-2">
              <Ionicons name="trophy" size={18} color="#4f46e5" />
            </View>
            <Text className="text-sm text-primary-600 font-medium">
              {viewMode === 'monthly' ? 'Top exercice' : 'Performance'}
            </Text>
          </View>
          {viewMode === 'monthly' ? (
            <>
              <Text className="text-lg font-bold text-primary-800 mb-1 leading-tight">
                {Object.entries(monthStats.mostFrequentExercise).sort((a, b) => b[1] - a[1])[0]?.[0] || "Aucun"}
              </Text>
              <Text className="text-xs text-primary-500">Exercice le plus pratiqué</Text>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-primary-800 mb-1">
                {Math.round((yearStats.totalWorkouts / (selectedYear === new Date().getFullYear() ? new Date().getMonth() + 1 : 12)) * 10) / 10}
              </Text>
              <Text className="text-xs text-primary-500">Séances par mois</Text>
            </>
          )}
        </View>
      </View>

      {/* Graphique amélioré (uniquement en vue annuelle) */}
      {viewMode === 'yearly' && (
        <View className="bg-primary-50 rounded-xl p-4 mt-2">
          <Text className="text-sm font-medium text-primary-600 mb-4">Distribution mensuelle</Text>
          <View className="h-40">
            <View className="flex-row justify-between h-full">
              {yearStats.monthlyStats.map((stat, index) => (
                <View key={index} className="flex-1 justify-end mx-0.5">
                  <View 
                    style={{ 
                      height: `${(stat.workouts / Math.max(...yearStats.monthlyStats.map(s => s.workouts))) * 100}%`,
                      minHeight: stat.workouts > 0 ? 4 : 0
                    }}
                    className="bg-statistics rounded-t-lg"
                  />
                </View>
              ))}
            </View>
            <View className="flex-row justify-between mt-2">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, index) => (
                <Text key={index} className="text-xs text-primary-400 flex-1 text-center">{month}</Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Nouveaux graphiques */}
      <View className="mt-6">
        <View className="bg-primary-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-primary-800 mb-4">
            Progression des entraînements
          </Text>
          <LineChart
            data={chartData.progression}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        <View className="bg-primary-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-primary-800 mb-4">
            Intensité moyenne
          </Text>
          <BarChart
            data={chartData.intensity}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=" cal"
          />
        </View>
      </View>
    </View>
  );
};

export default function Statistics() {
  const [selected, setSelected] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsByDate, setWorkoutsByDate] = useState<{ [date: string]: Workout[] }>({});
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedWorkoutForReminder, setSelectedWorkoutForReminder] = useState<Workout | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // Récupérer les workouts au chargement de la page
  useEffect(() => {
    loadUserWorkouts();
  }, []);

  const loadUserWorkouts = async () => {
    console.log('[STATS] Début loadUserWorkouts');
    
    if (!isAuthenticated()) {
      console.log('[AUTH] Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    console.log('[AUTH] Utilisateur authentifié');

    try {
      // Récupérer le token depuis le service d'auth
      const authService = await import('../../src/services/auth');
      const token = authService.default.getAuthToken();
      
      console.log('[TOKEN] Token récupéré:', !!token);
      if (token) {
        console.log('[TOKEN] Token preview:', token.substring(0, 20) + '...');
      }
      
      if (!token) {
        console.log('[ERROR] Token manquant');
        Alert.alert('Erreur', 'Token d&apos;authentification non trouvé');
        return;
      }

      console.log('[API] Appel fetchUserWorkouts...');
      const userWorkouts = await fetchUserWorkouts(token);
      console.log('[SUCCESS] Workouts récupérés:', userWorkouts.length);
      
      setWorkouts(userWorkouts);
      
      // Grouper les workouts par date
      const grouped = groupWorkoutsByDate(userWorkouts);
      console.log('[GROUP] Workouts groupés par date:', Object.keys(grouped).length, 'dates');
      setWorkoutsByDate(grouped);
      
      // Mettre à jour l'affichage du jour sélectionné si une date est sélectionnée
      if (selected) {
        const dayWorkouts = grouped[selected] || [];
        setSelectedDateWorkouts(dayWorkouts);
        console.log('[SELECTED] Workouts pour la date sélectionnée:', dayWorkouts.length);
      }
    } catch (error: any) {
      console.error('[ERROR] Erreur chargement workouts:', error);
      Alert.alert('Erreur', `Impossible de charger vos séances d'entraînement: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('[END] Fin loadUserWorkouts');
    }
  };

  // Créer les dates marquées à partir des workouts
  const createMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};
    
    // Marquer les dates qui ont des workouts
    Object.keys(workoutsByDate).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#f59e0b', // Orange pour les workouts
        activeOpacity: 0.5
      };
    });

    // Ajouter la sélection actuelle
    if (selected) {
      marked[selected] = {
        ...marked[selected],
        selected: true,
        disableTouchEvent: true,
        selectedDotColor: '#ffffff'
      };
    }

    return marked;
  };

  const handleDayPress = (day: DateData) => {
    setSelected(day.dateString);
    const dayWorkouts = workoutsByDate[day.dateString] || [];
    setSelectedDateWorkouts(dayWorkouts);
  };

  // Fonctions pour gérer le modal
  const openCreateModal = () => {
    if (!selected) {
      Alert.alert('Erreur', 'Veuillez d&apos;abord sélectionner une date sur le calendrier');
      return;
    }
    setSelectedWorkout(null);
    setModalVisible(true);
  };

  const openEditModal = (workout: Workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWorkout(null);
  };

  // Fonction pour sauvegarder une séance (création ou modification)
  const handleSaveWorkout = async (workoutData: CreateWorkoutData, workoutId?: number) => {
    if (!isAuthenticated()) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    try {
      const authService = await import('../../src/services/auth');
      const token = authService.default.getAuthToken();
      
      if (!token) {
        Alert.alert('Erreur', 'Token d&apos;authentification non trouvé');
        return;
      }

      if (workoutId) {
        // Modification
        await updateWorkout(token, workoutId, workoutData);
        Alert.alert('Succès', 'Séance d&apos;entraînement modifiée avec succès !');
      } else {
        // Création
        await createWorkout(token, workoutData);
        Alert.alert('Succès', 'Séance d&apos;entraînement créée avec succès !');
      }

      // Recharger les données (met à jour automatiquement l'affichage du jour sélectionné)
      await loadUserWorkouts();
    } catch (error: any) {
      console.error('Erreur sauvegarde workout:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder la séance');
      throw error; // Re-throw pour que le modal puisse gérer l'erreur
    }
  };

  // Fonction pour supprimer une séance
  const handleDeleteWorkout = async (workoutId: number) => {
    if (!isAuthenticated()) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    try {
      const authService = await import('../../src/services/auth');
      const token = authService.default.getAuthToken();
      
      if (!token) {
        Alert.alert('Erreur', 'Token d&apos;authentification non trouvé');
        return;
      }

      await deleteWorkout(token, workoutId);
      Alert.alert('Succès', 'Séance d&apos;entraînement supprimée avec succès !');

      // Recharger les données
      await loadUserWorkouts();
    } catch (error: any) {
      console.error('Erreur suppression workout:', error);
      Alert.alert('Erreur', error.message || 'Impossible de supprimer la séance');
      throw error; // Re-throw pour que le modal puisse gérer l'erreur
    }
  };

  const handleOpenReminderModal = (workout: Workout) => {
    setSelectedWorkoutForReminder(workout);
    setReminderModalVisible(true);
  };

  const handleReminderUpdate = () => {
    setRefreshKey(prev => prev + 1); // Force un rafraîchissement des WorkoutItems
  };

  const markedDates = createMarkedDates();

  const renderWorkoutItem = (workout: Workout, index: number) => (
    <WorkoutItem
      key={`${workout.workout_id}-${refreshKey}`} // Ajout de refreshKey pour forcer le rafraîchissement
      workout={workout}
      onOpenReminderModal={handleOpenReminderModal}
      onOpenEditModal={openEditModal}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView 
        className="flex-grow pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Décoration en haut */}
        <TopDecoration />

        {/* Header moderne avec accent orange */}
        <View className="px-6 pt-8 pb-7 bg-primary-800 rounded-b-3xl mx-0 mb-6 border-t-4 border-statistics shadow-header">
          <View className="flex-row items-center justify-between mb-6">
            <View className="bg-primary-700 border-2 border-statistics rounded-2xl p-4 shadow-card">
              <Ionicons name="analytics" size={28} color="#f59e0b" />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-4xl font-bold text-white mb-1.5 tracking-ultra">Dashboard</Text>
              <Text className="text-base text-primary-300 mb-6 opacity-90">Votre planning et statistiques</Text>
              <View className="bg-statistics rounded-2xl px-3 py-1.5 self-start shadow-sm">
                <Text className="text-white text-xs font-semibold uppercase tracking-wider">Analytics</Text>
              </View>
            </View>
            <View className="bg-primary-600 rounded-xl p-4 border border-primary-500 shadow-card min-w-20 items-center">
              <Text className="text-xl font-bold text-white">{workouts.length}</Text>
              <Text className="text-xs text-primary-200 mt-0.5 font-medium">Workouts</Text>
            </View>
          </View>
        </View>
        
        <View className='px-5'>
          {loading ? (
            <View className='flex-1 justify-center items-center py-20'>
              <View className="bg-white rounded-2xl p-8 items-center shadow-card border border-primary-200">
                <View className="bg-statistics-light rounded-full p-4 mb-4">
                  <ActivityIndicator size="large" color="#f59e0b" />
                </View>
                <Text className="text-xl font-bold text-primary-800 mb-2 text-center">
                  Chargement en cours...
                </Text>
                <Text className="text-primary-600 text-center">
                  Récupération de vos workouts
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Stats rapides */}
              <View className='flex-row justify-between mb-6'>
                <View className="bg-white rounded-xl p-5 flex-1 mr-2 border border-primary-200 shadow-card items-center">
                  <View className="bg-activity-light rounded-full p-3 mb-3">
                    <Ionicons name="fitness" size={24} color="#1e40af" />
                  </View>
                  <Text className="text-2xl font-bold text-primary-800">{workouts.length}</Text>
                  <Text className="text-xs text-primary-600 font-medium">Séances totales</Text>
                </View>
                <View className="bg-white rounded-xl p-5 flex-1 ml-2 border border-primary-200 shadow-card items-center">
                  <View className="bg-nutrition-light rounded-full p-3 mb-3">
                    <Ionicons name="flame" size={24} color="#047857" />
                  </View>
                  <Text className="text-2xl font-bold text-primary-800">
                    {workouts.reduce((total, workout) => total + workout.calories_burned, 0)}
                  </Text>
                  <Text className="text-xs text-primary-600 font-medium">Calories brûlées</Text>
                </View>
              </View>

              {/* Vue combinée des statistiques */}
              <StatsView workouts={workouts} />

              {/* Calendrier moderne */}
              <View className="bg-white rounded-xl p-5 mb-6 border border-primary-200 shadow-card">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="bg-statistics-light rounded-lg p-3 mr-3">
                      <Ionicons name="calendar" size={20} color="#d97706" />
                    </View>
                    <Text className="text-xl font-bold text-primary-800">Calendrier des séances</Text>
                  </View>
                  {!selected && (
                    <TouchableOpacity
                      onPress={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setSelected(today);
                        const dayWorkouts = workoutsByDate[today] || [];
                        setSelectedDateWorkouts(dayWorkouts);
                      }}
                      className="bg-primary-200 rounded-lg px-3 py-2"
                    >
                      <Text className="text-primary-800 text-sm">Aujourd&apos;hui</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#6b7280',
                    selectedDayBackgroundColor: '#f59e0b',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#f59e0b',
                    dayTextColor: '#1f2937',
                    textDisabledColor: '#d1d5db',
                    dotColor: '#f59e0b',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#f59e0b',
                    monthTextColor: '#1f2937',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14
                  }}
                />
              </View>

              {/* Container dynamique pour les workouts du jour sélectionné */}
              {selected && (
                <View className="bg-white rounded-xl p-5 mb-6 border border-primary-200 shadow-card">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="bg-statistics-light rounded-lg p-2 mr-3">
                        <Ionicons name="calendar-outline" size={20} color="#d97706" />
                      </View>
                      <Text className="text-xl font-bold text-primary-800">
                        {new Date(selected).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TouchableOpacity 
                        onPress={openCreateModal}
                        className="bg-primary-200 rounded-lg px-3 py-2 mr-2"
                      >
                        <Text className="text-primary-800 text-sm">Ajouter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="bg-primary-100 rounded-lg p-2"
                        onPress={() => setSelected('')}
                      >
                        <Ionicons name="close" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {selectedDateWorkouts.length > 0 ? (
                    <View>
                      <Text className="text-sm text-primary-600 mb-3">
                        {selectedDateWorkouts.length} séance(s) programmée(s)
                      </Text>
                      {selectedDateWorkouts.map((workout, index) => renderWorkoutItem(workout, index))}
                    </View>
                  ) : (
                    <View className="items-center py-8">
                      <View className="bg-primary-100 rounded-full p-4 mb-4">
                        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                      </View>
                      <Text className="text-lg font-bold text-primary-800 mb-2 text-center">
                        Aucune séance programmée
                      </Text>
                      <Text className="text-sm text-primary-600 text-center mb-4">
                        Aucune séance programmée ce jour
                      </Text>
                      <TouchableOpacity
                        onPress={openCreateModal}
                        className="bg-primary-200 rounded-lg px-4 py-2"
                      >
                        <Text className="text-primary-800 text-sm">Planifier une séance</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Section séances récentes */}
              {workouts.length > 0 && (
                <View className="bg-white rounded-xl p-5 mb-6 border border-primary-200 shadow-card">
                  <View className="flex-row items-center mb-4">
                    <View className="bg-activity-light rounded-lg p-3 mr-3">
                      <Ionicons name="time" size={20} color="#1e40af" />
                    </View>
                    <Text className="text-xl font-bold text-primary-800">Séances récentes</Text>
                  </View>
                  {workouts.slice(0, 3).map((workout, index) => (
                    <View key={workout.workout_id} className={`bg-primary-50 rounded-lg p-4 border border-primary-200 ${index < 2 ? 'mb-3' : ''}`}>
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="text-base font-bold text-primary-800">
                            {workout.name ? workout.name : `Séance #${workout.workout_id}`}
                          </Text>
                          <Text className="text-sm text-primary-600">
                            {new Date(workout.date).toLocaleDateString('fr-FR')} • {workout.duration}min
                          </Text>
                        </View>
                        <View className="bg-statistics-light rounded-lg px-3 py-1">
                          <Text className="text-statistics-dark text-xs font-medium">{workout.calories_burned} kcal</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Message si aucun workout */}
              {workouts.length === 0 && (
                <View className="bg-white rounded-xl p-8 items-center shadow-card border border-primary-200">
                  <View className="bg-primary-100 rounded-full p-6 mb-4">
                    <Ionicons name="fitness-outline" size={64} color="#d1d5db" />
                  </View>
                  <Text className="text-xl font-bold text-primary-800 mb-2 text-center">
                    Aucune séance enregistrée
                  </Text>
                  <Text className="text-sm text-primary-600 text-center">
                    Commencez à vous entraîner pour voir vos statistiques ici
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal pour créer/modifier des séances */}
      <WorkoutModal
        visible={modalVisible}
        onClose={closeModal}
        selectedDate={selected}
        workout={selectedWorkout}
        onSave={handleSaveWorkout}
        onDelete={handleDeleteWorkout}
      />

      {/* Modal de rappel */}
      {selectedWorkoutForReminder && (
        <ReminderModal
          visible={reminderModalVisible}
          onClose={() => {
            setReminderModalVisible(false);
            setSelectedWorkoutForReminder(null);
          }}
          workoutId={selectedWorkoutForReminder.workout_id}
          workoutName={selectedWorkoutForReminder.name || `Séance #${selectedWorkoutForReminder.workout_id}`}
          onUpdate={handleReminderUpdate}
        />
      )}
    </SafeAreaView>
  );
}