import {Alert} from 'react-native';
import { IUser } from '../@types';
import { GET } from '../helpers';
import { ICheckStatsData } from '../@types/stats';


interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const name = 'checkStats';
  return await GET({
    name,
    path: 'checkStats',
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
    queryParam:{
        user_id: props.userId,
    }
  }).then(([status, response]) => {
    const res = response;
    if (status === 200) {
      return res?.data as ICheckStatsData;
    } else {
      Alert.alert('Error', `${res} in ${name}, \nError Code: ${status}`);
    }
  });
};

export default index;
