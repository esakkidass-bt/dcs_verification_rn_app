import {IUser} from '../../@types';
import {ICropSurvey} from '../../@types/form';
import config from '../../config';
import {generateRandomNumber, POST} from '../../helpers';

import logs from '../../helpers/logs';
import {Alert} from 'react-native';

interface IPayLoadProps {
  district_code: any;
  taluk_code: any;
  village_code: any;
  survey_number: any;
  sub_division_number: any;
  season_id: any;
  cropping_method: any;
  crop_season_type: any;
  crop_type_id: any;
  crop_classification_id: any;
  crop_name_id: any;
  crop_land_extent: any;
  sown_date: any;
  expected_harvested_date: any;
  cultivator_type_id: any;
  cultivator_id: any;
  cultivator_name: any;
  crop_image_latitude: any;
  crop_image_longitude: any;
  crop_image_orientation_x: any;
  crop_image_orientation_y: any;
  crop_image_orientation_z: any;
  crop_image_timestamp: any;
  is_border_or_row_crop: any;
  crop_age: any;
  crop_count: any;
  app_version: any;
  gps_accuracy: any;
  form_type: any;
  id: any;
  irrigationSourceId: any;
  crop_image: any;
}

// const imageId = crop_image?.split('/').pop()?.split('.')[0];

interface Props {
  userId: IUser['userId'];
  data: IPayLoadProps;
  imageId: string;
  deviceId: string;
  onUpdateSuccess?: () => void;
  onUpdateFail: (e: string) => void;
}

const parseUndefinedValues = (value: any, returnableValue = 'null') => {
  if (['undefined'].includes(value)) {
    return returnableValue;
  }
  return value;
};

