import {ActivityIndicator, Alert, NativeModules} from 'react-native';
import {Box, Center, Icon, Image, Pressable, Row, Text} from 'native-base';
import {Camera, PhotoFile, useCameraDevice} from 'react-native-vision-camera';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAuth, useGyroscope, useLocation, useStateContext} from '../../hooks';

import ImageManipulator from 'react-native-image-resizer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import {colors} from '../../styles';
import {generateUniqueValue, geo} from '../../helpers';
import {navigation} from '../../routers/navigation';
import {isPointInsideTheSelectedLocation} from '../../helpers/geo/isPointInsideTheSelectedLocation';
import {ICordinates} from '../../@types/geoJson';

const CameraPreview = ({
  photo,
  ...props
}: {
  photo: any;
  isLoading: any;
  onCancel: any;
  savePhoto: any;
}) =>
  !props.isLoading ? (
    <Box flex="1" position="relative">
      <Image source={{uri: photo}} flex="1" alt="Camera preview" />
      <Row
        position="absolute"
        bottom="8"
        w="full"
        space="8"
        flex="1"
        justifyContent="center"
        alignItems="center">
        <Box bg="red.600" w="16" h="16" borderRadius="full" overflow="hidden">
          <Pressable
            flex="1"
            onPress={props.onCancel}
            isDisabled={props.isLoading}
            _pressed={{opacity: 0.7, bg: 'red.500'}}>
            <Center flex="1">
              <Text color="white" bold>
                Cancel
              </Text>
            </Center>
          </Pressable>
        </Box>
        <Box bg="green.600" w="16" h="16" borderRadius="full" overflow="hidden">
          <Pressable
            flex="1"
            onPress={props.savePhoto}
            isDisabled={props.isLoading}
            _pressed={{opacity: 0.7, bg: 'green.500'}}>
            <Center flex="1">
              <Text color="white" bold>
                Ok
              </Text>
            </Center>
          </Pressable>
        </Box>
      </Row>
    </Box>
  ) : (
    <Center flex="1">
      <ActivityIndicator size="large" color={colors.primary['600']} />
      <Text color="white">Compressing and saving image...</Text>
    </Center>
  );

