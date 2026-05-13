import {Alert} from 'react-native';
import {IUser} from '../../@types';
import {GET} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  callBack: () => void;
}

const index = async (props: Props) => {
  return await GET({
    name: 'auth > ßlogout',
    path: 'logout',
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;
    if (status === 200) {
      if (res?.success === 1) {
        props.callBack();
        return res?.data;
      } else {
        Alert.alert('Error', `${res?.message}, \nError Code: ${res?.success}`);
      }
    } else {
      Alert.alert('Error', `${res?.message}, \nError Code: ${res?.success}`);
    }
  });
};

export default index;
