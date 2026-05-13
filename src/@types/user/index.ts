import {FeatureCollection} from '@turf/turf';
import {DistrictsOnlineProps, TalukOnlineProps, VillageOnlineProps} from '..';

export interface IUserAssignedVillages {
  districtCode: DistrictsOnlineProps['districtCode'];
  districtName: DistrictsOnlineProps['districtName'];
  talukCode: TalukOnlineProps['talukCode'];
  talukName: TalukOnlineProps['talukName'];
  villageCode: VillageOnlineProps['villageCode'];
  villageName: VillageOnlineProps['villageName'];
  villageSpatialData: FeatureCollection;
  parentVillageCode: string;
}
export interface IUser {
  userId: string | number;
  mobileNumber: string;
  userName: string;
  role: string;
  role_group_id: number;
  assignedVillages: IUserAssignedVillages[];
  bufferDistance: number;
  bufferUnit: string;
  fullSurveyBtnEnable?: boolean; // Optional property for full survey button enable status
  mode?: 'dev' | 'user';
}