const compressImageAsync = async (uri: string) => {
  const compressedImage = await ImageManipulator.createResizedImage(
    uri,
    800, // Desired width
    600, // Desired height
    'JPEG',
    30,
  );
  return compressedImage;
};
const Index = ({route}: any) => {
  const {onCapture, cropName, subDivision, setTimeStamp} = route.params;

  const [localTimeStamp, setLocalTimeStamp] = useState(
    new Date()?.toLocaleString(),
  );

  function handleTimeStamp() {
    const timestamp = new Date()?.toLocaleString();
    setLocalTimeStamp(timestamp);
    setTimeStamp(timestamp);
    return timestamp;
  }
  const auth = useAuth();
  const {ImageManipulationModule} = NativeModules;
  const cropText = cropName ? `Crop: ${cropName}; ` : '(Non-Agri)';

  const {selectedLocationData} = useStateContext();
  const state = useStateContext();

  const {
    getCurrentLocation,
    isSimulatingTheLocation,
    simulatedCurrentLocation,
  } = useLocation();
  const gyroData = useGyroscope();

  const cameraRef = useRef<Camera | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imgData, setImgData] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: null,
    lat: null,
    lon: null,
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<PhotoFile | null>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // const [isRatioSet, setIsRatioSet] = useState(false);

  const device = useCameraDevice('back');

  const handleImgData = useCallback(
    (key: any) => (value: any) => {
      setImgData(prevData => ({...prevData, [key]: value}));
    },
    [],
  );
  async function validateLocation(currentLocation: ICordinates) {
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Validating your location...',
    });
    auth.openLoader('Validating your location...');
    // console.log('surveyNumberPolygon', surveyNumberPolygon);
    // console.debug('simulatedCurrentLocation', simulatedCurrentLocation);
    // console.debug('offlineVillageDetail', auth.offlineVillage);
    let {isInside, polygon} = await isPointInsideTheSelectedLocation(
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
        // auth.closeLoader();
        return true;
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
        // auth.closeLoader();
        return false;
      }
    } else {
      // auth.closeLoader();
      return true;
    }
  }

  // const validateLocation = useCallback(
  //   async (location: ICordinates) => {
  //     const polygonFeature =
  //       selectedFeatures.land?.length > 0
  //         ? selectedFeatures.land[0]
  //         : selectedFeatures.village[0];

  //     let isInside = await geo.isPointInPolygon(location, polygonFeature);

  //     if (!isInside) {
  //       let distance = await geo.distanceBetweenPolygonAndPoint(
  //         location,
  //         polygonFeature,
  //       );
  //       let distanceUnit = 'Km';

  //       if (distance > DISTANCE_ACCURACY_THRESHOLD) {
  //         if (distance < 1) {
  //           distanceUnit = 'm';
  //           distance = distance * 1000;
  //         }

  //         Alert.alert(
  //           'Location Error',
  //           'You are not in the selected area. Please try again.',
  //         );
  //         return false;
  //       }

  //       if (distance < 1) {
  //         distanceUnit = 'm';
  //         distance = distance * 1000;
  //       }

  //       Alert.alert(
  //         'Warning',
  //         `You are ${distance} ${distanceUnit} away from the selected area`,
  //       );
  //       return true;
  //     } else {
  //       return true;
  //     }
  //   },
  //   [
  //     DISTANCE_ACCURACY_THRESHOLD,
  //     selectedFeatures.land,
  //     selectedFeatures.village,
  //   ],
  // );

  // const validate = useCallback(
  //   async ({location}: {location: ICordinates}) => {
  //     return validateLocation(location);
  //   },
  //   [validateLocation],
  // );

  const takePicture = useCallback(async () => {
    if (!device) return;

    setIsLoading(true);
    if (!isCameraInitialized) {
      console.error('camera not initialized');
      return;
    }
    try {
      // if (!cameraRef.current) {
      //   return;
      // }
      const photo = await cameraRef.current?.takeSnapshot();
      getCurrentLocation(async location => {
        const isValidLocation = await validateLocation(location).finally(() => {
          auth.closeLoader();
        });
        // if (!isValidLocation) {
        //   setIsLoading(false);
        //   Alert.alert(
        //     'Error',
        //     'Unable to get location. Please try again.',
        //   );
        //   return;
        // }

        if (isValidLocation) {
          handleImgData('lat')(location.latitude.toFixed(6));
          handleImgData('lon')(location.longitude.toFixed(6));

          // let isValid = await validate({location});
          setIsLoading(false);

          // if (!isValid) return;

          const date = new Date();
          handleTimeStamp();

          handleImgData('x')(gyroData.x.toFixed(6));
          handleImgData('y')(gyroData.y.toFixed(6));
          handleImgData('z')(gyroData.z.toFixed(6));
          handleImgData('timestamp')(date.toLocaleString());

          setPreviewVisible(true);
          setCapturedImage(photo as PhotoFile);
        } else {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, getCurrentLocation, gyroData, handleImgData]);

  const [imageData, setImageData] = useState({
    villageName: '',
    talukName: '',
    districtName: '',
    formType: '',
    lvl: 'V',
  });

  useEffect(() => {
    const _village = auth.user.assignedVillages.find(
      village => village?.villageCode === selectedLocationData?.village,
    );

    setImageData(prevData => ({
      ...prevData,
      villageName: _village?.villageName || '',
      talukName: _village?.talukName || '',
      districtName: _village?.districtName || '',
      formType: 'surveyForm',
      lvl: 'V',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePhoto = useCallback(async () => {
    if (!capturedImage?.path) {
      return;
    }
    setIsLoading(true);

    const compressedImage = await compressImageAsync(
      'file://' + capturedImage.path,
    );

    const outDir = `${RNFS.DocumentDirectoryPath}/photos`;
    const filename = `${auth.deviceId}-${
      auth.user.userId
    }-${generateUniqueValue()}.jpg`;

    await RNFS.mkdir(outDir);

    const uri = `file://${outDir}/${filename}`;

    const text = `
${auth.user.userName}(${auth.user.userId}); ${cropText} SN:${
      selectedLocationData?.surveyNumber
    }${subDivision ? '/' + subDivision : ''};\n
V: ${imageData?.villageName}(${selectedLocationData?.village}) - ${
      imageData?.talukName
    }(${selectedLocationData?.taluk}) - ${imageData?.districtName}(${
      selectedLocationData?.district
    }); \n
DeviceId: ${auth.deviceId};  XYZ:${imgData.x},${imgData.y},${
      imgData.z
    }; Date:${localTimeStamp};\n
Loc:${imgData.lat},${imgData.lon}; FT:SD;`;
    // const text = `
    //  Lat: ${imgData.lat}, Lon: ${imgData.lon} \n
    //     X: ${imgData.x}, Y: ${imgData.y}, Z: ${imgData.z} \n
    //     Timestamp: ${imgData.timestamp} \n
    //     User : ${auth.user.userId}, , DeviceId: ${auth.deviceId}
    //     `;

    // addTextToImage(imagePath: String, text: String, outDir: String, filename: String, callback: Callback)
    await ImageManipulationModule.addTextToImage(
      compressedImage.path,
      text,
      outDir,
      filename,
      (error: any, filePath: any) => {
        if (error) {
          console.error('Error adding text to image: ', error);
        } else {
          console.log('Image saved to: ', filePath);
        }
      },
    );

    setPreviewVisible(false);
    onCapture('image')(uri);
    onCapture('imgOrientationX')(imgData.x);
    onCapture('imgOrientationY')(imgData.y);
    onCapture('imgOrientationZ')(imgData.z);
    onCapture('imgLat')(imgData.lat);
    onCapture('imgLon')(imgData.lon);
    onCapture('imgTimestamp')(imgData.timestamp);

    setIsLoading(false);
    navigation.goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    auth.deviceId,
    auth.user.userId,
    capturedImage,
    imgData.lat,
    imgData.lon,
    imgData.timestamp,
    imgData.x,
    imgData.y,
    imgData.z,
    onCapture,
  ]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, []);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasCameraPermission(status === 'granted');
    };

    if (!hasCameraPermission) {
      requestCameraPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!device || !hasCameraPermission) {
    return (
      <Center flex="1" bg="black">
        <ActivityIndicator size="large" color={colors.primary['600']} />
      </Center>
    );
  }

  return (
    <Box flex="1" bg="black">
      {previewVisible && capturedImage ? (
        <Box flex="1" justifyContent="center">
          {/* <Box
            zIndex={10}
            overflow="hidden"
            position="absolute"
            top="0"
            flex="1"
            w="full"
            p="1">
            <Box
              // bg="rgba(219,219,219,0.5)"
              p="0.5">
              <Text fontSize={10} color="white" bg="green.700">
                {`U:${auth.user.userName}(${auth.user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
                {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
                {`Date:${localTimeStamp};  Date:${new Date().toLocaleString()}; `}
                {`Loc:${imgData.lat},${imgData.lon}; FT:SN; XYZ:${imgData.x},${imgData.y},${imgData.z}; `}
              </Text>
            </Box>
          </Box> */}
          <CameraPreview
            photo={'file://' + capturedImage?.path}
            onCancel={onCancel}
            savePhoto={savePhoto}
            isLoading={isLoading}
          />
          <Box bg="green.700" p="0.5" px="2">
            <Text fontSize={10} color="white">
              {`U:${auth.user.userName}(${auth.user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
              {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
              {`DeviceId: ${auth.deviceId};  Date:${localTimeStamp}; `}
              {`Loc:${imgData.lat},${imgData.lon}; FT:SN; XYZ:${imgData.x},${imgData.y},${imgData.z}; `}
            </Text>
          </Box>
        </Box>
      ) : (
        <Box flex={1}>
          <Camera
            device={device}
            isActive={true}
            style={{flex: 1}}
            ref={cameraRef}
            onInitialized={() => setIsCameraInitialized(true)}>
            {/* <Center flex="1">
              {!isRatioSet && (
                <ActivityIndicator size="large" color={colors.primary['600']} />
              )}
            </Center> */}

            <Row flex="1" justifyContent="center">
              <Box
                w="16"
                h="16"
                borderRadius="full"
                overflow="hidden"
                position="absolute"
                bottom="10">
                <Pressable
                  flex="1"
                  onPress={takePicture}
                  _pressed={{opacity: 0.7, bg: 'gray.200'}}
                  bg="gray.500">
                  <Icon
                    as={MaterialIcons}
                    name="camera"
                    size="16"
                    color="white"
                  />
                </Pressable>
              </Box>
            </Row>
          </Camera>
          {/* <Box
            overflow="hidden"
            position="absolute"
            top="10"
            flex="1"
            zIndex={10}
            w="full"
            // p="1"
            >
            <Box bg="rgba(219,219,219,0.5)" borderRadius={8} >
              <Text fontSize={8}>
                {`User : ${auth.user.userName}(${auth.user.userId}), ${cropText}`}{' '}
              </Text>
              <Text fontSize={8}>
                {`SN:${selectedLocationData?.surveyNumber}${
                  subDivision ? '/' + subDivision : ''
                }. V:${imageData?.villageName}(${
                  selectedLocationData?.village
                }),${imageData?.talukName}(${selectedLocationData?.taluk}),${
                  imageData?.districtName
                }(${selectedLocationData?.district})`}
              </Text>
              <Text fontSize={8}>
                {`DeviceId: ${auth.deviceId},  XYZ:${imgData.x},${imgData.y},${imgData.z}; Date:${new Date().toLocaleString()}`}
              </Text>
              <Text fontSize={8}>
                {`Loc:${imgData?.lat || 0},${imgData?.lon || 0}; FT:SN, Lvl:${
                  imageData.lvl
                }`}
              </Text>
            </Box>
          </Box> */}

          <Box bg="green.700" p="0.5" px="2">
            <Text fontSize={10} color="white">
              {`U:${auth.user.userName}(${auth.user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
              {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
              {`DeviceId: ${
                auth.deviceId
              };  Date:${new Date().toLocaleString()}; `}
              {`Loc:${imgData.lat},${imgData.lon}; FT:SN; XYZ:${imgData.x},${imgData.y},${imgData.z}; `}
            </Text>
          </Box>
          <Row justifyContent="center">
            <Box
              w="16"
              h="16"
              borderRadius="full"
              overflow="hidden"
              position="absolute"
              bottom="10">
              <Pressable
                flex="1"
                onPress={takePicture}
                _pressed={{opacity: 0.7, bg: 'gray.200'}}
                bg="gray.500">
                <Icon
                  as={MaterialIcons}
                  name="camera"
                  size="16"
                  color="white"
                />
              </Pressable>
            </Box>
          </Row>
        </Box>
      )}
    </Box>
  );
};

export default Index;
