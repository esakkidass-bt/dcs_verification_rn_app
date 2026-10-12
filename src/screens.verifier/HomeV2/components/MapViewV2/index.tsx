import {Box, Button, Icon, Row, Text} from 'native-base';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import MapView, {
  Geojson,
  Marker,
  PROVIDER_GOOGLE,
  UrlTile,
} from 'react-native-maps';

import {Alert, Dimensions, Linking} from 'react-native';
import * as turf from '@turf/turf';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';

import {FarmerDetailsCard} from '../../../../components';
import {useIsFocused} from '@react-navigation/native';
import useDict from '../../../../hooks/useDict';

import {useAuth, useLocation, useStateContext} from '../../../../hooks';
import {ICordinates, IRegion} from '../../../../@types/geoJson';
import {isPointInsideTheSelectedLocation} from '../../../../helpers/geo/isPointInsideTheSelectedLocation';
import {geo} from '../../../../helpers';
import {navigation} from '../../../../routers/navigation';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ZOOM_LEVEL = -2.2;
const C_LATITUDE_DELTA = 0.01 * (screenHeight / screenWidth);
const C_LONGITUDE_DELTA = 0.01;
const C_CHENNAI_LOCATION = {
  latitude: 13.0534937035,
  longitude: 80.2496374771,
};

interface IScreenState {
  villages: any[];
}

