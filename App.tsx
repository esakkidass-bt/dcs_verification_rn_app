// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;


import React, {useEffect, useRef, useState} from 'react';
import {extendTheme, NativeBaseProvider, StatusBar} from 'native-base';
import Routers from './src/routers';
import {colors} from './src/styles';
import {AuthProvider} from './src/context/AuthContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StateProvider} from './src/context/StateContext';
import NetInfo from '@react-native-community/netinfo';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Alert,
  AppState,
  BackHandler,
  NativeModules,
  PermissionsAndroid,
  Text,
  View,
} from 'react-native';
import {LocationProvider} from './src/context/LocationContext';

import appUpdate from './src/helpers/appUpdate';
import {requestCameraPermission} from './src/helpers/permissions';
import {asyncStorage} from './src/helpers/asyncStorage';
import remoteConfig from '@react-native-firebase/remote-config';
import {fetchDeviceInfo} from './src/helpers';
import {runPlayIntegrityCheck} from './src/helpers/integrity';

// native base theme config
const theme = extendTheme({
  colors: {
    ...colors,
  },
  // fonts: {
  //   heading: 'ArialCE',
  //   body: 'ArialCE',
  //   mono: 'ArialCE',
  // },
  // fonts: {
  //   heading: 'ArialCE',
  //   body: 'ArialCE',
  //   mono: 'ArialCE',
  // 	customFont: 'ArialCE',
  // },
  useSystemColorMode: false,
  components: {
    // Input:{
    //   baseStyle:{
    //     _focus:{
    //       style:{
    //         boxShadow: 'transparent',
    //       }
    //     }
    //   }
    // },
    Text: {
      defaultProps: {
        fontSize: 'xs',
      },
    },
    Button: {
      defaultProps: {
        fontSize: 'xs',
        backgroundColor: 'primary.900',
        _disabled: {
          opacity: 0.7,
        },
      },
    },
    Pressable: {
      defaultProps: {
        _pressed: {
          opacity: 0.8,
        },
      },
    },
  },
});

const {AppSecurity} = NativeModules;

const blacklistedApps = [
  'com.lexa.fakegps',
  'com.fly.gps',
  'com.fakegps.mock',
  'com.incorporateapps.fakegps.fre',
  'com.theappninjas.fakegpsjoystick',
  'com.fakegps.mock.location',
  'com.rosteam.gpsemulator',
  'com.gpsjoystick',
  'com.theappninjas.gpsjoystick',
  'com.fly.gps',
  'org.hola.gpslocation',
  'com.dg.fakegps',
  'com.fakegps.location.spoofer',
  'com.lemao.fakelocation',
  'com.smart.gpsfaker',
  'com.locationchanger.fakegps',
  'com.excelliance.fakegps',
  'com.blogspot.newapphorizons.fakegps',
  'com.kapp.smartfaker',
  'com.tools.fakegps',
  'com.mobile.fakelocation',
  'com.androidsc.fakegpsgo.pro',
  'com.blogspot.newapphorizons.fakegps',
  'com.ninja.toolkit.pulse.fake.gps.pro',
  'com.incorporateapps.fakegps.fre',
  'com.rosteam.gpsemulator',
  'com.just4funtools.fakegpslocationprofessional',
  'com.hopefactory2021.fakegpslocation',
  'com.locationchanger',
  'top.tinysoft.fakegps',
  'fake.gps.location.emulator',
  'com.gsmartstudio.fakegps',
  'com.fly.gps',
  'project.listick.fakegps',
  'com.discipleskies.mock_location_spoofer',
  'com.theappninjas.fakegpsjoystick',
  'com.evezzon.fakegps',
  'location.changer.fake.gps.spoof.emulator',
  'ru.gavrikov.mocklocations',
  'fakegps.fakelocation.mocklocation.gpsfaker',
  'com.fakegps.fakelocation',
  'com.incorporateapps.fakegps_route',
  'com.mock.cartage',
  'fake.gps.location.changer.spoof.location',
  'com.fakegpslocation.spoofer',
  'com.pogoskill.fakegps',
  'app.ronzano.mocklocation',
  'com.rasfar.mock.location',
  'com.appanchor.fakegps',
  'com.phongphan.fakegps',
  'com.androidsc.fakegpsgo.free',
  'com.safisoft.fakelocation_duckgps',
  'com.xdoapp.virtualphonenavigation',
  'com.mock.fakegps.fakelocation',
  'com.changelocation.fakegps',
  'com.applisto.appcloner',
  'antmobi.parallelspace.dualspace.clonewhatsapp.appcloner',
  'com.pengyou.cloneapp',
  'com.nams.fenshen.wxclone',
  'com.cloner.android',
  'com.matrix.clone',
  'com.polestar.super.clone',
  'com.cmaster.cloner',
  'com.friendlygames.gamecloner',
  'com.excelliance.multiaccounts',
  'com.excean.parallelspace',
  'com.xunijun.app.gp',
  'com.polestar.super.clone',
  'com.waxmoon.ma.gp',
  'com.excelliance.multiaccount',
  'co.keeptop.multi.space',
  'co.keeptop.multi.clone',
];

