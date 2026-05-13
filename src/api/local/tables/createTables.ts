import {executeSql} from '../../../helpers/sqlite';
import { SQLiteService } from '../../../services';

import {tables} from './tableData';

interface Props {
  callback: () => void;
}
const createTable = async (props: Props) => {
  const db = await new SQLiteService().getDb();


  //  Object.entries(tables).forEach(async ([tableName, tableData]) => {
  //    console.log(`Creating ${tableName} table....`);
  //   await tableData.sql.forEach(async (sql: string) => {
  //      db.transaction(
  //       async (tx) => {
  //         await executeSql(tx, `${tableName} Table`, sql, {
  //           debug: false,
  //           logSql: false
  //         });
  //       },
  //       (e) => {
  //         console.log("e", e);
  //       }
  //     );
  //   });
  //    props?.callback();
  // });
  for (const [tableName, tableData] of Object.entries(tables)) {
    console.log(`Creating ${tableName} table....`);
    for (const sql of tableData.sql) {
      db.transaction(
        async tx => {
          await executeSql(tx, `${tableName} Table`, sql, {
            debug: false,
            logSql: false,
          });
        },
        e => {
          console.log('SQLite Error', e);
        },
      );
    }
  }
  props?.callback();
};

export default createTable;
