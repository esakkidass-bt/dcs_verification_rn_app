import {Alert} from 'react-native';
import {IUser} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  return await POST({
    name: 'user > refresh_user_details',
    path: 'refresh_user_details',
    data: null,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(async ([status, response]) => {
    const res: any = response;
    if (status === 200) {
      if (res.success === 1) {
        return [200, res];
      } else if (res.success === 0) {
        Alert.alert('Data Not Found', `${res?.message} `);
        return [404, {}];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
        return [500, {}];
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message}, \nError Code:  ${status}-${res?.success}`,
      );
      return [500, {}];
    }
  });
};

export default index;
