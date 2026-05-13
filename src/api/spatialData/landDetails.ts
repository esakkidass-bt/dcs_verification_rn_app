import {Alert} from 'react-native';
import {
  IUser,
  TalukOnlineProps,
  DistrictsOnlineProps,
  VillageOnlineProps,
  LandDetailsOnlineProps,
} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  districtCode: DistrictsOnlineProps['districtCode'];
  talukCode: TalukOnlineProps['talukCode'];
  villageCode: VillageOnlineProps['villageCode'];
  deviceId: string;
}

const index = async (props: Props) => {
  const data = {
    district_code: props.districtCode,
    taluk_code: props.talukCode,
    village_code: props.villageCode,
  };
  // return landData as LandDetailsOnlineProps[];
  return await POST({
    name: 'spatialData > land_details',
    path: 'land_detail',
    data,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(async ([status, response]) => {
    const res: any = response;
    if (status === 200) {
      if (res?.success === 1) {
        return res?.data as LandDetailsOnlineProps[];
      } else if (res?.success === 2) {
        Alert.alert(
          'Data Not Found',
          `Data not found for the village : ${props.villageCode} `,
        );
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message}, \nError Code:  ${status}-${res?.success}`,
      );
    }
  });
};

export default index;
