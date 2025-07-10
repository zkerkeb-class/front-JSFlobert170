import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBarOverlay } from '../../components';
import { TopDecoration } from '../../components/ui/TopDecoration';

const Nutrition = () => {
  const router = useRouter();

  const nutritionFeatures = [
    { id: 1, name: 'Suivi des calories', iconName: 'flame', description: 'Calculez vos besoins énergétiques' },
    { id: 2, name: 'Plans de repas', iconName: 'restaurant', description: 'Menus équilibrés personnalisés' },
    { id: 3, name: 'Scan de produits', iconName: 'barcode', description: 'Analysez vos aliments' },
    { id: 4, name: 'Hydratation', iconName: 'water', description: 'Suivez votre consommation d&apos;eau' },
    { id: 5, name: 'Macronutriments', iconName: 'pie-chart', description: 'Équilibrez protéines, glucides, lipides' },
    { id: 6, name: 'Recettes healthy', iconName: 'book', description: 'Découvrez des recettes saines' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView 
        className="flex-grow pb-24"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Décoration en haut */}
        <TopDecoration />
        
        {/* Header moderne avec accent vert */}
        <View className="px-6 pt-8 pb-7 bg-primary-800 rounded-b-3xl mx-0 mb-6 border-t-4 border-nutrition shadow-header">
          <View className="flex-row items-center justify-between mb-6">
            <View className="bg-primary-700 border-2 border-nutrition rounded-2xl p-4 shadow-card">
              <Ionicons name="restaurant" size={28} color="#10b981" />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-4xl font-bold text-white mb-1.5 tracking-ultra">Nutrition</Text>
              <Text className="text-base text-primary-300 mb-6 opacity-90">Suivez votre alimentation</Text>
              <View className="bg-nutrition rounded-2xl px-3 py-1.5 self-start shadow-sm">
                <Text className="text-white text-xs font-semibold uppercase tracking-wider">Healthy</Text>
              </View>
            </View>
            <View className="bg-primary-600 rounded-xl p-4 border border-primary-500 shadow-card min-w-20 items-center">
              <Text className="text-xl font-bold text-white">1.8k</Text>
              <Text className="text-xs text-primary-200 mt-0.5 font-medium">kcal</Text>
            </View>
          </View>
          
          {/* Boutons de navigation */}
          <View className="bg-primary-700 rounded-2xl p-1.5 flex-row border border-primary-600 shadow-md">
            
            <TouchableOpacity 
              className="flex-1 py-3.5 items-center rounded-xl"
              onPress={() => router.push('/activity')}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="fitness" size={16} color="#d1d5db" style={{ marginRight: 6 }} />
                <Text className="text-primary-300 font-medium text-sm">Activities</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 py-3.5 items-center rounded-xl bg-white shadow-sm">
              <View className="flex-row items-center justify-center">
                <Ionicons name="restaurant" size={16} color="#1f2937" style={{ marginRight: 6 }} />
                <Text className="text-primary-800 font-semibold text-sm">Meals</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Titre principal */}
        <View className="flex-row justify-between items-center mx-5 mb-6">
          <View>
            <Text 
              style={{ fontSize: hp(4.5) }}
              className="font-bold tracking-wider text-primary-400"
            >FUEL YOUR</Text>
            <Text 
              style={{ fontSize: hp(4.5) }}
              className="font-bold tracking-wider text-nutrition"
            >BODY</Text>
          </View>
        </View>

        {/* Résumé nutritionnel */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-xl p-5 border border-primary-200 shadow-card">
            <Text className="text-lg font-semibold text-primary-800 mb-4">Aujourd&apos;hui</Text>
            <View className="flex-row justify-between items-center mb-4">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-nutrition">1.2k</Text>
                <Text className="text-sm text-primary-500">Consommées</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary-600">600</Text>
                <Text className="text-sm text-primary-500">Restantes</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-warning">1.8k</Text>
                <Text className="text-sm text-primary-500">Objectif</Text>
              </View>
            </View>
            <View className="bg-primary-200 rounded-full h-2">
              <View className="bg-nutrition rounded-full h-2" style={{ width: '67%' }} />
            </View>
            <Text className="text-xs text-primary-500 mt-2 text-center">67% de votre objectif quotidien</Text>
          </View>
        </View>

        {/* Macronutriments */}
        <View className="px-5 mb-6">
          <Text className="text-xl font-semibold text-primary-800 mb-4">Macronutriments</Text>
          <View className="bg-primary-100 rounded-xl p-5 border border-primary-200">
            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <View className="bg-nutrition rounded-full p-3 mb-2">
                  <Ionicons name="fitness" size={16} color="white" />
                </View>
                <Text className="text-lg font-bold text-primary-700">45g</Text>
                <Text className="text-xs text-primary-500">Protéines</Text>
              </View>
              <View className="items-center flex-1">
                <View className="bg-warning rounded-full p-3 mb-2">
                  <Ionicons name="leaf" size={16} color="white" />
                </View>
                <Text className="text-lg font-bold text-primary-700">180g</Text>
                <Text className="text-xs text-primary-500">Glucides</Text>
              </View>
              <View className="items-center flex-1">
                <View className="bg-error rounded-full p-3 mb-2">
                  <Ionicons name="water" size={16} color="white" />
                </View>
                <Text className="text-lg font-bold text-primary-700">60g</Text>
                <Text className="text-xs text-primary-500">Lipides</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fonctionnalités nutrition */}
        <View className="px-5">
          <Text className="text-xl font-semibold text-primary-800 mb-4">Fonctionnalités</Text>
          {nutritionFeatures.map((feature, index) => (
            <View 
              key={feature.id} 
              className={`rounded-xl p-5 mb-4 border border-primary-200 ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary-100'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-nutrition-light rounded-xl p-4 mr-4">
                    <Ionicons name={feature.iconName as any} size={24} color="#047857" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-primary-800 mb-2">{feature.name}</Text>
                    <Text className="text-sm text-primary-500">{feature.description}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-nutrition rounded-lg px-2 py-1 ml-3">
                  <Text className="text-white text-xs font-medium">Utiliser</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Repas récents */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-semibold text-primary-800 mb-4">Repas récents</Text>
          <View className="bg-white rounded-xl p-5 border border-primary-200 shadow-card">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="bg-nutrition-light rounded-lg p-3 mr-3">
                  <Ionicons name="restaurant" size={20} color="#047857" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-primary-800">Salade César</Text>
                  <Text className="text-sm text-primary-500">Déjeuner • 350 kcal</Text>
                </View>
              </View>
              <Text className="text-sm text-primary-600 font-medium">12:30</Text>
            </View>
            
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="bg-warning-light rounded-lg p-3 mr-3">
                  <Ionicons name="cafe" size={20} color="#d97706" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-primary-800">Smoothie protéiné</Text>
                  <Text className="text-sm text-primary-500">Collation • 180 kcal</Text>
                </View>
              </View>
              <Text className="text-sm text-primary-600 font-medium">16:00</Text>
            </View>
            
            <TouchableOpacity className="bg-primary-100 rounded-lg p-3 mt-2">
              <Text className="text-primary-700 text-sm font-medium text-center">Voir tous les repas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Nutrition; 