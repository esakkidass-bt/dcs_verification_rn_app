import {AtLeastOne} from '../../../@types';
import {BoundBoxProps} from '../../../@types/geoJson';
import {
  DistrictsOfflineProps,
  TalukOfflineProps,
  VillageOfflineProps,
} from '../../../@types/offlineTypes';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface QueryProps extends BoundBoxProps {
  villageCode: VillageOfflineProps['villageCode'];
  districtCode: DistrictsOfflineProps['districtCode'];
  talukCode: TalukOfflineProps['talukCode'];
  surveyNumber: string;
  subDivisionNumber: string;
  limit: number;
  offset: number;
}

type Props = {
  callback: (e: any[]) => void;
} & AtLeastOne<QueryProps>;

// interface which have any one of the properties

const index = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'spatialData';
  const queries = props as AtLeastOne<QueryProps>;
  const buildQuery = () => {
    //  build query based on queries object
    let query = '';
    if (queries.villageCode) {
      query += ` AND CAST(village_code AS TEXT) = '${queries.villageCode}'`;
    }
    if (queries.districtCode) {
      query += ` AND CAST(district_code AS TEXT)  = '${queries.districtCode}'`;
    }
    if (queries.talukCode) {
      query += ` AND CAST(taluk_code AS TEXT)  = '${queries.talukCode}'`;
    }
    if (queries.surveyNumber) {
      query += ` AND CAST(survey_number AS TEXT)  = '${encodeURI(
        queries.surveyNumber,
      )}'`;
    }
    if (queries.subDivisionNumber) {
      query += ` AND CAST(sub_division_number AS TEXT)  = '${encodeURI(
        queries.subDivisionNumber,
      )}'`;
    }
    // else{
    //   query += ` AND CAST(subDivisionNumber AS TEXT)  = null`;
    //
    // }
    if (queries.limit) {
      query += ` LIMIT ${queries.limit}`;
    }
    if (queries.offset) {
      query += ` OFFSET ${queries.offset}`;
    }

    return query;
  };
  db.transaction(async tx => {
    await executeSql(
      tx,
      `get data from ${tableName}`,
      `SELECT geojson_feature FROM ${tableName} WHERE 1=1
      ${buildQuery()}`,
      {
        debug: true,
        logSql: true,
        callback: e => {
          const items = [];
          const len = e.rows.length;
          // console.log('land detail length', items.length)
          // console.log('land detail length', e)
          for (let i = 0; i < len; i++) {
            // console.log('type > ', e.rows.item(i)?.geojson_feature)
            items.push(JSON.parse(e.rows.item(i)?.geojson_feature)); // Access each row using item(index)
          }
          props.callback(items);
        },
        errorCallback:e=>{
          console.log('spatial error', e)
        }
      },
      
    );
  });
};

export default index;
