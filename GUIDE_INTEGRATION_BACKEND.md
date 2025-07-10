# 🔗 Guide d'Intégration Backend SparkFit

## 📋 Résumé des Modifications

### ✅ **Corrections Effectuées**

1. **Configuration Backend** : Port 3000 ✅
2. **SecureStore** : Stockage sécurisé des tokens ✅
3. **Service d'authentification** : Connecté à PostgreSQL ✅
4. **Pages unifiées** : Informations personnelles + santé ✅
5. **Navigation** : Routes corrigées ✅

---

## 🛠️ **Nouvelles Fonctionnalités**

### 1. **Service d'Authentification Complet** (`src/services/auth.ts`)

**Fonctionnalités :**
- ✅ Inscription avec profil complet (username, email, phone, profil santé)
- ✅ Connexion avec token JWT stocké dans SecureStore
- ✅ Mise à jour des données utilisateur et profil
- ✅ Calculs automatiques (IMC, calories recommandées)
- ✅ Gestion d'état persistante

**Endpoints Backend Utilisés :**
```
POST /api/auth/register  - Inscription
POST /api/auth/login     - Connexion
GET  /api/user/self/me   - Profil utilisateur
PUT  /api/user/:id       - Mise à jour utilisateur
PUT  /api/user/:id/profile - Mise à jour profil
```

### 2. **Page Unifiée d'Informations** (`app/personal-info.tsx`)

**Sections :**
- 👤 **Informations Personnelles** : username, email, téléphone
- 🏥 **Profil de Santé** : âge, poids, taille, objectifs fitness
- 📊 **Statistiques** : IMC, calories recommandées
- ✏️ **Mode édition** : Modification en temps réel

### 3. **Page de Paramètres** (`app/settings.tsx`)

**Fonctionnalités :**
- ⚙️ Navigation vers informations personnelles
- 🔔 Gestion des notifications
- 🚪 Déconnexion sécurisée
- ⚠️ Suppression de compte (avec double confirmation)

### 4. **Inscription Complète** (`app/register.tsx`)

**Champs :**
- Nom d'utilisateur (obligatoire)
- Email (obligatoire)
- Téléphone (optionnel)
- Mot de passe + confirmation

**Flux :**
```
1. Inscription → 2. Connexion automatique → 3. Redirection vers profil
```

---

## 🗃️ **Structure de Données Backend**

### **Table User**
```sql
user_id         INT (PK)
username        VARCHAR (UNIQUE)
email           VARCHAR (UNIQUE)
password        VARCHAR (HASHED)
phone           VARCHAR (UNIQUE, OPTIONAL)
profile_picture VARCHAR (OPTIONAL)
user_type       VARCHAR
created_at      TIMESTAMP
```

### **Table Profile**
```sql
profile_id   INT (PK)
user_id      INT (FK → User.user_id)
age          INT (OPTIONAL)
weight       FLOAT (OPTIONAL)
height       FLOAT (OPTIONAL)
fitness_goal VARCHAR (OPTIONAL)
goal_detail  TEXT (OPTIONAL)
```

---

## 🔐 **Sécurité Implémentée**

### **SecureStore (Expo)**
```typescript
// Stockage sécurisé du token JWT
await SecureStore.setItemAsync('sparkfit_auth_token', token);

// Récupération sécurisée
const token = await SecureStore.getItemAsync('sparkfit_auth_token');
```

### **Authentification JWT**
```typescript
// Headers avec token
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🧪 **Tests à Effectuer**

### **1. Inscription**
```
1. Ouvrir l'app → Aller à "S'inscrire"
2. Remplir : username, email, téléphone, mot de passe
3. Vérifier : Redirection vers /personal-info
4. Vérifier : Token stocké dans SecureStore
```

### **2. Connexion**
```
1. Se déconnecter
2. Se reconnecter avec email/password
3. Vérifier : Redirection vers /(tabs)
4. Vérifier : Données utilisateur récupérées
```

### **3. Profil Complet**
```
1. Aller dans Profile → "Mes informations"
2. Mode édition → Modifier âge, poids, taille
3. Sauvegarder → Vérifier calculs IMC/calories
4. Vérifier : Données persistantes après redémarrage
```

### **4. Navigation**
```
1. Profile → "Mes informations" ✅
2. Profile → "Paramètres" ✅
3. Paramètres → "Mes informations" ✅
4. Paramètres → "Supprimer compte" ✅
```

---

## 🚀 **Démarrage**

### **1. Backend (Port 3000)**
```bash
cd SparkFit_Backend
npm install
npm start
# Serveur sur http://localhost:3000
```

### **2. Frontend**
```bash
cd SparkFit_Frontend_AI
npx expo install
npx expo start
```

### **3. Base de Données**
```bash
# Vérifier que PostgreSQL fonctionne
# Vérifier les migrations Prisma
cd SparkFit_Backend
npx prisma migrate dev
```

---

## 📱 **Flux Utilisateur Complet**

```
1. 📱 Ouverture app
   ↓
2. 📝 Inscription (username, email, phone, password)
   ↓
3. 🔐 Connexion automatique + token SecureStore
   ↓
4. 📊 Redirection vers /personal-info
   ↓
5. ✏️ Compléter profil de santé (âge, poids, taille, objectifs)
   ↓
6. 🏠 Navigation vers /(tabs)
   ↓
7. 👤 Profile → "Mes informations" (modification possible)
   ↓
8. ⚙️ Profile → "Paramètres" (gestion compte)
```

---

## 🔧 **Configuration API**

### **URL Backend**
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

### **Clés de Stockage**
```typescript
const TOKEN_KEY = 'sparkfit_auth_token';
const USER_KEY = 'sparkfit_user_data';
```

---

## ⚠️ **Points d'Attention**

### **1. Backend Requis**
- Le backend doit tourner sur le port 3000
- PostgreSQL doit être configuré
- Les migrations Prisma doivent être appliquées

### **2. Gestion d'Erreurs**
- Connexion réseau
- Validation des données
- Expiration des tokens

### **3. Types TypeScript**
- Interfaces complètes pour User/Profile
- Validation côté client
- Gestion des erreurs typées

---

## 🎯 **Prochaines Étapes**

1. **Tests sur appareil physique**
2. **Gestion hors ligne**
3. **Refresh token automatique**
4. **Upload de photos de profil**
5. **Validation email/téléphone**

---

## 📞 **Support**

En cas de problème :
1. Vérifier que le backend fonctionne (port 3000)
2. Vérifier les logs de la console
3. Tester les endpoints avec Postman
4. Vérifier les données en base PostgreSQL 