const MapWithPolygon = () => {
  const state = useStateContext();
  const auth = useAuth();
  const ln = useDict();
  const {
    getCurrentLocation,
    handleSimulatedCurrentLocationChange,
    resetSimulatedCurrentLocation,
    simulatedCurrentLocation,
    isSimulatingTheLocation,
    previousLocation,
  } = useLocation();

  const FALL_BACK_ACCURACY = 30;

  const [surveyNumberPolygon, setSurveyNumberPolygon] = useState<any | null>(
    null,
  );
  const [MAX_GPS_ACCURACY, setMAX_GPS_ACCURACY] = useState(FALL_BACK_ACCURACY);
  const [enableLocationPicker, setEnableLocationPicker] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [, setUrlTemplate] = useState<string | null>(null);
  // const [screenState, setScreenState] = useState({} as IScreenState);

  // function handleScreenState<T extends keyof IScreenState>(
  //   key: T,
  //   value: IScreenState[T],
  // ) {
  //   setScreenState(prevState => {
  //     return {...prevState, [key]: value};
  //   });
  // }

  // const getVillages = useCallback(
  //   async (
  //     talukCode: string,
  //     callback: (
  //       e: {
  //         villageCode: string;
  //         villageName: string;
  //         parentVillageCode: string;
  //         talukCode: string;
  //       }[],
  //     ) => void,
  //   ) => {
  //     try {
  //       const assignedLocations = (await asyncStorage.getObj(
  //         'assignedLocations',
  //       )) as VillageDetail[];
  //       const _villages = assignedLocations
  //         ?.filter(e => e.taluk_code === Number(talukCode))
  //         ?.map(loc => {
  //           return {
  //             villageCode: loc.village_code.toString(),
  //             villageName: loc.village_name.toString(),
  //             parentVillageCode: loc.village_lgd_code.toString(),
  //             talukCode: loc.taluk_code.toString(),
  //           };
  //         });
  //       callback(_villages);
  //     } catch (error) {
  //       console.error('Error fetching villages:', error);
  //     }
  //   },
  //   [],
  // );

  const locateToVillage = useCallback(async () => {
    const region = {
      latitude: Number(state.selectedLocationData.villageLat),
      longitude: Number(state.selectedLocationData.villageLon),
      ...zoomToDelta(1),
    };
    mapRef.current?.animateToRegion({...region} as IRegion, 150);
  }, [
    state.selectedLocationData.villageLat,
    state.selectedLocationData.villageLon,
  ]);

  useEffect(() => {
    const initializeMap = async () => {
      await locateToVillage();
      if (!state.selectedLocationData.village) return;
      state.handleSelectedFeature('land')([]);
    };
    if (state.selectedLocationData.village) {
      initializeMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedLocationData.village]);

  const toggleShowLabels = () => setShowLabels(prev => !prev);

  const [mapType, setMapType] = useState<'satellite' | 'standard'>('satellite');

  const region: IRegion = {
    ...C_CHENNAI_LOCATION,
    latitudeDelta: C_LATITUDE_DELTA,
    longitudeDelta: C_LONGITUDE_DELTA,
  };

  const [geoJsonFeaturesInBBox, setGeoJsonFeaturesInBBox] = useState<any[]>([]);

  const toggleMapType = () =>
    setMapType(prevVal => (prevVal === 'satellite' ? 'standard' : 'satellite'));

  const mapRef = useRef<MapView>(null);

  const changeRegion = (newRegion: IRegion) => {
    mapRef.current?.animateToRegion(newRegion, 150);
  };

  const goToCurrentLocation = async () => {
    getCurrentLocation(currentLocation => {
      changeRegion({...currentLocation, ...zoomToDelta(-1)});
    });
  };

  const zoomToDelta = (zoom: number) => {
    const latitudeDelta = C_LATITUDE_DELTA * Math.pow(2, zoom);
    const longitudeDelta = C_LONGITUDE_DELTA * Math.pow(2, zoom);
    return {latitudeDelta, longitudeDelta};
  };

  const deltaToZoom = (latitudeDelta: number, longitudeDelta: number) => {
    const zoom = Math.log(C_LATITUDE_DELTA / latitudeDelta) / Math.log(2);
    return zoom * -1;
  };

  const handleRegionChangeComplete = async (props: IRegion) => {
    const boundBox = await mapRef.current?.getMapBoundaries();
    const zoom = deltaToZoom(props.latitudeDelta, props.longitudeDelta);
    if (zoom < ZOOM_LEVEL + 0.1) {
      if (!boundBox) return;
    } else {
      setGeoJsonFeaturesInBBox([]);
    }
  };

  const navigateToGMap = async () => {
    try {
      const link = generateGoogleMapLink([
        [previousLocation?.longitude, previousLocation?.latitude],
        turf.center({
          type: 'FeatureCollection',
          features: state.selectedFeatures.land,
        }).geometry.coordinates,
      ]);

      await Linking.openURL(link);
    } catch (error) {
      Alert.alert(
        'Navigation Error',
        'Unable to open Google Maps. Please ensure the app is installed or try again later.',
      );
    }
  };

  function navigateToCropForm(
    formName: 'differentCrop' | 'sameCrop',
    gpsAccuracy: string,
  ) {
    if (formName === 'differentCrop') {
      navigation.navigate('CropForm', {gpsAccuracy});
    } else {
      navigation.navigate('CropFormV3', {gpsAccuracy});
    }
  }

  async function validateLocationToOpenForm(
    currentLocation: ICordinates,
    formName: 'verificationForm',
    gpsAccuracy: number | null | undefined,
  ) {
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Validating your location...',
    });

    // console.log('surveyNumberPolygon', surveyNumberPolygon);
    // console.debug('simulatedCurrentLocation', simulatedCurrentLocation);
    // console.debug('offlineVillageDetail', auth.offlineVillage);
    let {isInside, polygon, errorMsg, warningMsg} =
      await isPointInsideTheSelectedLocation(
        state,
        isSimulatingTheLocation
          ? simulatedCurrentLocation || currentLocation
          : currentLocation,
      );
    console.debug('isInside > ', isInside);

    // if (!polygon) {
    //   // Alert.alert('Error', errorMsg);
    //   auth.closeLoader();
    //   return;
    // }

    if (!isInside) {
      let distance = await geo.distanceBetweenPolygonAndPoint(
        isSimulatingTheLocation
          ? simulatedCurrentLocation || currentLocation
          : currentLocation,
        polygon,
      );

      let distanceUnit = 'Km';

      // console.debug(
      //   'distance > ',
      //   distance,
      //   '; threshold > ',
      //   state.DISTANCE_ACCURACY_THRESHOLD,
      //   '; diff > ',
      //   Math.floor(distance * 100) / 100,
      // );

      if (
        Math.floor(distance * 100) / 100 <
        state.DISTANCE_ACCURACY_THRESHOLD
      ) {
        auth.closeLoader();

        navigation.navigate('VerificationDetail');
        // {
        //   props: {
        //     districtCode: state.selectedLocationData.district,
        //     villageCode: state.selectedLocationData.village,
        //     talukCode: state.selectedLocationData.taluk,
        //     surveyNumber: state.selectedLocationData.surveyNumber,
        //     subDivisionNumber: state.selectedLocationData.subDivision,
        //   },
        // }
        // navigateToCropForm(formName, (gpsAccuracy || -1).toString());
      } else {
        if (distance < 1) {
          distanceUnit = 'm';
          distance = distance * 1000;
        }
        Alert.alert(
          'You are not inside the selected location',
          `You are approximately ${
            Math.floor(distance * 100) / 100
          }  ${distanceUnit} away from the selected location`,
        );
        auth.closeLoader();
      }
    } else {
      auth.closeLoader();
      navigation.navigate('VerificationDetail');
    }
  }


