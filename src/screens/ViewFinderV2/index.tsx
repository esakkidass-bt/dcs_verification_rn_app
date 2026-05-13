import {ActivityIndicator, Alert, NativeModules} from 'react-native';
import {
  Box,
  Button,
  Center,
  Icon,
  Image,
  Pressable,
  Row,
  Text,
} from 'native-base';
import {Camera, PhotoFile, useCameraDevice} from 'react-native-vision-camera';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAuth, useGyroscope, useLocation, useStateContext} from '../../hooks';

import ImageManipulator from 'react-native-image-resizer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import api from '../../api';
import {colors} from '../../styles';
import {generateUniqueValue, geo} from '../../helpers';
import {navigation} from '../../routers/navigation';
import useDict from '../../hooks/useDict';
import {ICordinates} from '../../@types/geoJson';
import {isPointInsideTheSelectedLocation} from '../../helpers/geo/isPointInsideTheSelectedLocation';

const CameraPreview = ({
  photo,
  onCancel,
  isLoading,
  savePhoto,
}: {
  photo: string;
  onCancel: () => void;
  isLoading: boolean;
  savePhoto: () => void;
}) => {
  const ln = useDict();
  return !isLoading ? (
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
            onPress={onCancel}
            isDisabled={isLoading}
            _pressed={{opacity: 0.7, bg: 'red.500'}}>
            <Box flex="1" justifyContent="center" alignItems="center">
              <Text color="white" bold>
                {ln('Cancel')}
              </Text>
            </Box>
          </Pressable>
        </Box>
        <Box bg="green.600" w="16" h="16" borderRadius="full" overflow="hidden">
          <Pressable
            flex="1"
            onPress={savePhoto}
            isDisabled={isLoading}
            _pressed={{bg: 'green.500', opacity: 0.7}}>
            <Box flex="1" justifyContent="center" alignItems="center">
              <Text color="white" bold>
                {ln('Okay')}
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Row>
    </Box>
  ) : (
    <Box flex="1" justifyContent="center" alignItems="center">
      <Center>
        <ActivityIndicator size="large" color={colors.primary['600']} />
        <Text color="white">Compressing and saving image...</Text>
      </Center>
    </Box>
  );
};