const uploadSurvey = async (props: Props) => {
  const {crop_image: cropImage, ...data} = props.data;

  const checkedValue: any = {};
  for (const key of Object.keys(data)) {
    checkedValue[key] = parseUndefinedValues((data as any)[key]);
  }
  const parsedData = {
    ...checkedValue,
    image_id: props.imageId,
    app_version: config.version,
    gps_accuracy: props.data.gps_accuracy || -1,
    form_type: props.data.form_type,
    crop_age: 0,
    theervai: 0,
    orupoga_irupoga_nanjai: 0,
  };

  // console.log(JSON.stringify(parsedData));
  // console.log('parsedData', JSON.stringify(parsedData));
  // console.log('>>>>>>>>>>>>>>', parsedData?.crop_image_timestamp ,'<<<<<<<<<<<<<<<<s');

  if (parsedData.form_type === 'surveyNumberForm') {
    return await POST({
      data: parsedData,
      name: `upload survey`,
      path: 'crop_survey',
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-DEVICE-ID': props.deviceId,
        'X-USER-ID': props.userId,
      },
    }).then(async e => {
      // if the status is not 2xx, then return the error
      if (!String(e[0]).startsWith('2')) {
        const _res =
          typeof e[1] === 'object'
            ? JSON.stringify(e[1])
            : typeof e[1] === 'string'
            ? e[1]
            : 'Unknown ';
        props.onUpdateFail?.(`${_res}-${e[0]}`);
        return e;
      }
      props.onUpdateSuccess?.();
      return e;
    });
  } else {
    parsedData.crop_image = cropImage;
    return await POST({
      data: parsedData,
      name: `upload survey`,
      path: 'crop_survey',
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-DEVICE-ID': props.deviceId,
        'X-USER-ID': props.userId,
      },
    }).then(async e => {
      // if the status is not 2xx, then return the error
      if (!String(e[0]).startsWith('2')) {
        const _res =
          typeof e[1] === 'object'
            ? JSON.stringify(e[1])
            : typeof e[1] === 'string'
            ? e[1]
            : 'Unknown ';
        props.onUpdateFail?.(`${_res}-${e[0]}`);
        return e;
      }
      props.onUpdateSuccess?.();
      return e;
    });
    // .then(async e => handleAfterUpload(e));
  }

  // db.transaction(async tx => {
  //   const tableName: ITableNames = 'cropSurvey';
  //   // cs.cropStage AS crop_stage,
  //   // cs.irrigationSourceId AS irrigation_source_id,
  //   // cs.theervai AS theervai,
  //   // cs.orupogaIrupogaNanjai AS orupoga_irupoga_nanjai,
  //   const query = `
  //     SELECT cs.districtCode AS district_code, cs.talukCode AS taluk_code, cs.villageCode AS village_code,
  //            cs.surveyNumber AS survey_number,
  //            cs.subDivisionNumber AS sub_division_number,
  //            (SELECT s.seasonId FROM season AS s WHERE s.villageCode = cs.villageCode AND s.talukCode = cs.talukCode AND s.districtCode = cs.districtCode) AS season_id,
  //            cs.croppingMethod AS cropping_method,
  //            cs.cropSeasonType AS crop_season_type,
  //            cs.cropTypeId AS crop_type_id,
  //            cs.cropClassificationId AS crop_classification_id,
  //            cs.cropNameId AS crop_name_id,
  //            cs.cropLandExtent AS crop_land_extent,
  //            cs.sownDate AS sown_date,
  //            cs.expectedHarvestDate AS expected_harvested_date,
  //            cs.cultivatorTypeId AS cultivator_type_id,
  //            cs.cultivatorId AS cultivator_id,
  //            cs.cultivatorName AS cultivator_name,
  //            cs.imgLat AS crop_image_latitude,
  //            cs.imgLon AS crop_image_longitude,
  //            cs.imgOrientationX AS crop_image_orientation_x,
  //            cs.imgOrientationY AS crop_image_orientation_y,
  //            cs.imgOrientationZ AS crop_image_orientation_z,
  //            cs.imgTimestamp AS crop_image_timestamp,
  //            cs.image AS crop_image,
  //            cs.isBorderOrRowCrop AS is_border_or_row_crop,
  //            cs.cropAge AS crop_age,
  //            cs.cropCount AS crop_count,
  //            (SELECT csmd.appVersion FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS app_version,
  //            (SELECT csmd.gpsAccuracy FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS gps_accuracy,
  //            (SELECT csmd.formType FROM cropSurveyMetaData AS csmd WHERE csmd.cropSurveyId = CAST(cs.id AS TEXT)) AS form_type,
  //            (SELECT COALESCE(cis.syncStatus,
  //            'pending') AS syncStatus FROM cropImageStatus AS cis WHERE cis.imageId = CAST(cs.image AS TEXT)) AS image_sync_status
  //     FROM ${tableName} AS cs
  //     LEFT JOIN cropSurveyMetaData AS csmd ON CAST(id AS TEXT) = csmd.cropSurveyId
  //     WHERE CAST(id AS TEXT) = '${props.surveyId}'`;
  //   // await executeSql(tx, `get data from ${tableName}`, query, {
  //   //   debug: false,
  //   //   logSql: false,
  //   //   callback: async e => {
  //   //     try {
  //   //       const data = e.rows._array[0];
  //   //       if (!data) {
  //   //         props.onUpdateFail?.([404, 'data not found in the db']);
  //   //         return;
  //   //       }
  //   //       const imageId = data.crop_image?.split('/').pop()?.split('.')[0];
  //   //       const checkedValue: any = {};
  //   //       for (const key of Object.keys(data)) {
  //   //         checkedValue[key] = parseUndefinedValues(data[key]);
  //   //       }
  //   //       const parsedData = {
  //   //         ...checkedValue,
  //   //         image_id: imageId,
  //   //       };
  //   //       const cropImage = {
  //   //         uri: parsedData.crop_image,
  //   //         name: `${imageId}-${generateRandomNumber(4)}.jpg`,
  //   //         type: 'image/jpeg',
  //   //       };
  //   //       const handleAfterUpload = async ([status, response]: [
  //   //         number,
  //   //         any,
  //   //       ]) => {
  //   //         const _res =
  //   //           typeof response === 'object'
  //   //             ? JSON.stringify(response)
  //   //             : typeof response === 'string'
  //   //             ? response
  //   //             : 'Unknown ';
  //   //         if (
  //   //           status === 200 &&
  //   //           response?.message === 'Crop detail added successfully'
  //   //         ) {
  //   //           await updateDatabase(db, props.surveyId, data);
  //   //           props.onUpdateSuccess?.();
  //   //         } else {
  //   //           Alert.alert('Error', `${_res}-${status}`);
  //   //           props.onUpdateFail?.([status, _res]);
  //   //         }
  //   //       };
  //   //       console.log('parsedData', JSON.stringify(parsedData));
  //   //       if (parsedData.form_type === 'surveyNumberForm') {
  //   //         await POST({
  //   //           data: parsedData,
  //   //           name: `upload survey`,
  //   //           path: 'crop_survey',
  //   //           headers: {
  //   //             'Content-Type': 'multipart/form-data',
  //   //             'X-DEVICE-ID': props.deviceId,
  //   //             'X-USER-ID': props.userId,
  //   //           },
  //   //         }).then(async e => handleAfterUpload(e));
  //   //       } else {
  //   //         parsedData.crop_image = cropImage;
  //   //         await POST({
  //   //           data: parsedData,
  //   //           name: `upload survey`,
  //   //           path: 'crop_survey',
  //   //           headers: {
  //   //             'Content-Type': 'multipart/form-data',
  //   //             'X-DEVICE-ID': props.deviceId,
  //   //             'X-USER-ID': props.userId,
  //   //           },
  //   //         }).then(async e => handleAfterUpload(e));
  //   //       }
  //   //     } catch (err) {
  //   //       console.error(err);
  //   //       const data = e.rows._array[0];
  //   //       //           await logs.writeLogToFile({
  //   //       //             message: `Failed to process
  //   //       // --------------------------------------------------------------------------
  //   //       // survey id: ${props?.surveyId}
  //   //       // time - ${new Date().toLocaleString()}
  //   //       // userId - ${props?.userId}
  //   //       // err - ${err?.toString() || 'error while fetching data'}
  //   //       // data - ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
  //   //       // --------------------------------------------------------------------------`,
  //   //       //             _fileName: `uploadSurvey`,
  //   //       //           });
  //   //       props.onUpdateFail?.([
  //   //         400,
  //   //         typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
  //   //       ]);
  //   //     }
  //   //   },
  //   // });
  // });
  //
};

export default uploadSurvey;
