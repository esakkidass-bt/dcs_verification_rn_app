interface TableDataProps {
  sql: string[];
  description?: string;
}

export interface TableProps {
  // appSettings: TableDataProps;
  // metaData: TableDataProps;
  // crop: TableDataProps;
  // user: TableDataProps;
  // assignedVillage: TableDataProps;
  cropSurvey: TableDataProps;
  // district: TableDataProps;
  // taluk: TableDataProps;
  // village: TableDataProps;
  // cropType: TableDataProps;
  // cropClassification: TableDataProps;
  spatialData: TableDataProps;
  owner: TableDataProps;
  ownerMiscInfo: TableDataProps;
  // season: TableDataProps;
  // croppingMethod: TableDataProps;
  // cropSeasonType: TableDataProps;
  // cropStage: TableDataProps;
  // irrigationSource: TableDataProps;
  // surveyStats: TableDataProps;
  // webLinks: TableDataProps;
  // majorCrop: TableDataProps;
  // dataTimestamp: TableDataProps;
  cropSurveyMetaData: TableDataProps;
  cropImageStatus?: TableDataProps;
  // surveyStatusSummary: TableDataProps;
}

export const tables: TableProps = {
  // appSettings: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS appSettings(key PRIMARY KEY, value);`,
  //     `INSERT OR REPLACE INTO appSettings VALUES ('languageCode','en');`,
  //   ],
  // },
  // metaData: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS metaData(
  //       name TEXT PRIMARY KEY,
  //       value TEXT,
  //       dataType
  //       );`,
  //   ],
  // },
  // user: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS user(
  //       userId INTEGER PRIMARY key,
  //       userName,
  //       mobileNumber,
  //       role,
  //       bufferDistance INTEGER,
  //       bufferUnit
  //       )`,
  //     `CREATE INDEX IF NOT EXISTS idx_user_userId ON user (userId);`,
  //     `CREATE INDEX IF NOT EXISTS idx_user_mobileNumber ON user (mobileNumber);`,
  //   ],
  // },
  // assignedVillage: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS assignedVillage(
  //     id PRIMARY KEY,
  //     districtCode,
  //     districtName,
  //     talukCode,
  //     talukName,
  //     villageCode,
  //     villageName,
  //     villageSpatialData,
  //     lat,
  //     lon,
  //     userId
  //   )`,
  //     `CREATE INDEX IF NOT EXISTS idx_assignedVillage_districtCode ON assignedVillage (districtCode);`,
  //     `CREATE INDEX IF NOT EXISTS idx_assignedVillage_talukCode ON assignedVillage (talukCode);`,
  //     `CREATE INDEX IF NOT EXISTS idx_assignedVillage_villageCode ON assignedVillage (villageCode);`,
  //   ],
  // },
  // district: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS district(
  //       districtCode PRIMARY KEY,
  //       districtName
  //     )`,
  //     `CREATE INDEX IF NOT EXISTS idx_district_districtCode ON district (districtCode);`,
  //   ],
  // },
  // taluk: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS taluk(
  //       talukCode PRIMARY KEY,
  //       talukName,
  //       districtCode
  //     )`,
  //     `CREATE INDEX IF NOT EXISTS idx_taluk_talukCode ON taluk (talukCode);`,
  //   ],
  // },
  // village: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS village(
  //     villageCode PRIMARY KEY,
  //     villageName,
  //     talukCode
  //     )`,
  //     `CREATE INDEX IF NOT EXISTS idx_village_villageCode ON village (villageCode);`,
  //   ],
  // },
  // cropType: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS cropType(
  //     cropTypeId PRIMARY KEY,
  //     cropTypeName,
  //     cropTypeNameTamil
  //     )`,
  //   ],
  // },
  // cropClassification: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS cropClassification(
  //     cropClassificationId PRIMARY KEY,
  //     cropClassificationName,
  //     cropClassificationNameTamil,
  //     cropTypeId
  //     )`,
  //   ],
  // },
  // crop: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS crop(
  //     cropId PRIMARY KEY,
  //     cropName,
  //     cropNameTamil,
  //     cropTypeId,
  //     cropClassificationId,
  //     cropSeasonType
  //     )`,
  //   ],
  // },
  // majorCrop: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS majorCrop(
  //     cropId PRIMARY KEY,
  //     cropName,
  //     cropNameTamil,
  //     cropTypeId,
  //     cropClassificationId,
  //     cropSeasonType
  //     )`,
  //   ],
  // },

  cropSurvey: {
    sql: [
      `CREATE TABLE IF NOT EXISTS cropSurvey (
      id INTEGER,
      districtCode,
      talukCode,
      villageCode,
      surveyNumber,
      subDivisionNumber,
      seasonId,
      cropStage,
      croppingMethod,
      cropSeasonType,
      cropTypeId,
      cropClassificationId,
      cropNameId,
      cropLandExtent,
      irrigationSourceId,
      sownDate,
      expectedHarvestDate,
      cultivatorTypeId,
      cultivatorId,
      cultivatorName,
      imgLat,
      imgLon,
      imgOrientationX,
      imgOrientationY,
      imgOrientationZ,
      imgTimestamp,
      image TEXT,
      isBorderOrRowCrop TEXT,
      cropCount,
      masterSeasonId,
      cropAge,
      theervai,
      orupogaIrupogaNanjai,
      syncStatus TEXT CHECK( syncStatus IN ('completed','pending') ) NOT NULL DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      syncedAt TIMESTAMP
      );`,
      'CREATE INDEX IF NOT EXISTS idx_cropSurvey_districtCode ON cropSurvey (districtCode);',
      'CREATE INDEX IF NOT EXISTS idx_cropSurvey_talukCode ON cropSurvey (talukCode);',
      'CREATE INDEX IF NOT EXISTS idx_cropSurvey_villageCode ON cropSurvey (villageCode);',
      'CREATE INDEX IF NOT EXISTS idx_cropSurvey_surveyNumber ON cropSurvey (surveyNumber);',
      'CREATE INDEX IF NOT EXISTS idx_cropSurvey_subDivisionNumber ON cropSurvey (subDivisionNumber);',
    ],
  },

  cropSurveyMetaData: {
    sql: [
      `CREATE TABLE IF NOT EXISTS cropSurveyMetaData (
    cropSurveyId PRIMARY KEY,
    gpsAccuracy,
    appVersion,
    formType,
    otherData
      )`,
    ],
  },

  cropImageStatus: {
    sql: [
      `CREATE TABLE IF NOT EXISTS cropImageStatus (
        imageId PRIMARY KEY,
        syncStatus CHECK( syncStatus IN ('synced','pending') ) NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        syncedAt TIMESTAMP
       )`,
    ],
  },
  spatialData: {
    sql: [
      `CREATE TABLE IF NOT EXISTS spatialData (
        id PRIMARY KEY,
        sub_division_number,
        survey_number,
        village_code,
        district_code,
        taluk_code,
        geojson_feature,
        lat,
        lon
      );`,
    ],
  },
  owner: {
    sql: [
      `CREATE TABLE IF NOT EXISTS owner(
        id PRIMARY KEY,
        owner_name,
        farmer_name,
        land_type,
        extent,
        sub_division_number,
        survey_number,
        village_code,
        district_code,
        taluk_code,
        patta_number,
        owner_type_id,
        farmer_data_type,
        theervai
        )`,
    ],
  },
  ownerMiscInfo: {
    sql: [
      `
          CREATE TABLE IF NOT EXISTS ownerMiscInfo
          (
              id PRIMARY KEY,
              theervai,
              owner_id,
              sub_division_number,
              survey_number,
              village_code,
              district_code,
              taluk_code,
              other_data
          )
      `,
    ],
  },
  // season: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS season(
  //       id PRIMARY KEY,
  //       masterSeasonId,
  //       seasonId,
  //       seasonName,
  //       districtCode,
  //       talukCode,
  //       villageCode
  //       )`,
  //   ],
  // },
  // croppingMethod: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS croppingMethod(
  //       croppingMethodId PRIMARY KEY,
  //       croppingMethod
  //     )`,
  //   ],
  // },
  // cropSeasonType: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS cropSeasonType(
  //       cropSeasonTypeId PRIMARY KEY,
  //       cropSeasonType
  //     )`,
  //   ],
  // },
  // cropStage: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS cropStage(
  //       cropStageId PRIMARY KEY,
  //       cropStage
  //     )`,
  //   ],
  // },
  // irrigationSource: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS irrigationSource(
  //       id PRIMARY KEY,
  //       irrigationSource
  //     )`,
  //   ],
  // },
  // surveyStats: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS surveyStats(
  //       id PRIMARY KEY,
  //       districtCode,
  //       talukCode,
  //       villageCode,
  //       surveyNumber,
  //       subDivisionNumber,
  //       status TEXT CHECK( status IN ('completed','pending') ) NOT NULL DEFAULT 'pending'
  //     )`,
  //   ],
  //   description:
  //     "This table is used to store the count of surveys. API endpoint: /surveyStats",
  // },
  // webLinks: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS webLinks(
  //       webLinkId PRIMARY KEY,
  //       displayName,
  //       webLink
  //     )`,
  //   ],
  // },
  // dataTimestamp: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS dataTimestamp(
  //       id PRIMARY KEY,
  //       apiName,
  //       villageCode DEFAULT NULL,
  //       timeType TEXT CHECK( timeType IN ('api','synced') ) NOT NULL DEFAULT 'api',
  //       dataTimestamp
  //     )`,
  //   ],
  // },
  // surveyStatusSummary: {
  //   sql: [
  //     `CREATE TABLE IF NOT EXISTS surveyStatusSummary(
  //       id PRIMARY KEY,
  //       villageCode,
  //       parrentVillageCode DEFAULT NULL,
  //       talukCode,
  //       districtCode,
  //       part DEFAULT NULL,
  //       count,
  //       status TEXT CHECK( status IN ('completed','pending') ) NOT NULL,
  //       webView,
  //       miscData
  //     )`,
  //   ],
  // },
};

//get list of table names from TableProps interface
export const tableNames = Object.keys(tables) as (keyof TableProps)[];
export type ITableNames = keyof TableProps;
