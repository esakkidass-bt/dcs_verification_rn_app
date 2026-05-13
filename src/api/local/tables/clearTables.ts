import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames, tableNames} from './tableData';

interface Props {
  secureTables?: ITableNames[];
  callback?: () => void;
}

const createTable = async (props?: Props) => {
  const db = await new SQLiteService().getDb();
  let SECURE_TABLES: ITableNames[] = [];

  // join props.secureTables with SECURE_TABLES
  if (props?.secureTables) {
    SECURE_TABLES.push(...props?.secureTables);
  }
  db.transaction(
    async tx => {
      // clear data in table using tableNames
      console.log('cleating tables...');
      for (let i = 0; i < tableNames.length; i++) {
        if (!SECURE_TABLES.includes(tableNames[i])) {
          await executeSql(
            tx,
            `clear ${tableNames[i]} Table`,
            `DELETE FROM ${tableNames[i]};`,
            {debug: false, logSql: false},
          );
        }
      }
      props?.callback?.();
    },
    e => {
      console.log('error while clearing tables', e);
    },
  );
  return;
};

export default createTable;
