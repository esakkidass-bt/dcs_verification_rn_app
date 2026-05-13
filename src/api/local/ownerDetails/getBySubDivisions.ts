// import {AtLeastOne} from '../../../@types';
// import {OwnerDetailsOfflineProps} from '../../../@types/offlineTypes';
// import {executeSql} from '../../../helpers/sqlite';
// import {SQLiteService} from '../../../services';
// import {ITableNames} from '../tables/tableData';

// interface QueryProps {
//   districtCode?: string;
//   talukCode?: string;
//   villageCode?: string;
//   // pattaNumber?: string;
//   surveyNumber?: string;
//   subDivisionNumberList: string[];
//   // ownerTypeId?: string;
//   // fields?: fieldsType[]
// }

// // type fieldsType = "o.districtCode"|
// //   "o.talukCode"|
// //   "o.villageCode"|
// //   "o.pattaNumber"|
// //   "o.surveyNumber"|
// //   "o.subDivisionNumber"|
// //   "o.extent"|
// //   "o.landType"|
// //   "o.ownerName"|
// //   "o.farmerName"|
// //   "o.ownerTypeId"|
// //   "o.id"|
// //   "o.farmerDataType"

// type Props = {
//   callback: (e: OwnerDetailsOfflineProps[]) => void;
// } & AtLeastOne<QueryProps>;

// const index = async (props: Props) => {
//   const db = await new SQLiteService().getDb();
//   const tableName: ITableNames = 'owner';

//   async function buildQuery(subDivisionNumber: string) {
//     let fields = 'o.id, o.ownerTypeId, o.ownerName, o.farmerName';
//     // if(props.fields){
//     //   fields = props.fields.join(',')
//     // }
//     let query = `SELECT ${fields} FROM ${tableName} AS o
//   LEFT JOIN cropSurvey c ON o.districtCode = c.districtCode
//   AND o.talukCode = c.talukCode
//   AND o.villageCode = c.villageCode
//   AND o.surveyNumber = c.surveyNumber
//   AND o.subDivisionNumber = c.subDivisionNumber
//   WHERE c.id IS NULL`;

//     if (props.districtCode) {
//       query += ` AND CAST(o.districtCode AS TEXT) = '${props.districtCode}'`;
//     }
//     if (props.talukCode) {
//       query += ` AND CAST(o.talukCode AS TEXT) = '${props.talukCode}'`;
//     }
//     if (props.villageCode) {
//       query += ` AND CAST(o.villageCode AS TEXT) = '${props.villageCode}'`;
//     }
//     // if (props.pattaNumber) {
//     //   query += ` AND CAST(o.pattaNumber AS TEXT) = '${props.pattaNumber}'`;
//     // }
//     if (props.surveyNumber) {
//       query += ` AND CAST(o.surveyNumber AS TEXT) = '${props.surveyNumber}'`;
//     }
//     // if (props.ownerTypeId) {
//     //   query += ` AND CAST(o.ownerTypeId AS TEXT) = '${props.ownerTypeId}'`;
//     // }
//     // if (props.subDivisionNumber || props.subDivisionNumber === "") {
//     //   query += ` AND CAST(o.subDivisionNumber AS TEXT) = '${props.subDivisionNumber}'`;
//     // }
//     query += ` AND CAST(o.subDivisionNumber AS TEXT) = '${subDivisionNumber}'`;

//     return query;
//   }

//   let query = `SELECT id, ownerTypeId, ownerName, farmerName
//                FROM (SELECT o.id,
//                             o.ownerTypeId,
//                             o.ownerName,
//                             o.farmerName,
//                             o.subDivisionNumber
//                      FROM ${tableName} as o
//                               LEFT JOIN cropSurvey c
//                                         ON o.districtCode = c.districtCode
//                                             AND o.talukCode = c.talukCode
//                                             AND o.villageCode = c.villageCode
//                                             AND o.surveyNumber = c.surveyNumber
//                                             AND o.subDivisionNumber =
//                                                 c.subDivisionNumber
//                      WHERE c.id IS NULL
//                        AND CAST(o.districtCode AS TEXT) = '${props.districtCode}'
//                        AND CAST(o.talukCode AS TEXT) = '${props.talukCode}'
//                        AND CAST(o.villageCode AS TEXT) = '${props.villageCode}'
//                        AND CAST(o.surveyNumber AS TEXT) = '${props.surveyNumber}') AS ownerData


//   `;

//   db.transaction(async tx => {
//     await executeSql(tx, `get by subDivisions ${tableName}`, ``, {
//       debug: false,
//       logSql: false,
//       callback: e => {
//         props.callback(e.rows._array);
//       },
//     });
//   });
// };

// export default index;
