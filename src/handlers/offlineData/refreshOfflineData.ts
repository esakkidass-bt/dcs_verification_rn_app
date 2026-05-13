// import downloadCropMasterData from "./downloadCropMasterData";
// import downloadOwnerData from "./downloadOwnerData";
// import downloadSeasons from "./downloadSeasons";
// import downloadSpatialData from "./downloadSpatialData";
// import downloadMiscData from "./downloadMiscData";
// import {
//   DownloadProgressStatus,
//   HandleDownloadProgressFunction,
//   ISurveyStatusSummaryOfflineProps,
//   IUser,
// } from "../../@types";
// import api from "../../api";
// import downloadWebLinks from "./downloadWebLinks";
// import apiTimestamp from "../../api/local/apiTimestamp";
// import { SQLiteService } from "../../services";

// interface Props {
//   user: IUser;
//   deviceId: string;
//   handleDownloadProgress: HandleDownloadProgressFunction;
//   handleVillageProgress: (
//     villageCode: string,
//     villageName: string,
//     status: DownloadProgressStatus,
//   ) => void;
//   handleVillageDataProgress: (
//     villageCode: string,
//     statusName: "fmbStatus" | "vectorTileStatus" | "ownerDetailsStatus",
//     status: DownloadProgressStatus,
//   ) => void;
// }

// const index = async ({ user, deviceId, handleDownloadProgress, ...props }: Props) => {
//   // await api.local.tables.clearSelectedTable({tables:['cropSurvey'], callback:async()=>{

//   // }})

//   await downloadWebLinks({
//     userId: user.userId,
//     deviceId,
//     handleDownloadProgress,
//   });
//   await downloadCropMasterData({
//     userId: user.userId,
//     deviceId,
//     handleDownloadProgress,
//   });

//   // await downloadOwnerData({
//   //   userId: user.userId, deviceId, handleDownloadProgress
//   // });
//   await downloadSeasons({
//     userId: user.userId,
//     deviceId,
//     handleDownloadProgress,
//   });
//   await downloadMiscData({
//     userId: user.userId,
//     deviceId,
//     handleDownloadProgress,
//   });

//   // await api.local.apiTimestamp.compare({
//   //   apiName:''
//   // })
//   handleDownloadProgress("surveyStats", "downloading");

//   await api.surveyStats.stats({ userId: user.userId, deviceId }).then((e) => {
//     if (e) {
//       handleDownloadProgress("surveyStats", "completed");
//     } else {
//       handleDownloadProgress("surveyStats", "failed");
//     }
//   });

//   await api.surveyStatusSummary
//     .status({
//       userId: user.userId,
//       deviceId,
//     })
//     .then(async (e) => {
//       try {
//         if (e) {
//           const statusList: ISurveyStatusSummaryOfflineProps[] = [];
//           const parseData = (item: any, status: string) =>
//             ({
//               id: `${item.district_code}_${item.taluk_code}_${item.village_code}_${status}`,
//               villageCode: item.village_code,
//               parrentVillageCode: item.village_code,
//               talukCode: item.taluk_code,
//               districtCode: item.district_code,
//               part: item.part,
//               count: item.count,
//               webView: item.web_view,
//               status,
//             }) as ISurveyStatusSummaryOfflineProps;
//           for (const item of e["completed"]) {
//             statusList.push(parseData(item, "completed"));
//           }
//           for (const item of e["pending"]) {
//             statusList.push(parseData(item, "pending"));
//           }

//           await api.local.surveyStatusSummary.storeRecords({
//             data: statusList,
//           });
//           // handleDownloadProgress('surveyStatusSummary', 'completed')
//         } else {
//           // handleDownloadProgress('surveyStatusSummary', 'failed')
//         }
//       } catch (e) {
//         // handleDownloadProgress('surveyStatusSummary', 'failed')
//         console.error("Error while parsing > ", e);
//       }
//     });

//   for (const village of user.assignedVillages) {
//     const ownerDetailsSummary = await api.ownerDetails.getOwnerDetailSummary({
//       userId: user.userId,
//       deviceId,
//       villageCode: village.villageCode,
//       talukCode: village.talukCode,
//       villageName: village.villageName.replaceAll(/'/g, "~"),
//       districtCode: village.districtCode,
//     });

//     if (ownerDetailsSummary && ownerDetailsSummary.total_page_count) {
//       await api.local.apiTimestamp.compare({
//         apiName: "owner_details",
//         villageCode: village.villageCode,
//         callback: async ({ needToUpdate }) => {
//           if (true) {
//             props.handleVillageDataProgress(
//               village.villageCode,
//               "ownerDetailsStatus",
//               "downloading",
//             );

