import React, { useEffect } from 'react';     
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchExercicesByBodyPart } from '../src/services/exerciceDB';

const Exercices = () => {
    const router = useRouter();
    const item  = useLocalSearchParams();
    console.log('item:', item);
    console.log('item.name:', item.name);

    useEffect(() => {
        if (item && item.name) {
            const bodyPart = Array.isArray(item.name) ? item.name[0] : item.name;
            getExercices(bodyPart)
            .then((data) => {
                console.log(data);
            });
        }
    }, [item]);

    const getExercices = async (bodyPart: string) => {
        let data = await fetchExercicesByBodyPart(bodyPart);
        console.log(data);
        return data;
    }
    return (
        <View className='mt-20 p-4'>
            <Text className='text-2xl font-bold mb-4'>Exercices</Text>
            {item.name && (
                <Text className='text-lg text-blue-600 mb-4 capitalize'>
                    Partie du corps : {item.name}
                </Text>
            )}
            <TouchableOpacity 
                onPress={() => router.back()}
                className='bg-blue-500 rounded-lg px-4 py-2 self-start'
            >
                <Text className='text-white font-medium'>Retour</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Exercices;