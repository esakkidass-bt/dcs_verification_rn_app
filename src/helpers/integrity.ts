import {Alert, BackHandler, Linking, NativeModules} from 'react-native';
import {getUrlFromFirebase} from './firebase/urls';
import {asyncStorage} from './asyncStorage';

const {PlayIntegrityModule} = NativeModules;
// {
//   nonceApi,
//   validateApi,
// }: {
//   nonceApi: string;
//   validateApi: string;
// }

export const runPlayIntegrityCheck = async () => {
  try {
    const nonceApi = await getUrlFromFirebase('playIntegrityNonceApi');
    const validateApi = await getUrlFromFirebase('playIntegrityValidateApi');

    console.debug('Play Integrity APIs:', {
      nonceApi,
      validateApi,
    });
    if (!nonceApi || !validateApi) {
      console.warn('Play Integrity APIs are not configured properly');
      return false; // APIs not configured
    }
    const result = await PlayIntegrityModule.checkIntegrity(
      nonceApi,
      validateApi,
    );

    // console.log('Raw Response:', result.rawResponse);
    // console.log('Certificate Digest:', result.certificateSha256Digest);
    // const data = JSON.parse(result);

    // console.debug('Play Integrity Check:', data);

    // if (
    //   data?.tokenPayloadExternal?.appIntegrity?.appRecognitionVerdict ===
    //     'PLAY_RECOGNIZED' &&
    //   data?.tokenPayloadExternal?.deviceIntegrity?.deviceRecognitionVerdict?.includes(
    //     'MEETS_DEVICE_INTEGRITY',
    //   )
    // ) {
    //   return true; // Integrity check passed
    // } else {
    //   console.warn('Integrity check failed:', data);
    //   return false; // Integrity check failed
    // }

    const certificateSha256Digest = result.certificateSha256Digest || null;

    if (!certificateSha256Digest) {
      Alert.alert(
        'Integrity Check Failed',
        'The current application has failed in its integrity check. Please uninstall this and install the current official version by clicking download option',
        [
          {
            text: 'Download Official Version',
            onPress: async () => {
              await Linking.openURL('market://details?id=org.tnega.payiraaivu');
            },
          },
          {
            text: 'Exit',
            onPress: async () => {
              await asyncStorage.storeString('certificateSha256Digest', '');
              BackHandler.exitApp();
            },
          },
        ],
      );
    } else {
      asyncStorage.storeString(
        'certificateSha256Digest',
        certificateSha256Digest,
      );
    }

    console.debug('Play Integrity Check Result:', {
      certificateSha256Digest,
      rawResponse: result.rawResponse,
    });

    return certificateSha256Digest;
  } catch (e) {
    console.error('Integrity Check Failed', e);
    return false; // Error during integrity check
  }
};
