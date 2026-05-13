import local from './local';
import auth from './auth';
import cropMaster from './cropMaster';
import spatialData from './spatialData';
import season from './season';
import ownerDetails from './ownerDetails';
import cropSurvey from './cropSurvey';
import misc from './misc';
import user from './user';
import surveyStats from './surveyStats';
import surveyStatusSummary from './surveyStatusSummary';
import webLink from './webLinks';
import {apiTimestamp} from './apiTimestamp';
import assignedLocationDetails from './assignedLocationDetails';
import surveyDropdown from './surveyDropdown';
import surveyRecords from './suryveRecords';
import verification from './verification';
import checkStats from './checkStats';



const api = {
  local,
  auth,
  cropMaster,
  spatialData,
  season,
  ownerDetails,
  cropSurvey,
  misc,
  user,
  surveyStats,
  webLink,
  apiTimestamp,
  surveyStatusSummary,
  assignedLocationDetails,
  surveyDropdown,
  surveyRecords,
  verification,
  checkStats
};

export default api;
