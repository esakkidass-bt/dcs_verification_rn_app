// import React, {useState} from 'react';
// import Geolocation from 'react-native-geolocation-service';


// import {LocationContextProps, LocationProviderProps} from './type';
// import {ICordinates} from '../../@types/geoJson';
// import {Alert, NativeModules, PermissionsAndroid, Platform} from 'react-native';

// export const LocationContext = React.createContext<LocationContextProps>(
//   {} as LocationContextProps,
// );

// const initSimulatedLocationData = {
//   accuracy: 0,
// };

// export const LocationProvider = ({children}: LocationProviderProps) => {
//   const [isSimulatingTheLocation, setIsSimulatingTheLocation] = useState(false);
//   const [simulatedCurrentLocation, setSimulatedCurrentLocation] =
//     useState<ICordinates>(initSimulatedLocationData as ICordinates);

//   const {BasicFunctions} = NativeModules;

//   // useEffect(() => {
//   //   if(!simulatedCurrentLocation){
//   //     setIsSimulatingTheLocation(false)
//   //   }

//   // }, [simulatedCurrentLocation])

//   async function handleSimulatedCurrentLocationChange(
//     latitude: number,
//     longitude: number,
//   ) {
//     setIsSimulatingTheLocation(true);
//     setSimulatedCurrentLocation(e => {
//       return {...e, latitude, longitude};
//     });
//   }

//   async function resetSimulatedCurrentLocation() {
//     setSimulatedCurrentLocation(initSimulatedLocationData as ICordinates);
//     setIsSimulatingTheLocation(false);
//   }

//   const [previousLocation, setPreviousLocation] = useState<
//     ICordinates | undefined
//   >(undefined);

//   async function getUserLocationFromAndroid() {
//     // try {
//     //   if (Platform.OS === 'android') {
//     //     const granted = await PermissionsAndroid.request(
//     //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//     //     );
//     //     if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//     //       throw new Error('Location permission denied');
//     //     }
//     //   }

//     //   const location = await BasicFunctions.getCurrentLocation();
//     //   return location as ICordinates;
//     //   // Example: { latitude: 12.97, longitude: 80.22, accuracy: 5.3 }
//     // } catch (err) {
//     //   console.warn('Location fetch error', err);
//     //   Alert.alert('Error', 'Failed to fetch location');
//     // }

//     try {
//         if (Platform.OS === 'android') {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           );
//           if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//             throw new Error('Location permission denied');
//           }
//         }
//       const location = await BasicFunctions.getVerifiedLocation();
//       // console.log('User Location:', location);

//       if (location.isMocked) {
//         Alert.alert('Warning', 'Mock location detected. Closing the app.');
//         setTimeout(() => {
//           BasicFunctions.forceExitApp();
//         }, 1000);
//       } else {
//         return location as ICordinates;
//       }
//     } catch (err) {
//       console.log('Failed to fetch location', err)
//         Alert.alert('Error', 'Failed to fetch location');
//     }
//   }

//   const getCurrentLocation = async (callback?: (e: ICordinates) => void) => {
//     // const start = Date.now();
//     if (isSimulatingTheLocation) {
//       const _loc = {
//         ...simulatedCurrentLocation,
//         accuracy: 0,
//         simulated: true,
//       };
//       setPreviousLocation(_loc as ICordinates);
//       callback?.(_loc);
//     }

//     getUserLocationFromAndroid().then(e => {
//       if (e) {
//         const _loc = {
//           ...e,
//           accuracy: e.accuracy ? parseInt(e.accuracy.toFixed(0), 10) : null,
//         };
//         setPreviousLocation(_loc as ICordinates);
//         callback?.(_loc);
//       }
//     });

//     // Geolocation.getCurrentPosition(
//     //   location => {
//     //     let _loc = {
//     //       ...location.coords,
//     //       accuracy: location.coords.accuracy
//     //         ? parseInt(location.coords.accuracy.toFixed(0))
//     //         : null,
//     //     } as ICordinates;
//     //     setPreviousLocation(_loc);
//     //     callback?.(_loc);
//     //   },
//     //   () => {},
//     //   {enableHighAccuracy: true, timeout: 15000},
//     // );

