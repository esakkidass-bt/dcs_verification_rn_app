// import { IUser } from "../../@types";
// import { ICropSurvey } from "../../@types/form";
// import { generateRandomNumber, POST } from "../../helpers";
// import { executeSql } from "../../helpers/sqlite";
// import { SQLiteService } from "../../services";
// import { ITableNames } from "../local/tables/tableData";
// import logs from "../../helpers/logs";
// import { Alert } from "react-native";
// import { WebSQLDatabase } from "expo-sqlite";

// interface Props {
//   userId: IUser["userId"];
//   surveyId: ICropSurvey["id"];
//   deviceId: string;
//   onUpdateSuccess?: () => void;
//   onUpdateFail?: ([err, status]?: [number, any]) => void;
// }

// const parseUndefinedValues = (value: any, returnableValue = "null") => {
//   if (["undefined"].includes(value)) {
//     return returnableValue;
//   }
//   return value;
// };

// interface IUploadImageProps {
//   image_id: string;
//   survey_number: string;
//   village_code: string;
//   crop_name_id: string;
//   crop_stage: string;
//   crop_image: {
//     uri: string;
//     name: string;
//     type: string;
//   };
// }
// const uploadImage = async (
//   data: IUploadImageProps,
//   props: { deviceId: string; userId: string },
// ) => {
//   return POST({
//     name: "crop_image",
//     path: "crop_image",
//     headers: {
//       "Content-Type": "multipart/form-data",
//       "X-DEVICE-ID": props.deviceId,
//       "X-USER-ID": props.userId,
//     },
//     data: data,
//   });
// };

// const updateDatabase = async (db: WebSQLDatabase, surveyId: string, data: any) => {
//   db.transaction(async (tx) => {
//     await executeSql(
//       tx,
//       "update sync status - cropSurvey",
//       `UPDATE cropSurvey SET syncStatus = 'completed' WHERE id = ${surveyId}`,
//       {
//         logSql: false,
//         debug: false,
//       },
//     );
//     await executeSql(
//       tx,
//       "update sync status - surveyStats",
//       `UPDATE surveyStats SET status = 'completed' WHERE id = "${data.districtCode}_${data.talukCode}_${data.villageCode}_${data.surveyNumber}_${data.subDivisionNumber}"`,
//     );
//     await executeSql(
//       tx,
//       "delete owner data",
//       `DELETE FROM owner WHERE CAST(districtCode AS TEXT) = (SELECT CAST(districtCode AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(talukCode AS TEXT) = (SELECT CAST(talukCode AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(villageCode AS TEXT) = (SELECT CAST(villageCode AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(surveyNumber AS TEXT) = (SELECT CAST(surveyNumber AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(subDivisionNumber AS TEXT) = (SELECT CAST(subDivisionNumber AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}');`,
//     );
//   });
// };

// const uploadSurvey = async (props: Props) => {
//   const db = await new SQLiteService().getDb();
//   db.transaction(async (tx) => {
//     const tableName: ITableNames = "cropSurvey";
//     const query = `
//       SELECT cs.districtCode AS district_code, cs.talukCode AS taluk_code, cs.villageCode AS village_code,
//              cs.surveyNumber AS survey_number, cs.subDivisionNumber AS sub_division_number,
//              (SELECT s.seasonId FROM season AS s WHERE s.villageCode = cs.villageCode AND s.talukCode = cs.talukCode AND s.districtCode = cs.districtCode) AS season_id,
//              cs.cropStage AS crop_stage, cs.croppingMethod AS cropping_method, cs.cropSeasonType AS crop_season_type,
//              cs.cropTypeId AS crop_type_id, cs.cropClassificationId AS crop_classification_id, cs.cropNameId AS crop_name_id,
//              cs.cropLandExtent AS crop_land_extent, cs.irrigationSourceId AS irrigation_source_id, cs.sownDate AS sown_date,
//              cs.expectedHarvestDate AS expected_harvested_date, cs.cultivatorTypeId AS cultivator_type_id, cs.cultivatorId AS cultivator_id,
//              cs.cultivatorName AS cultivator_name, cs.imgLat AS crop_image_latitude, cs.imgLon AS crop_image_longitude,
//              cs.imgOrientationX AS crop_image_orientation_x, cs.imgOrientationY AS crop_image_orientation_y, cs.imgOrientationZ AS crop_image_orientation_z,
//              cs.imgTimestamp AS crop_image_timestamp, cs.image AS crop_image, cs.isBorderOrRowCrop AS is_border_or_row_crop, cs.cropAge AS crop_age,
//              cs.theervai AS theervai, cs.orupogaIrupogaNanjai AS orupoga_irupoga_nanjai, cs.cropCount AS crop_count,
//              (SELECT csmd.appVersion FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS app_version,
//              (SELECT csmd.gpsAccuracy FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS gps_accuracy,
//              (SELECT csmd.formType FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS form_type,
//              (SELECT COALESCE(cis.syncStatus, 'pending') AS syncStatus FROM cropImageStatus AS cis WHERE cis.imageId = CAST(cs.image AS TEXT)) AS image_sync_status
//       FROM ${tableName} AS cs
//       LEFT JOIN cropSurveyMetaData AS csmd ON CAST(id AS TEXT) = csmd.cropSurveyId
//       WHERE CAST(id AS TEXT) = '${props.surveyId}'`;

