import {ICropSurveyOfflineProps} from '../../../@types/form';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface Props {
  syncStatus?: 'completed' | 'pending';
  orderBy?: 'ASC' | 'DESC';
  callback: (e: ICropSurveyOfflineProps[]) => void;
}

const getCropSurvey = async (props: Props) => {
  const queryBuilder = () => {
    let query = '';
    if (props?.syncStatus) {
      query += ` AND syncStatus = '${props.syncStatus}'`;
    }

    // order by timestamp
    query += ` ORDER BY imgTimestamp ${props?.orderBy || 'DESC'}`;
    return query;
  };
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'cropSurvey';
  let query = `SELECT cs.*,
                        cst.cropStage  as cropStageName,
                        s.id           as sId,
                        CASE
                            WHEN (s.masterSeasonId = cs.masterSeasonId) THEN 1
                            ELSE 0 END AS isSyncEnabled
                 FROM ${tableName} cs
                          LEFT JOIN cropStage cst ON cst.cropStageId = cs.cropStage
                          LEFT JOIN season as s
                                    ON s.villageCode = cs.villageCode and
                                       s.talukCode = cs.talukCode and
                                       s.districtCode = cs.districtCode
                 WHERE 1 = 1 ${queryBuilder()}`;
  db.transaction(async tx => {
    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: false,
      logSql: false,
      callback: e => {
        const items = [];
        const len = e.rows.length;
        for (let i = 0; i < len; i++) {
          items.push(e.rows.item(i)); // Access each row using item(index)
        }
        props.callback(items as ICropSurveyOfflineProps[]);
      },
    });
  });
  // await db.transaction(async (tx) => {

  //   await tx.executeSql(
  //     `SELECT * FROM cropSurvey WHERE 1=1
  //     ${syncStatusQuery(props)}
  //     `,
  //     [],
  //     (_, { rows }) => {
  //       props?.callback(rows._array as ICropSurvey[]);
  //     },
  //     (_, error) => {
  //       return true;
  //     }
  //   );
  // });
};

export default getCropSurvey;
