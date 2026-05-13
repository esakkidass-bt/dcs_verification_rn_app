import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';

import {ITableNames, tableNames} from './tableData';

interface Props {
  secureTables?: ITableNames[];
}

const dropTables = async (props?: Props) => {
  const db = await new SQLiteService().getDb();

  // const SECURE_TABLES=['appSettings']
  let SECURE_TABLES: ITableNames[] = [];

  if (props?.secureTables) {
    SECURE_TABLES = props?.secureTables;
  }

  await db.transaction(
    async tx => {
      console.log('dropping tables.....');
      for (let i = 0; i < tableNames.length; i++) {
        if (!SECURE_TABLES.includes(tableNames[i])) {
          await executeSql(
            tx,
            `clear ${tableNames[i]} Table`,
            `DROP TABLE ${tableNames[i]};`,
          );
        }
      }
    },
    e => {
      console.log('error while dropping tables', e);
    },
  );
};

export default dropTables;
