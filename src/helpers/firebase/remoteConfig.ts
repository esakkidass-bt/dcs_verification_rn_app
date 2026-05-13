import remoteConfig from '@react-native-firebase/remote-config';

async function fetchRemoteConfig() {
  await remoteConfig().setDefaults({
    welcome_message: 'Hello from local default',
  });

  await remoteConfig().fetchAndActivate();

  const value = remoteConfig().getValue('welcome_message');
  console.log('Remote Config value:', value.asString());
}