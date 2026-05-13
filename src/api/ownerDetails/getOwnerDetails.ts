import {Alert} from 'react-native';
import {IUser, OwnerDetailsOnlineProps} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const data = null;
  return await POST({
    name: 'owner_details',
    path: 'owner_details',
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
        return res?.data as OwnerDetailsOnlineProps[];
        // return []
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
