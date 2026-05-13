// import {useEffect, useState} from 'react';
// import {Gyroscope} from 'expo-sensors';
// import {downloadUserData, refreshOfflineData} from '../../handlers/offlineData';

// import {
//   ApiTimestampOfflineProps,
//   ApiTimestampOnlineProps,
//   DownloadProgressStatus,
//   IUser,
// } from '../../@types';
// import api from '../../api';

// // get x,y,z from Gyroscope expo-sensors

// interface Props {
//   deviceId: string;
// }

// type ProgressKeys =
//   | 'villageData'
//   | 'userData'
//   | 'seasonData'
//   | 'cropData'
//   | 'miscData'
//   | 'webLinks'
//   | 'surveyStats';

// interface VillageProgressProps {
//   [key: string]: {
//     villageName: string;
//     status: DownloadProgressStatus;
//     fmbStatus: DownloadProgressStatus;
//     ownerDetailsStatus: DownloadProgressStatus;
//     vectorTileStatus: DownloadProgressStatus;
//   };
// }

// interface BaseDownloadProgressProps {
//   status: DownloadProgressStatus;
//   label: string;
//   timestampKey?: keyof ApiTimestampOnlineProps;
// }

// interface IProgressProps {
//   villageData: VillageProgressProps;
//   userData: BaseDownloadProgressProps;
//   webLinks: BaseDownloadProgressProps;
//   seasonData: BaseDownloadProgressProps;
//   cropMasterData: BaseDownloadProgressProps;
//   miscData: BaseDownloadProgressProps;
//   surveyStats: BaseDownloadProgressProps;
// }

// const initialProgressData = {
//   userData: {status: 'pending', label: 'User Data'},
//   webLinks: {status: 'pending', label: 'Web Links', timestampKey: 'web_links'},
//   cropMasterData: {
//     status: 'pending',
//     label: 'Crop Master Data',
//     timestampKey: 'crop_master_major_crops',
//   },
//   seasonData: {status: 'pending', label: 'Season Data', timestampKey: 'season'},
//   miscData: {
//     status: 'pending',
//     label: 'Misc Data',
//     timestampKey: 'misc_crop_stage',
//   },
//   surveyStats: {status: 'pending', label: 'Survey Status'},
//   villageData: {},
// } as IProgressProps;

// const useAppDataDownload = (props: Props) => {
//   const [downloadStatus, setDownloadStatus] = useState<
//     'downloading' | 'downloaded' | 'failed'
//   >();
//   const [progress, setProgress] = useState<IProgressProps>(initialProgressData);

//   const resetProgressStatus = () => {
//     setProgress(initialProgressData);
//   };

//   const handleDownloadProgress = async (
//     name: string,
//     status: DownloadProgressStatus,
//   ) => {
//     console.log(
//       'downloadProgressStatus > ',
//       name,
//       status,
//       Date.now().toString(),
//     );
//     // if(status==='downloading') return
//     setProgress((prevVal: any) => {
//       return {...prevVal, [name]: {...prevVal[name], status}};
//     });
//   };

//   const handleVillageProgress = async (
//     villageCode: string,
//     villageName: string,
//     status: DownloadProgressStatus,
//   ) => {
//     setProgress((prevVal: any) => {
//       return {
//         ...prevVal,
//         villageData: {
//           ...prevVal.villageData,
//           [villageCode]: {villageName, status},
//         },
//       };
//     });
//   };

//   const handleVillageDataProgress = async (
//     villageCode: string,
//     statusName: 'fmbStatus' | 'vectorTileStatus' | 'ownerDetailsStatus',
//     status: DownloadProgressStatus,
//   ) => {
//     setProgress((prevVal: any) => {
//       return {
//         ...prevVal,
//         villageData: {
//           ...prevVal.villageData,
//           [villageCode]: {
//             ...prevVal.villageData[villageCode],
//             [statusName]: status,
//           },
//         },
//       };
//     });
//   };

//   const buildInitialVillageProgressData = async (user: IUser) => {
//     const villageProgressData: VillageProgressProps = {};
//     user.assignedVillages.forEach(village => {
//       villageProgressData[village.villageCode] = {
//         villageName: village.villageName,
//         status: 'pending',
//         ownerDetailsStatus: 'pending',
//         fmbStatus: 'pending',
//         vectorTileStatus: 'pending',
//       };
//     });

//     setProgress(prevVal => {
//       return {...prevVal, villageData: villageProgressData};
//     });
//     return villageProgressData;
//   };

//   const download = async ({user}: {user: IUser}) => {
//     await resetProgressStatus();
//     await buildInitialVillageProgressData(user);
//     // await api.local.tables.clearTables({secureTables:['appSettings', 'user', 'assignedVillage', 'metaData']})
//     await downloadUserData({
//       user_name: user.userName,
//       user_id: user.userId.toString(),
//       mobile_number: user.mobileNumber,
//       role: user.role,
//       assigned_villages: user.assignedVillages,
//       handleDownloadProgress: handleDownloadProgress,
//     }).then(async () => {
//       for (const village of user.assignedVillages) {
//         await api
//           .apiTimestamp({
//             villageCode: village.villageCode,
//             userId: user.userId,
//             deviceId: props.deviceId,
//           })
//           .then(async e => {
//             if (e) {
//               await api.local.apiTimestamp.store({
//                 data: e,
//                 villageCode: village.villageCode,
//               });
//             }
//           });
//       }
//       await refreshOfflineData({
//         user,
//         deviceId: props.deviceId,
//         handleDownloadProgress,
//         handleVillageProgress,
//         handleVillageDataProgress,
//       });
//     });
//   };

//   return {progress, download, downloadStatus, setDownloadStatus};
// };

// export default useAppDataDownload;
