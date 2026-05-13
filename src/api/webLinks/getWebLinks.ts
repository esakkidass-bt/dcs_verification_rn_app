import {Alert} from 'react-native';
import {IUser, WebLinkOnlineProps} from '../../@types';
import {GET} from '../../helpers';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
}

// {
//   "success": 1,
//   "message": "Web Links Details",
//   "data": [
//   {
//     "web_link_id": 1,
//     "display_name": "Crop Survey Dashboard",
//     "web_link":
//       "https://tngis.tnega.org/crop_survey_dashboard/"
//   }
// ]
// }

const index = async (props: Props) => {
  const name = 'web_links';
  return await GET({
    name,
    path: 'web_links',
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(([status, response]) => {
    const res = response;
    if (status === 200) {
      return res?.data as WebLinkOnlineProps[];
    } else {
      Alert.alert('Error', `${res} in ${name}, \nError Code: ${status}`);
    }
  });
};

export default index;
