import {Alert} from 'react-native';
import {IUser, SeasonOnlineProps} from '../../@types';
import {GET} from '../../helpers';
import {asyncStorage} from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

const index = async (props: Props) => {
  const appMode = await asyncStorage.getString('mode', 'online');

  if (appMode === 'online') {
    return await GET({
      name: 'season > season',
      path: 'season',
      headers: {
        'X-USER-ID': props.userId,
        'X-DEVICE-ID': props.deviceId,
      },
    }).then(([status, response]) => {
      // find the response is an array or object
      // if (Array.isArray(response)) {

      const res = response;
      if (status === 200) {
        if (res.success === 1) {
          return [200, res?.data as SeasonOnlineProps[]];
        } else {
          Alert.alert(
            'Error',
            `${res?.message}, \nError Code:  ${status}-${res?.success}`,
          );
          return [500, response];
        }
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status} - ${res?.success}`,
        );
        return [status, response];
      }
    });
  } else {
    console.debug('Offline - seasonData');
    return await asyncStorage.getObj('seasonData', [] as SeasonOnlineProps[]);
  }
};

export default index;
