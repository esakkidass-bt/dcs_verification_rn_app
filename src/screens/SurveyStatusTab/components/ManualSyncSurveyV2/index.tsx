// import { Box, Button, Checkbox, FlatList, Pressable, Row, Text } from "native-base";
// import { CropSurveyStatusCard, UploadCounter } from "../../../../components";
// import React, { useEffect, useState } from "react";
// import { FontAwesome5 as FA5I } from "@expo/vector-icons";
// import useDict from "../../../../hooks/useDict";
// import { ICropSurveyDetailsOfflineProps, ICropSurveyOfflineProps } from "../../../../@types";
// import api from "../../../../api";
// import { useAuth } from "../../../../hooks";

// interface UploadStatusProps {
//   uploading: boolean;
//   totalProgress: number;
//   currentProgress: number;
// }

// const Index = () => {
//   const ln = useDict();
//   const auth = useAuth();
//   const D = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
//   const [isUpload, setIsUpload] = useState(false);
//   const [survey, setSurvey] = useState<
//     {
//       records: ICropSurveyDetailsOfflineProps[];
//       key: string;
//       isSyncEnabled: boolean;
//     }[]
//   >([]);
//   const [selectedSurveyIds, setSelectedSurveyIds] = useState<any[]>([]);

//   const handleSelectSurvey = async (surveyId: string | number) => {
//     setSelectedSurveyIds((prevVal) => {
//       return [...prevVal, surveyId];
//     });
//   };

//   const selectAllSurvey = async () => {
//     let ids: any[] = [];
//     survey?.forEach((s) => {
//       ids.push(s.key);
//     });
//     setSelectedSurveyIds(ids);
//   };

//   const clearSelection = async () => {
//     setSelectedSurveyIds([]);
//   };

//   const unSelectSurvey = async (surveyId: string | number) => {
//     setSelectedSurveyIds((prevVal) => {
//       return [...prevVal.filter((e) => e != surveyId)];
//     });
//   };

//   const handleDeleteSelected = async () => {
//     const surveyIds = await getSurveyIdsOfSelectedSurveyNumberGroup();

//     for (let i = 0; i < surveyIds.length; i++) {
//       await api.local.cropSurvey.remove({ id: surveyIds[i] });
//     }
//     await getPendingSurvey();
//   };

//   const getSurveyIdOfSurveyNumber = (key: string) => {
//     const surveyRecords: ICropSurveyOfflineProps[] = survey.find((e) => e.key === key)
//       ?.records as ICropSurveyOfflineProps[];
//     return surveyRecords.map((e) => e.id);
//   };

//   const getSurveyIdsOfSelectedSurveyNumberGroup = () => {
//     const groupedSurveyRecordIds: any[] = [];
//     for (const e of selectedSurveyIds) {
//       groupedSurveyRecordIds.push(getSurveyIdOfSurveyNumber(e));
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
//     setIsUpload(true);
//   };

//   const getPendingSurvey = async () => {
//     auth.updateLoaderStatus({
//       isLoading: true,
//       loadingText: "Getting pending survey...",
//     });
//     await api.local.cropSurvey.getCropSurveyDetail({
//       syncStatus: "pending",
//       callback: (e) => {
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
//             const { surveyNumber, subDivisionNumber, districtCode, villageCode, talukCode } = item;
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

//         // console.log("######################################################");
//         // console.log(JSON.stringify(groupedArray));
//         // console.log("######################################################");
//         clearSelection();
//         auth.closeLoader();
//       },
//     });
//   };

//   useEffect(() => {
//     if (!isUpload) {
//       getPendingSurvey();
//     }
//   }, [isUpload]);

//   return (
//     <Box flex={"1"}>
//       {isUpload ? (
//         <UploadCounter
//           surveyRecordIds={getSurveyIdsOfSelectedSurveyNumberGroup()}
//           onCancel={() => {
//             setIsUpload(false);
//           }}
//           onComplete={() => {
//             setIsUpload(false);
//           }}
//           show={isUpload}
//         />
//       ) : null}

//       <Row justifyContent="center">
//         <Box justifyContent={"center"} flex="1" bg="#f9fbf9" m="2" p="4" borderRadius={"xl"}>
//           <Box alignItems={"center"}>
//             <Text fontSize={"xl"} color="blue.600">
//               {ln("Pending to sync")}
//             </Text>
//             <Text bold fontSize={"2xl"}>
//               {survey?.length}
//             </Text>
//           </Box>
//         </Box>
//       </Row>

//       <Row alignItems={"center"} justifyContent="space-between" m="2">
//         <Row space={"2"} alignItems={"center"}>
//           <Checkbox
//             value=""
//             accessibilityLabel="Select All"
//             isChecked={
//               selectedSurveyIds?.length > 0 && selectedSurveyIds?.length === survey?.length
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
//               // auth.openLoader('loading')
//               setTimeout(() => {
//                 handleSyncSelected();
//               }, 1000);
//             }}
//             // onPress={()=>console.log('>')}
//             isDisabled={
//               selectedSurveyIds?.length === 0
//               // ||
//               // survey.some((s) => s.isSyncEnabled == 0)
//             }
//           >
//             <Row alignItems={"center"} space="2">
//               <FA5I name="sync-alt" color="white" />
//               <Text color={"white"}>{ln("manualSyncBtn").replace("${selectedSurveyIdsLength}",(selectedSurveyIds?.length)?.toString())}</Text>
//             </Row>
//           </Button>
//           <Button
//             backgroundColor="red.600"
//             onPress={handleDeleteSelected}
//             isDisabled={selectedSurveyIds?.length === 0}
//           >
//             <Row alignItems={"center"} space="2">
//               <FA5I name="sync-alt" color="white" />
//               <Text color={"white"}>{ln("deleteSyncBtn").replace("${selectedSurveyIdsLength}",(selectedSurveyIds?.length)?.toString())}</Text>

//               {/* <Text color={"white"}>Delete {selectedSurveyIds?.length} Data</Text> */}
//             </Row>
//           </Button>
//         </Row>
//       </Row>

//       <FlatList
//         flex="1"
//         data={survey}
//         renderItem={({ item }: { item: any }) =>
//           item?.records?.length > 0 ? (
//             <Box borderBottomColor={"gray.300"} borderBottomWidth={"1"} mt="3">
//               <Box my="2">
//                 <Pressable
//                   onPress={() => {
//                     if (selectedSurveyIds.includes(item?.key)) {
//                       unSelectSurvey(item?.key);
//                     } else {
//                       handleSelectSurvey(item?.key);
//                     }
//                   }}
//                 >
//                   <Row space="2">
//                     <Checkbox
//                       accessibilityLabel="Select"
//                       value=""
//                       isChecked={selectedSurveyIds.includes(item.key)}
//                     />
//                     <Text bold letterSpacing={"2"}>
//                       {item?.records[0]?.surveyNumber}/{item?.records[0]?.subDivisionNumber}
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
//     </Box>
//   );
// };

// export default Index;
