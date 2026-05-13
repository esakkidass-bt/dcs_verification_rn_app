// import {Box, Button, Icon, Row, Text} from 'native-base';
// import React, {useCallback, useEffect, useRef, useState} from 'react';
// import MapView, {
//   Geojson,
//   Marker,
//   PROVIDER_DEFAULT,
//   UrlTile,
// } from 'react-native-maps';
// import {geo} from '../../../../helpers';
// import {navigation} from '../../../../routers/navigation';
// import {ICordinates, IRegion} from '../../../../@types/geoJson';
// import api from '../../../../api';
// import {useAuth, useLocation, useStateContext} from '../../../../hooks';
// import {Alert, Dimensions, Linking, Platform, Vibration} from 'react-native';
// import * as turf from '@turf/turf';
// import {FeatureCollection} from '@turf/turf';

// import AntDesign from 'react-native-vector-icons/AntDesign';
// import Entypo from 'react-native-vector-icons/Entypo';
// import Fontisto from 'react-native-vector-icons/Fontisto';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import {FarmerDetailsCard} from '../../../../components';
// import {useIsFocused} from '@react-navigation/native';
// import useDict from '../../../../hooks/useDict';
// import {isPointInsideTheSelectedLocation} from '../../../../helpers/geo/isPointInsideTheSelectedLocation';
// import {combineSubDivisionNumbers} from '../../../../helpers/geo/combineSubDivisions';
// import {asyncStorage} from '../../../../helpers/asyncStorage';
// import {VillageDetail} from '../../../../@types';

// const screenWidth = Dimensions.get('window').width;
// const screenHeight = Dimensions.get('window').height;

// const ZOOM_LEVEL = -2.2;
// const C_LATITUDE_DELTA = 0.01 * (screenHeight / screenWidth);
// const C_LONGITUDE_DELTA = 0.01;
// const C_CHENNAI_LOCATION = {
//   latitude: 13.0534937035,
//   longitude: 80.2496374771,
// };

// interface IScreenState {
//   villages: any[];
// }

// const MapWithPolygon = () => {
//   const state = useStateContext();
//   const auth = useAuth();
//   const ln = useDict();
//   const {
//     getCurrentLocation,
//     handleSimulatedCurrentLocationChange,
//     resetSimulatedCurrentLocation,
//     simulatedCurrentLocation,
//     isSimulatingTheLocation,
//     previousLocation,
//   } = useLocation();

//   const FALL_BACK_ACCURACY = 30;

//   const [surveyNumberPolygon, setSurveyNumberPolygon] = useState<any | null>(
//     null,
//   );
//   const [MAX_GPS_ACCURACY, setMAX_GPS_ACCURACY] = useState(FALL_BACK_ACCURACY);
//   const [enableLocationPicker, setEnableLocationPicker] = useState(false);
//   const [showLabels, setShowLabels] = useState(false);
//   const [, setUrlTemplate] = useState<string | null>(null);
//   const [screenState, setScreenState] = useState({} as IScreenState);

//   function handleScreenState<T extends keyof IScreenState>(
//     key: T,
//     value: IScreenState[T],
//   ) {
//     setScreenState(prevState => {
//       return {...prevState, [key]: value};
//     });
//   }

//   // const getVillages = async (talukCode: string) => {
//   //   // await api.local.villages.getVillages({
//   //   //   callback: e => handleScreenState('villages', e),
//   //   //   talukCode,
//   //   // });
//   //   //

//   // };

//   const getVillages = useCallback(
//     async (
//       talukCode: string,
//       callback: (
//         e: {
//           villageCode: string;
//           villageName: string;
//           parentVillageCode: string;
//           talukCode: string;
//         }[],
//       ) => void,
//     ) => {
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
//     },
//     [],
//   );

//   useEffect(() => {
//     getVillages(state.selectedLocationData.taluk, e =>
//       handleScreenState('villages', e),
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.selectedLocationData.taluk]);
//   // const [cropFormType, setCropFormType] = useState<'diffrentCrop'|'sameCrop'>('diffrentCrop')

