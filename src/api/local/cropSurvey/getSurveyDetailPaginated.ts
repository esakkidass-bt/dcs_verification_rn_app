import {ICropSurveyOfflineProps} from '../../../@types/form';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  cropSurveyId?: string;
  callback: (e: {
    surveys: ICropSurveyOfflineProps[];
    totalRecords: number;
  }) => void;
  syncStatus?: 'completed' | 'pending';
  limit?: number;
  offset?: number;
  // orderBy?: "ASC" | "DESC";
}

// import SQLite from "react-native-sqlite-storage";

const getSurveyDetailPaginated = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'cropSurvey';
  const whereClauseBuilder = () => {
    let query = '';
    if (props?.cropSurveyId) {
      query += `AND cs.id = ${props.cropSurveyId}`;
    }
    if (props?.syncStatus) {
      query += ` AND cs.syncStatus = '${props.syncStatus}'`;
    }

    // order by timestamp
    // query += ` ORDER BY imgTimestamp ${props?.orderBy||"DESC"}`;
    return query;
  };

  const paginationClause = () => {
    let query = '';
    if (props?.limit !== undefined && props?.offset !== undefined) {
      query += ` LIMIT ${props.limit} OFFSET ${props.offset}`;
    }
    return query;
  };

  // SQL query to get the total number of records
  const totalCountQuery = `SELECT COUNT(*) AS totalRecords FROM cropSurvey cs WHERE cs.id IS NOT NULL ${whereClauseBuilder()}`;

  // -- csmd.cropSurveyId                                    AS cropSurveyId,
  let query = `SELECT
      csmd.cropSurveyId AS id,
      cs.id AS cropSurveyId,
      cs.districtCode AS districtCode,
      cs.talukCode AS talukCode,
      cs.villageCode AS villageCode,
      cs.surveyNumber AS surveyNumber,
      cs.subDivisionNumber AS subDivisionNumber,
      cs.cropStage AS cropStage,
      cs.croppingMethod AS croppingMethod,
      cs.cropSeasonType AS cropSeasonType,
      cs.cropTypeId AS cropTypeId,
      cs.cropClassificationId AS cropClassificationId,
      cs.cropNameId AS cropNameId,
      cs.cropLandExtent AS cropLandExtent,
      cs.irrigationSourceId AS irrigationSourceId,
      cs.sownDate AS sownDate,
      cs.expectedHarvestDate AS expectedHarvestDate,
      cs.cultivatorTypeId AS cultivatorTypeId,
      cs.cultivatorId AS cultivatorId,
      cs.cultivatorName AS cultivatorName,
      cs.imgLat AS imgLat,
      cs.imgLon AS imgLon,
      cs.imgOrientationX AS imgOrientationX,
      cs.imgOrientationY AS imgOrientationY,
      cs.imgOrientationZ AS imgOrientationZ,
      cs.imgTimestamp AS imgTimestamp,
      cs.image AS image,
      cs.isBorderOrRowCrop AS isBorderOrRowCrop,
      cs.cropCount AS cropCount,
      cs.cropAge AS cropAge,
      cs.theervai AS theervai,
      cs.orupogaIrupogaNanjai AS orupogaIrupogaNanjai,
      cs.syncStatus AS syncStatus,
      cs.createdAt AS createdAt,
      cs.syncedAt AS syncedAt,
      cultivator.owner_name AS ownerName,
      cultivator.farmer_name AS farmerName,
      cultivator.patta_number AS pattaNumber,
      csmd.appVersion AS appVersion,
      csmd.gpsAccuracy AS gpsAccuracy,
      csmd.formType AS formType,
      cis.syncStatus AS imageSyncStatus,
      cis.syncedAt AS imageSyncedAt
  FROM cropSurvey cs
  LEFT JOIN owner cultivator ON cultivator.id = cs.cultivatorId
  LEFT JOIN cropSurveyMetaData csmd ON cs.id = csmd.cropSurveyId
  LEFT JOIN cropImageStatus cis ON cis.imageId = cs.image
  WHERE cs.id IS NOT NULL
  ${whereClauseBuilder()}
  ${paginationClause()}

  `;
  db.transaction(async tx => {
    let totalRecords = 0;

    // Get total records
    await executeSql(
      tx,
      `get total records from ${tableName}`,
      totalCountQuery,
      {
        debug: true,
        logSql: true,
        debugOnFile: true,
        logSqlOnFile: true,
        callback: e => {
          console.log('totalCountQuery', e)
          if (e.rows.length > 0) {
            totalRecords = e.rows.item(0).totalRecords;
          }
        },
      },
    );

    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: true,
      logSql: true,
      debugOnFile: true,
      logSqlOnFile: true,
      callback: e => {
        let dataArray = [];
        let len = e.rows.length;
        console.log('query', e)

        for (let i = 0; i < len; i++) {
          let row = e.rows.item(i);
          dataArray.push(row);
        }
        props?.callback({
          surveys: dataArray as ICropSurveyOfflineProps[],
          totalRecords,
        });
      },
    });
  });
};

export default getSurveyDetailPaginated;
