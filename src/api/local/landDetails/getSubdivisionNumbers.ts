import {
  VillageOfflineProps,
} from '../../../@types/offlineTypes';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  surveyNumber: string;
  villageCode: VillageOfflineProps['villageCode'];
  callback: (
    e: {
      surveyNumber: string;
      subDivisionNumber: string;
      geoJsonFeature: string;
    }[],
  ) => void;
}

const index = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'spatialData';
  await db.transaction(async tx => {
    await executeSql(
      tx,
      `get data from ${tableName}`,
      `SELECT survey_number, sub_division_number,geojson_feature  FROM ${tableName} 
      WHERE CAST(survey_number AS TEXT) = '${props.surveyNumber}'
      AND CAST(village_code AS TEXT) = '${props.villageCode}'`,
      {
        debug: false,
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
