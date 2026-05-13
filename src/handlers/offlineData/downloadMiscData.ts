import {HandleDownloadProgressFunction, IUser} from '../../@types';
import api from '../../api';
import {asyncStorage} from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  handleDownloadProgress: HandleDownloadProgressFunction;
}

const index = async ({userId, deviceId, handleDownloadProgress}: Props) => {
  let downloadStatus = {
    cropSeasonType: 'pending',
    croppingMethod: 'pending',
  };

  const cropSeasonType = await api.misc.cropSeasonType({
    userId,
    deviceId,
  });

  // change keywords in cropTypes list
  if (cropSeasonType && cropSeasonType?.length > 0) {
    await asyncStorage.storeObj('cropSeasonType', cropSeasonType);
    downloadStatus.cropSeasonType = 'downloaded';
  } else {
    downloadStatus.cropSeasonType = 'dataNotFound';
  }

  const croppingMethod = await api.misc.croppingMethod({
    userId,
    deviceId,
  });

  // change keywords in cropTypes list
  if (croppingMethod && croppingMethod?.length > 0) {
    await asyncStorage.storeObj('croppingMethod', croppingMethod);
    downloadStatus.croppingMethod = 'downloaded';
  } else {
    downloadStatus.croppingMethod = 'dataNotFound';
  }

  const irrigationSource = await api.misc.irrigationSource({
    userId,
    deviceId,
  });

  // change keywords in cropTypes list
  if (irrigationSource && irrigationSource?.length > 0) {
    await asyncStorage.storeObj('irrigationSource', irrigationSource);
    // downloadStatus.irrigationSource = 'downloaded';
  } else {
    // downloadStatus.irrigationSource = 'dataNotFound';
  }

  if (Object.values(downloadStatus)?.some(e => e === 'dataNotFound')) {
    handleDownloadProgress('miscData', 'dataNotFound');
  } else {
    handleDownloadProgress('miscData', 'completed');
  }
};

export default index;
