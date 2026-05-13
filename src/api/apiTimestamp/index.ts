import {Alert} from 'react-native';
import {ApiTimestampOnlineProps, IUser} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  villageCode: string;
}

const apiTimestamp = async (props: Props) => {
  const data = {
    village_code: props.villageCode,
  };
  const name = 'api_timestamp > api_timestamp';
  return await POST({
    name: 'api_timestamp',
    path: 'api_timestamp',
    data,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;
    if (status === 200) {
      return res.data as ApiTimestampOnlineProps;
    } else {
      if (status === 404) {
        Alert.alert('Error', `${res} in ${name}, \nError Code: ${status}`);
      } else {
        Alert.alert(
          'Error',
          `${res?.message} in ${name}, \nError Code: ${status}-${res?.success}`,
        );
      }
    }
  });
};

export {apiTimestamp};
