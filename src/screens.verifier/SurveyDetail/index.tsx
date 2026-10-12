import React, {useEffect, useState} from 'react';
import {FlatList, Alert, Image, Modal, View, TouchableOpacity, StyleSheet} from 'react-native';
import {Radio, Button, Row, Pressable} from 'native-base';

import {Box, Text} from 'native-base';
import {ProfileHeader} from '../../components';
import Entypo from 'react-native-vector-icons/Entypo';

import useDict from '../../hooks/useDict';
import {NativeModules} from 'react-native';
import {Icon} from 'native-base';

import appUpdate from '../../helpers/appUpdate';
import useAuthContext from '../../hooks/useAuth';
import {useStateContext} from '../../hooks';
import api from '../../api';
import {navigation} from '../../routers/navigation';
import {OwnerDetailsOnlineProps} from '../../@types';

const remarkOptions = [
  {key: 'No Crop', value: 'No Crop'},
  {key: 'Crop Mismatch', value: 'Crop Mismatch'},
  {key: 'Area Mismatch', value: 'Area Mismatch'},
  {key: 'Crop Harvested', value: 'Crop Harvested'},
  {key: 'Crop Damaged due to Natural Calamity', value: 'Crop Damaged due to Natural Calamity'},
];

// Helper to format date string to Month and Year (e.g. 'November 2023')
const formatMonth = (dateString?: string | null): string => {
  if (!dateString) return '-';
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const parts = dateString.split(/[-/]/);
    if (parts.length >= 2) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD or YYYY-MM
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${months[monthIndex]} ${year}`;
        }
      } else if (parts[2]?.length === 4) {
        // DD/MM/YYYY
        const year = parts[2];
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${months[monthIndex]} ${year}`;
        }
      }
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch (e) {
    // fallback
  }
  return dateString;
};

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
  extent?: string;
  total_extent?: string;
  sub_division_area?: string;
  total_area?: string;
}