async function checkSecurity() {
  const isSecure: boolean = await AppSecurity.isDeviceSecure(blacklistedApps);
  if (!isSecure) {
    Alert.alert(
      'Security Risk: Please uninstall unauthorized apps to use this application.',
    );
  } else {
    console.log('Device is secure');
  }
  return isSecure;
}

type MyThemeType = typeof theme;
declare module 'native-base' {
  interface ICustomTheme extends MyThemeType {}
}

export default function App() {
  const [_isPermissionGrantedSuccessfully, setIsPermissionGrantedSuccessfully] =
    useState(false);
  useEffect(() => {
    requestCameraPermission().then(e => {
      setIsPermissionGrantedSuccessfully(e as any);
    });
  }, []);
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.HIGH_SAMPLING_RATE_SENSORS,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the high sampling rate sensors');
        } else {
          console.log('High sampling rate sensors permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const setupRemoteConfig = async () => {
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0, // every fetch in dev, 1hr in prod
      });

      await remoteConfig().setDefaults({
        test: 'oldValue',
      });

      await remoteConfig().fetchAndActivate();
    };

    // runPlayIntegrityCheck();

    setupRemoteConfig();
  }, []);

  // popup for exit to prevent accidental exit
  //
  // if (!firebase.apps.length) {
  //   firebase.initializeApp({
  //           apiKey: "AIzaSyDq8oKiRpof_xo1Fq9G44LNBb3E4qlUKfo",
  //           projectId: "crop-survey-c6c02",
  //           storageBucket: "crop-survey-c6c02.appspot.com",
  //           messagingSenderId: "223286223777",
  //           appId: "1:223286223777:android:20f87c6ab71bb84c2ee1e0",

  //       });
  // }

  const appState = useRef(AppState.currentState);
  const [, setAppStateVisible] = useState(appState.current);

  // const getDataFromFireBase = async () => {
  // const users = await firestore().collection('Links').get();

  // };

  useEffect(() => {
    // getDataFromFireBase();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        // checkDevMode();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);

      if (appState.current === 'active') {
        appUpdate.checkAppBuildVersion();

        fetchDeviceInfo()
          .then(result => {
            asyncStorage.storeObj('deviceInfo', result);
          })
          .catch(err => {
            console.error('Error fetching device info:', err);
          });

        getAppMode().then(mode => {
          if (mode === 'online') {
            // runPlayIntegrityCheck();
          }
        });

        // Check blacklisted apps
        checkSecurity().then(isSecure => {
          if (!isSecure) {
            Alert.alert(
              'Security Risk',
              'Please uninstall unauthorized apps to use this application.',
              [
                {
                  text: 'Exit',
                  onPress: () => {
                    BackHandler.exitApp();
                  },
                },
              ],
            );
          }
        });
      }
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [isConnected, setIsConnected] = useState(true);
  const [appMode, setAppMode] = useState<'online' | 'offline'>('online');

  async function getAppMode() {
    return await asyncStorage.getString('mode', 'online');
  }

  useEffect(() => {
    getAppMode().then(mode => {
      if (appMode !== mode) {
        setAppMode(mode);
      }
    });
    const checkConnectivity = async () => {
      const state = await NetInfo.fetch();
      if (isConnected !== Boolean(state?.isConnected)) {
        setIsConnected(Boolean(state?.isConnected));
      }
    };

    // Check the initial connection
    checkConnectivity();

    // Subscribe to connectivity changes
    const unsubscribe = NetInfo.addEventListener(state => {
      if (isConnected !== Boolean(state?.isConnected)) {
        setIsConnected(Boolean(state?.isConnected));
      }
    });

    // Cleanup subscription when the component unmounts
    return () => unsubscribe();
  }, [appMode, isConnected]);

  // Function to handle retry logic
  // const handleRetry = async () => {
  //   // setLoading(true);
  //   await checkConnectivity(); // Recheck connection
  //   setLoading(false);
  // };

  return (
    <LocationProvider>
      <AuthProvider>
        <StateProvider>
          <SafeAreaProvider>
            <NativeBaseProvider theme={theme}>
              <StatusBar
                barStyle={'light-content'}
                backgroundColor={colors.primary[600]}
              />
              <Routers />

              {!isConnected && appMode === 'online' ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // optional, to make it look like an overlay
                  }}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <MCIcon
                      name="wifi-strength-alert-outline"
                      color="white"
                      size={40}
                    />
                    <Text style={{color: 'white', fontSize: 18}}>
                      No Internet Connection {isConnected} - {appMode}
                    </Text>
                  </View>
                </View>
              ) : null}
              {/* {isPermissionGrantedSuccessfully ?  : null} */}
            </NativeBaseProvider>
          </SafeAreaProvider>
        </StateProvider>
      </AuthProvider>
    </LocationProvider>
  );
}
