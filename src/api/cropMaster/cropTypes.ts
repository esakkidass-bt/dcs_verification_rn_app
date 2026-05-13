import {Alert} from 'react-native';
import {CropTypeOnlineProps, IUser} from '../../@types';

import {POST} from '../../helpers';
import { asyncStorage } from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const appMode = await asyncStorage.getString('mode', 'online');

  if (appMode === 'online') {
    const data = {
      type: 'crop_type',
    };
    return await POST({
      name: 'crop_master > crop_type',
      path: 'crop_master',
      data,
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      const res = response;
      if (status === 200) {
        return res?.data as CropTypeOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    });
  } else {
    console.debug('Offline - crop_type');
    return await asyncStorage.getObj(
      'cropTypes',
      [] as CropTypeOnlineProps[],
    );
  }
};

export default index;