function checkTimeWindow(): boolean {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 6 && hour < 18) {
    return true; // allowed
  } else {
    Alert.alert('Hold On','Access not allowed beyond time limit! (6 AM to 6 PM)');
    return false;
  }
}


  const handleForm = async (formName: 'verificationForm') => {
    // if( !state.selectedFeatures?.village[0]){
    //   Alert.alert("Warning!", 'Either FMB details or village boundary is not' +
    //     ' availabelee. Please refresh the app or contact the admin')
    //   return
    // }

    // if(!checkTimeWindow()){
    //   return;
    // }
    //auth.checkDeveloperOptionEnabled();
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Fetching your current location....',
    });
    let currentLocation = previousLocation;
    // let currentLocation = (await callWithTimeout(
    //   getCurrentLocation,
    //   10000,
    //   previousLocation,
    // )) as ICordinates | undefined;
    // console.debug('currentLocation > ', currentLocation);

    if (!currentLocation) {
      Alert.alert('Something went wrong', 'please check your gps settings');
      auth.closeLoader();
      return;
    } else {
      // ? check the accuracy of the gps sensor
      if (
        currentLocation?.accuracy &&
        currentLocation?.accuracy >= MAX_GPS_ACCURACY
      ) {
        // auth.closeLoader();
        Alert.alert(
          ln('Low Accuracy'),
          ln('LowAccuracyPopUpMsg')
            .replace('${accuracy}', currentLocation?.accuracy.toString())
            .replaceAll('${GPS_Accuracy}', MAX_GPS_ACCURACY.toString()),
          [
            {
              onPress: () =>
                validateLocationToOpenForm(
                  currentLocation as ICordinates,
                  formName,
                  currentLocation?.accuracy,
                ),
              text: ln('Okay'),
            },
            {
              text: ln('Cancel'),
              onPress: () => auth.closeLoader(),
            },
          ],
        );
        // throw new Error(`Accuracy is more than ${MAX_GPS_ACCURACY} mtr`);
        return;
      }

      validateLocationToOpenForm(
        currentLocation,
        formName,
        currentLocation?.accuracy,
      );
    }
    // const currentLocation = current;
    // const polygonFeature = state.selectedFeatures.land?.length > 0 ? state.selectedFeatures.land[0] : state.selectedFeatures.village[0];
  };

  const generateGoogleMapLink = (coordinates: number[][]) => {
    let link = 'https://www.google.com/maps/dir/?api=1&origin=';
    coordinates.forEach((coordinate, index) => {
      if (index === 0) {
        link += `${coordinate[1]},${coordinate[0]}`;
      } else {
        link += `&destination=${coordinate[1]},${coordinate[0]}`;
      }
    });
    return link;
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;
    state.handleSelectedFeature('land')([]);
    setSurveyNumberPolygon(null);
    // getGpsAccuracy();
  }, [isFocused]);

  // async function getGpsAccuracy() {
  //   return Number(await asyncStorage.getString('gpsAccuracy'));
  // }

  function handleMapViewOnPress(e: any) {
    if (enableLocationPicker) {
      handleSimulatedCurrentLocationChange?.(
        e.nativeEvent.coordinate.latitude,
        e.nativeEvent.coordinate.longitude,
      );
      setEnableLocationPicker(false);
    }
  }

  useEffect(() => {
    if (state.selectedFeatures.land?.length > 0) {
      changeRegion({
        latitude: state.selectedFeatures.land[0]?.properties?.centroid_latitude,
        longitude:
          state.selectedFeatures.land[0]?.properties?.centroid_longitude,
        ...zoomToDelta(
          state.selectedLocationData.surveyNumber ? ZOOM_LEVEL : -1,
        ),
      });
    }
  }, [state.selectedFeatures.land]);
  useEffect(() => {
    if (
      state.selectedFeatures.land?.length > 0 &&
      state.selectedLocationData.subDivisionNumber
    ) {
      const subDivisionBoundary = state.selectedFeatures.land.find(
        e =>
          e?.properties?.sub_division_number ==
          state.selectedLocationData?.subDivisionNumber,
      );
      changeRegion({
        latitude: subDivisionBoundary?.properties?.centroid_latitude,
        longitude: subDivisionBoundary?.properties?.centroid_longitude,
        ...zoomToDelta(
          state.selectedLocationData?.subDivisionNumber ? ZOOM_LEVEL : -1,
        ),
      });
    }
  }, [state.selectedLocationData.subDivisionNumber]);

  return (
    <>
      <MapView
        style={{flex: 1}}
        mapType={'satellite'}
        initialRegion={region}
        ref={mapRef}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsScale
        showsMyLocationButton={false}
        provider={PROVIDER_GOOGLE}
        userLocationFastestInterval={1000}
        userLocationPriority="high"
        onPress={handleMapViewOnPress}>
        {isSimulatingTheLocation ? (
          <Marker coordinate={simulatedCurrentLocation as any}>
            <Icon name="location-pin" color="red.500" as={Entypo} size="3xl" />
          </Marker>
        ) : null}
        {state.selectedFeatures.land?.length > 0 ? (
          <Geojson
            zIndex={107}
            strokeColor={'cyan'}
            strokeWidth={2}
            fillColor="transparent"
            geojson={{
              type: 'FeatureCollection',
              features: [...state.selectedFeatures.land],
            }}
          />
        ) : null}

        {state.selectedFeatures.land.length > 0 &&
        state.selectedFeatures.land.find(
          e =>
            e.properties.sub_division_number ==
            state.selectedLocationData.subDivisionNumber,
        ) ? (
          <Geojson
            zIndex={108}
            strokeColor={'magenta'}
            strokeWidth={3}
            fillColor="transparent"
            geojson={{
              type: 'FeatureCollection',
              features: [
                state.selectedFeatures.land.find(
                  e =>
                    e.properties.sub_division_number ==
                    state.selectedLocationData.subDivisionNumber,
                ),
              ],
              // features: [...state.selectedFeatures.land],
              // features: [
              //   {
              //     type: 'Feature',
              //     geometry: {
              //       type: 'Polygon',
              //       coordinates: [
              //         [
              //           [79.464158185, 12.765500296],
              //           [79.464113212, 12.765113206],
              //           [79.463792192, 12.765153042],
              //           [79.463404194, 12.765202307],
              //           [79.463481357, 12.765561051],
              //           [79.464158185, 12.765500296],
              //         ],
              //       ],
              //     },
              //     properties: {
              //       centroid_longitude: 79.46379273877155,
              //       centroid_latitude: 12.765342055941803,
              //       survey_number: '10',
              //       sub_division_number: '1',
              //       district_code: 731,
              //       taluk_code: 7059,
              //       village_code: 630747,
              //     },
              //   },
              // ],
            }}
          />
        ) : null}

        {state.selectedLocationData?.xyzTileLink &&
        auth.appMode === 'online' ? (
          <UrlTile
            zIndex={105}
            // urlTemplate={`http://ec2-13-235-45-34.ap-south-1.compute.amazonaws.com/xyz_tiles/578/5960/5785960640695/x{z}/{x}/{y}.png`}
            urlTemplate={`${state.selectedLocationData?.xyzTileLink}{z}/{x}/{y}.png`}
          />
        ) : null}

        {auth.appMode === 'offline' ? (
          <UrlTile
            zIndex={105}
            urlTemplate={`file:///data/data/org.tnega.payiraaivu/files/vectors/${state.selectedLocationData.district}${auth.offlineVillage?.talukCode}${auth.offlineVillage?.villageCode}/{z}/{x}/{y}.png`}
          />
        ) : null}

        {state.selectedFeatures.village ? (
          <Geojson
            strokeColor={'red'}
            strokeWidth={3}
            zIndex={106}
            fillColor="transparent"
            geojson={{
              type: 'FeatureCollection',
              features: state.selectedFeatures.village,
            }}
          />
        ) : null}
      </MapView>

      <Box position={'absolute'} bottom="0" w="full">
        <Row
          my="2"
          space={'2'}
          flexWrap="wrap"
          w="full"
          justifyContent={'center'}>
          <Button
            onPress={goToCurrentLocation}
            fontSize="xs"
            size="xs"
            leftIcon={<Icon as={MaterialIcons} name="my-location" size="sm" />}
          />
          <Button
            onPress={toggleMapType}
            fontSize="xs"
            size="xs"
            leftIcon={
              mapType === 'satellite' ? (
                <Icon as={MaterialIcons} name="map" size="sm" />
              ) : (
                <Icon as={Fontisto} name="map" size="sm" />
              )
            }></Button>

          {/* Full survey number form */}
          {/* {state.selectedLocationData.surveyNumber &&
          !state.selectedLocationData.subDivisionNumber &&
          auth.user.fullSurveyBtnEnable ? (
            <Button
              onPress={() => handleForm('sameCrop')}
              key="openFormBtn_sameCrop"
              fontSize={'xs'}
              size="xs"
              bg="white"
              borderColor={'secondary.600'}
              _pressed={{
                bg: 'white',
              }}
              leftIcon={
                <Icon
                  as={AntDesign}
                  color={'secondary.600'}
                  name="form"
                  size="sm"
                />
              }
            />
          ) : null} */}
          {state.selectedLocationData.subDivisionNumber ||
          state.selectedLocationData?.ownerDetails?.patta_number ? (
            <>
              <Button
                onPress={() => handleForm('verificationForm')}
                key="openFormBtn_differentCrop"
                fontSize={'xs'}
                size="xs"
                bg="secondary.600"
                leftIcon={<Icon as={AntDesign} name="form" size="sm" />}
              />
              {!state.error ? (
                <Button
                  onPress={() => navigateToGMap()}
                  key="findDirectionBtn"
                  size="xs"
                  leftIcon={
                    <Icon as={MaterialIcons} name="directions" size="sm" />
                  }
                />
              ) : null}
            </>
          ) : null}

          {/* {auth?.user?.role?.toLocaleLowerCase() === 'dev' ? (
            <Button
              onPress={() => {
                // Vibration.vibrate(50);
                if (isSimulatingTheLocation) {
                  resetSimulatedCurrentLocation();
                } else {
                  setEnableLocationPicker(e => !e);
                }
              }}
              key="simulateLocation"
              size="xs"
              bg={enableLocationPicker ? 'red.500' : 'warning.400'}>
              <Row>
                <Icon as={Entypo} name="location" size="sm" color="white" />
                <Text color="white">
                  {isSimulatingTheLocation
                    ? ln('ResetSimulation')
                    : ln('Simulate')}
                </Text>
              </Row>
            </Button>
          ) : null} */}

          {auth?.user.mode === 'dev' ? (
            <Button
              onPress={() => {
                // Vibration.vibrate(50);
                if (isSimulatingTheLocation) {
                  resetSimulatedCurrentLocation();
                } else {
                  setEnableLocationPicker(e => !e);
                }
              }}
              key="simulateLocation"
              size="xs"
              bg={enableLocationPicker ? 'red.500' : 'warning.400'}>
              <Row>
                <Icon as={Entypo} name="location" size="sm" color="white" />
                <Text color="white">
                  {isSimulatingTheLocation
                    ? ln('ResetSimulation')
                    : ln('Simulate')}
                </Text>
              </Row>
            </Button>
          ) : (
            <></>
          )}
        </Row>
        <FarmerDetailsCard />
      </Box>
    </>
  );
};

export default MapWithPolygon;