//   function toggleShowLabels() {
//     setShowLabels(prev => !prev);
//   }

//   const [mapType, setMapType] = useState<'satellite' | 'standard'>('satellite');

//   const region: IRegion = {
//     ...C_CHENNAI_LOCATION,
//     latitudeDelta: C_LATITUDE_DELTA,
//     longitudeDelta: C_LONGITUDE_DELTA,
//   };

//   const [geoJsonFeaturesInBBox, setGeoJsonFeaturesInBBox] = useState<any[]>([]); // features

//   const toggleMapType = () => {
//     setMapType(prevVal => {
//       return prevVal === 'satellite' ? 'standard' : 'satellite';
//     });
//   };

//   const mapRef = useRef<MapView>(null);

//   const changeRegion = (newRegion: IRegion) => {
//     mapRef.current?.animateToRegion(newRegion, 500);
//   };

//   // find that i am inside the geojson polygon or not

//   const goToCurrentLocation = async () => {
//     getCurrentLocation(currentLocation =>
//       changeRegion({...currentLocation, ...zoomToDelta(-1)}),
//     );
//   };

//   // convert zoom value to latitude and longitude delta
//   const zoomToDelta = (zoom: number) => {
//     const latitudeDelta = C_LATITUDE_DELTA * Math.pow(2, zoom);
//     const longitudeDelta = C_LONGITUDE_DELTA * Math.pow(2, zoom);
//     return {latitudeDelta, longitudeDelta};
//   };

