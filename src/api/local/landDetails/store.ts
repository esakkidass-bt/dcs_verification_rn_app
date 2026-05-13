import {LandDetailsOfflineProps} from '../../../@types/offlineTypes';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';

import {ITableNames} from '../tables/tableData';

interface Props {
  data: LandDetailsOfflineProps[];
  callback?: () => void;
  errorCallback?: () => void;
}

// store json in sqlite

const index = async (props: Props) => {
  if (props?.data?.length === 0) {
    return;
  }
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'spatialData';

  db.transaction(async tx => {
    const villageCodes: string[] = [];
    const buildQuery = async () => {
      let query = `
    INSERT OR REPLACE INTO ${tableName} (
      id,
      survey_number,
      sub_division_number,
      village_code,
      district_code,
      taluk_code,
      geojson_feature,
      lat,
      lon
      ) VALUES
      `;

      for (let i = 0; i < props.data.length; i++) {
        const d = props.data[i];
        if (!villageCodes.includes(d.villageCode)) {
          villageCodes.push(d.villageCode);
          // await apiTimestamp.apiInsertTimestampQuery(tx, "land_detail", d.villageCode);
        }
        // const subDivisionNumber = d?.subDivisionNumber?.replace('"', "");

        query += `(
        '${d.districtCode}_${d.talukCode}_${d.villageCode}_${encodeURI(
          d.surveyNumber,
        )}_${encodeURI(d?.subDivisionNumber)}',
        '${encodeURI(d.surveyNumber)}',
        '${encodeURI(d?.subDivisionNumber)}',
        '${d.villageCode}',
        '${d.districtCode}',
        '${d.talukCode}',
        '${JSON.stringify(d.geoJsonFeature)}',
        ${d.lat},
        ${d.lon}
          )`;
        if (i !== props.data.length - 1) {
          query += ',';
        }
      }
      return query;
    };
    const sql = await buildQuery();

    await executeSql(tx, `insert ${tableName} data`, sql, {
      debug: false,
      logSql: false,
      callback: () => {
        props?.callback?.();
      },
      errorCallback: () => {
        props?.errorCallback?.();
      },
    });
  });
};

export default index;
