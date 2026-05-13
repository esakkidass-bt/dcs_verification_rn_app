import {SQLiteService} from '../../../services';

interface Props {
  date: string;
}

const deleteOldData = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  db.transaction(async tx => {
    tx.executeSql(
      `delete from cropSurvey where  createdAt < '${props?.date}'`,
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

export default deleteOldData;
