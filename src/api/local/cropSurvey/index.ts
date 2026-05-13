import {default as remove} from './deleteCropSurvey';
import {default as post} from './postCropSurvey';
import {default as get} from './getCropSurveys';
import {default as updateSyncStatus} from './updateSyncStatus';
import {default as stats} from './stats';
import {default as getCropSurveyDetail} from './getSurveyDetail';
import {default as deleteOldData} from './deleteOldData';
import {default as getSurveyDetailPaginated} from './getSurveyDetailPaginated';

const cropSurvey = {
  post,
  remove,
  get,
  updateSyncStatus,
  stats,
  getCropSurveyDetail,
  deleteOldData,
  getSurveyDetailPaginated,
};

export default cropSurvey;
