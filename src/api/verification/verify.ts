import {Alert} from 'react-native';
import {IUser} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;

  status: string;
  discrepancies: string;
  remarks: string;
  district_id: string;
  taluk_id: string;
  village_id: string;
  survey_number: string;
  sub_division: string;
  role_group_id: string;
}

const index = async (props: Props) => {
    console.log('dd')
  return await POST({
    name: 'verification > survey_verify',
    path: 'survey_verify',
    data: props,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(async ([status, response]) => {
    const res: any = response;
    console.log('posr>')
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
