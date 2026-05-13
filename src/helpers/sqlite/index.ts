import {

  ResultSet,
  Transaction,
} from 'react-native-sqlite-storage';

import logs from '../logs';
// import config from '../../config';

// export const getDBConnection = async () => {
//   return openDatabase({name: config.localDb, location: 'default'});
// };

export const executeSql = async (
  tx: Transaction,
  name: string,
  sql: string,
  options?: {
    debug?: boolean;
    debugOnFile?: boolean;
    logSqlOnFile?: boolean;
    logSql?: boolean;
    callback?: (e: ResultSet) => void;
    errorCallback?: (e?: any) => void;
  },
) => {
  if (options?.logSqlOnFile) {
    logs.writeLogToFile({
      message: `
      _______________________________________
      SQL - ${name} >
      ${sql}

      `,
      _fileName: 'cropSurvey_sqlLog',
    });
  }
  if (options?.logSql) {
    console.log(`sql - ${name} >`, sql);
  }
  tx.executeSql(
    sql,
    [],
    async (_tx, e) => {
      if (options?.debug) {
        console.debug(`response - ${name} >`, e);
      }
      if (options?.debugOnFile) {
        logs.writeLogToFile({
          message: `

          Response - ${name} >
          ${JSON.stringify(e)}
          _______________________________________
          `,
          _fileName: 'cropSurvey_sqlLog',
        });
      }
      if (options?.callback) {
        options.callback(e);
      }
    },
    (_tx, err) => {
      if (options?.debug) {
        console.debug(`error - ${name} >`, err.toString().slice(0, 300));
      }
      if (options?.debugOnFile) {
        logs.writeLogToFile({
          message: `

          Error - ${name} >
          ${err.toString()}
          _______________________________________
          `,
          _fileName: 'cropSurvey_sqlLog',
        });
      }
      if (options?.errorCallback) {
        options?.errorCallback?.(err);
      }
      return true;
    },
  );
};