//     await executeSql(tx, `get data from ${tableName}`, query, {
//       debug: false,
//       logSql: false,
//       callback: async (e) => {
//         try {
//           const data = e.rows._array[0];
//           if (!data) {
//             props.onUpdateFail?.([404, null]);
//             return;
//           }

//           const imageId = data.crop_image?.split("/").pop()?.split(".")[0];
//           const checkedValue: any = {};
//           for (const key of Object.keys(data)) {
//             checkedValue[key] = parseUndefinedValues(data[key]);
//           }

//           const parsedData = {
//             ...checkedValue,
//             image_id: imageId,
//           };

//           const cropImage = {
//             uri: parsedData.crop_image,
//             name: `${imageId}-${generateRandomNumber(4)}.jpg`,
//             type: "image/jpeg",
//           };

//           let imageResponse: [number, any] = [400, {}];
//           let response: [number, any] = [400, {}];
//           if (parsedData.form_type === "surveyNumberForm") {
//             // if (parsedData.image_sync_status !== "synced") {
//             //   imageResponse = await uploadImage(
//             //     {
//             //       image_id: imageId,
//             //       survey_number: parsedData?.survey_number,
//             //       village_code: parsedData?.village_code,
//             //       crop_name_id: parsedData?.crop_name_id,
//             //       crop_stage: parsedData?.crop_stage,
//             //       crop_image: cropImage,
//             //     },
//             //     {
//             //       deviceId: props.deviceId,
//             //       userId: props.userId?.toString(),
//             //     },
//             //   );
//             //   if (imageResponse[0] === 200) {
//             //     db.transaction(async (_tx) => {
//             //       await executeSql(
//             //         _tx,
//             //         `update image status to synced`,
//             //         `
//             //         INSERT OR REPLACE cropImageStatus (id, syncStatus) VALUES ('${data.crop_image}', 'synced');`,
//             //       );
//             //     });
//             //   }
//             // }
//             response = await POST({
//               data: parsedData,
//               name: `upload survey`,
//               path: "crop_survey",
//               headers: {
//                 "Content-Type": "multipart/form-data",
//                 "X-DEVICE-ID": props.deviceId,
//                 "X-USER-ID": props.userId,
//               },
//             });
//           } else {
//             parsedData.crop_image = cropImage;
//             response = await POST({
//               data: parsedData,
//               name: `upload survey`,
//               path: "crop_survey",
//               headers: {
//                 "Content-Type": "multipart/form-data",
//                 "X-DEVICE-ID": props.deviceId,
//                 "X-USER-ID": props.userId,
//               },
//             });
//           }

//           if (response[0] === 200 && response[1]?.message === "Crop detail added successfully") {
//             await updateDatabase(db, props.surveyId, data);
//             props.onUpdateSuccess?.();
//           } else {
//             Alert.alert("Error", `${response[1]}-${response[0]}`);
//             props.onUpdateFail?.([response[0], response[1]]);
//           }
//         } catch (err) {
//           console.error(err);
//           const data = e.rows._array[0];
//           await logs.writeLogToFile({
//             message: `Failed to process
// --------------------------------------------------------------------------
// survey id: ${props?.surveyId}
// time - ${new Date().toLocaleString()}
// userId - ${props?.userId}
// err - ${err?.toString() || "error while fetching data"}
// data - ${typeof data === "object" ? JSON.stringify(data, null, 2) : data}
// --------------------------------------------------------------------------`,
//             _fileName: `uploadSurvey`,
//           });
//           props.onUpdateFail?.([400, JSON.stringify(err)]);
//         }
//       },
//     });
//   });
// };

// export default uploadSurvey;
