import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  villageCode?: string;
  callback: (e: {completed: number; pending: number}) => void;
}

const getCropSurvey = async (props: Props) => {
  const villageQuery = (villageCode?: string) => {
    return villageCode ? ` AND villageCode = '${villageCode}'` : '';
  };

  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'cropSurvey';
  let query = `SELECT syncStatus,
                      count(Distinct districtCode || '-' || talukCode || '-' ||
                                     villageCode || '-' || surveyNumber ||
                                     '-' || subDivisionNumber) as value
               FROM ${tableName}
               WHERE syncStatus = 'completed' ${villageQuery(props.villageCode)}
               GROUP BY districtCode
               UNION ALL
  SELECT syncStatus,
         count(Distinct
               districtCode || '-' || talukCode || '-' || villageCode || '-' ||
               surveyNumber || '-' || subDivisionNumber) as value
  FROM ${tableName}
  WHERE syncStatus = 'pending' ${villageQuery(props.villageCode)}
  GROUP BY districtCode
  `;
  db.transaction(async tx => {
    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: false,
      logSql: false,
      callback: e => {
        const data = [];
        const len = e.rows.length;
        for (let i = 0; i < len; i++) {
          data.push(e.rows.item(i)); // Access each row using item(index)
        }
        const completed =
          data.find(_e => _e.syncStatus === 'completed')?.value || 0;
        const pending = data.find(_e => _e.syncStatus === 'pending')?.value || 0;
        props.callback({
          completed,
          pending,
        });
      },
    });
  });
};

export default getCropSurvey;
