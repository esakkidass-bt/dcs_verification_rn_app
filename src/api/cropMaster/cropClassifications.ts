import {Alert} from 'react-native';
import {CropClassificationOnlineProps, IUser} from '../../@types';

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
      type: 'crop_classification',
    };
    const name = 'crop_master > crop_classification';
    return await POST({
      name: 'crop_master > crop_classification',
      path: 'crop_master',
      data,
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      const res = response;
      if (status === 200) {
        return res?.data as CropClassificationOnlineProps[];
      } else {
        Alert.alert('Error', `${res} in ${name}, \nError Code: ${status}`);
      }
    });
  } else {
    console.debug('Offline - crop_classification');
    return await asyncStorage.getObj('cropClassifications', [] as CropClassificationOnlineProps[]);
  }
};

export default index;
