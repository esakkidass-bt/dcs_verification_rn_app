import {SQLiteService} from '../../../services';

interface Props {
  id: string;
  syncStatus: 'completed' | 'pending';
}

const updateSyncStatus = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  await db.transaction(async tx => {
    await tx.executeSql(
      `UPDATE cropSurvey SET syncStatus = '${props.syncStatus}' WHERE id = ${props.id}`,
      [],
      (_, ) => {},
      (_, error) => {
        console.log('error', error);
        return true;
      },
    );
  });
};

export default updateSyncStatus;
