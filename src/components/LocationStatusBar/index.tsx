import {Box, Row, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {useAuth, useLocation} from '../../hooks';

import FA5 from 'react-native-vector-icons/FontAwesome5';
import {ICordinates} from '../../@types/geoJson';
import IIcon from 'react-native-vector-icons/Ionicons';
import config from '../../config';

export default function Index() {
  const [location, setLocation] = useState<ICordinates>();
  const {getCurrentLocation, isSimulatingTheLocation} = useLocation();
  const auth = useAuth();

  // update location on change
  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentLocation(e => {
        setLocation({
          latitude: parseFloat(e.latitude.toFixed(6)),
          longitude: parseFloat(e.longitude.toFixed(6)),
          accuracy: e.accuracy,
        });
      });
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulatingTheLocation]);

  return (
    <Box>
      <Box
        px="2"
        bg={auth?.appMode === 'offline' ? 'green.700' : 'primary.600'}>
        <Row alignItems={'center'}>
          <Row flex="1" pl="1">
            <Text color={'white'} fontSize="10">
              {location?.latitude},{location?.longitude} - acc:{' '}
              {location?.accuracy}m{' '}
            </Text>
            {/* {isSimulatingTheLocation?<Text>sim</Text>:null} */}
          </Row>
          <Row
            flex="1"
            justifyContent={'flex-end'}
            space="4"
            alignItems={'center'}>
            <Text color={'white'} fontSize="10">
              {new Date().toLocaleDateString() +
                ' ' +
                new Date().getHours() +
                ':' +
                new Date().getMinutes()}
            </Text>
            {/* </Row>
        <Row  justifyContent={'flex-end'}> */}
            {/* <Text fontSize={"xs"}>(Preview)</Text> */}

            {config?.env === 'beta' ? (
              <Text color={'white'} fontSize="xs">
                {config.version}-beta-{config.androidBuildNumber}
              </Text>
            ) : (
              <Row alignItems={'center'}>
                {auth?.appMode === 'online' ? (
                  <FA5 name="globe-americas" color="white" />
                ) : (
                  <IIcon name="cloud-offline" color="white" />
                )}
                {/* <Text color={'white'} fontSize="xs" mx="1">
                  (2)
                </Text> */}
                <Text color={'white'} fontSize="xs" mx="1">
                  {config.env !== 'production' ? `${config.env}-` : ''}
                  {config.version}
                </Text>

                {/* <Text color={'white'} fontSize="xs" ml="1">
                  (Online)
                </Text> */}
              </Row>
            )}
          </Row>
        </Row>
      </Box>
    </Box>
  );
}
