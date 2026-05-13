import React, {useCallback, useEffect, useState} from 'react';
import {Box, Button, Icon, Image, Row, Text} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {navigation} from '../../../../routers/navigation';

import useDict from '../../../../hooks/useDict';
import {useStateContext} from '../../../../hooks';
import {ICropFormV3CameraProps} from '../../type';
import cropMaster from '../../../../api/cropMaster';
import {Alert} from 'react-native';

interface Props {
  previewMode: boolean;
  surveyId: string;
  formType: string;
  cropName: string;
  // imageData: ICropFormV3CameraProps;
  // handleInputChange: (data :ICropFormV3CameraProps)=>void
}

export default function Index(props: Props) {
  const ln = useDict();
  const {
    capturedImageData: imageData,
    removeImageData,
    otherMetaData,
  } = useStateContext();

  const [timeStamp, setTimeStamp] = useState('');

  const captureBtnOnPress = useCallback(() => {
    // if(!otherMetaData?.cropName){
    //   Alert.alert(ln('Error'), ln('Please select crop before cap'))
    //   return
    // }

    if (props.formType === 'agricultural' && !props.cropName) {
      Alert.alert(
        'Please Select Crop',
        'To continue please select the crop name',
      );
      return;
    }
    navigation.navigate('ViewFinderV2', {setTimeStamp});
  }, [props.formType, props.cropName]);

  return (
    <Box mt="1">
      {/* //? image */}
      {imageData?.image ? (
        <Box h={'24'}>
          <Image
            source={{uri: imageData?.image}}
            flex="1"
            alt="Camera preview"
          />
        </Box>
      ) : null}
      <Box mt="1">
        {/* //? image buttons */}
        {!imageData?.image ? (
          <Button
            onPress={captureBtnOnPress}
            bgColor="black"
            leftIcon={
              <Icon
                as={MaterialIcons}
                name="camera-alt"
                color="white"
                size="sm"
              />
            }
            isDisabled={props.previewMode}>
            {ln('Capture Image')}
          </Button>
        ) : (
          <Row space="4">
            <Button
              flex="1"
              onPress={() => {
                removeImageData();
                // props.handleInputChange({
                //   "image":'',
                //   "imgLat":'',
                //   "imgLon":'',
                //   "imgTimestamp":'',
                //   "imgOrientationZ":'',
                //   "imgOrientationY":'',
                //   "imgOrientationX":'',
                // })
              }}
              bgColor="red.600"
              leftIcon={
                <Icon
                  as={MaterialIcons}
                  name="delete"
                  color="white"
                  size="sm"
                />
              }
              isDisabled={props.previewMode}>
              {ln('Remove')}
            </Button>
            <Button
              flex="1"
              onPress={captureBtnOnPress}
              bgColor="secondary.900"
              leftIcon={
                <Icon
                  as={MaterialIcons}
                  name="camera-alt"
                  color="white"
                  size="sm"
                />
              }
              isDisabled={props.previewMode}>
              {ln('Re-Take')}
            </Button>
          </Row>
        )}

        {imageData?.imgLat ? (
          <Box>
            <Text>
              Lat:{imageData?.imgLat}, Lon:{imageData?.imgLon}
            </Text>
            <Text>
              X:{imageData?.imgOrientationX}, Y:{imageData?.imgOrientationY}, Z:
              {imageData?.imgOrientationZ}
            </Text>
            <Text>{timeStamp}</Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
