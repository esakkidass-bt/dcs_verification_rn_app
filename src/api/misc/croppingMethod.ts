import {Alert} from 'react-native';
import {IUser, MiscCroppingMethodOnlineProps} from '../../@types';
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
      type: 'cropping_method',
    };
    return await POST({
      name: 'misc > cropping_method',
      path: 'misc',
      data,
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      const res = response;
      if (status === 200) {
        return res?.data as MiscCroppingMethodOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    });
  } else {
    console.debug('Offline - croppingMethod');
    return await asyncStorage.getObj('croppingMethod', [] as MiscCroppingMethodOnlineProps[]);
  }
};

export default index;
