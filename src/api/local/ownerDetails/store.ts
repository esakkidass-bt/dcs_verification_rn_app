import {OwnerDetailsOnlineProps} from '../../../@types';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  data: OwnerDetailsOnlineProps[];
  callback?: () => void;
  errCallback?: () => void;
}

const index = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'owner';
  const buildQuery = () => {
    if (props?.data?.length > 0) {
      let query = `
        INSERT
        OR REPLACE INTO
        ${tableName}
        (
        id,
        owner_name,
        farmer_name,
        land_type,
        extent,
        sub_division_number,
        survey_number,
        village_code,
        district_code,
        taluk_code,
        patta_number,
        owner_type_id,
        farmer_data_type,
        theervai
        )
        VALUES
      `;

      for (let i = 0; i < props.data.length; i++) {
        query += `( "${props.data[i].id}",
         "${props.data[i].owner_name?.replaceAll('"', '')}",
         "${props.data[i].farmer_name?.replaceAll('"', '')}",
         "${props.data[i].land_type}",
         "${props.data[i].extent}",
         "${props.data[i].sub_division_number}",
         "${props.data[i].survey_number}",
         "${props.data[i].village_code}",
         "${props.data[i].district_code}",
         "${props.data[i].taluk_code}",
         "${props.data[i].patta_number}",
         "${props.data[i].owner_type_id}",
         "${props.data[i].farmer_data_type}",
         "${props.data[i].theervai}"
         )`;
        if (i !== props.data.length - 1) {
          query += ',';
        }
      }

      return query;
    }
    return null;
  };


  const query = buildQuery();

  if (query) {
    console.log('village >>>', props.data[0].village_code);
    // const ownerMiscInfoQuery = await buildOwnerMiscInfoQuery();
    db.transaction(async tx => {
      // await apiTimestamp.apiInsertTimestampQuery(tx, "owner_details")

      await executeSql(tx, `insert ${tableName} data`, query, {
        debug: true,
        logSql: false,
      });
    });
  } else {
    props?.callback?.();
  }
};

export default index;
