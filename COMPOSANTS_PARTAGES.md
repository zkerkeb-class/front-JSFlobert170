# 🎨 Composants Partagés SparkFit

Ce document explique comment utiliser les composants et styles partagés dans l'application SparkFit.

## 🏗️ TopDecoration

### Description
Composant de décoration qui affiche une barre horizontale en haut des pages pour une cohérence visuelle.

### Utilisation

```tsx
import { TopDecoration } from '../../components/ui';

export default function MaPage() {
  return (
    <SafeAreaView>
      <ScrollView>
        {/* Décoration en haut */}
        <TopDecoration />
        
        {/* Contenu de votre page */}
        <View>
          <Text>Contenu de la page</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Avantages
- ✅ Cohérence visuelle entre toutes les pages
- ✅ Code centralisé et réutilisable
- ✅ Facile à modifier pour toute l'application
- ✅ Import simple et direct

## 🎨 Styles Partagés (sharedStyles)

### Description
Fichier de styles centralisé contenant tous les styles communs utilisés dans l'application.

### Utilisation

```tsx
import { sharedStyles } from '../../styles/shared.styles';

export default function MaPage() {
  return (
    <SafeAreaView style={sharedStyles.container}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <TopDecoration />
        
        {/* Header avec styles partagés */}
        <View style={sharedStyles.header}>
          <View style={sharedStyles.titleContainer}>
            <View style={[sharedStyles.iconContainer, { backgroundColor: '#votre-couleur' }]}>
              <Text style={sharedStyles.titleIcon}>🎯</Text>
            </View>
            <View style={sharedStyles.titleTextContainer}>
              <Text style={sharedStyles.title}>Titre de la page</Text>
              <Text style={sharedStyles.subtitle}>Sous-titre</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Styles disponibles

#### Conteneurs de base
- `container` : Conteneur principal de la page
- `scrollContent` : Contenu du ScrollView
- `header` : En-tête de page stylisé

#### Décoration
- `topDecorationContainer` : Conteneur de la décoration
- `topDecorationBar` : Barre de décoration elle-même

#### Titres et textes
- `title` : Titre principal
- `subtitle` : Sous-titre
- `titleContainer` : Conteneur du titre
- `titleTextContainer` : Conteneur du texte du titre

#### Navigation
- `navigationContainer` : Conteneur des boutons de navigation
- `navButton` : Bouton de navigation
- `navButtonActive` : Bouton de navigation actif
- `navButtonText` : Texte du bouton
- `navButtonTextActive` : Texte du bouton actif

## 📋 Template pour nouvelles pages

```tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBarOverlay } from '../../components';
import { TopDecoration } from '../../components/ui';
import { sharedStyles } from '../../styles/shared.styles';

const MaNouvellePage = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={sharedStyles.container}>
      {Platform.OS === 'android' && <StatusBarOverlay />}
      
      <ScrollView 
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Décoration en haut */}
        <TopDecoration />
        
        {/* Header amélioré */}
        <View style={sharedStyles.header}>
          <View style={sharedStyles.titleContainer}>
            <View style={[sharedStyles.iconContainer, styles.iconContainerCustom]}>
              <Text style={sharedStyles.titleIcon}>🎯</Text>
            </View>
            <View style={sharedStyles.titleTextContainer}>
              <Text style={sharedStyles.title}>Ma Page</Text>
              <Text style={sharedStyles.subtitle}>Description de ma page</Text>
            </View>
            <View style={sharedStyles.statsContainer}>
              <Text style={[sharedStyles.statsNumber, styles.statsNumberCustom]}>42</Text>
              <Text style={sharedStyles.statsLabel}>unité</Text>
            </View>
          </View>
        </View>

        {/* Contenu spécifique à votre page */}
        <View className="p-5">
          <Text>Contenu de votre page ici</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles spécifiques à cette page
const styles = StyleSheet.create({
  iconContainerCustom: {
    backgroundColor: '#votre-couleur',
  },
  statsNumberCustom: {
    color: '#votre-couleur',
  },
});

export default MaNouvellePage;
```

## 🚀 Bonnes pratiques

1. **Toujours utiliser TopDecoration** en haut des pages pour la cohérence
2. **Importer sharedStyles** pour utiliser les styles communs
3. **Créer des styles spécifiques** seulement si nécessaire
4. **Utiliser les couleurs cohérentes** avec le design system
5. **Suivre le template** pour les nouvelles pages

## 🎨 Couleurs du thème

- **Violet** : `#8b5cf6` (Activity/Entraînement)
- **Vert** : `#4ade80` (Nutrition)
- **Bleu** : `#3b82f6` (Home/Général)
- **Gris foncé** : `#374151` (Headers)
- **Gris clair** : `#f8f9fa` (Background)

Cette approche garantit une cohérence visuelle et facilite la maintenance du code ! 🎯 