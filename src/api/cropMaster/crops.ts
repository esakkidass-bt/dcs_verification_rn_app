import {Alert} from 'react-native';
import {IUser, CropOnlineProps} from '../../@types';

import {POST} from '../../helpers';
import {asyncStorage} from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const appMode = await asyncStorage.getString('mode', 'online');

  if (appMode === 'online') {
    const data = {
      type: 'crop_name',
    };
    const name = 'crop_master > crop_name';
    return await POST({
      name: 'crop_master > crop_name',
      path: 'crop_master',
      data,
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      const res = response;
      if (status === 200) {
        return res?.data as CropOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message} ${name}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    });
  } else {
    console.debug('Offline - cropNames')
    return await asyncStorage.getObj('cropNames', [] as CropOnlineProps[]);
  }
};

export default index;
