import config from '../../config';
import { GET } from '../restMethods';
import remoteConfig from '@react-native-firebase/remote-config';


export const FIREBASE_URL_LIST = [
  // 'crop_master',
  // 'login',
  // 'logout',
  // 'resend_otp',
  // 'otp',
  // 'crop_survey',
  // 'owner_details',
  // 'season',
  // 'survey_status',
  // 'refresh_user_details',
  // 'web_links',
  // 'land_detail',
  // 'vector_tiles',
  // 'misc',
  // 'api_timestamp',
  // 'owner_detail_summary',
  // 'owner_details_paginated',
  // 'survey_status_summary',
  // 'crop_image',


  "api_timestamp",
  "crop_master",
  "crop_survey",
  "land_detail",
  "login",
  "logout",
  "misc",
  "otp",
  "owner_details",
  "refresh_user_details",
  "resend_otp",
  "season",
  "survey_status",
  "vector_tiles",
  "web_links",
 
  
  "owner_details_paginated",
  "owner_detail_summary",
  "crop_image",
  "survey_status_summary",
  "online_location_details",
  "online_spatial_boundary",
  "online_spatial_boundary",
  "online_survey_dropdown",
];

// export const getUrlFromFirebase = async (name: string) => {
//   const links: any = await firestore()
//     .collection(config.env)
//     .doc('links')
//     .get();
//   const URL = links?._data?.[name];
//   console.log('firebase url > ', URL);
//   return URL;
// };
export const getUrlFromFirebase = async (name: string) => {
  const link: any = remoteConfig().getValue(name).asString();
  // const URL = links?._data?.[name];
  // console.log('firebase url > ', link);
  return link;
};

export const getLatestAppVersion = async () => {
  // if (config.env === 'training') {
  //   const appVersion: any = await firestore()
  //     .collection(config.env)
  //     .doc('appVersion')
  //     .get();
  //   return appVersion?._data?.androidVersion;
  // }

  return await GET({
    name: 'app_version',
    path: 'app_version',
  }).then(([status, data]) => {
    if (status === 200) {
      return data.data?.app_version as string;
    } else {
      return null;
    }
  });

  // const network = await Network.getNetworkStateAsync();
  // if (network.isConnected && network.isInternetReachable) {
  //   return await GET({
  //     name: "app_version",
  //     path: "app_version",
  //   }).then(([status, data]) => {
  //     if (status === 200) {
  //       return data.data?.app_version as string;
  //     } else {
  //       return null;
  //     }
  //   });
  // } else {
  //   return config.version;
  // }
};
