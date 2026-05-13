import {
  CropClassificationOnlineProps,
  CropOnlineProps,
  CropTypeOnlineProps,
  MiscCroppingMethodOnlineProps,
  MiscCropStageOnlineProps,
  MiscIrrigationSourceOnlineProps,
  SeasonOnlineProps,
} from './onlineTypes';

export * from './user';
export * from './config';
export * from './auth';
export * from './onlineTypes';

export * from './conditions';

export * from './appSettings';
export * from './feedback';
export * from './form';

export interface ISurveyStatusSummaryOfflineProps {
  status: 'completed' | 'pending';
  id: string;
  villageCode: string;
  parrentVillageCode: string;
  talukCode: string;
  districtCode: string;
  part: string;
  count: string;
  webView: string;
  miscData?: string;
}

// export type TLocalStorageKey =
//   | 'mode'
//   | 'user'
//   | 'assignedLocationDetails'
//   | 'majorCropOrder'
//   | 'gpsAccuracy'
//   | 'gpsAccuracyUnit'
//   | 'languageCode';

export interface IDeviceInfo {
  deviceId: any;
  makeModel: any;
}

export interface ILocalStorageProps {
  mode: 'online' | 'offline';
  user: any;
  deviceInfo: IDeviceInfo;
  assignedLocationDetails: any;
  villageOfflineData: IOfflineVillageDetail;
  majorCropOrder: any;
  gpsAccuracy: string;
  gpsAccuracyUnit: string;
  languageCode: string;
  cropClassifications: CropClassificationOnlineProps[];
  cropTypes: CropTypeOnlineProps[];
  cropNames: CropOnlineProps[];
  majorCrops: CropOnlineProps[];
  cropSeasonType: MiscCropStageOnlineProps[];
  croppingMethod: MiscCroppingMethodOnlineProps[];
  seasonData: SeasonOnlineProps[];
  surveyStatusData: ISurveyStatusSummaryOfflineProps[];
  irrigationSource: MiscIrrigationSourceOnlineProps[];
  certificateSha256Digest: string | null;
}

export interface IOfflineVillageDetail {
  villageCode: string;
  villageName: string;
  talukCode: string;
  talukName: string;
  districtCode: string;
  districtName: string;
  villageBoundary: any;
}
