import { SurveyNumberDropDown } from '../../../@types';
import {
  VillageOfflineProps,
} from '../../../@types/offlineTypes';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  villageCode: VillageOfflineProps['villageCode'];
  callback: (e: SurveyNumberDropDown[]) => void;
}

const index = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'spatialData';
  await db.transaction(async tx => {
    await executeSql(
      tx,
      `get data from ${tableName}`,
      `SELECT survey_number FROM ${tableName} WHERE CAST(village_code AS TEXT) = '${props.villageCode}' GROUP BY survey_number`,
      {
        debug: true,
        logSql: true,
        callback: e => {
          const items = [];
          const len = e.rows.length;
          for (let i = 0; i < len; i++) {
            items.push(e.rows.item(i)); // Access each row using item(index)
          }
          props.callback(items);
        },
      },
    );
  });
};

export default index;
