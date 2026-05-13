// import React, {useEffect, useState, useCallback} from 'react';
// import {Dimensions, Platform, ActivityIndicator} from 'react-native';
// import {Camera, Came, useCameraDevice} from 'react-native-vision-camera';

// import ImageManipulator from 'react-native-image-resizer';
// import RNFS from 'react-native-fs';
// import {Box, Image, Row, Text, Pressable, Icon, Center} from 'native-base';

// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import {navigation} from '../../routers/navigation';
// import {generateUniqueValue} from '../../helpers';
// import {useAuth, useGyroscope, useLocation} from '../../hooks';
// import {colors} from '../../styles';
// import useDict from '../../hooks/useDict';
// import {requestCameraPermission} from '../../helpers/permissions';

// const CameraPreview = (props: {
//   photo: any;
//   isLoading: boolean;
//   onCancel: () => void;
//   savePhoto: () => void;
// }) => {
//   const ln = useDict();
//   return !props.isLoading ? (
//     <Box flex="1" position="relative">
//       <Image
//         source={{uri: props?.photo && props.photo.uri}}
//         flex="1"
//         alt="Camera preview"
//       />

//       <Row
//         position="absolute"
//         bottom="8"
//         w="full"
//         space="8"
//         flex="1"
//         justifyContent="center"
//         alignItems="center">
//         <Box bg="red.600" w="16" h="16" borderRadius="full" overflow="hidden">
//           <Pressable
//             flex="1"
//             onPress={props.onCancel}
//             isDisabled={props.isLoading}
//             _pressed={{opacity: 0.7, bg: 'red.500'}}>
//             <Box flex="1" justifyContent="center" alignItems="center">
//               <Text color="white" bold>
//                 {ln('Cancel')}
//               </Text>
//             </Box>
//           </Pressable>
//         </Box>
//         <Box bg="green.600" w="16" h="16" borderRadius="full" overflow="hidden">
//           <Pressable
//             flex="1"
//             onPress={props.savePhoto}
//             isDisabled={props.isLoading}
//             _pressed={{bg: 'green.500', opacity: 0.7}}>
//             <Box flex="1" justifyContent="center" alignItems="center">
//               <Text color="white" bold>
//                 {ln('Okay')}
//               </Text>
//             </Box>
//           </Pressable>
//         </Box>
//       </Row>
//     </Box>
//   ) : (
//     <Box flex="1" justifyContent="center" alignItems="center">
//       <Center>
//         <ActivityIndicator size="large" color={colors.primary['600']} />
//         <Text color="white">{ln('Compressing and saving image')}...</Text>
//       </Center>
//     </Box>
//   );
// };

// const Index = ({route}: any) => {
//   const {onCapture} = route.params;
//   const {deviceId, user} = useAuth();
//   // const {selectedFeatures, DISTANCE_ACCURACY_THRESHOLD} = useStateContext();
//   const {getCurrentLocation} = useLocation();
//   const gyroData = useGyroscope();
//   const [isLoading, setIsLoading] = useState(false);
//   const [imgData, setImgData] = useState({
//     x: 0,
//     y: 0,
//     z: 0,
//     timestamp: null,
//     lat: null,
//     lon: null,
//   });

//   const device = useCameraDevice('back');

//   const handleImgData = useCallback(
//     (key: any) => (value: any) => {
//       setImgData(prevData => ({...prevData, [key]: value}));
//     },
//     [],
//   );

//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [capturedImage, setCapturedImage] = useState<any>(null);
//   const [camera, setCamera] = useState<any>(null);

//   const [imagePadding, setImagePadding] = useState(0);
//   const [ratio, setRatio] = useState('4:3');
//   const {height, width} = Dimensions.get('window');
//   const screenRatio = height / width;
//   const [isRatioSet, setIsRatioSet] = useState(false);

//   const prepareRatio = useCallback(async () => {
//     let desiredRatio = '4:3';
//     if (Platform.OS === 'android') {
//       const ratios = await camera.getSupportedRatiosAsync();
//       let distances: any = {};
//       let realRatios: any = {};
//       let minDistance: any = null;

