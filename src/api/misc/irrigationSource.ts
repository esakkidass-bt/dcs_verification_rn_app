import {Alert} from 'react-native';
import {IUser, MiscIrrigationSourceOnlineProps} from '../../@types';
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
      type: 'irrigation_source',
    };
    return await POST({
      name: 'misc > irrigation_source',
      path: 'misc',
      data,
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      const res = response;
      if (status === 200) {
        return res?.data as MiscIrrigationSourceOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    });
  } else {
    console.debug('Offline - irrigationSource');
    return await asyncStorage.getObj(
      'irrigationSource',
      [] as MiscIrrigationSourceOnlineProps[],
    );
  }
};


export default index;