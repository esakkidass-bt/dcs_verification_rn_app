// import {
//   Box,
//   Button,
//   Checkbox,
//   FlatList,
//   Pressable,
//   Row,
//   Text,
// } from 'native-base';
// import React, {useEffect, useState} from 'react';
// import {CropSurveyStatusCard} from '../../../../components';
// import FA5I from 'react-native-vector-icons/FontAwesome5';
// import * as Network from '@react-native-community/netinfo';
// import api from '../../../../api';
// import {
//   ICropSurveyDetailsOfflineProps,
//   ICropSurveyOfflineProps,
// } from '../../../../@types/form';
// import {useAuth} from '../../../../hooks';
// import {Alert} from 'react-native';
// import {SeasonOnlineProps} from '../../../../@types';
// import useDict from '../../../../hooks/useDict';

// interface UploadStatusProps {
//   uploading: boolean;
//   totalProgress: number;
//   currentProgress: number;
// }

// const Index = () => {
//   const auth = useAuth();
//   const ln = useDict();
//   const [survey, setSurvey] = useState<
//     {
//       records: ICropSurveyDetailsOfflineProps[];
//       key: string;
//       isSyncEnabled: boolean;
//     }[]
//   >([]);
//   const [selectedSurveyIds, setSelectedSurveyIds] = useState<any[]>([]);
//   // const [isLoading, setIsLoading] = useState(true);
//   // const [isSyncBtnDisabled, setIsSyncBtnDisabled] = useState(false)
//   const [uploadStatus, setUploadStatus] = useState<UploadStatusProps>({
//     uploading: false,
//     totalProgress: 0,
//     currentProgress: 0,
//   });
//   //
//   const handleUploadStatus = (key: keyof UploadStatusProps) => (value: any) => {
//     if (key === 'uploading') {
//       auth.updateLoaderStatus({
//         isLoading: value,
//         loadingText: value ? 'Uploading...' : 'Loading...',
//       });
//     }

//     // if(key==='currentProgress'){
//     //   if(value===uploadStatus.totalProgress){
//     //     auth.closeLoader()
//     //   }else{
//     //
//     //   auth.updateLoaderStatus({
//     //     isLoading: true, loadingText: `${value}/${uploadStatus.totalProgress}`,
//     //   });
//     //   }
//     // }
//     setUploadStatus(prevVal => {
//       return {...prevVal, [key]: value};
//     });
//   };

//   // const handleUploadStatus = (currentProgress:number, totalProgress:number) => {
//   //   if(currentProgress===totalProgress){
//   //     auth.closeLoader()
//   //   }else{
//   //     auth.updateLoaderStatus({
//   //       isLoading: true, loadingText: `loading - ${currentProgress}/${totalProgress}`,
//   //     });
//   //   }
//   //
//   //   // setUploadStatus((prevVal) => {
//   //   //   return {...prevVal, [k};
//   //   // });
//   // };

//   const handleSelectSurvey = async (surveyId: string | number) => {
//     setSelectedSurveyIds(prevVal => {
//       return [...prevVal, surveyId];
//     });
//   };

//   const selectAllSurvey = async () => {
//     let ids: any[] = [];
//     survey?.forEach(s => {
//       ids.push(s.key);
//     });
//     setSelectedSurveyIds(ids);
//   };

//   const clearSelection = async () => {
//     setSelectedSurveyIds([]);
//   };

//   const unSelectSurvey = async (surveyId: string | number) => {
//     setSelectedSurveyIds(prevVal => {
//       return [...prevVal.filter(e => e != surveyId)];
//     });
//   };

//   const handleDeleteSelected = async () => {
//     const surveyIds = await getSurveyIdsOfSelectedSurveyNumberGroup();

//     for (let i = 0; i < surveyIds.length; i++) {
//       await api.local.cropSurvey.remove({id: surveyIds[i]});
//     }
//     await getPendingSurvey();
//   };

//   const getSurveyIdOfSurveyNumber = async (key: string) => {
//     const surveyRecords: ICropSurveyOfflineProps[] = survey.find(
//       e => e.key === key,
//     )?.records as ICropSurveyOfflineProps[];
//     return surveyRecords.map(e => e.id);
//   };

//   const getSurveyIdsOfSelectedSurveyNumberGroup = async () => {
//     const groupedSurveyRecordIds: any[] = [];
//     for (const e of selectedSurveyIds) {
//       groupedSurveyRecordIds.push(await getSurveyIdOfSurveyNumber(e));
//     }

//     const surveyIds: string[] = [];
//     for (const surveyRecordIds of groupedSurveyRecordIds) {
//       for (const id of surveyRecordIds) {
//         surveyIds.push(id);
//       }
//     }

//     return surveyIds;
//   };

//   const handleSyncSelected = async () => {
//     console.log('handleSyncSelected');
//     if (!auth.deviceId) {
//       Alert.alert('Error', 'device id not found');
//       return;
//     }
//     // handleUploadStatus("uploading")(true);

