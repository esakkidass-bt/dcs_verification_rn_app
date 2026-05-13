import { MetaDataKeyType } from "../appSettings";

export interface DistrictsOfflineProps {
  districtCode: string;
  districtName: string;
}

export interface TalukOfflineProps {
  talukCode: string;
  talukName: string;
  districtCode?: DistrictsOfflineProps["districtCode"];
}

export interface VillageOfflineProps {
  villageCode: string;
  villageName: string;
  parentVillageCode?: string;
  talukCode?: TalukOfflineProps["talukCode"];
  lat?: string;
  lon?: string;
}

export interface CropTypeOfflineProps {
  cropTypeId: number | string;
  cropTypeName: string;
  cropTypeNameTamil?: string;
}

export interface CropClassificationOfflineProps {
  cropClassificationId: number | string;
  cropClassificationName: string;
  cropClassificationNameTamil?: string;
  cropTypeId?: CropTypeOfflineProps["cropTypeId"];
}

export interface CropOfflineProps {
  cropId: number | string;
  cropName: string;
  cropNameTamil?: string;
  cropSeasonType: string;
  cropTypeId?: CropTypeOfflineProps["cropTypeId"];
  cropClassificationId?: CropClassificationOfflineProps["cropClassificationId"];
}

export interface MiscCropStageOfflineProps {
  cropStageId: string;
  cropStage: string;
}

export interface MiscCroppingMethodOfflineProps {
  croppingMethodId: string;
  croppingMethod: string;
}

export interface MiscCropSeasonTypeOfflineProps {
  cropSeasonTypeId: string;
  cropSeasonType: string;
}

export interface MiscIrrigationSourceOfflineProps {
  id: string;
  irrigationSource: string;
}

export interface LandDetailsOfflineProps {
  surveyNumber: string;
  subDivisionNumber: string;
  villageCode: string;
  districtCode: string;
  talukCode: string;
  geoJsonFeature: any;
  lat: number;
  lon: number;
}

export interface OwnerDetailsOfflineProps {
  districtCode: string;
  talukCode: string;
  villageCode: string;
  pattaNumber: string;
  surveyNumber: string;
  subDivisionNumber: string;
  extent: string;
  landType: string;
  ownerName: string;
  farmerName: string;
  ownerTypeId: number;
  id: string;
  farmerDataType: string;
  theervai?: string;
}

export interface SeasonOfflineProps {
  seasonId: number;
  districtCode: string;
  talukCode: string;
  villageCode: string;
  seasonName: string;
  id: string;
  masterSeasonId: string;
}

export interface ISurveyStatusOfflineProps {
  status: "completed" | "pending";
  surveyNumber: string;
  subDivisionNumber: string;
  villageCode: string;
  talukCode: string;
  districtCode: string;
  id: string;
  villageName: string;
}
export interface ISurveyStatusSummaryOfflineProps {
  status: "completed" | "pending";
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

export interface IMetaDataProps {
  name: MetaDataKeyType;
  dataType?: string;
  value: string;
}

export interface WebLinkOfflineProps {
  webLinkid: string;
  displayName: string;
  webLink: string;
}

export interface ApiTimestampOfflineProps {
  id: string;
  villageCode: string;
  apiName: string;
  dataTimestamp: string;
}

export interface IGPSACcuracyOfflineProps {
  gpsAccuracy?: number;
  gpsAccuracyUnit?: string;
}
