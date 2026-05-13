import {getLatestAppVersion} from './firebase/urls';
import config from '../config';
import {Alert, Linking} from 'react-native';
import * as Network from '@react-native-community/netinfo';

function compareVersions(
  currentVersion: string,
  latestVersion: string,
): number {
  //? The function returns -1 if currentVersion is less than
  // latestVersion, 1 if it is greater, and 0 if they are equal
  const parts1 = currentVersion.split('.').map(Number);
  const parts2 = latestVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) {
      return -1;
    } else if (part1 > part2) {
      return 1;
    }
  }

  return 0;
}

const checkAppBuildVersion = async () => {
  const network = await Network.fetch();
  console.log('network.isInternetReachable  ', network.isInternetReachable);
  console.log('network.isConnected  ', network.isConnected);
  // if (network.isConnected && network.isInternetReachable) {
  //   await getLatestAppVersion().then(latestVersion => {
  //     if (!latestVersion) {
  //       Alert.alert('Error', `Error while fetching app version`);
  //       return;
  //     }
  //     const isUpdateAvailable = compareVersions(config.version, latestVersion);
  //     console.debug(
  //       'appVesrion',
  //       latestVersion,
  //       config.version,
  //       isUpdateAvailable,
  //     );
  //     if (isUpdateAvailable === -1) {
  //       Alert.alert(
  //         `New Update Available - ${latestVersion}`,
  //         `You are using ${config.version}, please update the app to ${latestVersion}`,
  //         [
  //           {
  //             text: 'Update',
  //             onPress: async () => {
  //               await Linking.openURL('market://details?id=org.tnega.payiraaivu');
  //             },
  //           },
  //         ],
  //         {
  //           cancelable: false,
  //         },
  //       );
  //     }
  //   });
  // }
};
//
// const checkAppBuildVersionPeriodically = async (intervalInSeconds: number = 10) => {
// 	return setInterval(async () => {
// 		await getLatestAppVersion().then(e => {
// 			console.log('appVesrion', e)
// 			if(config.androidBuildNumber<e){
// 				Alert.alert("New Update Availabel", "Please update the app" +
// 					" to use ", [
// 					{
// 						text:"Update",
//                         onPress: async () => {
//                             await Linking.openURL('market://details?id=org.tnega.cropsurvey');
//                         }
// 					}
// 				])
// 			}
// 		})
// 	}, intervalInSeconds*1000)
// }

const appUpdate = {
  checkAppBuildVersion,
  // checkAppBuildVersionPeriodically
};

export default appUpdate;
