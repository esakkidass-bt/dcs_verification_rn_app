import {Alert} from 'react-native';
import {DownloadProgressStatus, IUser} from '../../@types';
import {GET, } from '../../helpers';


interface Props {
  userId: IUser['userId'];
  deviceId: string;
  roleGroupId: number;
  handleDownloadProgress?: (status: DownloadProgressStatus) => void;
}

interface VillageSurveyStatusData {
  survey_number: string;
  sub_division_number: string;
}

// interface VillageSurveyStatus {
//   village_code: string;
//   district_code?: string;
//   taluk_code?: string;
//   count: number;
//   data: VillageSurveyStatusData[];
// }

export interface ISurveyStatusOnlineProps {
    district_code: string;
    district_name: string;
    taluk_code: string;
    taluk_name: string;
    village_code: string;
    village_name: string;
    stats: {
      assigned: number;
      pending: number;
      approved: number;
      rejected: number;
    };
}

const index = async (props: Props) => {
  // return landData as LandDetailsOnlineProps[];

  const stats = await GET({
    name: 'surveyStats > verification/stats',
    path: 'verification/stats',
    queryParam: {
      role_group_id: props.roleGroupId,
      user_id: props.userId,
    },
    headers: {
      'X-USER-ID': props.userId,
      'X-DEVICE-ID': props.deviceId,
    },
  }).then(async ([status, response]) => {
    const res: any = response;
    if (status === 200) {
      if (res?.success === 1) {
        return res?.data as ISurveyStatusOnlineProps[];
      } else {
        Alert.alert(
          'Error',
          `${res?.message}, \nError Code:  ${status}-${res?.success}`,
        );
        return [] as ISurveyStatusOnlineProps[];
      }
    } else {
      Alert.alert(
        'Error',
        `${res?.message}, \nError Code:  ${status}-${res?.success}`,
      );
      return [] as ISurveyStatusOnlineProps[];
    }
  });

  // const buildQuery = async (_data: ISurveyStatusOnlineProps) => {
  //   let query = `INSERT OR REPLACE INTO surveyStats VALUES `;
  //   let overAllSurveyCount = 0;

  //   db.transaction(async _tx => {
  //     Object.entries(_data).forEach(([key, value], idx1) => {
  //       value.forEach((village: VillageSurveyStatus, idx2: number) => {
  //         const {district_code, taluk_code, village_code, count, data} =
  //           village;
  //         overAllSurveyCount += count;
  //         const id = `${district_code}_${taluk_code}_${village_code}`;
  //         data.forEach(async (survey, idx3) => {
  //           let _query = `${query} (
  //           "${id}_${survey.survey_number}_${survey.sub_division_number}",
  //           "${district_code}",
  //           "${taluk_code}",
  //           "${village_code}",
  //           "${survey.survey_number}",
  //           "${survey.sub_division_number}",
  //           "${key}"
  //         )`;
  //           await executeSql(_tx, 'update survey status', _query || '', {
  //             debug: false,
  //             // logSql: false,
  //             callback: () => props.handleDownloadProgress?.('completed'),
  //             // errorCallback: () => props.handleDownloadProgress?.("failed")
  //           });
  //         });
  //       });
  //     });
  //   });

  //   // if (overAllSurveyCount > 0) {
  //   //   return query;
  //   // } else {
  //   //   return null;
  //   // }
  // };
  // buildQuery(stats);

  // if (query ) {
  //   if (query.slice(-1) === ",") {
  //     query = query.slice(0, -1) ||'';
  //   }
  //   await db.transaction(async (_tx) => {
  //   await executeSql(_tx, "update survey status", query||'', {
  //     debug: false,
  //     // logSql: false,
  //     callback: () => props.handleDownloadProgress?.("completed"),
  //   });
  // });
  // }

  return stats;
};

export default index;
