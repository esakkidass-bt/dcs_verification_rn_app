import {Alert} from 'react-native';
import {DownloadProgressStatus, IUser} from '../../@types';
import {POST} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  handleDownloadProgress?: (status: DownloadProgressStatus) => void;
}

interface VillageSurveyStatus {
  village_code: string;
  taluk_code: string;
  district_code: string;
  part: string;
  count: string;
  web_view: string;
}

export interface ISurveyStatusSummaryOnlineProps {
  completed: VillageSurveyStatus[];
  pending: VillageSurveyStatus[];
}

const index = async (props: Props) => {
  // return landData as LandDetailsOnlineProps[];
  const stats = await POST({
    name: 'survey_status_summary',
    path: 'survey_status_summary',
    data: null,
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(async ([status, response]) => {
    const res: any = response;
    if (status === 200) {
      if (res?.success === 1) {
        return res?.data as ISurveyStatusSummaryOnlineProps;
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
        return {} as ISurveyStatusSummaryOnlineProps;
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message}, \nError Code:  ${status}-${res?.success}`,
      );
      return {} as ISurveyStatusSummaryOnlineProps;
    }
  });
  return stats;
};

export default index;