const SurveyDetail = (props: any) => {
  const auth = useAuthContext();
  const {BasicFunctions} = NativeModules;
  const ln = useDict();

  const routeItem = props?.route?.params?.item;
  const [surveyRecords, setSurveyRecords] = useState<SurveyDetailProps[]>([]);
  const [imageModelData, setImageModelData] = useState<{show: boolean; uri: string}>({
    show: false,
    uri: '',
  });

  const state = useStateContext();
  const [subDivisionTotalArea, setSubDivisionTotalArea] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<
    'approved' | 'rejected' | undefined
  >(undefined);
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  // Fetch or extract sub-division total area
  useEffect(() => {
    if (routeItem?.extent) {
      setSubDivisionTotalArea(routeItem.extent);
    } else if (state.selectedLocationData?.ownerDetails?.extent) {
      setSubDivisionTotalArea(state.selectedLocationData.ownerDetails.extent);
    } else if (
      state.selectedLocationData.surveyNumber &&
      state.selectedLocationData.village &&
      state.selectedLocationData.subDivisionNumber
    ) {
      if (auth.appMode === 'offline') {
        api.local.ownerDetails.read({
          callback: e => {
            if (e && e.length > 0 && e[0].extent) {
              setSubDivisionTotalArea(e[0].extent);
            }
          },
          subDivisionNumber: state.selectedLocationData.subDivisionNumber,
          villageCode: state.selectedLocationData.village,
          surveyNumber: state.selectedLocationData.surveyNumber,
        });
      } else {
        api.surveyDropdown
          .ownerDetail({
            userId: auth.user.userId,
            deviceId: auth.deviceId as string,
            district_code: state.selectedLocationData.district,
            taluk_code: state.selectedLocationData.taluk,
            village_code: state.selectedLocationData.village,
            sub_division: state.selectedLocationData.subDivisionNumber,
            survey_number: state.selectedLocationData.surveyNumber,
            role_group_id: auth.user.role_group_id,
          })
          .then(e => {
            if (e && e.length > 0 && e[0].extent) {
              setSubDivisionTotalArea(e[0].extent);
            }
          });
      }
    }
  }, [routeItem, state.selectedLocationData, auth]);

  const handleSubmit = async () => {
    console.log('Button pressed');
    const status = selectedStatus;
    const remark = selectedRemark || '';

    if (!status) {
      Alert.alert('Warning!', 'Please select Approved or Reject.');
      return;
    }

    if (status === 'rejected' && !remark) {
      Alert.alert(
        'Warning!',
        'You need to select a remark to reject.',
      );
      return;
    }

    console.log('Submitting verification with data:', {
      role_group_id: auth.user.role_group_id?.toString(),
      status,
      discrepancies: remark,
      remarks: remark,
    });

    await api.verification
      .verify({
        deviceId: auth.deviceId as string,
        userId: auth.user.userId,
        discrepancies: remark,
        status: status as string,
        remarks: remark,
        district_id:
          state.selectedLocationData.district ||
          routeItem?.district_code ||
          routeItem?.districtCode,
        taluk_id:
          state.selectedLocationData.taluk ||
          routeItem?.taluk_code ||
          routeItem?.talukCode,
        village_id:
          state.selectedLocationData.village ||
          routeItem?.village_code ||
          routeItem?.villageCode,
        survey_number:
          state.selectedLocationData.surveyNumber ||
          routeItem?.survey_number ||
          routeItem?.surveyNumber,
        sub_division:
          state.selectedLocationData.subDivisionNumber ||
          routeItem?.sub_division_number ||
          routeItem?.subDivisionNumber,
        role_group_id: auth.user.role_group_id?.toString(),
      })
      .then(([statusRes, response]) => {
        if (statusRes === 200) {
          Alert.alert('Success', 'Verification submitted successfully', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert(
            'Error',
            `Failed to submit verification: ${statusRes}:${response?.message}`,
          );
        }
      });
  };

  useEffect(() => {
    appUpdate.checkAppBuildVersion();
  }, [BasicFunctions, auth, ln]);

  const fetchSurveyRecords = React.useCallback(async () => {
    setSurveyRecords([]);
    const records = await api.surveyRecords.getSurveyRecords({
      deviceId: auth.deviceId as string,
      userId: auth.user.userId,
      district_code:
        state.selectedLocationData.district ||
        routeItem?.district_code ||
        routeItem?.districtCode,
      taluk_code:
        state.selectedLocationData.taluk ||
        routeItem?.taluk_code ||
        routeItem?.talukCode,
      village_code:
        state.selectedLocationData.village ||
        routeItem?.village_code ||
        routeItem?.villageCode,
      survey_number:
        state.selectedLocationData.surveyNumber ||
        routeItem?.survey_number ||
        routeItem?.surveyNumber,
      sub_division:
        state.selectedLocationData.subDivisionNumber ||
        routeItem?.sub_division_number ||
        routeItem?.subDivisionNumber,
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
    routeItem,
  ]);

  useEffect(() => {
    fetchSurveyRecords();
  }, [fetchSurveyRecords]);

  const displayTotalArea =
    subDivisionTotalArea ||
    state.selectedLocationData?.ownerDetails?.extent ||
    routeItem?.extent ||
    surveyRecords?.[0]?.extent ||
    surveyRecords?.[0]?.total_extent ||
    surveyRecords?.[0]?.sub_division_area ||
    surveyRecords?.[0]?.total_area;

  return (
    <Box flex={1}>
      <ProfileHeader disableNavigation />

      {/* Sub Division & Location Header */}
      <Box bg="primary.600" p="3" shadow={2}>
        <Row flexWrap="wrap" space="2" alignItems={'center'} justifyContent="space-between">
          <Row space={'1'} alignItems="center">
            <Icon as={Entypo} name="location-pin" size={'sm'} color="white" />
            <Text color="white" fontSize={'sm'} bold>
              {state.selectedLocationData.surveyNumber ||
                routeItem?.survey_number ||
                routeItem?.surveyNumber}
              /
              {state.selectedLocationData.subDivisionNumber ||
                routeItem?.sub_division_number ||
                routeItem?.subDivisionNumber}
            </Text>
          </Row>

          {/* 1. Include Total area of the Sub Division */}
          {displayTotalArea ? (
            <Box bg="white" px="2.5" py="1" borderRadius="md">
              <Text color="primary.700" fontSize={'xs'} bold>
                {ln('Total Area') || 'Total Area'}: {displayTotalArea} Ares
              </Text>
            </Box>
          ) : null}
        </Row>

        <Row mt="1">
          <Text color="white" fontSize={'xs'} opacity={0.9} isTruncated>
            {surveyRecords?.[0]?.village_name || state.selectedLocationData?.villageName || ''}
            {surveyRecords?.[0]?.taluk_name || state.selectedLocationData?.talukName
              ? `, ${surveyRecords?.[0]?.taluk_name || state.selectedLocationData?.talukName}`
              : ''}
            {surveyRecords?.[0]?.district_name || state.selectedLocationData?.districtName
              ? `, ${surveyRecords?.[0]?.district_name || state.selectedLocationData?.districtName}`
              : ''}
          </Text>
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
                <Pressable
                  onPress={() =>
                    setImageModelData({show: true, uri: item.image_path})
                  }
                  opacity={0.9}>
                  <Image
                    source={{uri: item.image_path}}
                    style={{
                      width: '50%',
                      aspectRatio: 16 / 9,
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
            <Text fontSize="sm" color="gray.600" mb={1}>
              Crop Type: <Text bold>{item.crop_type_name}</Text> | Classification:{' '}
              <Text bold>{item.crop_classification_name}</Text>
            </Text>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Area: <Text bold>{item.area} Ares</Text>
            </Text>

            {/* 2. Include Crop Sown Month and Crop Harvest Month */}
            <Text fontSize="sm" color="gray.600" mb={1}>
              Crop Sown Month: <Text bold>{formatMonth(item.sown_date)}</Text>
            </Text>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Crop Harvest Month:{' '}
              <Text bold>{formatMonth(item.expected_harvested_date)}</Text>
            </Text>
          </Box>
        )}
        ListFooterComponent={
          <Box
            bg={'white'}
            p={3}
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
              mt={1}
              space={'2'}>
              <Row space="4" flexWrap={'wrap'}>
                <Radio value="approved" mr={4}>
                  Approved
                </Radio>
                <Radio value="rejected">Reject</Radio>
              </Row>
            </Radio.Group>

            {/* 3. Remarks (Single Select Radio Buttons) */}
            {selectedStatus === 'rejected' && (
              <Box mt={3} pt={2} borderTopWidth={1} borderTopColor="gray.200">
                <Text bold fontSize="sm" color="gray.700" mb={2}>
                  Remarks *
                </Text>
                <Radio.Group
                  name="remarksOptions"
                  value={selectedRemark}
                  onChange={val => setSelectedRemark(val)}
                  mt={1}>
                  {remarkOptions.map(opt => (
                    <Radio value={opt.value} key={opt.value} mb={2}>
                      <Text fontSize="sm">{opt.key}</Text>
                    </Radio>
                  ))}
                </Radio.Group>
              </Box>
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