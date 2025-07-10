import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { logOut } from '../src/services/auth';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenue sur Home !</Text>
      <Button title="Se déconnecter" onPress={handleLogout} />
    </View>
  );
}
