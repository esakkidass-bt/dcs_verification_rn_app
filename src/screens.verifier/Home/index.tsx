// import SurveyNumberDropDownSelector from './components/surveyNumberDropDown/index';
const dummySurveyNumbers = [
  {survey_number: '101'},
  {survey_number: '102'},
  {survey_number: '103'},
  {survey_number: '104'},
  {survey_number: '105'},
];

import {Box, Row, Text} from 'native-base';
import React, {useEffect} from 'react';
import {
  LocationSelector,
  OfflineLocationDetails,
  ProfileHeader,
} from '../../components';
import {SafeAreaView} from '../../layout';
import {useLocation, useStateContext} from '../../hooks';

import useDict from '../../hooks/useDict';
import {Alert, BackHandler, NativeModules, Pressable} from 'react-native';
import {View, FlatList} from 'react-native';
import SurveyNumberCard from './components/SurveyNumberCard';
import {OwnerDetailsOnlineProps} from '../../@types/onlineTypes/index';

const sampleData: Array<
  | OwnerDetailsOnlineProps
  | import('../../@types/offlineTypes/index').OwnerDetailsOfflineProps
> = [
  {
    district_code: '001',
    taluk_code: '002',
    village_code: '003',
    patta_number: '12345',
    survey_number: '10',
    sub_division_number: 'A',
    extent: '50',
    land_type: 'Wet',
    owner_name: 'Ravi Kumar',
    farmer_name: 'Ravi Kumar',
    owner_type_id: 1,
    id: 1,
    farmer_data_type: 'online',
    theervai: 'Yes',
  },
  {
    districtCode: '002',
    talukCode: '003',
    villageCode: '004',
    pattaNumber: '54321',
    surveyNumber: '10',
    subDivisionNumber: 'B',
    extent: '75',
    landType: 'Dry',
    ownerName: 'Sita Devi',
    farmerName: 'Sita Devi',
    ownerTypeId: 2,
    id: '2',
    farmerDataType: 'offline',
    theervai: 'No',
  },
];
import appUpdate from '../../helpers/appUpdate';
import useAuthContext from '../../hooks/useAuth';
import SurveyNumberDropDownSelector from './components/surveyNumberDropDown';
import {OwnerDetailsOfflineProps} from '../../@types/offlineTypes/index';
import {navigation} from '../../routers/navigation';

const VerifierHome = () => {
  const auth = useAuthContext();
  const {BasicFunctions} = NativeModules;
  const {isSimulatingTheLocation} = useLocation();
  const {error} = useStateContext();
  const ln = useDict();

  useEffect(() => {
    console.log('auth.user.assignedVillages', auth.user.assignedVillages);
    
   // auth.checkDeveloperOptionEnabled();
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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [BasicFunctions, auth, ln]);
  return (
    <SafeAreaView>
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
      <SurveyNumberDropDownSelector surveyNumbers={dummySurveyNumbers} />
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
      {/* <Button
        onPress={() => {
          navigation.navigate("CropForm");
        }}
      >
        open form
      </Button> */}
      <View style={{flex: 1, padding: 16}}>
        <FlatList
          data={sampleData}
          keyExtractor={(
            _item: OwnerDetailsOnlineProps | OwnerDetailsOfflineProps,
            idx: number,
          ) => idx.toString()}
          renderItem={({
            item,
          }: {
            item: OwnerDetailsOnlineProps | OwnerDetailsOfflineProps;
          }) => (
            <Box
              bg="amber.100"
              my="2"
              >
                <Pressable  onPress={() => {
                  navigation.navigate('VerificationDetail', {item});
                }}>
                  <SurveyNumberCard data={item} />
                </Pressable>
            </Box>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default VerifierHome;
