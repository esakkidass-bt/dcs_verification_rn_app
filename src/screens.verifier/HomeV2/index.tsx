import {Box, Row, Text} from 'native-base';
import React, {useEffect} from 'react';
import {
  LocationSelector,
  OfflineLocationDetails,
  ProfileHeader,
  SubDivisionSelector,
} from '../../components';
import {SafeAreaView} from '../../layout';
import {MapView} from './components';
import {useLocation, useStateContext} from '../../hooks';

import useDict from '../../hooks/useDict';
import {Alert, BackHandler, NativeModules} from 'react-native';
import appUpdate from '../../helpers/appUpdate';

import LocationDetails from '../CropForm/components/LocationDetails';
import useAuthContext from '../../hooks/useAuth';

const VerifierHome = () => {
  const auth = useAuthContext();
  const {BasicFunctions} = NativeModules;
  const {isSimulatingTheLocation} = useLocation();
  const {error, selectedLocationData, handleSelectedLocationData} =
    useStateContext();
  const ln = useDict();

  useEffect(() => {
  //  auth.checkDeveloperOptionEnabled();
    appUpdate.checkAppBuildVersion();
    const backAction = () => {
      // console.log(selectedLocationData)
      // handleSelectedLocationData('surveyNumber')('')
      Alert.alert(ln('HoldOn'), ln('exitAppWarningMsg'), [
        {
          text: ln('Cancel'),
          onPress: () => null,
        },
        {text: ln('Yes'), onPress: () => BasicFunctions.forceExitApp()},
      ]);
      return true;
    };
    // const backHandler = BackHandler.addEventListener(
    //   'hardwareBackPress',
    //   backAction,
    // );
    // return () => backHandler.remove();
  }, []);
  return (
    <Box flex={1}>
      <ProfileHeader />
      {/* <LocationSelector /> */}
      {auth?.appMode === 'online' ? (
        <LocationSelector />
      ) : (
        <OfflineLocationDetails
          showSurveyNumber={false}
          showSubDivisionNumber={false}
        />
      )}

      <SubDivisionSelector />
      {error ? (
        <Row bg="amber.500" p="2">
          <Text color="white">{error}</Text>
        </Row>
      ) : null}
      {isSimulatingTheLocation ? (
        <Row bg="amber.500" p="2">
          <Text color="white">{ln('You are simulating your location')} </Text>
        </Row>
      ) : null}
      <MapView />
      {/* <Button
        onPress={() => {
          navigation.navigate("CropForm");
        }}
      >
        open form
      </Button> */}
    </Box>
  );
};

export default VerifierHome;
