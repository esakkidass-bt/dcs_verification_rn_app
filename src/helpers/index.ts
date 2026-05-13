import {Alert, BackHandler, NativeModules} from 'react-native';

export * from './restMethods';
export * from './form';
export * from './string';
export {default as geo} from './geo';
export {default as landExtent} from './landExtent';

// export function callWithTimeout(
//   fn: () => Promise<any>,
//   timeout: number,
//   defaultValue: any,
// ) {
//   let timer: any;
//   const promise = new Promise(resolve => {
//     timer = setTimeout(() => {
//       console.debug('returning previous location');
//       resolve(defaultValue);
//     }, timeout);
//     fn((result: any) => {
//       clearTimeout(timer);
//       resolve(result);
//     });
//   });
//   return promise;
// }

// const {DarkZipFileModule} = NativeModules;

export const checkDevMode = () => {
  // DarkZipFileModule.isDeveloperModeEnabled()
  // .then((e: boolean) => {
  //   if (e) {
  //     console.log('devModeEnabled');
  //     const backAction = () => {
  //       Alert.alert(
  //         'Developer mode enabled!',
  //         'You enabled developer option, so you cant access the application. To use the app please disable the developer option int the settings',
  //         [
  //           {
  //             text: 'Exit',
  //             onPress: () => {
  //               BackHandler.exitApp();
  //             },
  //           },
  //         ],
  //       );
  //       return true;
  //     };
  //     // BackHandler.addEventListener(
  //     //   "hardwareBackPress",
  //     //   backAction
  //     // );
  //     backAction();
  //   } else {
  //     console.log('devModeDisabled');
  //   }
  // })
  // .catch((e: any) => console.log(e));
};

// export function get(min)
export function generateRandomNumber(digits: number) {
  if (digits < 1) throw new Error('Number of digits must be at least 1');

  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  const randomNumber = Math.floor(min + Math.random() * (max - min + 1));

  return randomNumber;
}

export function generateUniqueValue() {
  // Get current epoch time in milliseconds
  const epochMillis = Date.now();

  // Convert to string and get the last 10 digits to ensure it's under 14 digits
  const epochPart = epochMillis.toString().slice(-10);

  // Generate a random number between 1000 and 9999
  const randomPart = generateRandomNumber(4).toString();

  // Combine epochPart and randomPart to form a unique 14-digit number
  const uniqueValue = epochPart + randomPart;

  return uniqueValue;
}


const {DeviceIdModule} = NativeModules;

export async function fetchDeviceInfo() {
  const deviceId = await DeviceIdModule.getDeviceId();
  const makeModel = await DeviceIdModule.getDeviceMakeModel();
  console.log(`Device ID: ${deviceId}`);
  console.log(`Make & Model: ${makeModel}`);

  return {
    deviceId,
    makeModel,
  };
}