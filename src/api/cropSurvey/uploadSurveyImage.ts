import {ICropSurvey, IUser} from '../../@types';
import {generateRandomNumber, POST} from '../../helpers';
import logs from '../../helpers/logs';
import {executeSql} from '../../helpers/sqlite';
import {SQLiteService} from '../../services';
import {ITableNames} from '../local/tables/tableData';
// import { executeSql } from "../../helpers/sqlite";
// import { SQLiteService } from "../../services";
// import { ITableNames } from "../local/tables/tableData";

interface Props {
  userId: IUser['userId'];
  surveyIds: ICropSurvey['id'][];
  deviceId: string;
  // onUpdateSuccess?: () => void;
  onImageUploadFailure?: ([statusCode, data]: [
    number,
    {ids: any[]; message?: string},
  ]) => void;
  onImageUploadSuccess?: ([statusCode, data]: [number, {ids: any[]}]) => void;
  onUpdateFail?: ([err, status]?: [number, any]) => void;
}

interface IUploadImageApiProps {
  image_id: string;
  survey_number: string;
  village_code: string;
  crop_name_id: string;
  crop_stage: string;
  crop_image: {
    uri: string;
    name: string;
    type: string;
  };
}
const uploadImage = async (
  data: IUploadImageApiProps,
  props: {deviceId: string; userId: string},
) => {
  return await POST({
    name: 'crop_image',
    path: 'crop_image',
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-DEVICE-ID': props.deviceId,
      'X-USER-ID': props.userId,
    },
    data: data,
  });
};