//   // convert latitude and longitude delta to zoom value
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const deltaToZoom = (latitudeDelta: number, longitudeDelta: number) => {
//     const zoom = Math.log(C_LATITUDE_DELTA / latitudeDelta) / Math.log(2);
//     return zoom * -1;
//   };

//   const handleRegionChangeComplete = async (props: IRegion) => {
//     // const boundBox = getBoundBox(props);
//     const boundBox = await mapRef.current?.getMapBoundaries();

//     const zoom = deltaToZoom(props.latitudeDelta, props.longitudeDelta);
//     if (zoom < ZOOM_LEVEL + 0.1) {
//       if (!boundBox) return;
//       // getGeoJsonForBoundBox(boundBox);
//     } else {
//       setGeoJsonFeaturesInBBox([]);
//     }
//   };

//   async function validateLocaioinToOpenForm(
//     currentLocation: ICordinates,
//     formName: 'differentCrop' | 'sameCrop',
//     gpsAccuracy: number | null | undefined,
//   ) {
//     auth.updateLoaderStatus({
//       isLoading: true,
//       loadingText: 'Validating your location...',
//     });
//     let isInside = await isPointInsideTheSelectedLocation(
//       surveyNumberPolygon,
//       state,
//       currentLocation,
//     );
//     console.debug('isInside > ', isInside);
//     if (!isInside) {
//       let polygon: any;
//       // const isSubDivisionNumberPresent = state.selectedFeatures.land?.find(e=>e.sub_division_number===null)

//       // (state.selectedFeatures.land[0].properties.survey_number === null
//       //   ? state.selectedFeatures.land[0]
//       //   : await combineSubDivisionNumbers(state.selectedFeatures.land).then(e => e.features[0]))

//       polygon =
//         state.selectedFeatures.land?.length > 0
//           ? surveyNumberPolygon
//             ? surveyNumberPolygon
//             : state.selectedFeatures?.village[0]
//           : state.selectedFeatures?.village[0];

//       if (!polygon) {
//         Alert.alert('No spatial data found');
//         auth.closeLoader();
//         return;
//       }
//       let distance = await geo.distanceBetweenPolygonAndPoint(
//         currentLocation,
//         polygon,
//       );

//       let distanceUnit = 'Km';

//       console.debug(
//         'distance > ',
//         distance,
//         '; threshold > ',
//         state.DISTANCE_ACCURACY_THRESHOLD,
//         '; diff > ',
//         Math.floor(distance * 100) / 100,
//       );

//       if (
//         Math.floor(distance * 100) / 100 <
//         state.DISTANCE_ACCURACY_THRESHOLD
//       ) {
//         auth.closeLoader();
//         navigateToCropForm(formName, (gpsAccuracy || -1).toString());
//       } else {
//         if (distance < 1) {
//           distanceUnit = 'm';
//           distance = distance * 1000;
//         }
//         Alert.alert(
//           'You are not inside the selected location',
//           `You are approximately ${
//             Math.floor(distance * 100) / 100
//           } ${distanceUnit} away from the selected location`,
//         );

//         auth.closeLoader();
//       }
//     } else {
//       auth.closeLoader();
//       navigateToCropForm(formName, (gpsAccuracy || -1).toString());
//     }
//   }

//   const handleForm = async (formName: 'differentCrop' | 'sameCrop') => {
//     // if( !state.selectedFeatures?.village[0]){
//     //   Alert.alert("Warning!", 'Either FMB details or village boundary is not' +
//     //     ' availabelee. Please refresh the app or contact the admin')
//     //   return
//     // }

//     auth.updateLoaderStatus({
//       isLoading: true,
//       loadingText: 'Fetching your current location....',
//     });
//     let currentLocation = previousLocation;
//     // let currentLocation = (await callWithTimeout(
//     //   getCurrentLocation,
//     //   10000,
//     //   previousLocation,
//     // )) as ICordinates | undefined;
//     console.debug('currentLocation > ', currentLocation);

//     if (!currentLocation) {
//       Alert.alert('Something went wrong', 'please check your gps settings');
//       auth.closeLoader();
//       return;
//     } else {
//       // ? check the accuracy of the gps sensor
//       if (
//         currentLocation?.accuracy &&
//         currentLocation?.accuracy >= MAX_GPS_ACCURACY
//       ) {
//         // auth.closeLoader();
//         Alert.alert(
//           ln('Low Accuracy'),
//           ln('LowAccuracyPopUpMsg')
//             .replace('${accuracy}', currentLocation?.accuracy.toString())
//             .replaceAll('${GPS_Accuracy}', MAX_GPS_ACCURACY.toString()),
//           [
//             {
//               onPress: () =>
//                 validateLocaioinToOpenForm(
//                   currentLocation as ICordinates,
//                   formName,
//                   currentLocation?.accuracy,
//                 ),
//               text: ln('Okay'),
//             },
//             {
//               text: ln('Cancel'),
//               onPress: () => auth.closeLoader(),
//             },
//           ],
//         );
//         // throw new Error(`Accuracy is more than ${MAX_GPS_ACCURACY} mtr`);
//         return;
//       }

//       validateLocaioinToOpenForm(
//         currentLocation,
//         formName,
//         currentLocation?.accuracy,
//       );
//     }
//     // const currentLocation = current;
//     // const polygonFeature = state.selectedFeatures.land?.length > 0 ? state.selectedFeatures.land[0] : state.selectedFeatures.village[0];
//   };

//   function navigateToCropForm(
//     formName: 'differentCrop' | 'sameCrop',
//     gpsAccuracy: string,
//   ) {
//     if (formName === 'differentCrop') {
//       navigation.navigate('CropForm', {gpsAccuracy});
//     } else {
//       navigation.navigate('CropFormV3', {gpsAccuracy});
//     }
//     // Alert.alert("Choose Form Type", "Which form do you need to use to" + " capture the data", [{
//     //   text: "Cancel", style: 'destructive'
//     // }, {
//     //   text: "Different Crops", onPress: () => navigation.navigate('CropForm')
//     // }, {
//     //   text: "Same Crop", onPress: () => navigation.navigate('CropFormV2')
//     // },], {cancelable: true})
//   }

//   // const getGeoJsonForBoundBox = async (boundBox: BoundBoxProps) => {
//   //   auth.updateLoaderStatus({
//   //     isLoading: true,
//   //     loadingText: 'Fetching GeoJSON...',
//   //   });
//   //   try {
//   //     await api.local.landDetails.readByBoundary({
//   //       districtCode: state.selectedLocationData.district,
//   //       talukCode: state.selectedLocationData.taluk,
//   //       villageCode: state.selectedLocationData.village,
//   //       boundBox,
//   //       callback: async res => {
//   //         if (res?.length === 0) {
//   //           // Alert.alert(
//   //           //   "Data not found",
//   //           //   "No data found for the selected location"
//   //           // );
//   //           //
//   //         } else {
//   //           await setGeoJsonFeaturesInBBox(res);
//   //         }
//   //       },
//   //     });
//   //   } catch (error) {
//   //     console.error(
//   //       'Error fetching >getGeoJsonForBoundBoxFunction features: ',
//   //       error,
//   //     );
//   //     // handle error
//   //   } finally {
//   //     await await auth.closeLoader();
//   //   }
//   // };

//   const locateToVillage = async () => {
//     const region = {
//       latitude: Number(state.selectedLocationData.villageLat),
//       longitude: Number(state.selectedLocationData.villageLon),
//       ...zoomToDelta(1),
//     };
//     mapRef.current?.animateToRegion({...region} as IRegion, 500);
//   };
//   // const getSelectedLandGeoJsonFeature = async () => {
//   //   auth.updateLoaderStatus({
//   //     isLoading: true,
//   //     loadingText: 'Fetching land data...',
//   //   });
//   //   try {
//   //     await api.local.landDetails.read({
//   //       districtCode: state.selectedLocationData.district,
//   //       talukCode: state.selectedLocationData.taluk,
//   //       villageCode: state.selectedLocationData.village,
//   //       surveyNumber: state.selectedLocationData.surveyNumber,
//   //       callback: async res => {
//   //         if (res?.length === 0) {
//   //           // Alert.alert(
//   //           //   "Data not found",
//   //           //   "No data found for the selected location. Refresh the data or please contact admin"
//   //           // );
//   //           state.setError(
//   //             ln(
//   //               'Survey and Sub Division Polygon not found but you can continue to survey inside the village',
//   //             ),
//   //           );

//   //           auth.closeLoader();
//   //           return;
//   //         } else {
//   //           console.debug('getSelectedLandGeoJsonFeature > ', {
//   //             districtCode: state.selectedLocationData.district,
//   //             talukCode: state.selectedLocationData.taluk,
//   //             villageCode: state.selectedLocationData.village,
//   //             surveyNumber: state.selectedLocationData.surveyNumber,
//   //           });
//   //           // console.debug(await combineSubDivisionNumbers(res))
//   //           // const d = res?.filter(e=>e.properties?.sub_division_number!==null)
//   //           const isSubDivisionNumberPresent = res?.find(
//   //             e => e.properties?.sub_division_number === null,
//   //           );
//   //           if (isSubDivisionNumberPresent) {
//   //             setSurveyNumberPolygon(isSubDivisionNumberPresent);
//   //             console.debug(
//   //               '>setSurveyNumberPolygon',
//   //               isSubDivisionNumberPresent,
//   //             );
//   //           } else {
//   //             const _polygons = res.map(
//   //               multiPolygon => turf.flatten(multiPolygon).features,
//   //             );

//   //             // Flatten the array of arrays into a single array
//   //             const flatPolygons = _polygons.flat();
//   //             setSurveyNumberPolygon(
//   //               await combineSubDivisionNumbers(flatPolygons),
//   //             );
//   //             console.debug(
//   //               '>setSurveyNumberPolygon',
//   //               combineSubDivisionNumbers(flatPolygons),
//   //             );
//   //           }

//   //           console.debug('land records > ', res?.length);
//   //           state.handleSelectedFeature('land')(res); // feature
//   //           // console.debug(JSON.stringify(res))
//   //           state.setError(null);
//   //         }
//   //         // const center = await turf.center({
//   //         //   type: "FeatureCollection",
//   //         //   features: res,
//   //         // }).geometry.coordinates;
//   //         changeRegion({
//   //           latitude: res[0]?.properties?.centroid_latitude,
//   //           longitude: res[0]?.properties?.centroid_longitude,
//   //           ...zoomToDelta(
//   //             state.selectedLocationData.surveyNumber ? ZOOM_LEVEL : -1,
//   //           ),
//   //         });
//   //         // if (res?.length > 0) {
//   //         //   state.handleSelectedFeature("land")(res); // feature
//   //         // }else{
//   //         // }
//   //         auth.closeLoader();
//   //       },
//   //     });
//   //   } catch (error) {
//   //     console.error(
//   //       'Error fetching getSelectedLandGeoJsonFeature features: ',
//   //       error,
//   //     );
//   //     // handle error
//   //   } finally {
//   //   }
//   // };

//   // generate link to redirect to google maps for navigation from point to point
//   const generateGoogleMapLink = (coordinates: number[][]) => {
//     let link = 'https://www.google.com/maps/dir/?api=1&origin=';
//     coordinates.forEach((coordinate, index) => {
//       if (index === 0) {
//         link += `${coordinate[1]},${coordinate[0]}`;
//       } else {
//         link += `&destination=${coordinate[1]},${coordinate[0]}`;
//       }
//     });
//     return link;
//   };

//   // redirect to google maps with generateGoogleMapLink function by using current location and region
//   const navigateToGMap = async () => {
//     // const {latitude, longitude} = await getCurrentLocation();
//     const link = generateGoogleMapLink([
//       [previousLocation?.longitude, previousLocation?.latitude],
//       turf.center({
//         type: 'FeatureCollection',
//         features: state.selectedFeatures.land,
//       }).geometry.coordinates,
//     ]);

//     //! open google map app in android
//     if (Platform.OS === 'android') {
//       Linking.openURL(link);
//     }
//     //! open google map app in ios
//     else {
//       Linking.openURL(link);
//     }
//   };

//   useEffect(() => {
//     locateToVillage();
//     // getParentVillageCode(state.selectedLocationData.village)

//     if (
//       state.selectedLocationData.village === '' ||
//       !state.selectedLocationData.village
//     )
//       return;

//     state.handleSelectedFeature('land')([]);
//     // // getParentVillageCode(state.selectedLocationData.village)
//     // state.handleSelectedFeature('land')([]);
//     // console.log(
//     //   'state.selectedLocationData.village',
//     //   state.selectedLocationData.village,
//     // );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.selectedLocationData.village]);

//   useEffect(() => {
//     // if(!state.selectedLocationData.parentVillageCode) return

//     setUrlTemplate(
//       `/data/data/org.tnega.cropsurvey/files/vectors/${state.selectedLocationData.district}${state.selectedLocationData.taluk}${state.selectedLocationData.parentVillageCode}/{z}/{x}/{y}.png`,
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.selectedLocationData.parentVillageCode]);

