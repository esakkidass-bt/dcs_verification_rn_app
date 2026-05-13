import {Alert} from 'react-native';
import {IUser} from '../../@types';

import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const data = {
    user_id: props.userId,
    device_id: props.deviceId,
  };
  return await POST({
    name: 'registerDevice (reassign_device)',
    path: 'reassign_device',
    data,
  }).then(([status, res]) => {
    const response = res;
    if (status === 200) {
      console.log('Success', `${response?.message}`);
    } else {
      Alert.alert(
        'Error',
        `${response?.message} \nError Code: ${response?.success}`,
      );
    }
    return res[0];
  });
};

export default index;
