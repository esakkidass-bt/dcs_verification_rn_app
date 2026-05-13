import {SQLiteService} from '../../../services';

interface Props {
  id: string;
}

const deleteCropSurvey = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  db.transaction(async tx => {
    // executeSql(tx, 'get survey',`select * from cropSurvey `,{
    //   logSql:true, debug: false, callback:async(e)=>console.log('>>',e.rows._array)
    // })
    // await executeSql(
    //   tx,
    //   "remove survey",
    //   `select * from cropSurvey where CAST(id AS TEXT) = '${props.id}'`,
    //   // `delete from cropSurvey where CAST(id AS TEXT) = '${props.id}'`,
    //   {
    //     logSql: false,
    //     debug: false,
    //     callback: (e) => {
    //       console.log(">>>>>>>>>>>>", e.rows.length);
    //     },
    //   },
    // );
    tx.executeSql(
      `delete from cropSurvey where CAST(id AS TEXT) = '${props.id}'`,
      [],
      (_, e) => {
        console.log('rows', e);
      },
      (_, error) => {
        console.log('error', error);
        return true;
      },
    );
  });
};

export default deleteCropSurvey;
