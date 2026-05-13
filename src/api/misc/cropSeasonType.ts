import {Alert} from 'react-native';
import {IUser, MiscCropSeasonTypeOnlineProps} from '../../@types';

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
      type: 'crop_season_type',
    };
    return await POST({
      name: 'misc > crop_season_type',
      path: 'misc',
      data,
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      const res = response;
      if (status === 200) {
        return res?.data as MiscCropSeasonTypeOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    });
  } else {
    console.debug('Offline - cropSeasonType');
    return await asyncStorage.getObj(
      'cropSeasonType',
      [] as MiscCropSeasonTypeOnlineProps[],
    );
  }
};

export default index;
