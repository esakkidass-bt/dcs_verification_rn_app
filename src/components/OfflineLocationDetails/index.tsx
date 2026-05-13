import Entypo from 'react-native-vector-icons/Entypo';
import {Box, Icon, Row, Text} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {useStateContext} from '../../hooks';
import {asyncStorage} from '../../helpers/asyncStorage';
import {VillageDetail} from '../../@types';
import {IOfflineVillageDetail} from '../../@types';

interface Props {
  showSurveyNumber?: boolean;
  showSubDivisionNumber?: boolean;
}

export default function Index(props: Props) {
  // ? hooks
  const [locationData, setLocationData] = useState<{
    villageName: string | undefined;
    districtName: string | undefined;
    talukName: string | undefined;
  }>();
  const state = useStateContext();

  const getSelectedLocationDetail = useCallback(async () => {
    // state.selectedLocationData.village
    const assignedLocationDetails = await asyncStorage.getObj(
      'assignedLocationDetails',
    );

    const offlineVillage: IOfflineVillageDetail = await asyncStorage.getObj(
      'villageOfflineData',
    );

    const selectedVillage = assignedLocationDetails?.village_details?.find(
      (e: VillageDetail) =>
        e?.village_lgd_code?.toString() === offlineVillage?.villageCode,
    );
    setLocationData({
      districtName: selectedVillage?.district_name,
      villageName: selectedVillage?.village_name,
      talukName: selectedVillage?.taluk_name,
    });

    if (offlineVillage?.villageBoundary) {
      state.setError(null);
      state.handleSelectedFeature('village')(offlineVillage.villageBoundary);
    } else {
      state.setError('Village boundary not found. Please contact TNeGA');
    }

    // console.debug('selectedVillage>>>',
    //   offlineVillage,
    //   assignedLocationDetails?.village_details,
    //   'state.selectedLocationData.village',
    //   state.selectedLocationData.village,
    //   {
    //   districtName: selectedVillage?.district_name,
    //   villageName: selectedVillage?.village_name,
    //   talukName: selectedVillage?.taluk_name,
    // });
  }, [state.selectedLocationData.village]);

  useEffect(() => {
    getSelectedLocationDetail();
  }, []);

  useEffect(() => {
    asyncStorage.getObj('assignedLocationDetails').then(e => {
      console.log('assignedLocationDetails>>>', e);
    });
  }, []);

  return (
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
            {props.showSurveyNumber ? (
              <Text color="white" fontSize={'xs'} isTruncated>
                {state.selectedLocationData.surveyNumber}
              </Text>
            ) : null}

            {props.showSubDivisionNumber ? (
              <Text color="white" fontSize={'xs'} isTruncated>
                /{state.selectedLocationData.subDivisionNumber}
              </Text>
            ) : null}
          </Row>

          {/*<Text color="white" fontSize={"xs"}  isTruncated>*/}
          {/*  {props.showSurveyNumber ? `${state.selectedLocationData.surveyNumber}/${state.selectedLocationData.subDivisionNumber}, ` : ''}{locationData.villageName}, {locationData.talukName}, {locationData.districtName}*/}
          {/*</Text>*/}

          <Text color="white" fontSize={'xs'} isTruncated>
            {locationData?.villageName}, {locationData?.talukName},{' '}
            {locationData?.districtName}
            {state.selectedLocationData.village}
          </Text>
        </Row>
      </Row>
    </Box>
  );
}