//   useEffect(() => {
//     setSurveyNumberPolygon(null);
//     if (
//       (state.selectedLocationData.subDivisionNumber ||
//         state.selectedLocationData.subDivisionNumber === '') &&
//       state.selectedLocationData.surveyNumber
//     ) {
//       // getSelectedLandGeoJsonFeature().then(async () => {
//       //   auth.closeLoader();
//       // });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.selectedLocationData.surveyNumber]);
//   useEffect(() => {
//     if (state.selectedLocationData.subDivisionNumber === null) return;
//     let polygon =
//       state.selectedFeatures.land.length > 0
//         ? state.selectedFeatures.land?.find(
//             e =>
//               e.properties.sub_division_number ==
//               state.selectedLocationData.subDivisionNumber,
//           )
//         : null;
//     if (polygon) {
//       changeRegion({
//         latitude: polygon?.properties?.centroid_latitude,
//         longitude: polygon?.properties?.centroid_longitude,
//         ...zoomToDelta(
//           state.selectedLocationData.subDivisionNumber ? ZOOM_LEVEL : -1,
//         ),
//       });
//       // const center = turf.centroid(turf.points(polygon.coordinates))
//       // changeRegion({
//       // 	latitude: center.geometry.coordinates[0],
//       // 	longitude: center.geometry.coordinates[1],
//       // 	...zoomToDelta(-1)
//       // })
//     }
//     // if ((state.selectedLocationData.subDivisionNumber || state.selectedLocationData.subDivisionNumber === "") && state.selectedLocationData.surveyNumber) {
//     // 	getSelectedLandGeoJsonFeature().then(async () => {
//     // 		auth.closeLoader();
//     // 	});
//     // }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.selectedLocationData.subDivisionNumber]);

