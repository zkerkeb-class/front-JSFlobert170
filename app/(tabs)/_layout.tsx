// import { ImageBackground } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';

import { icons } from '@/constants/icons';

const TabIcons = ({focused, icon, title}: any) => {
  if (focused) {
    return (
      <View className='flex flex-row gap-x-1 px-4 py-2 w-full h-full flex-1 min-w-[131] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden' style={{ backgroundColor: '#ffffff' }}>
          <Image source={icon} tintColor="#374151" className='size-5' />
          <Text className="text-gray-700 text-base font-semibold text-center">{title}</Text>
      </View>
    );
  }
  return (
    <View className='size-full justify-center items-center mt-4 rounded-full'>
        <Image source={icon} tintColor="#d1d5db" className='size-5' />
    </View>
  );
};

export default function _layout() {
  
  return (
    
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          flexDirection: "row",
          backgroundColor: "#374151", // Gris moderne cohérent avec l'app
          borderRadius: 50,
          marginBottom: 36,
          marginHorizontal: 20,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#4b5563", // Bordure gris plus claire
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
            title: "Program",
            headerShown: false,
            tabBarIcon: ({ focused}) => {
                return <>
                    <TabIcons 
                      focused={focused} 
                      icon={icons.play} 
                      title="Program"
                    />
                </>
            }
        }}
      />
      <Tabs.Screen 
        name="statistics" 
        options={{ 
            title: "Statistics",
            headerShown: false,
            tabBarIcon: ({ focused}) => {
                return <>
                    <TabIcons 
                      focused={focused} 
                      icon={icons.star} 
                      title="Statistics" 
                    />
                </>
            }
        }}
      />
      <Tabs.Screen 
        name="profile"
        options={{ 
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused}) => {
                return <>
                    <TabIcons 
                      focused={focused} 
                      icon={icons.person} 
                      title="Profile" 
                    />
                </>
            }
        }}
      />
      
      {/* Pages cachées des onglets mais accessibles par navigation */}
      <Tabs.Screen 
        name="nutrition"
        options={{ 
            href: null, // Cache cet onglet de la barre de navigation
            headerShown: false,
        }}
      />
      <Tabs.Screen 
        name="activity"
        options={{ 
            href: null, // Cache cet onglet de la barre de navigation
            headerShown: false,
        }}
      />
      <Tabs.Screen 
        name="entrainnements"
        options={{ 
            href: null, // Cache cet onglet de la barre de navigation
            headerShown: false,
        }}
      />
    </Tabs>
  )
}