//       for (const ratio of ratios) {
//         const parts = ratio.split(':');
//         const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
//         realRatios[ratio] = realRatio;
//         const distance = screenRatio - realRatio;
//         distances[ratio] = realRatio;

//         if (minDistance == null) {
//           minDistance = ratio;
//         } else {
//           if (distance >= 0 && distance < distances[minDistance]) {
//             minDistance = ratio;
//           }
//         }
//       }

//       desiredRatio = minDistance;
//       const remainder = Math.floor(
//         (height - realRatios[desiredRatio] * width) / 2,
//       );

//       setImagePadding(remainder);
//       setRatio(desiredRatio);
//       setIsRatioSet(true);
//     }
//   }, [camera, screenRatio, height, width]);

//   const setCameraReady = useCallback(async () => {
//     if (!isRatioSet) {
//       await prepareRatio();
//     }
//   }, [isRatioSet, prepareRatio]);

//   // const validateLocation = useCallback(
//   //   async (location: ICordinates) => {
//   //     // const polygonFeature =
//   //     //   selectedFeatures.land?.length > 0
//   //     //     ? selectedFeatures.land[0]
//   //     //     : selectedFeatures.village[0];

//   //     let polygonFeature =
//   //       selectedFeatures.land?.length > 0
//   //         ? selectedFeatures.land[0].properties.survey_number === null
//   //           ? selectedFeatures.land[0]
//   //           : await combineSubDivisionNumbers(selectedFeatures.land)
//   //         : selectedFeatures.village[0];

//   //     let isInside = await geo.isPointInPolygon(location, polygonFeature);

//   //     if (!isInside) {
//   //       let distance = await geo.distanceBetweenPolygonAndPoint(
//   //         location,
//   //         polygonFeature,
//   //       );
//   //       let distanceUnit = 'Km';

//   //       if (distance > DISTANCE_ACCURACY_THRESHOLD) {
//   //         if (distance < 1) {
//   //           distanceUnit = 'm';
//   //           distance = distance * 1000;
//   //         }

//   //         Alert.alert(
//   //           'Location Error',
//   //           'You are not in the selected area. Please try again.',
//   //         );
//   //         return false;
//   //       }

//   //       if (distance < 1) {
//   //         distanceUnit = 'm';
//   //         distance = distance * 1000;
//   //       }

//   //       Alert.alert(
//   //         'Warning',
//   //         `you are ${distance} ${distanceUnit} away from the selected area`,
//   //       );
//   //       return true;
//   //     } else {
//   //       return true;
//   //     }
//   //   },
//   //   [
//   //     DISTANCE_ACCURACY_THRESHOLD,
//   //     selectedFeatures.land,
//   //     selectedFeatures.village,
//   //   ],
//   // );

//   // const validate = useCallback(
//   //   async ({location}: {location: ICordinates}) => {
//   //     return validateLocation(location);
//   //   },
//   //   [validateLocation],
//   // );

//   const takePicture = useCallback(async () => {
//     if (!camera) return;

//     setIsLoading(true);
//     const photo = await camera.takePictureAsync({quality: 0});
//     getCurrentLocation(location => {
//       handleImgData('lat')(location.latitude.toFixed(6));
//       handleImgData('lon')(location.longitude.toFixed(6));
//     });

//     // let isValid = await validate({ location });
//     setIsLoading(false);

//     // if (!isValid) {
//     //   return;
//     // }

//     const date = new Date();

//     handleImgData('x')(gyroData.x.toFixed(6));
//     handleImgData('y')(gyroData.y.toFixed(6));
//     handleImgData('z')(gyroData.z.toFixed(6));
//     handleImgData('timestamp')(date.toLocaleString().split('T')[0]);

//     setPreviewVisible(true);
//     setCapturedImage(photo);
//   }, [
//     camera,
//     getCurrentLocation,
//     gyroData.x,
//     gyroData.y,
//     gyroData.z,
//     handleImgData,
//   ]);