//   async function getGpsAccuracy() {
//     return Number(await asyncStorage.getString('gpsAccuracy'));
//   }

//   const isFocused = useIsFocused();
//   useEffect(() => {
//     if (!isFocused) return;
//     state.handleSelectedFeature('land')([]);
//     setSurveyNumberPolygon(null);
//     getGpsAccuracy();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isFocused]);

//   function handleMapViewOnPress(e: any) {
//     if (enableLocationPicker) {
//       handleSimulatedCurrentLocationChange?.(
//         e.nativeEvent.coordinate.latitude,
//         e.nativeEvent.coordinate.longitude,
//       );
//       setEnableLocationPicker(false);
//     }
//   }

//   // const r = `/data/data/org.tnega.cropsurvey/files/vectors/${state.selectedLocationData.district}${state.selectedLocationData.taluk}${state.selectedLocationData.parentVillageCode}/{z}/{x}/{y}.png`;

//   return (
//     <>
//       <MapView
//         style={{flex: 1}}
//         initialRegion={region}
//         ref={mapRef}
//         onRegionChangeComplete={handleRegionChangeComplete}
//         showsUserLocation
//         showsScale
//         showsMyLocationButton={false}
//         provider={PROVIDER_DEFAULT}
//         mapType={mapType}
//         userLocationFastestInterval={1000}
//         userLocationPriority="high"
//         // mapType={'none'}
//         onPress={handleMapViewOnPress}>
//         {/* {screenState?.villages?.length > 0
//           ? screenState?.villages?.map(village => {
//               return [village.parentVillageCode, village.villageCode]?.includes(
//                 state.selectedLocationData.parentVillageCode,
//               ) ? (
//                 <UrlTile
//                   zIndex={105}
//                   key={village.parentVillageCode}
//                   urlTemplate={`file:///data/data/org.tnega.cropsurvey/files/vectors/${state.selectedLocationData.district}${state.selectedLocationData.taluk}${village.villageCode}/{z}/{x}/{y}.png`}
//                 />
//               ) : null;
//             })
//           : null} */}

