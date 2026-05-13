import {Alert} from 'react-native';
import {IUser, VillagesAssignedData} from '../../@types';

import {GET} from '../../helpers';
import config from '../../config';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const name = 'location_details > online_details';
  return await GET({
    name,
    path: 'online_location_details',
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;
    if (status === 200) {
      return res?.data as VillagesAssignedData;
    } else {
      Alert.alert('Error', `${res} in ${name}, \nError Code: ${status}`);
    }
  });
};

export default index;