//   const compressImageAsync = useCallback(async (uri: string) => {
//     const compressedImage = await ImageManipulator.createResizedImage(
//       uri,
//       800, // Desired width
//       600, // Desired height
//       'JPEG',
//       30,
//     );
//     return compressedImage;
//   }, []);

//   //function to get random 6 digit number
//   // const getRandomNumber = () => {
//   //   return Math.floor(100000 + Math.random() * 900000);
//   // };
//   const savePhoto = useCallback(async () => {
//     setIsLoading(true);

//     const compressedImage = await compressImageAsync(capturedImage.uri);
//     const uri = `${RNFS.DocumentDirectoryPath}/photos/${deviceId}-${
//       user.userId
//     }-${generateUniqueValue()}.jpg`;

//     await RNFS.copyFile(compressedImage.uri, uri);

//     setPreviewVisible(false);
//     await onCapture('image')(uri);
//     await onCapture('imgOrientationX')(imgData.x);
//     await onCapture('imgOrientationY')(imgData.y);
//     await onCapture('imgOrientationZ')(imgData.z);
//     await onCapture('imgLat')(imgData.lat);
//     await onCapture('imgLon')(imgData.lon);

//     await onCapture('imgTimestamp')(imgData.timestamp);

//     setIsLoading(false);

//     navigation.goBack();
//   }, [
//     capturedImage?.uri,
//     compressImageAsync,
//     imgData.x,
//     imgData.y,
//     imgData.z,
//     imgData.lat,
//     imgData.lon,
//     imgData.timestamp,
//     onCapture,
//     deviceId,
//     user.userId,
//   ]);

//   const onCancel = useCallback(() => {
//     navigation.goBack();
//   }, []);

//   useEffect(() => {
//     requestCameraPermission();
//   }, []);

//   if (device == null) {
//     return null;
//   }
//   return (
//     <Box flex="1" bg="black">
//       {previewVisible && capturedImage ? (
//         <CameraPreview
//           photo={capturedImage}
//           isLoading={isLoading}
//           savePhoto={savePhoto}
//           onCancel={onCancel}
//         />
//       ) : (
//         // <Camera
//         //   type={Camera.Constants.Type.back}
//         //   onCameraReady={setCameraReady}
//         //   style={{
//         //     flex: 1,
//         //     justifyContent: 'flex-end',
//         //     paddingVertical: imagePadding,
//         //   }}
//         //   ratio={ratio}
//         //   ref={setCamera}>
//         <Camera
//           device={device}
//           isActive={true}
//           // onCameraReady={setCameraReady}
//           style={{
//             flex: 1,
//             justifyContent: 'flex-end',
//             paddingVertical: imagePadding,
//           }}
//           ratio={ratio}
//           ref={setCamera}>
//           <Box
//             flex="1"
//             bg="transparent"
//             justifyContent="center"
//             alignItems="center">
//             <ActivityIndicator
//               size="large"
//               color={colors.primary['600']}
//               animating={!isRatioSet}
//             />
//           </Box>
//           <Row flex="1" justifyContent="center">
//             {/* <Box bg="red.500" w="16" h="16" borderRadius="full" overflow="hidden">
//               <Pressable flex="1" onPress={onCancel} _pressed={{ opacity: 0.7, bg: 'gray.600' }}>
//                 <Box flex="1" justifyContent="center" alignItems="center">
//                   <Text color="white" bold>
//                     Cancel
//                   </Text>
//                 </Box>
//               </Pressable>
//             </Box> */}
//             <Box
//               w="16"
//               h="16"
//               borderRadius="full"
//               overflow="hidden"
//               position={'absolute'}
//               bottom="10">
//               <Pressable
//                 flex="1"
//                 onPress={takePicture}
//                 _pressed={{opacity: 0.7, bg: 'gray.200'}}
//                 bg="gray.500">
//                 {/* <Box flex="1" justifyContent="center" alignItems="center"> */}
//                 <Icon
//                   as={MaterialIcons}
//                   name="camera"
//                   size="16"
//                   color="white"
//                 />
//                 {/* </Box> */}
//               </Pressable>
//             </Box>
//           </Row>
//         </Camera>
//       )}
//     </Box>
//   );
// };

// export default Index;
