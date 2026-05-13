import {ICropSurvey} from '../../../@types/form';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  cropSurveyId?: string;
  callback: (e: any) => void;
  syncStatus?: 'completed' | 'pending';
  limit?: number;
  offset?: number;
  // orderBy?: "ASC" | "DESC";
}

// import SQLite from "react-native-sqlite-storage";

const getCropSurveyDetail = async (props: Props) => {
  // // Open the database
  // const db = SQLite.openDatabase(
  //   {
  //     name: config.localDb,
  //     location: "default",
  //     // createFromLocation: `files/SQLite/${config.localDb}`,
  //   },
  //   () => {
  //     console.log("Database opened");
  //   },
  //   (error) => {
  //     console.error("DB Error: >", error);
  //   },
  // );
  //
  //
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

    if (props?.limit && props?.offset) {
      query += ` LIMIT ${props.limit} OFFSET  ${props.offset}`;
    }

    // order by timestamp
    // query += ` ORDER BY imgTimestamp ${props?.orderBy||"DESC"}`;
    return query;
  };
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
      cstage.cropStage AS cropStageName,
      d.districtName AS districtName,
      t.talukName AS talukName,
      v.villageName AS villageName,
      cm.croppingMethod AS croppingMethodName,
      cst.cropSeasonType AS cropSeasonTypeName,
      ct.cropTypeName AS cropTypeName,
      cc.cropClassificationName AS cropClassificationName,
      cropName.cropName AS cropName,
      irrSrc.irrigationSource AS irrigationSource,
      cultivator.ownerName AS ownerName,
      cultivator.farmerName AS farmerName,
      cultivator.pattaNumber AS pattaNumber,
      season.seasonName AS seasonName,
      season.masterSeasonId AS masterSeasonId,
      season.id AS sId,
      season.seasonId AS seasonId,
      csmd.appVersion AS appVersion,
      csmd.gpsAccuracy AS gpsAccuracy,
      csmd.formType AS formType,
      cis.syncStatus AS imageSyncStatus,
      cis.syncedAt AS imageSyncedAt,
      CASE WHEN season.masterSeasonId = cs.masterSeasonId THEN 1 ELSE 0 END AS isSyncEnabled
  FROM cropSurvey cs
  LEFT JOIN cropStage cstage ON cstage.cropStageId = cs.cropStage
  LEFT JOIN district d ON d.districtCode = cs.districtCode
  LEFT JOIN village v ON v.villageCode = cs.villageCode
  LEFT JOIN taluk t ON t.talukCode = cs.talukCode
  LEFT JOIN croppingMethod cm ON cm.croppingMethodId = cs.croppingMethod
  LEFT JOIN cropSeasonType cst ON cst.cropSeasonTypeId = cs.cropSeasonType
  LEFT JOIN cropType ct ON ct.cropTypeId = cs.cropTypeId
  LEFT JOIN cropClassification cc ON cc.cropClassificationId = cs.cropClassificationId
  LEFT JOIN crop cropName ON cropName.cropName = cs.cropNameId
  LEFT JOIN irrigationSource irrSrc ON irrSrc.id = cs.irrigationSourceId
  LEFT JOIN owner cultivator ON cultivator.id = cs.cultivatorId
  LEFT JOIN cropSurveyMetaData csmd ON cs.id = csmd.cropSurveyId
  LEFT JOIN cropImageStatus cis ON cis.imageId = cs.image
  LEFT JOIN season ON season.villageCode = cs.villageCode AND season.talukCode = cs.talukCode AND season.districtCode = cs.districtCode
  WHERE cs.id IS NOT NULL
  ${whereClauseBuilder()}

  `;
  // ${whereClauseBuilder()}

  // cstage.cropStage                         AS cropStageName,
  // d.districtName                           AS districtName,
  // t.talukName                              AS talukName,
  // v.villageName                            AS villageName,
  // cm.croppingMethod                        AS croppingMethodName,
  // cst.cropSeasonType                       AS cropSeasonTypeName,

  // ct.cropTypeName                          AS cropTypeName,
  // cc.cropClassificationName                AS cropClassificationName,
  // cropName.cropName                        AS cropName,
  // irrSrc.irrigationSource                  AS irrigationSource,
  // cultivator.ownerName                     AS ownerName,
  // cultivator.farmerName                    AS farmerName,
  // cultivator.pattaNumber                   AS pattaNumber,

  // (SELECT s.seasonName
  //  FROM season AS s
  //  WHERE s.villageCode = cs.villageCode
  //    and s.talukCode = cs.talukCode
  //    and s.districtCode = cs.districtCode) as seasonName,

  // (SELECT masterSeasonId
  //  FROM season AS s
  //  WHERE s.villageCode = cs.villageCode
  //    and s.talukCode = cs.talukCode
  //    and s.districtCode = cs.districtCode) as masterSeasonId,

  // (SELECT id
  //  FROM season AS s
  //  WHERE s.villageCode = cs.villageCode
  //    and s.talukCode = cs.talukCode
  //    and s.districtCode = cs.districtCode) as sId,

  // (SELECT s.seasonId
  //  FROM season AS s
  //  WHERE s.villageCode = cs.villageCode
  //    and s.talukCode = cs.talukCode
  //    and s.districtCode = cs.districtCode) as seasonId,
  // -- csmd.appVersion                          AS appVersion,
  // -- csmd.gpsAccuracy                         AS gpsAccuracy,
  // -- csmd.formType                            AS formType,

  // (SELECT CASE
  //             WHEN s.masterSeasonId = cs.masterSeasonId
  //                 THEN 1
  //             ELSE 0
  //             END
  //  FROM season AS s
  //  WHERE s.villageCode = cs.villageCode
  //    and s.talukCode = cs.talukCode
  //    and s.districtCode = cs.districtCode) AS isSyncEnabled
  //
  //

  //
  //  LEFT JOIN cropStage cstage
  //           ON cstage.cropStageId = cstage.cropStage
  // LEFT JOIN district d ON d.districtCode = cs.districtCode
  // LEFT JOIN village v ON v.villageCode = cs.villageCode
  // LEFT JOIN taluk t ON t.talukCode = cs.talukCode
  // LEFT JOIN croppingMethod as cm
  //           ON cm.croppingMethodId = cs.croppingMethod
  // LEFT JOIN cropSeasonType as cst
  //           ON cst.cropSeasonTypeId = cs.cropSeasonType

  // LEFT JOIN cropType as ct
  //           ON ct.cropTypeId = cs.cropTypeId
  // LEFT JOIN cropClassification as cc
  //           ON cc.cropClassificationId =
  //              cs.cropClassificationId
  // LEFT JOIN crop as cropName
  //           ON cropName.cropName = cs.cropNameId
  // LEFT JOIN irrigationSource irrSrc
  //           ON irrSrc.id =
  //              cs.irrigationSourceId
  // LEFT JOIN owner cultivator
  //           ON cultivator.id =
  //              cs.cultivatorId

  //
  //
  // LEFT JOIN cropSurveyMetaData AS csmd
  //           ON cs.id = csmd.cropSurveyId
  db.transaction(async tx => {
    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: false,
      logSql: false,
      debugOnFile: true,
      logSqlOnFile: true,
      callback: e => {
        let dataArray = [];
        let len = e.rows.length;
        for (let i = 0; i < len; i++) {
          let row = e.rows.item(i);
          dataArray.push(row);
        }
        props?.callback(dataArray as ICropSurvey[]);
      },
    });
  });
};

export default getCropSurveyDetail;
