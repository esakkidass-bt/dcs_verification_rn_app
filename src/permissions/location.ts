import {Alert, BackHandler, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const getLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need access to your location to provide better service.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert(
        'Missing Permission!',
        'Enable Location permission in settings',
        [
          {
            text: 'Exit',
            onPress: () => {
              console.log('Permission denied');
              BackHandler.exitApp();
            },
          },
        ],
      );
    }
  } else {
    // For iOS, Geolocation.requestAuthorization() should be used
    Geolocation.requestAuthorization();
  }
};

export default getLocationPermission;
