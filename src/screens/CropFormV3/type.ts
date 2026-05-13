import {SeasonOfflineProps} from '../../@types';

export interface ICropDataForm {
  labelCropName: string;
  labelCropType: string;
  labelCropClassification: string;
  labelCropSesonType: string;

  // disabled for oct28 changes
  // labelIrrigationSource: string;
  // disabled for oct28 changes
  // labelCropStage: string;
  //
  labelSeason: string;
  method: string;
  // seasonData: SeasonOfflineProps,
  selectedSubDivisionNumbers: string[];
  season: string;
  masterSeasonId: string;
  cropTypeId: string;
  cropSeasonType: string;
  cropClassificationId: string;
  cropNameId: string;
  // disabled for oct28 changes
  irrigationSourceId: string;
  sownDate: string;
  expectedHarvestDate: string;
  cropStage: string;
  districtCode: string;
  villageCode: string;
  surveynumber: string;
  talukCode: string;
  cropAge: string;

  // // disabled for oct28 changes
  // orupogaIrupogaNanjai: string;
}

interface ISubDivisionSurvey {
  id: string;
  cropSeasonType: string;
  cropClassificationId: string;
  extent: string;
}
export interface ISubDivision {
  subDivisionNumber: string;
  surveys: ISubDivisionSurvey[];
  cultivatorTypeId: string;
  remainingLandExtent: string;
  cultivatorId: string;
  cultivatorName: string;

  // disabled for oct28 changes
  // theervai: string;
}
export interface ICropFormV3CameraProps {
  image: string;
  imgLat: string;
  imgLon: string;
  imgOrientationX: string;
  imgOrientationY: string;
  imgOrientationZ: string;
  imgTimestamp: string;
}

export interface IFormDataV3 {
  cropData: ICropDataForm;
  farmerData: {[key: string]: ISubDivision};
  imageData: ICropFormV3CameraProps;
}
