import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import { bodyPartsForce, bodyPartsCardio } from '../../constants/bodyParts';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { router } from 'expo-router';


const BodyParts = ({selectedCategory}: {selectedCategory: string}) => {
    console.log("selectedCategory", selectedCategory);
    const bodyParts = selectedCategory === 'Force' ? bodyPartsForce : 
                     selectedCategory === 'Cardio' ? bodyPartsCardio : 
                     [];

    const handleBodyPartPress = (items: any) => {
        console.log(`Partie du corps sélectionnée : ${items.name}`);
        // Ici vous pouvez ajouter la navigation vers la page des exercices
        router.push({pathname: `/Execices`, params: {name: items.name}});
    };

    return (
        <View>
            <Text style={{ fontSize: hp(3) }} className='font-semibold text-neutral-700 mb-4'>Exercices</Text>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 50, paddingTop: 10}}
            >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 5 }}>
                    {bodyParts.map((item: any, index: number) => (
                        <BodyPartCards 
                            key={item.name}
                            index={index} 
                            item={item} 
                            onPress={() => handleBodyPartPress(item)}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );  
};

const BodyPartCards = ({item, index, onPress}: {item: any, index: number, onPress: () => void}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: wp(44),
                height: hp(20),
                marginBottom: 15,
            }}
            className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
            activeOpacity={0.8}
        >
            <View className='flex-1 relative'>
                <Image 
                    source={item.image} 
                    resizeMode='cover' 
                    style={{ 
                        width: '100%', 
                        height: '75%',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }} 
                />
                <View className='absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3'>
                    <Text className='text-center text-sm font-semibold text-gray-800 capitalize'>
                        {item.name.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default BodyParts;