import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'sparkfit_auth_token';
const USER_KEY = 'sparkfit_user_data';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  profile?: {
    age?: number;
    weight?: number;
    height?: number;
    fitness_goal?: string;
    goal_detail?: string;
    intensity?: string;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  user_type: string;
  created_at: string;
  profile?: {
    profile_id: number;
    age?: number;
    weight?: number;
    height?: number;
    fitness_goal?: string;
    goal_detail?: string;
    intensity?: string;
  };
}

interface AuthResponse {
  status: number;
  message: string;
  data?: User;
  token?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);
      
      if (token && userData) {
        this.authToken = token;
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
    }
  }

  async signUp(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data: AuthResponse = await response.json();

      if (data.status === 201 && data.data) {
        // Enregistrer les données utilisateur
        this.currentUser = data.data;
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.data));
        
        // Connecter automatiquement après inscription
        const loginResponse = await this.signIn({
          email: registerData.email,
          password: registerData.password
        });
        
        return loginResponse;
      }

      throw new Error(data.message || 'Erreur lors de l\'inscription');
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      throw new Error(error.message || 'Erreur de connexion au serveur');
    }
  }

  async signIn(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data: AuthResponse = await response.json();

      if (data.status === 200 && data.token) {
        // Stocker le token de manière sécurisée
        this.authToken = data.token;
        await SecureStore.setItemAsync(TOKEN_KEY, data.token);

        // Récupérer les données utilisateur
        await this.fetchUserProfile();

        return {
          status: 200,
          message: 'Connexion réussie',
          data: this.currentUser || undefined,
          token: data.token
        };
      }

      throw new Error(data.message || 'Erreur lors de la connexion');
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      throw new Error(error.message || 'Erreur de connexion au serveur');
    }
  }

  async fetchUserProfile(): Promise<void> {
    if (!this.authToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/self/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 200 && data.data) {
        this.currentUser = data.data;
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Erreur récupération profil:', error);
    }
  }

  async updateProfile(profileData: Partial<RegisterData['profile']>): Promise<boolean> {
    if (!this.authToken || !this.currentUser) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/user/${this.currentUser.user_id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.status === 200) {
        // Actualiser les données utilisateur
        await this.fetchUserProfile();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      return false;
    }
  }

  async updateUser(userData: Partial<User>): Promise<boolean> {
    if (!this.authToken || !this.currentUser) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/user/${this.currentUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.status === 200) {
        // Actualiser les données utilisateur
        await this.fetchUserProfile();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      return false;
    }
  }

  async logOut(): Promise<void> {
    try {
      // Supprimer les données stockées
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      // Réinitialiser l'état
      this.authToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return this.authToken !== null && this.currentUser !== null;
  }

  // Calculer l'IMC
  calculateBMI(): number | null {
    if (!this.currentUser?.profile?.weight || !this.currentUser?.profile?.height) {
      return null;
    }
    
    const heightInMeters = this.currentUser.profile.height / 100;
    return Math.round((this.currentUser.profile.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }

  // Catégorie IMC
  getBMICategory(): string {
    const bmi = this.calculateBMI();
    if (!bmi) return 'Non défini';
    
    if (bmi < 18.5) return 'Insuffisance pondérale';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }

  // Calories recommandées
  getRecommendedCalories(): number | null {
    if (!this.currentUser?.profile?.weight || !this.currentUser?.profile?.height || !this.currentUser?.profile?.age) {
      return null;
    }

    const { weight, height, age } = this.currentUser.profile;
    
    // Formule de Harris-Benedict (approximation homme)
    // Pour une version plus précise, il faudrait le sexe
    const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    
    // Facteur d'activité moyen (1.55)
    return Math.round(bmr * 1.55);
  }
}

// Export singleton
const authService = new AuthService();

export default authService;

// Export des fonctions pour compatibilité
export const signUp = (data: RegisterData) => authService.signUp(data);
export const signIn = (data: LoginData) => authService.signIn(data);
export const logOut = () => authService.logOut();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const updateProfile = (data: Partial<RegisterData['profile']>) => authService.updateProfile(data);
export const updateUser = (data: Partial<User>) => authService.updateUser(data);

export type { User, RegisterData, LoginData, AuthResponse };
