import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from './tableData';

interface Props {
  tables: ITableNames[];
  callback?: () => void;
}

const createTable = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  let SECURE_TABLES: ITableNames[] = [];

  // join props.secureTables with SECURE_TABLES
  await db.transaction(
    async tx => {
      // clear data in table using tableNames
      console.log(`clearing ${props.tables}  tables...`);
      for (let i = 0; i < props.tables.length; i++) {
        if (!SECURE_TABLES.includes(props.tables[i])) {
          await executeSql(
            tx,
            `clear ${props.tables[i]} Table`,
            `DELETE FROM ${props.tables[i]};`,
          );
        }
        // console.log(`cleared ${props.tables[i]} Table`)
      }
      await props?.callback?.();
    },
    e => {
      console.log('error while clearing tables', e);
    },
  );
  return;
};

export default createTable;
