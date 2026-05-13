import {PermissionsAndroid} from 'react-native';

const getCameraPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'We need access to your camera to take photos.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log('Camera permission granted');
    return true;
  } else {
    console.log('Camera permission denied');
    return false;
  }
};

export const requestCameraPermission = async () => {
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(
    hasPermission => {
      if (!hasPermission) {
        getCameraPermission();
      }
    },
  );
};
