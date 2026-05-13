import {OwnerDetailsOnlineProps} from '.';

export interface ICropSurvey {
  id: string;
  districtCode: string;
  talukCode: string;
  villageCode: string;
  surveyNumber: string;
  subDivisionNumber: string;
  seasonId: string;
  // // disabled for oct28 changes
  // cropStage: string;
  croppingMethod: string;
  cropSeasonType: string;
  cropTypeId: string;
  cropClassificationId: string;
  cropNameId: string;
  cropLandExtent: string;
  // // disabled for oct28 changes
  irrigationSourceId: string | null;
  sownDate: string;
  expectedHarvestDate: string;
  cultivatorTypeId: string;
  cultivatorId: string;
  cultivatorName: string;
  imgLat: string;
  imgLon: string;
  imgOrientationX: string;
  imgOrientationY: string;
  imgOrientationZ: string;
  imgTimestamp: string;
  image: string;
  cropAge: string;
  // // disabled for oct28 changes
  // theervai:string;
  // // disabled for oct28 changes
  // orupogaIrupogaNanjai:string;

  isBorderOrRowCrop: string;
  cropCount: string;

  gpsAccuracy?: string;
  appVersion?: string;
  formType?: string;
}

export interface ICropBaseFormProps {
  method: string;
  season: string;
  masterSeasonId: string;
}

export interface ICropFormProps extends ICropBaseFormProps {
  surveys: ICropSurvey[];
  gpsAccuracy: string;
  formType: 'surveyNumberForm' | 'subDivisionForm';
}

export interface ICropFormV2CameraProps {
  image: string;
  imgLat: string;
  imgLon: string;
  imgOrientationX: string;
  imgOrientationY: string;
  imgOrientationZ: string;
  imgTimestamp: string;
}

export interface ICropFormV2SubDivisionSurveyForm {
  id: string;
  extent: string;
  cropSeasonType: string;
  cropClassificationId: string;
}

export interface ICropFormV2SubDivisionFormValueProps {
  cultivatorTypeId: string;
  cultivatorId: string;
  cultivatorName: string;
  subDivisionNumber: string;
  remainingLandExtent: string;

  // // disabled for oct28 changes
  // theervai:string
  surveys: ICropFormV2SubDivisionSurveyForm[];
}

export interface ICropFormV2BaseProps {
  cropTypeId: string;
  cropSeasonType: string;
  cropClassificationId: string;
  cropNameId: string;

  // // disabled for oct28 changes
  // irrigationSourceId: string;
  sownDate: string;
  expectedHarvestDate: string;

  // // disabled for oct28 changes
  // cropStage: string;
  districtCode: string;
  villageCode: string;
  surveynumber: string;
  talukCode: string;
}

export interface ICropFormV2Props
  extends ICropBaseFormProps,
    ICropFormV2BaseProps {
  subDivisionsSurveyData: ICropFormV2SubDivisionFormValueProps[];
  imageData: ICropFormV2CameraProps;
}

export interface ICropSurveyOfflineProps
  extends ICropSurvey,
    ICropBaseFormProps {
  syncStatus: 'completed' | 'pending';
  createdAt: string;
  syncedAt: string;
  isSyncEnabled: number;
}

export interface ICropSurveyDetailsOfflineProps
  extends ICropSurveyOfflineProps {
  districtName: string;
  talukName: string;
  villageName: string;
  seasonName: string;
  croppingMethodName: string;
  cropSeasonTypeName: string;
}

export interface ISelectedLocationDataProps {
  district: string;
  taluk: string;
  village: string;
  parentVillageCode: string;
  villageLat: string;
  villageLon: string;
  surveyNumber: string;
  subDivisionNumber: string;
  ownerDetails: OwnerDetailsOnlineProps;
  xyzTileLink?: string;

  districtName?: string;
  talukName?: string;
  villageName?: string;
}