//             const ownerDetailsStatusList: DownloadProgressStatus[] = [];
//             for (let i = 1; i <= ownerDetailsSummary.total_page_count; i++) {
//               await downloadOwnerData({
//                 userId: user.userId,
//                 districtCode: village.districtCode,
//                 talukCode: village.talukCode,
//                 villageCode: village.villageCode,
//                 villageName: village.villageName.replaceAll(/'/g, "~"),
//                 deviceId,
//                 pageNumber: i,
//                 handleDownloadProgress: (status) => {
//                   ownerDetailsStatusList.push(status);
//                   // props.handleVillageDataProgress(village.villageCode, "ownerDetailsStatus", status)
//                 },
//               });
//             }

//             // const status = ownerDetailsStatusList.some(e => 'dataNotFound') ? 'dataNotFound' : 'completed'
//             let status: DownloadProgressStatus = "completed";
//             if (ownerDetailsStatusList.includes("failed")) {
//               status = "failed";
//               props.handleVillageDataProgress(village.villageCode, "ownerDetailsStatus", status);
//             } else if (ownerDetailsStatusList.includes("dataNotFound")) {
//               status = "dataNotFound";
//               props.handleVillageDataProgress(village.villageCode, "ownerDetailsStatus", status);
//             }
//             if (status === "completed") {
//               const db = await new SQLiteService().getDb();
//               //? update the date
//               db.transaction(async (tx) => {
//                 await apiTimestamp.apiInsertTimestampQuery(
//                   tx,
//                   "owner_details",
//                   village.villageCode,
//                 );
//               });
//               props.handleVillageDataProgress(village.villageCode, "ownerDetailsStatus", status);
//             }
//           } else {
//             // await apiTimestamp.apiInsertTimestampQuery(tx, 'owner_details')
//             props.handleVillageDataProgress(village.villageCode, "ownerDetailsStatus", "completed");
//           }
//         },
//       });
//     } else {
//       props.handleVillageDataProgress(village.villageCode, "ownerDetailsStatus", "dataNotFound");
//     }

//     await api.local.apiTimestamp.compare({
//       apiName: "land_detail",
//       villageCode: village.villageCode,
//       callback: async ({ needToUpdate }) => {
//         props.handleVillageDataProgress(village.villageCode, "fmbStatus", "downloading");

//         if (needToUpdate) {
//           await downloadSpatialData({
//             userId: user.userId,
//             districtCode: village.districtCode,
//             talukCode: village.talukCode,
//             villageCode: village.villageCode,
//             villageName: village.villageName.replaceAll(/'/g, "~"),
//             deviceId,
//             handleDownloadProgress: (status) =>
//               props.handleVillageDataProgress(village.villageCode, "fmbStatus", status),
//           });
//         } else {
//           props.handleVillageDataProgress(village.villageCode, "fmbStatus", "completed");
//         }
//       },
//     });

//     await api.local.apiTimestamp.compare({
//       apiName: "vector_tiles",
//       villageCode: village.villageCode,
//       callback: async ({ needToUpdate }) => {
//         // await api.local.apiTimestamp.remove({
//         //   apiName: 'vector_tiles', villageCode: village.villageCode
//         // },)
//         if (needToUpdate) {
//           props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", "downloading");

//           await api.spatialData.vectorTiles({
//             userId: user.userId,
//             districtCode: village.districtCode,
//             talukCode: village.talukCode,
//             villageCode: village.villageCode,
//             villageName: village.villageName.replaceAll(/'/g, "~"),
//             deviceId,
//             handleDownloadProgress: (status) =>
//               props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", status),
//           });
//         } else {
//           props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", "completed");
//         }
//       },
//     });
//   }

//   // for (const village of user.assignedVillages) {
//   //
//   // await api.local.apiTimestamp.compare({
//   //   apiName: "vector_tiles",
//   //   villageCode: village.villageCode,
//   //   callback: async ({needToUpdate}) => {
//   //     console.log('>>>')
//   //     await api.local.apiTimestamp.remove({apiName:'vector_tiles', villageCode:village.villageCode},)
//   //     console.log('>>>2')
//   //     if (needToUpdate) {
//   //       props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", 'downloading')
//   //
//   //       await api.spatialData.vectorTiles({
//   //         userId: user.userId,
//   //         districtCode: village.districtCode,
//   //         talukCode: village.talukCode,
//   //         villageCode: village.villageCode,
//   //         villageName: village.villageName,
//   //         deviceId,
//   //         handleDownloadProgress: (status) => props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", status)
//   //       });
//   //     } else {
//   //       props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", 'completed')
//   //
//   //     }
//   //   }
//   // })
//   // }
// };

// export default index;