interface IImageMetaDataQueryProps {
  id: string;
  district_code: string;
  taluk_code: string;
  village_code: string;
  survey_number: string;
  sub_division_number: string;
  crop_name_id: string;
  crop_image: any;
  crop_stage: string;
  image_sync_status: string;
}
export default async function uploadSurveyImage(props: Props) {
  const db = await new SQLiteService().getDb();
  db.transaction(async tx => {
    const tableName: ITableNames = 'cropSurvey';
    const surveyIds = `('${props.surveyIds.join("', '")}')`;
    const query = `
      SELECT
      csmd.cropSurveyId as id,
             cs.districtCode AS district_code,
             cs.talukCode AS taluk_code,
             cs.villageCode AS village_code,
             cs.surveyNumber AS survey_number,
             cs.subDivisionNumber AS sub_division_number,
              cs.cropNameId AS crop_name_id,
             cs.image AS crop_image,
             cs.cropStage AS crop_stage,
             (SELECT COALESCE(cis.syncStatus, 'pending') AS syncStatus FROM cropImageStatus AS cis WHERE cis.imageId = CAST(cs.image AS TEXT)) AS image_sync_status
      FROM ${tableName} AS cs
       LEFT JOIN cropSurveyMetaData AS csmd ON CAST(id AS TEXT) = csmd.cropSurveyId
      WHERE CAST(id AS TEXT) in ${surveyIds}`;
    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: true,
      logSql: true,
      callback: async e => {
        // console.log(e?.rows?.item(0));
        let dataArray: IImageMetaDataQueryProps[] = [];

        let len = e.rows.length;
        for (let i = 0; i < len; i++) {
          let row = e.rows.item(i);
          dataArray.push(row);
        }

        try {
          // console.debug(
          //   "uploadSurveyimage > ",
          //   dataArray ? JSON.stringify(dataArray) : dataArray
          // );
          async function getUniqueArray(array: IImageMetaDataQueryProps[]) {
            const result: {
              crop_image: any;
              image_sync_status: string;
              id: string[];
              survey_number: string;
              village_code: string;
              crop_name_id: string;
              crop_stage: string;
            }[] = [];
            const map = new Map();
            await Promise.all(
              array.map(async item => {
                if (item.crop_image != null) {
                  if (!map.has(item.crop_image)) {
                    map.set(item.crop_image, {
                      ...item,
                      crop_image: item.crop_image,
                      id: [],
                    });
                    result.push(map.get(item.crop_image));
                  }
                  map.get(item.crop_image).id.push(item.id);
                } else {
                  logs.writeLogToFile({
                    _fileName: 'uploadSurvey',
                    message: `crop image not found for survey number > ${item.district_code}_${item.taluk_code}_${item.village_code}_${item.survey_number}_${item.sub_division_number} - ${item.id}_ `,
                  });
                }
              }),
            );
            return result;
          }
          const uniqueArray = await getUniqueArray(dataArray);
          for (const data of uniqueArray) {
            if (!data) {
              props?.onImageUploadFailure?.([
                404,
                {ids: [], message: 'Image not found'},
              ]);
              return;
            }
            const imageId = data.crop_image?.split('/').pop()?.split('.')[0];
            const cropImage = {
              uri: data.crop_image,
              name: `${imageId}-${generateRandomNumber(4)}.jpg`,
              type: 'image/jpeg',
            };
            // let imageResponse: [number, any] = [200, {}];
            if (data?.image_sync_status !== 'synced') {
              await uploadImage(
                {
                  image_id: imageId,
                  survey_number: data?.survey_number,
                  village_code: data?.village_code,
                  crop_name_id: data?.crop_name_id,
                  crop_stage: data?.crop_stage,
                  crop_image: cropImage,
                },
                {
                  deviceId: props.deviceId,
                  userId: props.userId?.toString(),
                },
              ).then(async imageResponse => {
                if (
                  imageResponse[0] === 200 ||
                  (imageResponse[0] === 400 &&
                    imageResponse[1]?.message ===
                      'Image reference ID already Exists')
                ) {
                  if (
                    imageResponse[0] === 400 &&
                    imageResponse[1]?.message ===
                      'Image reference ID already Exists'
                  ) {
                    await logs.writeLogToFile({
                      message: `image already exist for survey numbers > ${JSON.stringify(
                        data,
                      )}`,
                      _fileName: `uploadSurvey`,
                    });
                  }
                  db.transaction(async _tx => {
                    await executeSql(
                      _tx,
                      `update image status to synced`,
                      `
                        INSERT OR REPLACE INTO cropImageStatus (imageId, syncStatus, syncedAt) VALUES ('${data.crop_image}', 'synced', DATETIME('now'));`,
                      {
                        debug: false,
                        logSql: false,
                        callback: () => {
                          props?.onImageUploadSuccess?.([
                            imageResponse[0],
                            {ids: data.id},
                          ]);
                        },
                        errorCallback: () => {
                          logs.writeLogToFile({
                            message: `Failed to update image sync status in DB
            --------------------------------------------------------------------------
            time - ${new Date().toLocaleString()}
            userId - ${props?.userId}
            data - ${
              typeof data === 'object' ? JSON.stringify(data, null, 2) : data
            }
            --------------------------------------------------------------------------`,
                            _fileName: `uploadSurvey`,
                          });
                          props?.onImageUploadFailure?.([
                            imageResponse[0],
                            {ids: data.id},
                          ]);
                        },
                      },
                    );
                  });
                } else {
                  props?.onImageUploadFailure?.([
                    imageResponse[0],
                    {ids: data.id},
                  ]);
                }
              });
            } else {
              props?.onImageUploadSuccess?.([600, {ids: data.id}]);
              await logs.writeLogToFile({
                message: `Image Already synced
      --------------------------------------------------------------------------
      time - ${new Date().toLocaleString()}
      userId - ${props?.userId}
      data - ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
      --------------------------------------------------------------------------`,
                _fileName: `uploadSurvey`,
              });
            }
          }
        } catch (err) {
          console.error(err);
          const data = e.rows.item(0);
          await logs.writeLogToFile({
            message: `Failed to process
  --------------------------------------------------------------------------
  time - ${new Date().toLocaleString()}
  userId - ${props?.userId}
  err - ${err?.toString() || 'error while fetching data'}
  data - ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
  --------------------------------------------------------------------------`,
            _fileName: `uploadSurvey`,
          });
          props.onUpdateFail?.([400, JSON.stringify(err)]);
        }
      },
    });
  });
}
