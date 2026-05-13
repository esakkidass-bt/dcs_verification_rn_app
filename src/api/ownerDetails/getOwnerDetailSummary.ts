import {Alert} from 'react-native';
import {
  DistrictsOnlineProps,
  IUser,
  OwnerDetailSummaryProps,
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
}

const index = async (props: Props) => {
  const data = {
    district_code: props.districtCode,
    taluk_code: props.talukCode,
    village_code: props.villageCode,
  };
  return await POST({
    name: 'owner_detail_summary',
    path: 'owner_detail_summary',
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
        return res?.data as OwnerDetailSummaryProps;
      } else {
        Alert.alert('Error', `${res?.message}, \nError Code: ${res?.success}`);
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message || response}, \nError Code:  ${status}-${res?.success}`,
      );
    }
  });
};

export default index;
