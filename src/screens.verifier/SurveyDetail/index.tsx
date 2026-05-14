import React, {useEffect, useState} from 'react';
import {FlatList, Alert, Image, Modal, View, TouchableOpacity, StyleSheet} from 'react-native';
import {Radio, Checkbox, Button, Row, Pressable} from 'native-base';

import {Box, Text} from 'native-base';
import {ProfileHeader} from '../../components';
import {SafeAreaView} from '../../layout';
import Entypo from 'react-native-vector-icons/Entypo';

import useDict from '../../hooks/useDict';
import {NativeModules} from 'react-native';
import {Icon} from 'native-base';

import appUpdate from '../../helpers/appUpdate';
import useAuthContext from '../../hooks/useAuth';
import {useStateContext} from '../../hooks';
import api from '../../api';
import {LocationDetails} from '../../screens/CropForm/components';
import {navigation} from '../../routers/navigation';

const discrepancyOptions = [
  {key: 'Crop mismatch', value: '1'},
  {key: 'Incorrect area', value: '2'},
];

// Survey detail interface
export interface SurveyDetailProps {
  id: number;
  season_name: string;
  stage: string | null;
  cropping_method_name: string;
  crop_season_type_name: string;
  crop_type_name: string;
  crop_classification_name: string;
  crop_name: string;
  area: string;
  irrigation_name: string | null;
  sown_date: string;
  expected_harvested_date: string;
  cultivator_type_name: string;
  image_path: string;
  latitude: string;
  longitude: string;
  is_border_or_row_crop: string;
  tree_count: number;
  added_by_name: string;
  created_at: string;
  district_code: number;
  district_name: string;
  taluk_code: number;
  taluk_name: string;
  village_code: number;
  village_name: string;
  survey_number: string;
  sub_division_number: string;
  crop_age: string;
  theervai: string;
  orupoga_irupoga_nanjai: string;
}