//     const surveyIds = await getSurveyIdsOfSelectedSurveyNumberGroup();
//     for (const e of surveyIds) {
//       await api.cropSurvey.uploadSurvey({
//         userId: auth.user.userId,
//         surveyId: e,
//         deviceId: auth.deviceId as string,
//         onUpdateSuccess: () => {
//           getPendingSurvey();
//           handleUploadStatus('uploading')(false);
//         },
//         onUpdateFail: () => {
//           console.log('failed');
//           handleUploadStatus('uploading')(false);
//         },
//       });
//     }
//     // surveyIds.map(async (e) => {
//     // await api.cropSurvey.uploadSurvey({
//     //   userId: auth.user.userId,
//     //   surveyId: e,
//     //   deviceId: auth.deviceId as string,
//     //   onUpdateSuccess: () => {
//     //     getPendingSurvey();
//     //     handleUploadStatus("uploading")(false);
//     //   },
//     //   onUpdateFail: () => {
//     //     console.log('failed')
//     //     handleUploadStatus("uploading")(false);
//     //   },
//     // });
//     // });
//   };

//   // const handleSyncSelected = async () => {
//   //   try{
//   //
//   //
//   //   if (!auth.deviceId) {
//   //     Alert.alert("Error", "device id not found");
//   //     return;
//   //   }
//   //   console.log('handleSyncSelected')
//   //
//   //   const surveyIds = await getSurveyIdsOfSelectedSurveyNumberGroup();
//   //   console.log(surveyIds)
//   //     handleUploadStatus(0,surveyIds?.length)
//   //
//   //   // handleUploadStatus("uploading")(true);
//   //
//   //
//   //   for (let i = 0; i < surveyIds?.length; i++) {
//   //     console.log(i, surveyIds[i])
//   //     await api.cropSurvey.uploadSurvey({
//   //       userId: auth.user.userId,
//   //       surveyId: surveyIds[i],
//   //       deviceId: auth.deviceId as string,
//   //       onUpdateSuccess: () => {
//   //         handleUploadStatus( i+1, surveyIds?.length)
//   //
//   //       },
//   //       onUpdateFail: () => {
//   //         // handleUploadStatus("uploading")(false);
//   //         handleUploadStatus( i+1, surveyIds?.length)
//   //
//   //
//   //         console.log('error > ', surveyIds[i])
//   //       },
//   //
//   //     });
//   //   }
//   //   }finally {
//   //     getPendingSurvey();
//   //
//   //     auth.closeLoader()
//   //
//   //   }
//   //   // surveyIds.map(async (e) => {
//   //   //   await api.cropSurvey.uploadSurvey({
//   //   //     userId: auth.user.userId,
//   //   //     surveyId: e,
//   //   //     deviceId: auth.deviceId as string,
//   //   //     onUpdateSuccess: () => {
//   //   //       getPendingSurvey();
//   //   //       handleUploadStatus("uploading")(false);
//   //   //     },
//   //   //     onUpdateFail: () => {
//   //   //       console.log('failed')
//   //   //       handleUploadStatus("uploading")(false);
//   //   //     },
//   //   //   });
//   //   // });
//   // };

//   // useEffect(() => {
//   //   if(uploadStatus?.currentProgress===uploadStatus?.totalProgress){auth.closeLoader()}else{
//   //     auth.updateLoaderStatus({
//   //       isLoading: true, loadingText: `uploading (${uploadStatus?.currentProgress}/${uploadStatus?.totalProgress})`
//   //     });
//   //   }
//   // }, [uploadStatus?.currentProgress]);
//   const getPendingSurvey = async () => {
//     auth.updateLoaderStatus({
//       isLoading: true,
//       loadingText: 'Getting pending survey...',
//     });
//     await api.local.cropSurvey.getCropSurveyDetail({
//       syncStatus: 'pending',
//       callback: e => {
//         const groupedData = e.reduce(
//           (
//             groups: Record<
//               string,
//               {
//                 records: ICropSurveyOfflineProps[];
//                 key: string;
//                 isSyncEnabled: boolean;
//               }
//             >,
//             item: ICropSurveyOfflineProps,
//           ) => {
//             const {
//               surveyNumber,
//               subDivisionNumber,
//               districtCode,
//               villageCode,
//               talukCode,
//             } = item;
//             const key = `${districtCode}-${talukCode}-${villageCode}-${surveyNumber}-${subDivisionNumber}`;

//             if (!groups[key]) {
//               groups[key] = {
//                 key: key,
//                 records: [],
//                 isSyncEnabled: Boolean(item.isSyncEnabled),
//               };
//             }
//             groups[key].records.push(item);
//             return groups;
//           },
//           {},
//         );

//         const groupedArray: any[] = Object.values(groupedData);
//         setSurvey(groupedArray);
//         clearSelection();
//         auth.closeLoader();
//       },
//     });
//   };

//   const checkSeason = async () => {
//     auth.updateLoaderStatus({
//       isLoading: true,
//       loadingText: 'Checking Season...',
//     });
//     const network = await Network?.fetch();
//     if (network.isInternetReachable) {
//       const seasons = await api.season.getSeasons({
//         userId: auth.user.userId,
//         deviceId: auth?.deviceId || '',
//       });
//       if (seasons[0] !== 200) {
//         console.log('season check failed');
//         auth.closeLoader();
//         return;
//       }

