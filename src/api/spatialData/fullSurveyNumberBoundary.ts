import {Alert} from 'react-native';
import {
  IUser,
  TalukOnlineProps,
  DistrictsOnlineProps,
  VillageOnlineProps,
} from '../../@types';
import {POST} from '../../helpers';
import {GeoJsonMultiPolygon} from '../../@types/geoJson';
import config from '../../config';

interface Props {
  userId: IUser['userId'];
  districtCode: DistrictsOnlineProps['districtCode'];
  talukCode: TalukOnlineProps['talukCode'];
  villageCode: VillageOnlineProps['villageCode'];
  surveyNumber: string;
  deviceId: string;
}

const index = async (props: Props) => {
  const data = {
    district_code: props.districtCode,
    taluk_code: props.talukCode,
    survey_number: props.surveyNumber,
    village_code: props.villageCode,
  };
  // return landData as LandDetailsOnlineProps[];
  return await POST({
    name: 'online > spatial_boundary - full_survey_number',
    data: {
      ...data,
      dropdown_type: 'full_survey_number',
    },
    path: 'online_spatial_boundary',
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(async ([status, response]) => {
    const res: any = response;
    console.debug('full_survey_number >', res, data);
    if (status === 200) {
      if (res?.success === 1) {
        return res?.data as {
          type: 'FeatureCollection';
          features: GeoJsonMultiPolygon[];
        };
      } else if (res?.success === 2) {
        Alert.alert(
          'Data Not Found',
          `No boundary data found for the survey number - ${props.villageCode}-${props.surveyNumber}`,
        );
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message}, \nError Code:  ${status}-${res?.success}`,
      );
    }
  });
};

export default index;
