import {HandleDownloadProgressFunction, IUser} from '../../@types';
import api from '../../api';
import {asyncStorage} from '../../helpers/asyncStorage';

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  handleDownloadProgress: HandleDownloadProgressFunction;
}

const index = async ({userId, deviceId, ...props}: Props) => {
  let downloadStatus = {
    cropType: 'pending',
    cropClassification: 'pending',
    crops: 'pending',
    majorCrops: 'pending',
  };

  const cropClassifications = await api.cropMaster.getCropClassifications({
    userId,
    deviceId,
  });

  if (cropClassifications && cropClassifications?.length > 0) {
    await asyncStorage.storeObj('cropClassifications', cropClassifications);
    downloadStatus.cropClassification = 'downloaded';
  } else {
    downloadStatus.cropClassification = 'dataNotFound';
  }

  const cropTypes = await api.cropMaster.getCropTypes({
    userId,
    deviceId,
  });

  if (cropTypes && cropTypes?.length > 0) {
    await asyncStorage.storeObj('cropTypes', cropTypes);
    downloadStatus.cropClassification = 'downloaded';
  } else {
    downloadStatus.cropClassification = 'dataNotFound';
  }

  const cropNames = await api.cropMaster.getCrops({
    userId,
    deviceId,
  });

  if (cropNames && cropNames?.length > 0) {
    await asyncStorage.storeObj('cropNames', cropNames);
    downloadStatus.cropClassification = 'downloaded';
  } else {
    downloadStatus.cropClassification = 'dataNotFound';
  }

  const majorCrops = await api.cropMaster.getMajorCrops({
    userId,
    deviceId,
  });

  if (majorCrops && majorCrops?.length > 0) {
    await asyncStorage.storeObj('majorCrops', majorCrops);
    downloadStatus.cropClassification = 'downloaded';
  } else {
    downloadStatus.cropClassification = 'dataNotFound';
  }


  if (Object.values(downloadStatus)?.some(e => e === 'dataNotFound')) {
    props.handleDownloadProgress('cropMasterData', 'dataNotFound');
  } else {
    props.handleDownloadProgress('cropMasterData', 'completed');
  }
};

export default index;
