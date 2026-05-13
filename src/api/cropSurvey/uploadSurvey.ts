import {IUser, SeasonOnlineProps} from '../../@types';
import {ICropSurvey} from '../../@types/form';
import {generateRandomNumber, POST} from '../../helpers';

import logs from '../../helpers/logs';
import {Alert} from 'react-native';
import {SQLiteService} from '../../services';
import {ITableNames} from '../local/tables/tableData';
import {executeSql} from '../../helpers/sqlite';
import {asyncStorage} from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  surveyId: ICropSurvey['id'];
  deviceId: string;
  onUpdateSuccess?: () => void;
  onUpdateFail: ([err, status]: [number, any]) => void;
}

const parseUndefinedValues = (value: any, returnableValue = 'null') => {
  if (['undefined'].includes(value)) {
    return returnableValue;
  }
  return value;
};

const updateDatabase = async (db: any, surveyId: string, data: any) => {
  db.transaction(async (tx: any) => {
    await executeSql(
      tx,
      'update sync status - cropSurvey',
      `UPDATE cropSurvey SET syncStatus = 'completed' where CAST(id AS TEXT) = '${surveyId}'`,
      {
        logSql: true,
        debug: true,
      },
    );
    // await executeSql(
    //   tx,
    //   'update sync status - surveyStats',
    //   `UPDATE surveyStats SET status = 'completed' WHERE id = "${data.districtCode}_${data.talukCode}_${data.villageCode}_${data.surveyNumber}_${data.subDivisionNumber}"`,
    // );
    await executeSql(
      tx,
      'delete owner data',
      `DELETE FROM owner 
WHERE CAST(district_code AS TEXT) = (SELECT CAST(districtCode AS TEXT) FROM cropSurvey 
WHERE CAST(id AS TEXT) = '${surveyId}') AND 
CAST(taluk_code AS TEXT) = (SELECT CAST(talukCode AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(village_code AS TEXT) = (SELECT CAST(villageCode AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(survey_number AS TEXT) = (SELECT CAST(surveyNumber AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}') AND CAST(sub_division_number AS TEXT) = (SELECT CAST(subDivisionNumber AS TEXT) FROM cropSurvey WHERE CAST(id AS TEXT) = '${surveyId}');`,
      {
        logSql: true,
        debug: true,
      },
    );
  });
};

const uploadSurvey = async (props: Props) => {
  const db = await new SQLiteService().getDb();

  const allSeasonData = (await asyncStorage.getObj(
    'seasonData',
  )) as SeasonOnlineProps[];

  db.transaction(async tx => {
    const tableName: ITableNames = 'cropSurvey';

    const query = `
      SELECT cs.districtCode AS district_code, cs.talukCode AS taluk_code, cs.villageCode AS village_code,
             cs.surveyNumber AS survey_number,
             cs.subDivisionNumber AS sub_division_number,
             cs.croppingMethod AS cropping_method,
             cs.cropSeasonType AS crop_season_type,
             cs.cropTypeId AS crop_type_id,
             cs.cropClassificationId AS crop_classification_id,
             cs.cropNameId AS crop_name_id,
             cs.cropLandExtent AS crop_land_extent,
             cs.sownDate AS sown_date,
             cs.expectedHarvestDate AS expected_harvested_date,
             cs.cultivatorTypeId AS cultivator_type_id,
             cs.cultivatorId AS cultivator_id,
             cs.cultivatorName AS cultivator_name,
             cs.imgLat AS crop_image_latitude,
             cs.imgLon AS crop_image_longitude,
             cs.imgOrientationX AS crop_image_orientation_x,
             cs.imgOrientationY AS crop_image_orientation_y,
             cs.imgOrientationZ AS crop_image_orientation_z,
             cs.imgTimestamp AS crop_image_timestamp,
             cs.image AS crop_image,
             cs.isBorderOrRowCrop AS is_border_or_row_crop,
             cs.cropAge AS crop_age,
             cs.cropCount AS crop_count,
             (SELECT csmd.appVersion FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS app_version,
             (SELECT csmd.gpsAccuracy FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS gps_accuracy,
             (SELECT csmd.formType FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS form_type,
             (SELECT COALESCE(cis.syncStatus,
             'pending') AS syncStatus FROM cropImageStatus AS cis WHERE cis.imageId = CAST(cs.image AS TEXT)) AS image_sync_status
      FROM ${tableName} AS cs
      LEFT JOIN cropSurveyMetaData AS csmd ON CAST(id AS TEXT) = csmd.cropSurveyId
      WHERE CAST(id AS TEXT) = '${props.surveyId}'`;
    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: false,
      logSql: false,
      callback: async e => {
        try {
          const data = e.rows.item(0);
          if (!data) {
            props.onUpdateFail?.([404, 'data not found in the db']);
            return;
          }

          // season id

          const seasonData = allSeasonData.find(
            (item: SeasonOnlineProps) =>
              item.village_code === data.village_code,
          );

          const imageId = data.crop_image?.split('/').pop()?.split('.')[0];
          const checkedValue: any = {};
          for (const key of Object.keys(data)) {
            checkedValue[key] = parseUndefinedValues(data[key]);
          }
          const parsedData = {
            ...checkedValue,
            image_id: imageId,
            season_id: seasonData?.season_id,
          };
          const cropImage = {
            uri: parsedData.crop_image,
            name: `${imageId}-${generateRandomNumber(4)}.jpg`,
            type: 'image/jpeg',
          };
          const handleAfterUpload = async ([status, response]: [
            number,
            any,
          ]) => {
            const _res =
              typeof response === 'object'
                ? JSON.stringify(response)
                : typeof response === 'string'
                ? response
                : 'Unknown ';
            if (
              status === 200 &&
              response?.message === 'Crop detail added successfully'
            ) {
              await updateDatabase(db, props.surveyId, data);
              props.onUpdateSuccess?.();
            } else {
              Alert.alert('Error', `${_res}-${status}`);
              props.onUpdateFail?.([status, _res]);
            }
          };
          // console.log('parsedData', JSON.stringify(parsedData));
          if (parsedData.form_type === 'surveyNumberForm') {
            await POST({
              data: parsedData,
              name: `upload survey`,
              path: 'crop_survey',
              headers: {
                'Content-Type': 'multipart/form-data',
                'X-DEVICE-ID': props.deviceId,
                'X-USER-ID': props.userId,
              },
            }).then(async e => handleAfterUpload(e));
          } else {
            parsedData.crop_image = cropImage;
            await POST({
              data: parsedData,
              name: `upload survey`,
              path: 'crop_survey',
              headers: {
                'Content-Type': 'multipart/form-data',
                'X-DEVICE-ID': props.deviceId,
                'X-USER-ID': props.userId,
              },
            }).then(async e => handleAfterUpload(e));
          }
        } catch (err) {
          console.error(err);
          const data = e.rows.item(0);
          await logs.writeLogToFile({
            message: `Failed to process
          --------------------------------------------------------------------------
          survey id: ${props?.surveyId}
          time - ${new Date().toLocaleString()}
          userId - ${props?.userId}
          err - ${err?.toString() || 'error while fetching data'}
          data - ${
            typeof data === 'object' ? JSON.stringify(data, null, 2) : data
          }
          --------------------------------------------------------------------------`,
            _fileName: `uploadSurvey`,
          });
          props.onUpdateFail?.([
            400,
            typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
          ]);
        }
      },
    });
  });
};

export default uploadSurvey;
