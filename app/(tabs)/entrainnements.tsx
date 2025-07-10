import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageSlider } from '../../components';

const Entrainnements = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white flex space-x-5" edges={['top']}>
      <View className="flex flex-row items-center justify-between mx-5 my-4">
          <Image 
            source={require("../../assets/images/avatar.png")} 
            className="rounded-full"
            style={{ width: hp(5.5), height: hp(5.5) }}
          />
          <View className="flex flex-col">
            <Text className="text-neutral-900 font-bold">Welcome</Text>
            <Text className="text-neutral-900 font-bold">John Doe</Text>
          </View>
          
          <View 
            className="bg-neutral-200 rounded-full flex justify-center items-center border-[3px] border-neutral-300"
            style={{ width: hp(5.5), height: hp(5.5) }}
          >
            <Ionicons name="notifications" size={hp(3)} color="grey" />
          </View>
        </View>

      {/* Boutons de navigation */}
      <View className="mx-5 mb-4 bg-gray-100 rounded-full p-1 flex-row">
        <TouchableOpacity 
          className="flex-1 py-3 rounded-full items-center"
          style={{ backgroundColor: '#f3f4f6' }}
          onPress={() => router.push('/nutrition')}
        >
          <Text className="text-gray-600 font-semibold">Meals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 py-3 rounded-full items-center"
          style={{ backgroundColor: '#fff' }}
          onPress={() => router.push('/activity')}
        >
          <Text className="text-black font-semibold">Activities</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mx-5">
        <View className="space-x-2">
          <Text 
              style={{ fontSize: hp(4.5), fontWeight: 'bold' }}
              className="font-bold tracking-wider text-neutral-400"
          >READY TO</Text>
          <Text 
              style={{ fontSize: hp(4.5), fontWeight: 'bold' }}
              className="font-bold tracking-wider text-violet-400"
          >WORKOUT</Text>
        </View>
        </View>
      <ImageSlider />
    </SafeAreaView>

  )
}

export default Entrainnements