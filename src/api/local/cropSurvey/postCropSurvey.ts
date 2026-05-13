import {ICropFormProps} from '../../../@types/form';
import {SQLiteService} from '../../../services';
import config from '../../../config';
import {executeSql} from '../../../helpers/sqlite';

const postCropSurvey = async (data: ICropFormProps) => {
  const db = await new SQLiteService().getDb();

  // generate values for insert query from data object which has array of surveys key. need to generate query based on surveys array
  const generateInsertQuery = (_data: ICropFormProps) => {
    let query = `insert or REPLACE into cropSurvey
                     (id,
                      seasonId,
                      croppingMethod,
                      districtCode,
                      talukCode,
                      villageCode,
                      surveyNumber,
                      subDivisionNumber,
                      cropSeasonType,
                      cropTypeId,
                      cropClassificationId,
                      cropNameId,
                      sownDate,
                      expectedHarvestDate,
                      cropLandExtent,
                      cultivatorTypeId,
                      cultivatorId,
                      cultivatorName,
                      imgLat,
                      imgLon,
                      imgOrientationX,
                      imgOrientationY,
                      imgOrientationZ,
                      imgTimestamp,
                      image,
                      isBorderOrRowCrop,
                      cropCount,
                      masterSeasonId,
                      cropAge)
                     VALUES `;
    _data.surveys.forEach((survey, index) => {
      query += `(
        '${survey.id}',
        '${_data.season || 0}',
        '${_data.method}',
      '${survey.districtCode}',
      '${survey.talukCode}',
        '${survey.villageCode}',
      '${survey.surveyNumber}',
      '${survey.subDivisionNumber}',
      '${survey.cropSeasonType}',
      '${survey.cropTypeId}',
      '${survey.cropClassificationId}',
      NULLIF('${survey.cropNameId}', 'null'),
      NULLIF('${survey.sownDate}', 'null'),
      NULLIF('${survey.expectedHarvestDate}', 'null'),
      '${survey.cropLandExtent}',
      '${survey.cultivatorTypeId}',
      '${survey.cultivatorId}',
      '${survey.cultivatorName}',
      '${survey.imgLat}',
      '${survey.imgLon}',
      '${survey.imgOrientationX}',
      '${survey.imgOrientationY}',
      '${survey.imgOrientationZ}',
      '${survey.imgTimestamp}',
      '${survey.image}',
      '${survey.isBorderOrRowCrop}',
      '${survey.cropCount}',
      '${_data.masterSeasonId || 0}',
      '${survey.cropAge || 0}'
      )`;
      if (index < _data.surveys.length - 1) {
        query += ',';
      }
    });
    return query;
  };

  const buildQueryForCropMetaData = () => {
    let query = `insert into cropSurveyMetaData
                     (cropSurveyId,
                      gpsAccuracy,
                      appVersion,
                      formType)
                     VALUES `;
    data.surveys.forEach((survey, index) => {
      query += `(
        '${survey.id}',
        '${data.gpsAccuracy}',
        '${config.version}',
        '${data.formType}'
      )`;
      if (index < data.surveys.length - 1) {
        query += ',';
      }
    });
    return query;
  };

  db.transaction(async tx => {
    // tx.executeSql(`
    //     ${generateInsertQuery(data)};
    //     COMMIT;
    // `, [], (_, e) => {
    // 	console.log('inserted > ', e)
    // }, (_, error) => {
    // 	console.log("error while inserting > ", error);
    // 	return true;
    // },);

    await executeSql(tx, 'cropsurvey', generateInsertQuery(data), {
      logSql: false,
      debug: false,
    });
    await executeSql(tx, 'cropsurveyMetaData', buildQueryForCropMetaData(), {
      logSql: false,
      debug: false,
    });
    await executeSql(
      tx,
      'cropImageStatus',
      `
		insert or REPLACE into cropImageStatus (imageId) VALUES ('${data?.surveys?.[0]?.image}');
		`,
      {
        logSql: false,
        debug: false,
      },
    );

    // tx.executeSql(buildQueryForCropMetaData(), [], (_, e) => {
    // 	console.log('inserted > ', e)
    // }, (_, error) => {
    // 	console.log("error while inserting > ", error);
    // 	return true;
    // },)
  });
};

export default postCropSurvey;