const Index = ({route}: any) => {
  const {setTimeStamp} = route.params;
  const [localTimeStamp, setLocalTimeStamp] = useState(
    new Date()?.toLocaleString(),
  );

  function handleTimeStamp() {
    const timestamp = new Date()?.toLocaleString();
    setLocalTimeStamp(timestamp);
    setTimeStamp(timestamp);
    return timestamp;
  }
  const {selectedLocationData} = useStateContext();

  const {ImageManipulationModule} = NativeModules;

  const {onImageCapture, otherMetaData} = useStateContext();
  const state = useStateContext();
  const {
    getCurrentLocation,
    isSimulatingTheLocation,
    simulatedCurrentLocation,
  } = useLocation();
  const {deviceId, user} = useAuth();
  const auth = useAuth();
  const cameraRef = useRef<Camera | null>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const gyroData = useGyroscope();
  const [isLoading, setIsLoading] = useState(false);
  const [imgData, setImgData] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: Date.now(),
    lat: 0.0,
    lon: 0.0,
  });
  const handleImgData = useCallback(
    (key: any) => (value: any) => {
      setImgData(prevData => ({...prevData, [key]: value}));
    },
    [],
  );
  const cropText = otherMetaData?.cropName
    ? `Crop: ${otherMetaData?.cropName}; `
    : '(Non-Agri)';

  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<PhotoFile | null>(null);

  const device = useCameraDevice('back');

  useEffect(() => {
    console.log('Crop data : ', route.params);
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      if (cameraPermission !== 'granted') {
        console.warn('Camera permission not granted');
      }
    };
    requestPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePicture = useCallback(async () => {
    if (!device) return;

    setIsLoading(true);
    if (!isCameraInitialized) {
      console.error('camera not initialized');
      return;
    }

    const photo = await cameraRef.current?.takeSnapshot();

    getCurrentLocation(async location => {
      const isValidLocation = await validateLocation(location).finally(() => {
        auth.closeLoader();
      });

      if (isValidLocation) {
        handleImgData('lat')(location.latitude.toFixed(6));
        handleImgData('lon')(location.longitude.toFixed(6));

        const date = new Date();
        handleTimeStamp();

        handleImgData('x')(gyroData.x.toFixed(6));
        handleImgData('y')(gyroData.y.toFixed(6));
        handleImgData('z')(gyroData.z.toFixed(6));
        handleImgData('timestamp')(date.toLocaleString());

        setPreviewVisible(true);
        setCapturedImage(photo as PhotoFile);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    device,
    getCurrentLocation,
    gyroData.x,
    gyroData.y,
    gyroData.z,
    handleImgData,
    isCameraInitialized,
  ]);

  const compressImageAsync = useCallback(async (path: string) => {
    const compressedImage = await ImageManipulator.createResizedImage(
      path,
      800,
      600,
      'JPEG',
      30,
    );
    return compressedImage;
  }, []);

  const [imageData, setImageData] = useState({
    villageName: '',
    talukName: '',
    districtName: '',
    formType: '',
    lvl: 'V',
  });

  useEffect(() => {
    const _village = user.assignedVillages.find(
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

  async function validateLocation(currentLocation: ICordinates) {
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Validating your location...',
    });
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

  const savePhoto = useCallback(async () => {
    if (!capturedImage?.path) {
      return;
    }
    setIsLoading(true);

    try {
      const compressedImage = await compressImageAsync(
        'file://' + capturedImage.path,
      );

      const outDir = `${RNFS.DocumentDirectoryPath}/photos`;
      const filename = `${deviceId}-${
        user.userId
      }-${generateUniqueValue()}.jpg`;

      await RNFS.mkdir(outDir);
      const uri = `file://${outDir}/${filename}`;

      const text = `
${user.userName}(${user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; \n
V: ${imageData?.villageName}(${selectedLocationData?.village}) - ${imageData?.talukName}(${selectedLocationData?.taluk}) - ${imageData?.districtName}(${selectedLocationData?.district}); \n
DeviceId: ${deviceId}, XYZ:${imgData.x},${imgData.y},${imgData.z}; Date:${localTimeStamp}; \n
Loc:${imgData.lat},${imgData.lon}; FT:SN; 
        `;

      // addTextToImage(imagePath: String, text: String, outDir: String, filename: String, callback: Callback)
      await ImageManipulationModule.addTextToImage(
        compressedImage.path,
        text,
        outDir,
        filename,
        (error, filePath) => {
          if (error) {
            console.error('Error adding text to image: ', error);
          } else {
            console.log('Image saved to: ', filePath);
          }
        },
      );

      onImageCapture({
        image: uri,
        imgOrientationX: imgData.x?.toString(),
        imgOrientationY: imgData.y?.toString(),
        imgOrientationZ: imgData.z?.toString(),
        imgLat: imgData.lat?.toString(),
        imgLon: imgData.lon?.toString(),
        imgTimestamp: imgData.timestamp?.toString(),
      });
      // Alert.alert('Image saved', `${imgData.timestamp?.toString()}`);

      await setIsLoading(false);
      setPreviewVisible(false);
      navigation.goBack();
    } catch (e) {
      console.error('copy error', e);
    }
  }, [capturedImage, imgData, deviceId, onImageCapture, user.userId]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, []);

  if (!device) {
    return (
      <Box flex="1" bg="black" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={colors.primary['600']} />
        <Text color="white">Loading camera...</Text>
      </Box>
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
            top="10"
            flex="1"
            w="full"
            p="1">
            <Box bg="rgba(219,219,219,0.5)" borderRadius={8} p="2">
              <Text fontSize={8}>
                {`${user.userName}(${user.userId}), ${cropText}, SN:${selectedLocationData?.surveyNumber}`}
              </Text>
              <Text fontSize={8}>
                {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district})`}
              </Text>
              <Text fontSize={8}>
                {`DeviceId: ${deviceId}, XYZ:${imgData.x},${imgData.y},${imgData.z}; Date:${localTimeStamp}`}
              </Text>
              <Text
                fontSize={8}>{`Loc:${imgData.lat},${imgData.lon}; FT:SN`}</Text>
            </Box>
          </Box> */}
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
              p='0.5'>
            <Text fontSize={10}
             color="white" bg='green.700'
             >
              {`U:${user.userName}(${user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
              {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
              {`DeviceId: ${deviceId};  Date:${new Date().toLocaleString()}; `}
              {`Loc:${imgData.lat},${imgData.lon}; FT:SN; XYZ:${imgData.x},${imgData.y},${imgData.z}; `}
            </Text>
            </Box>
          </Box> */}
          <CameraPreview
            photo={'file://' + capturedImage?.path}
            savePhoto={savePhoto}
            onCancel={onCancel}
            isLoading={isLoading}
          />
          <Box bg="green.700" p="0.5" px="2">
            <Text fontSize={10} color="white">
              {`U:${user.userName}(${user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
              {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
              {`DeviceId: ${deviceId};  Date:${localTimeStamp}; `}
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
            onInitialized={() => setIsCameraInitialized(true)}
            // photo={true}
          >
            {/* <Box flex="1" justifyContent="center" alignItems="center"> */}
            {/* <Pressable onPress={takePicture}>
              <Icon as={MaterialIcons} name="camera" size="16" color="white" />
            </Pressable> */}
            {/* <Row flex="1" justifyContent="center">
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
            </Row> */}
            {/* </Box> */}
          </Camera>
          {/* <Box
            overflow="hidden"
            position="absolute"
            top="10"
            flex="1"
            w="full"
            p="1">
            <Box bg="rgba(219,219,219,0.5)"  p='0.5'>
              <Text fontSize={8}>
                {`${user.userName}(${user.userId}), ${cropText} SN:${selectedLocationData?.surveyNumber}`}
              </Text>
              <Text fontSize={8}>
                {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district})`}
              </Text>
              <Text fontSize={8}>
                {`DeviceId: ${deviceId}, XYZ:${imgData.x},${imgData.y},${imgData.z}; Date:${new Date().toLocaleString()}`}
              </Text>
              <Text
                fontSize={8}>{`Loc:${imgData.lat},${imgData.lon}; FT:SN`}</Text>
            </Box>
          </Box> */}
          {/* <Box
            overflow="hidden"
            position="absolute"
            top="10"
            flex="1"
            w="full"
            p="1">
            <Box bg="rgba(219,219,219,0.5)"  p='0.5'>
            <Text fontSize={10}
            //  color="white" bg='green.700'
             >
              {`U:${user.userName}(${user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
              {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
              {`DeviceId: ${deviceId};  Date:${new Date().toLocaleString()}; `}
              {`Loc:${imgData.lat},${imgData.lon}; FT:SN; XYZ:${imgData.x},${imgData.y},${imgData.z}; `}
            </Text>
            </Box>
          </Box> */}
          <Box bg="green.700" p="0.5" px="2">
            <Text fontSize={10} color="white">
              {`U:${user.userName}(${user.userId}); ${cropText} SN:${selectedLocationData?.surveyNumber}; `}
              {`V:${imageData?.villageName}(${selectedLocationData?.village}),${imageData?.talukName}(${selectedLocationData?.taluk}),${imageData?.districtName}(${selectedLocationData?.district}); `}
              {`DeviceId: ${deviceId};  Date:${new Date().toLocaleString()}; `}
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
