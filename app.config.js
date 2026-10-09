module.exports = ({ config }) => {
  const development = process.env.APP_VARIANT === 'development';
  return {
    ...config,
    name: development ? 'MoonLoom (Dev)' : config.name,
    ios: {
      ...config.ios,
      ...(development ? { bundleIdentifier: 'com.bayekai.moonloom.dev' } : {}),
    },
    android: {
      ...config.android,
      ...(development ? { package: 'com.bayekai.moonloom.dev' } : {}),
    },
    plugins: config.plugins.map(plugin => plugin === 'expo-dev-client'
      ? ['expo-dev-client', { addGeneratedScheme: development }] : plugin),
  };
};
