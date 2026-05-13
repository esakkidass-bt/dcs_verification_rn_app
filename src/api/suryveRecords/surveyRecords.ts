import {Alert} from 'react-native';
import {
  IUser,
} from '../../@types';

import {GET} from '../../helpers';
import { SurveyDetailProps } from '../../screens.verifier/SurveyDetail';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  district_code: string;
  taluk_code: string;
  village_code: string;
  survey_number: string;
  sub_division: string;
}

const index = async (props: Props) => {
  const name = 'online > survey_records';
  console.debug(name);
  return await GET({
    name,
    // path: 'location_details',
    path: 'getSurveyDetails',
    queryParam: {
      district_code: props.district_code,
      taluk_code: props.taluk_code,
      village_code: props.village_code,
      survey_number: props.survey_number,
      sub_division_number: props.sub_division,
    },
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;

    if (status === 200) {
      return res?.data as SurveyDetailProps[];
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