//     // console.debug("getCurrentLocation >", Date.now() - start);
//     // return _loc;
//   };
//   // React.useEffect(() => {
//   //   const getCurrentLocation = async () => {
//   //     const location = await Location.getCurrentPositionAsync({});
//   //     state.handleCurrentLocationChange(
//   //       location.coords.latitude,
//   //       location.coords.longitude
//   //     );
//   //   };
//   // getCurrentLocation();
//   // }, []);

//   const value: LocationContextProps = {
//     getCurrentLocation,
//     handleSimulatedCurrentLocationChange,
//     simulatedCurrentLocation,
//     resetSimulatedCurrentLocation,
//     isSimulatingTheLocation,
//     previousLocation,
//   };
//   return (
//     <LocationContext.Provider value={value}>
//       {children}
//     </LocationContext.Provider>
//   );
// };




import React, {useState} from 'react';
import Geolocation from 'react-native-geolocation-service';

import {LocationContextProps, LocationProviderProps} from './type';
import {ICordinates} from '../../@types/geoJson';

import {
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

export const LocationContext = React.createContext<LocationContextProps>(
  {} as LocationContextProps,
);

const initSimulatedLocationData = {
  accuracy: 0,
};

export const LocationProvider = ({
  children,
}: LocationProviderProps) => {
  const [isSimulatingTheLocation, setIsSimulatingTheLocation] =
    useState(false);

  const [simulatedCurrentLocation, setSimulatedCurrentLocation] =
    useState<ICordinates>(
      initSimulatedLocationData as ICordinates,
    );

  const [previousLocation, setPreviousLocation] = useState<
    ICordinates | undefined
  >(undefined);

  async function handleSimulatedCurrentLocationChange(
    latitude: number,
    longitude: number,
  ) {
    setIsSimulatingTheLocation(true);

    setSimulatedCurrentLocation(e => {
      return {
        ...e,
        latitude,
        longitude,
      };
    });
  }

  async function resetSimulatedCurrentLocation() {
    setSimulatedCurrentLocation(
      initSimulatedLocationData as ICordinates,
    );

    setIsSimulatingTheLocation(false);
  }

  async function requestLocationPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }

  async function getUserLocationFromAndroid() {
    try {
      const hasPermission =
        await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Location permission denied',
        );

        return;
      }

      const location = await new Promise<ICordinates>(
        (resolve, reject) => {
          Geolocation.getCurrentPosition(
            position => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                heading: position.coords.heading,
                speed: position.coords.speed,
              } as ICordinates);
            },

            error => {
              reject(error);
            },

            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
              forceRequestLocation: true,
              showLocationDialog: true,
            },
          );
        },
      );

      return location;
    } catch (err: any) {
      console.log('LOCATION ERROR => ', err);

      Alert.alert(
        'Location Error',
        err?.message || 'Failed to fetch location',
      );
    }
  }

  const getCurrentLocation = async (
    callback?: (e: ICordinates) => void,
  ) => {
    if (isSimulatingTheLocation) {
      const _loc = {
        ...simulatedCurrentLocation,
        accuracy: 0,
        simulated: true,
      };

      setPreviousLocation(_loc as ICordinates);

      callback?.(_loc);

      return;
    }

    const e = await getUserLocationFromAndroid();

    if (e) {
      const _loc = {
        ...e,
        accuracy: e.accuracy
          ? parseInt(e.accuracy.toFixed(0), 10)
          : null,
      };

      setPreviousLocation(_loc as ICordinates);

      callback?.(_loc);
    }
  };

  const value: LocationContextProps = {
    getCurrentLocation,
    handleSimulatedCurrentLocationChange,
    simulatedCurrentLocation,
    resetSimulatedCurrentLocation,
    isSimulatingTheLocation,
    previousLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};