import {Alert} from 'react-native';
import {
  DistrictsOnlineProps,
  IUser,
  OwnerDetailsOnlineProps,
  TalukOnlineProps,
  VillageOnlineProps,
} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  districtCode: DistrictsOnlineProps['districtCode'];
  talukCode: TalukOnlineProps['talukCode'];
  villageCode: VillageOnlineProps['villageCode'];
  pageNumber: number;
}

const index = async (props: Props) => {
  const data = {
    district_code: props.districtCode,
    taluk_code: props.talukCode,
    village_code: props.villageCode,
    page_number: props.pageNumber,
  };
  return await POST({
    name: 'owner_details_paginated',
    path: 'owner_details_paginated',
    data,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    // const res = response?.isArray ? response[0] : response;
    const res = response;
    if (status === 200) {
      if (res.success === 1) {
        console.debug(
          '--------------------------api--------------------------------',
        );
        console.debug(`village - ${props.villageCode} (${props.villageCode})`);
        console.debug(`count : ${res.data?.length}`);
        console.debug('--------------------------------');
        return res?.data as OwnerDetailsOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code: ${res?.success}, \npage:${data?.page_number}; village:${data?.village_code}`,
        );
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message || response}, \nError Code:  ${status}-${
          res?.success
        } \npage:${data?.page_number}; village:${data?.village_code}`,
      );
    }
  });
};

export default index;
