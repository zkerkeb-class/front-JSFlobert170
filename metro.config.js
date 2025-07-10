const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ajout de la configuration pour résoudre les problèmes de dépendances
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db', 'sqlite'],
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
};

module.exports = withNativeWind(config, { input: './app/globals.css' });