//         {/*{state.selectedLocationData.district && state.selectedLocationData.taluk && state.selectedLocationData.village ? (*/}
//         {/*  <UrlTile zIndex={105}*/}
//         {/*           urlTemplate={`file:///data/data/org.tnega.cropsurvey/files/vectors/5895694628760/{z}/{x}/{y}.png`}/>) : null}*/}
//         {isSimulatingTheLocation ? (
//           <Marker coordinate={simulatedCurrentLocation as any}>
//             <Icon name="location-pin" color="red.500" as={Entypo} size="3xl" />
//           </Marker>
//         ) : null}

//         {state.selectedFeatures.land?.length > 0 ? (
//           <Geojson
//             zIndex={107}
//             strokeColor={'cyan'}
//             strokeWidth={2}
//             fillColor="transparent"
//             // geojson={surveyNumberPolygon as any}
//             // geojson={{
//             //   type: "FeatureCollection",
//             //   features: [surveyNumberPolygon as any],
//             // }}
//             geojson={{
//               type: 'FeatureCollection',
//               features: [...state.selectedFeatures.land],
//             }}
//           />
//         ) : null}

//         {/*{state.selectedLocationData.subDivisionNumber ? (<Geojson*/}

//         {state.selectedFeatures.land.length > 0 &&
//         state.selectedFeatures.land.find(
//           e =>
//             e.properties.sub_division_number ==
//             state.selectedLocationData.subDivisionNumber,
//         ) ? (
//           <Geojson
//             zIndex={108}
//             strokeColor={'magenta'}
//             strokeWidth={3}
//             fillColor="transparent"
//             geojson={{
//               type: 'FeatureCollection', // features: [...state.selectedFeatures.land],
//               features: [
//                 state.selectedFeatures.land.find(
//                   e =>
//                     e.properties.sub_division_number ==
//                     state.selectedLocationData.subDivisionNumber,
//                 ) || {
//                   type: 'Feature',
//                   geometry: {
//                     type: 'Polygon',
//                     coordinates: [],
//                   },
//                 },
//               ],
//             }}
//           />
//         ) : null}
//         {state.selectedFeatures.village ? (
//           <Geojson
//             strokeColor={'red'}
//             strokeWidth={3}
//             zIndex={106}
//             fillColor="transparent"
//             geojson={{
//               type: 'FeatureCollection',
//               features: [...state.selectedFeatures.village],
//             }}
//           />
//         ) : null}
//         {geoJsonFeaturesInBBox.length > 0 && showLabels
//           ? geoJsonFeaturesInBBox?.map((feature, idx) => {
//               return (
//                 <React.Fragment key={idx}>
//                   <Geojson
//                     zIndex={-1}
//                     strokeColor={'yellow'}
//                     strokeWidth={2}
//                     fillColor="transparent"
//                     markerComponent={<Text>d</Text>}
//                     key={idx}
//                     geojson={{
//                       type: 'FeatureCollection',
//                       features: [feature],
//                     }}
//                   />
//                 </React.Fragment>
//               );
//             })
//           : null}
//         {geoJsonFeaturesInBBox.length > 0 && showLabels
//           ? geoJsonFeaturesInBBox?.map((feature, idx) => {
//               return (
//                 <React.Fragment key={idx}>
//                   <Marker
//                     coordinate={{
//                       latitude: feature.properties.centroid_latitude,
//                       longitude: feature.properties.centroid_longitude,
//                     }}>
//                     <Text
//                       color="white"
//                       p="0.5"
//                       py="0"
//                       bg="red.400"
//                       fontSize={'xs'}>
//                       {feature?.properties?.survey_number}
//                       {feature?.properties?.sub_division_number
//                         ? `/${feature?.properties?.sub_division_number}`
//                         : ''}
//                     </Text>
//                   </Marker>
//                 </React.Fragment>
//               );
//             })
//           : null}

