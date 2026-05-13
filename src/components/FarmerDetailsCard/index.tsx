import {Box, Row, Text} from 'native-base';
import React, {memo, useEffect} from 'react';
import {useAuth, useStateContext} from '../../hooks';
import useDict from '../../hooks/useDict';
import {parseLandExtent} from '../../helpers/landExtent';
import {cultiVatorTypes} from '../../const';
import api from '../../api';
import {OwnerDetailsOnlineProps} from '../../@types';
import {Alert} from 'react-native';

const Index = () => {
  const ln = useDict();
  const auth = useAuth();
  // const state = useStateContext()
  const {selectedLocationData: locData, handleSelectedLocationData} =
    useStateContext();
  const {landExtendValueString} = parseLandExtent(
    locData?.ownerDetails?.extent,
  );

  const getOwnerDetails = async () => {
    if (auth.appMode === 'offline') {
      await api.local.ownerDetails.read({
        callback: e => {
          if (e.length < 1) {
            Alert.alert(
              'No owner found',
              'Please refresh the local data from the settings page and try again. If the problem persists, please contact the admin.',
            );
            handleSelectedLocationData('ownerDetails')(
              {} as OwnerDetailsOnlineProps,
            );
            return;
          }
          handleSelectedLocationData('ownerDetails')(
            e[0] as unknown as OwnerDetailsOnlineProps,
          );
        },
        subDivisionNumber: locData.subDivisionNumber,
        villageCode: locData.village,
        surveyNumber: locData.surveyNumber,
      });
    } else {
      await api.surveyDropdown
        .ownerDetail({
          userId: auth.user.userId,
          deviceId: auth.deviceId as string,
          district_code: locData.district,
          taluk_code: locData.taluk,
          village_code: locData.village,
          sub_division: locData.subDivisionNumber,
          survey_number: locData.surveyNumber,
          role_group_id: auth.user.role_group_id,
        })
        .then(e => {
          if (e) {
            if (e.length < 1) {
              Alert.alert(
                'No owner found',
                'Please refresh the local data from the settings page and try again. If the problem persists, please contact the admin.',
              );
              handleSelectedLocationData('ownerDetails')(
                {} as OwnerDetailsOnlineProps,
              );
              return;
            }
            handleSelectedLocationData('ownerDetails')(
              e[0] as OwnerDetailsOnlineProps,
            );
          }
        });
    }
  };

  useEffect(() => {
    if (locData.surveyNumber && locData.village && locData.subDivisionNumber) {
      getOwnerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locData.subDivisionNumber]);

  return locData.ownerDetails?.id ? (
    <Row space={'2'} pt="1" px="2" bg="white" alignItems={'center'}>
      <Box flex={'1'}>
        <Row space={'2'}>
          <Text>{ln('Owner Name')}</Text>
          <Text flex="1" bold isTruncated>
            {locData?.ownerDetails?.owner_name}
          </Text>
        </Row>
        {locData?.ownerDetails?.farmer_name ? (
          <Row space={'2'}>
            <Text>{ln('Farmer Name')}</Text>
            <Text flex="1" bold isTruncated>
              {locData?.ownerDetails?.farmer_name}
              <Text color={'muted.400'} fontWeight={'light'}>
                (
                {
                  cultiVatorTypes.find(
                    e =>
                      parseInt(e?.value) ==
                      locData?.ownerDetails?.owner_type_id,
                  )?.label
                }
                )
              </Text>
            </Text>
          </Row>
        ) : null}
        <Row flex={'1'}>
          <Row space={'2'} flex={'1'}>
            <Text>{ln('Farmer Data Type')}</Text>
            <Text flex="1" bold isTruncated>
              {locData?.ownerDetails?.farmer_data_type}
            </Text>
          </Row>
          <Row space={'2'} flex={'1'}>
            <Text>{ln('Theervai')}</Text>
            <Text flex="1" bold isTruncated>
              {locData?.ownerDetails?.theervai}
            </Text>
          </Row>
        </Row>
        <Row justifyContent={'space-between'}>
          <Row space={'2'}>
            <Text bold>{ln('Area')}</Text>
            <Text>{landExtendValueString}</Text>
          </Row>
          <Row space={'2'}>
            <Text bold>{ln('Patta')}</Text>
            <Text>{locData?.ownerDetails?.patta_number}</Text>
          </Row>
          <Row space={'2'}>
            <Text bold>{ln('Land Type')}</Text>
            <Text>
              {locData?.ownerDetails?.land_type === 'null'
                ? '-'
                : locData?.ownerDetails?.land_type}
            </Text>
          </Row>
        </Row>
      </Box>
    </Row>
  ) : null;
};

export default memo(Index);
