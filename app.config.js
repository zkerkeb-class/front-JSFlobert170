export default {
  expo: {
    name: 'SparkFit',
    slug: 'sparkfit',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icons/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sparkfit.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.sparkfit.app'
    },
    web: {
      favicon: './assets/icons/favicon.png'
    },
    extra: {
      // Ajoutez vos variables d'environnement ici
      notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://192.168.1.122:3003',
      eas: {
        projectId: 'your-project-id'
      }
    }
  }
}; 