import {Alert} from 'react-native';
import {
  IUser,
  OwnerDetailsOnlineProps,
} from '../../@types';

import {POST} from '../../helpers';
import config from '../../config';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  district_code: string;
  taluk_code: string;
  village_code: string;
  survey_number: string;
  sub_division: string;
  role_group_id: string;
}

const index = async (props: Props) => {
  const name = 'online > ownerDetails';
  console.debug(name);
  return await POST({
    name,
    // path: 'location_details',
    path: 'online_assigned_survey_dropdown',
    data: {
      district_code: props.district_code,
      taluk_code: props.taluk_code,
      village_code: props.village_code,
      survey_number: props.survey_number,
      sub_division: props.sub_division,
      dropdown_type: 'owner_details',
      role_group_id: props.role_group_id,
    },
    // log: {
    //   text: true,
    // },
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;

    if (status === 200) {
      return res?.data as OwnerDetailsOnlineProps[];
    } else {
      Alert.alert(
        'Error',
        `${
          typeof res === 'object' ? JSON.stringify(res) : res
        } in ${name}, \nError Code: ${status}`,
      );
    }
  });
};

export default index;