//         {/* {config.env === "dev" ? (
//           <Marker
//             coordinate={{
//               latitude: current.latitude,
//               longitude: current.longitude,
//             }}
//           >
//             <Text p="2" bg="red.500">
//               here
//             </Text>
//           </Marker>
//         ) : null} */}
//       </MapView>

//       {/*<Modal isOpen bg={'white'} p={'2'} h={'2/6'} w={'5/6'} >*/}
//       {/*  <Button>Crop form 1</Button>*/}
//       {/*</Modal>*/}

//       <Box position={'absolute'} bottom="0" w="full">
//         {/*{*/}
//         {/*  state.selectedLocationData.surveyNumber?*/}
//         {/*  <Box bg={'white'} px={'2'} py={'1'}>*/}
//         {/*  <Row alignItems={'center'} space={'2'}>*/}
//         {/*    <Checkbox value={'croppingType'}*/}
//         {/*              onChange={e => setCropFormType(e ? "sameCrop" : 'diffrentCrop')}*/}
//         {/*              accessibilityLabel="Checkbox for choosing crop type"/>*/}
//         {/*    <Text>By selecting the checkbox, you are agreeing to redirect to the*/}
//         {/*      same crop survey form</Text>*/}
//         {/*  </Row>*/}
//         {/*</Box>:null}*/}

