import {
  HandleDownloadProgressFunction,
  IUser,
} from '../../@types';
import api from '../../api';
import {asyncStorage} from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  handleDownloadProgress: HandleDownloadProgressFunction;
}

const index = async ({userId, deviceId, handleDownloadProgress}: Props) => {
  const [, seasons] = await api.season.getSeasons({
    userId,
    deviceId,
  });

  handleDownloadProgress('seasonData', 'downloading');
  // change keywords in cropTypes list
  if (seasons && seasons?.length > 0) {
    await asyncStorage.storeObj('seasonData', seasons);
    handleDownloadProgress('seasonData', 'completed');
  } else {
    handleDownloadProgress('seasonData', 'dataNotFound');
  }
};

export default index;
