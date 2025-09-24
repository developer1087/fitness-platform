const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for symlinked packages
config.watchFolders = [
  path.resolve(__dirname, '../../packages'),
];

// Add resolver configuration for symlinked packages
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '../../node_modules'),
  ],
  // Resolve packages that are symlinked
  unstable_enableSymlinks: true,
};

module.exports = config;