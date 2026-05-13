import {Alert} from 'react-native';
import {MiscCropStageOnlineProps, IUser} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const data = {
    type: 'crop_stage',
  };
  return await POST({
    name: 'misc > crop_stage',
    path: 'misc',
    data,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;
    if (status === 200) {
      return res?.data as MiscCropStageOnlineProps[];
    } else {
      Alert.alert(
        'Error',
        `${res?.message}, \nError Code:  ${status}-${res?.success}`,
      );
    }
  });
};

export default index;