//         {/* //? bottom actions */}
//         <Row
//           my="2"
//           space={'2'}
//           flexWrap="wrap"
//           w="full"
//           justifyContent={'center'}>
//           <Button
//             onPress={goToCurrentLocation}
//             fontSize="xs"
//             size="xs"
//             leftIcon={<Icon as={MaterialIcons} name="my-location" size="sm" />}
//           />
//           <Button
//             onPress={toggleMapType}
//             fontSize="xs"
//             size="xs"
//             leftIcon={
//               mapType === 'satellite' ? (
//                 <Icon as={MaterialIcons} name="map" size="sm" />
//               ) : (
//                 <Icon as={Fontisto} name="map" size="sm" />
//               )
//             }></Button>
//           {state.selectedLocationData.surveyNumber &&
//           !state.selectedLocationData.subDivisionNumber ? (
//             <Button
//               onPress={() => handleForm('sameCrop')}
//               key="openFormBtn"
//               fontSize={'xs'}
//               size="xs"
//               bg="white"
//               borderColor={'secondary.600'}
//               _pressed={{
//                 bg: 'white',
//               }}
//               leftIcon={
//                 <Icon
//                   as={AntDesign}
//                   color={'secondary.600'}
//                   name="form"
//                   size="sm"
//                 />
//               }
//             />
//           ) : null}
//           {(state.selectedLocationData.subDivisionNumber ||
//             state.selectedLocationData.subDivisionNumber === '') &&
//           state.selectedLocationData?.ownerDetails?.patta_number ? (
//             <>
//               <Button
//                 onPress={() => handleForm('differentCrop')}
//                 key="openFormBtn"
//                 fontSize={'xs'}
//                 size="xs"
//                 bg="secondary.600"
//                 leftIcon={<Icon as={AntDesign} name="form" size="sm" />}
//               />
//               {!state.error ? (
//                 <Button
//                   onPress={() => navigateToGMap()}
//                   key="findDirectionBtn"
//                   size="xs"
//                   leftIcon={
//                     <Icon as={MaterialIcons} name="directions" size="sm" />
//                   }
//                 />
//               ) : null}
//             </>
//           ) : null}

//           {auth?.user?.role?.toLocaleLowerCase() === 'dev' ? (
//             <>
//               {geoJsonFeaturesInBBox.length > 0 ? (
//                 <Button
//                   onPress={toggleShowLabels}
//                   key="markerLabelBtn"
//                   size="xs"
//                   leftIcon={
//                     <Icon
//                       as={MaterialCommunityIcons}
//                       name={
//                         showLabels
//                           ? 'map-marker-off-outline'
//                           : 'map-marker-outline'
//                       }
//                       size="sm"
//                     />
//                   }
//                 />
//               ) : null}
//               <Button
//                 onPress={() => {
//                   Vibration.vibrate(50);
//                   if (isSimulatingTheLocation) {
//                     resetSimulatedCurrentLocation();
//                   } else {
//                     setEnableLocationPicker(e => !e);
//                   }
//                 }}
//                 key="simulateLocation"
//                 size="xs"
//                 bg={enableLocationPicker ? 'red.500' : 'warning.400'}>
//                 <Row>
//                   <Icon as={Entypo} name="location" size="sm" color="white" />
//                   <Text color="white">
//                     {isSimulatingTheLocation
//                       ? ln('ResetSimulation')
//                       : ln('Simulate')}
//                   </Text>
//                 </Row>
//               </Button>
//             </>
//           ) : null}
//         </Row>
//         <FarmerDetailsCard />
//       </Box>
//     </>
//   );
// };

// export default MapWithPolygon;