const SurveyDetail = () => {
  const auth = useAuthContext();
  const {BasicFunctions} = NativeModules;
  const ln = useDict();

  const [surveyRecords, setSurveyRecords] = useState<SurveyDetailProps[]>([]);
  const [imageModelData, setImageModelData] = useState<{show: boolean, uri: string}>({show: false, uri: ''});

  // item is passed as route.params.item
  const state = useStateContext();
  const [selectedStatus, setSelectedStatus] = useState<
    'approved' | 'rejected' | undefined
  >(undefined);
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<string[]>(
    [],
  );
  // const [notes, _setNotes] = useState<{[key: number]: string}>({});
  const handleSubmit = async () => {
    console.log('Button pressed');
    const status = selectedStatus;
    const discrepancies = selectedDiscrepancies || [];

    if (status === 'rejected' && discrepancies?.length == 0) {
      Alert.alert(
        'Warning!',
        'You need to select any one of the reason to reject.',
      );
      return;
    }
    // const note = notes || '';
    // const output = {
    //   status,
    //   discrepancies,
    //   remarks: '',
    //   district_id: state.selectedLocationData.district,
    //   taluk_id: state.selectedLocationData.taluk,
    //   village_id: state.selectedLocationData.village,
    //   survey_number: state.selectedLocationData.surveyNumber,
    //   sub_division: state.selectedLocationData.subDivisionNumber,
    //   role_group_id: auth.user.role_group_id,
    // };

    console.log('Submitting verification with data:', {
      role_group_id: auth.user.role_group_id?.toString(),
    });
    await api.verification
      .verify({
        deviceId: auth.deviceId as string,
        userId: auth.user.userId,
        discrepancies: discrepancies.join(','),
        status: status as string,
        remarks: '',
        district_id: state.selectedLocationData.district,
        taluk_id: state.selectedLocationData.taluk,
        village_id: state.selectedLocationData.village,
        survey_number: state.selectedLocationData.surveyNumber,
        sub_division: state.selectedLocationData.subDivisionNumber,
        role_group_id: auth.user.role_group_id?.toString(),
      })
      .then(([status, response]) => {
        if (status === 200) {
          Alert.alert('Success', 'Verification submitted successfully', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert(
            'Error',
            `Failed to submit verification: ${status}:${response?.message}`,
          );
        }
      });
  };

  useEffect(() => {
   // auth.checkDeveloperOptionEnabled();
    appUpdate.checkAppBuildVersion();
    // const backAction = () => {
    //   Alert.alert(ln('HoldOn'), ln('exitAppWarningMsg'), [
    //     {
    //       text: ln('Cancel'),
    //       onPress: () => null,
    //     },
    //     {text: ln('Yes'), onPress: () => BasicFunctions.forceExitApp()},
    //   ]);
    //   return true;
    // };
    // const backHandler = BackHandler.addEventListener(
    //   'hardwareBackPress',
    //   backAction,
    // );
    // return () => backHandler.remove();
  }, [BasicFunctions, auth, ln]);

  const fetchSurveyRecords = React.useCallback(async () => {
    setSurveyRecords([]);
    const records = await api.surveyRecords.getSurveyRecords({
      deviceId: auth.deviceId as string,
      userId: auth.user.userId,
      district_code: state.selectedLocationData.district,
      taluk_code: state.selectedLocationData.taluk,
      village_code: state.selectedLocationData.village,
      survey_number: state.selectedLocationData.surveyNumber,
      sub_division: state.selectedLocationData.subDivisionNumber,
    });

    console.log('records?.length>', records?.length);
    console.log('records > ', records);
    if (records) {
      setSurveyRecords(records);
    }
  }, [
    auth.deviceId,
    auth.user.userId,
    state.selectedLocationData.district,
    state.selectedLocationData.taluk,
    state.selectedLocationData.village,
    state.selectedLocationData.surveyNumber,
    state.selectedLocationData.subDivisionNumber,
  ]);

  useEffect(() => {
    fetchSurveyRecords();
  }, [fetchSurveyRecords]);

  return (
    <Box flex={1}>
      <ProfileHeader disableNavigation />

      <Box bg="primary.600" p="2">
        <Row flexWrap="wrap" space="2" alignItems={'center'}>
          <Icon as={Entypo} name="location-pin" size={'sm'} color="white" />
          {/* {assignedLocationDetails.find(
                // eslint-disable-next-line eqeqeq
                e =>
                  e?.village_lgd_code?.toString() == state.selectedLocationData.village,
              )} */}
          <Row space={'1'}>
            <Row>
              <Text color="white" fontSize={'xs'} isTruncated>
                {state.selectedLocationData.surveyNumber}
              </Text>

              <Text color="white" fontSize={'xs'} isTruncated>
                /{state.selectedLocationData.subDivisionNumber}
              </Text>
            </Row>

            {/*<Text color="white" fontSize={"xs"}  isTruncated>*/}
            {/*  {props.showSurveyNumber ? `${state.selectedLocationData.surveyNumber}/${state.selectedLocationData.subDivisionNumber}, ` : ''}{locationData.villageName}, {locationData.talukName}, {locationData.districtName}*/}
            {/*</Text>*/}

            <Text color="white" fontSize={'xs'} isTruncated>
              {surveyRecords?.[0]?.village_name},{' '}
              {surveyRecords?.[0]?.district_name},{' '}
              {surveyRecords?.[0]?.taluk_name},{' '}
            </Text>
          </Row>
        </Row>
      </Box>

      <FlatList
        data={surveyRecords}
        keyExtractor={item => item?.id?.toString()}
        renderItem={({item, index}) => (
          <Box
            bg="white"
            p={3}
            m={2}
            borderRadius="xl"
            overflow="hidden"
            shadow={2}>
            {/* Survey Image */}
            <Box alignItems="center" mb={3}>
              <Box
                bg="gray.200"
                borderRadius="md"
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
                width="100%">
                {/* <Image
                  source={{uri: item.image_path}}
                  alt={`Crop Survey ${index + 1}`}
                  style={{width: '70%', aspectRatio: 1, resizeMode: 'cover'}}
                /> */}
                <Pressable
                  onPress={() =>
                    setImageModelData({show: true, uri: item.image_path})
                  }
                  opacity={0.9}>
                  <Image
                    source={{uri: item.image_path}}
                    // width="100%"
                    // height={300}
                    style={{
                      width: '50%',
                      // height: '300',
                      aspectRatio: '16/9',
                    }}
                    resizeMode="contain"
                    alt="Camera preview"
                  />
                </Pressable>
              </Box>
            </Box>

            {/* Survey Info */}
            <Text bold fontSize="lg" mb={1}>
              Crop Survey {index + 1}
            </Text>

            <Text fontSize="sm" color="gray.600" mb={1}>
              Crop: <Text bold>{item.crop_name || 'N/A'}</Text>
            </Text>
            {/* <Text fontSize="sm" color="gray.600" mb={1}>
              Crop Stage: <Text bold>{item.stage || 'N/A'}</Text>
            </Text> */}
            <Text fontSize="sm" color="gray.600" mb={1}>
              Crop Type: <Text bold>{item.crop_type_name}</Text> |
              Classification: <Text bold>{item.crop_classification_name}</Text>
            </Text>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Area: <Text bold>{item.area} Ares</Text>
            </Text>
            {/* <Text fontSize="sm" color="gray.600" mb={1}>
              Sown Date: <Text bold>{item.sown_date || '-'}</Text> | Expected
              Harvest: <Text bold>{item.expected_harvested_date || '-'}</Text>
            </Text> */}
            {/* <Text fontSize="sm" color="gray.600" mb={1}>
              Irrigation: <Text bold>{item.irrigation_name ?? 'N/A'}</Text> |
              Tree
            </Text> */}
            {/* Count: <Text bold>{item.tree_count}</Text> */}
            {/* <Text fontSize="sm" color="gray.600" mb={1}>
              Theervai: <Text bold>{item.theervai}</Text>
            </Text> */}
            {/* <Text fontSize="sm" color="gray.600" mb={1}>
                Survey Status: <Text bold>{item.survey_status}</Text>
            </Text> */}
            {/* <Text fontSize="xs" color="gray.400" mt={2}>
              Added By: {item.added_by} | Created: {item.created_at}
            </Text> */}
          </Box>
        )}
        ListFooterComponent={
          <Box
            bg={'white'}
            p={2}
            m={2}
            borderRadius={'xl'}
            overflow="hidden"
            shadow={2}>
            <Radio.Group
              name={`status`}
              value={selectedStatus}
              onChange={val =>
                setSelectedStatus(val as 'approved' | 'rejected')
              }
              flexDirection="row"
              mt={2}
              space={'2'}>
              <Row space="4" flexWrap={'wrap'}>
                <Radio value="approved" mr={4}>
                  Approved
                </Radio>
                <Radio value="rejected">Reject</Radio>
              </Row>
            </Radio.Group>
            {selectedStatus === 'rejected' && (
              <>
                <Checkbox.Group
                  value={selectedDiscrepancies || []}
                  onChange={vals => setSelectedDiscrepancies(vals as string[])}
                  mt={2}>
                  {discrepancyOptions.map(opt => (
                    <Checkbox value={opt?.value} key={opt?.key} mb={1}>
                      {opt?.key}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
                {/* <Input
                  placeholder="Remarks"
                  value={notes[item.id] || ''}
                  onChangeText={txt => setNotes(n => ({...n, [item.id]: txt}))}
                  mt={2}
                /> */}
              </>
            )}

            <Modal
              animationType="fade"
              transparent={true}
              visible={imageModelData.show}
              onRequestClose={() => setImageModelData({show: false, uri: ''})}>
              <View style={styles.modalBackground}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setImageModelData({show: false, uri: ''})}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                {/* Fullscreen Image */}
                <Image
                  source={{uri: imageModelData.uri}}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            </Modal>

            <Button mt={4} onPress={handleSubmit}>
              Submit
            </Button>
          </Box>
        }
      />
    </Box>
  );
};

export default SurveyDetail;


const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  modalBackground: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {width: '100%', height: '100%'},
  closeButton: {position: 'absolute', top: 40, right: 20, zIndex: 10},
  closeText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});