//       let seasonsParsed: SeasonOnlineProps[] = [];
//       // if(seasons?.length===0)
//       seasons?.forEach((e: any) => {
//         seasonsParsed.push({
//           districtCode: e.district_code,
//           talukCode: e.taluk_code,
//           villageCode: e.village_code,
//           seasonId: e.season_id,
//           seasonName: e.season_name,
//           masterSeasonId: e.master_season_id,
//           id: `${e.district_code}_${e.taluk_code}_${e.village_code}`,
//         });
//       });
//       await api.local.seasons.store({
//         data: seasonsParsed,
//         callback: async () => {
//           await getPendingSurvey();
//         },
//       });
//     } else {
//       Alert.alert('Alert', 'Network not available. Unable to check the season');
//       getPendingSurvey();
//     }
//     auth.closeLoader();
//   };

//   useEffect(() => {
//     checkSeason();
//     return () => {
//       // cleanup
//       auth.closeLoader();

//       setSurvey([]);
//       setSelectedSurveyIds([]);
//     };
//   }, []);

//   return (
//     <Box flex="1">
//       <Row justifyContent="center">
//         <Box
//           justifyContent={'center'}
//           flex="1"
//           bg="#f9fbf9"
//           m="2"
//           p="4"
//           borderRadius={'xl'}>
//           <Box alignItems={'center'}>
//             <Text fontSize={'xl'} color="blue.600">
//               {ln('Pending to sync')}
//             </Text>
//             <Text bold fontSize={'2xl'}>
//               {survey?.length}
//             </Text>
//           </Box>
//         </Box>
//       </Row>

//       <Row alignItems={'center'} justifyContent="space-between" m="2">
//         <Row space={'2'} alignItems={'center'}>
//           <Checkbox
//             value=""
//             accessibilityLabel="Select All"
//             isChecked={
//               selectedSurveyIds?.length > 0 &&
//               selectedSurveyIds?.length === survey?.length
//             }
//             onChange={() => {
//               if (selectedSurveyIds?.length === survey?.length) {
//                 clearSelection();
//               } else {
//                 selectAllSurvey();
//               }
//             }}
//           />
//           {/* {selectedSurveyIds?.length > 0 ? <Text>{selectedSurveyIds?.length}</Text> : null} */}
//           <Button
//             backgroundColor="blue.600"
//             onPress={() => {
//               auth.openLoader('loading');
//               setTimeout(() => {
//                 handleSyncSelected();
//               }, 1000);
//             }}
//             // onPress={()=>console.log('>')}
//             isDisabled={
//               selectedSurveyIds?.length === 0
//               // ||
//               // survey.some((s) => s.isSyncEnabled == 0)
//             }>
//             <Row alignItems={'center'} space="2">
//               <FA5I name="sync-alt" color="white" />
//               <Text color={'white'}>Sync {selectedSurveyIds?.length} Data</Text>
//             </Row>
//           </Button>
//           <Button
//             backgroundColor="red.600"
//             onPress={handleDeleteSelected}
//             isDisabled={selectedSurveyIds?.length === 0}>
//             <Row alignItems={'center'} space="2">
//               <FA5I name="sync-alt" color="white" />
//               <Text color={'white'}>
//                 Delete {selectedSurveyIds?.length} Data
//               </Text>
//             </Row>
//           </Button>
//         </Row>
//       </Row>

//       <FlatList
//         flex="1"
//         data={survey}
//         renderItem={({item}: {item: any}) =>
//           item?.records?.length > 0 ? (
//             <Box borderBottomColor={'gray.300'} borderBottomWidth={'1'} mt="3">
//               <Box my="2">
//                 <Pressable
//                   onPress={() => {
//                     if (selectedSurveyIds.includes(item?.key)) {
//                       unSelectSurvey(item?.key);
//                     } else {
//                       handleSelectSurvey(item?.key);
//                     }
//                   }}>
//                   <Row space="2">
//                     <Checkbox
//                       accessibilityLabel="Select"
//                       value=""
//                       isChecked={selectedSurveyIds.includes(item.key)}
//                     />
//                     <Text bold letterSpacing={'2'}>
//                       {item?.records[0]?.surveyNumber}/
//                       {item?.records[0]?.subDivisionNumber}
//                     </Text>
//                   </Row>
//                 </Pressable>
//               </Box>
//               {/*<Text>{item.records[0]?.id}</Text>*/}
//               {item?.records.map((e: any, idx: number) => (
//                 <CropSurveyStatusCard surveyData={e} key={idx} />
//               ))}
//             </Box>
//           ) : null
//         }
//         keyExtractor={(item, index) => `${index}`}
//         refreshing={auth.loaderStatus.isLoading}
//         onRefresh={getPendingSurvey}
//       />
//       {/* <LoadingOverlay
//         isLoading={uploadStatus.uploading}
//         loadingText={uploadStatus.uploading ? "Uploading" : ""}
//       /> */}
//     </Box>
//   );
// };

// export default Index;
