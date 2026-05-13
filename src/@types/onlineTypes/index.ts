
export interface VerificationDetailProps {
  id: number;
  land_id: number;
  season_id: number;
  stage: string | null;
  cropping_method: string;
  crop_season_type: string;
  crop_type_id: number;
  crop_classification_id: number;
  crop_id: number | null;
  area: string;
  irrigation_id: number | null;
  sown_date: string | null;
  expected_harvested_date: string | null;
  cultivator_type_id: number;
  image_path: string;
  latitude: string;
  longitude: string;
  image_timestamp: string | null;
  image_orientation_x: string;
  image_orientation_y: string;
  image_orientation_z: string;
  is_border_or_row_crop: string;
  tree_count: number;
  added_by: number;
  created_at: string;
  modified_at: string | null;
  is_allocated: boolean;
  district_code: number;
  taluk_code: number;
  village_code: number;
  survey_number: string;
  sub_division_number: string;
  firka_code: string | null;
  crop_age: string;
  theervai: string;
  orupoga_irupoga_nanjai: string;
  app_version: string;
  gps_accuracy: string;
  form_type: string;
  level_1_status: string | null;
  level_1_by: number | null;
  level_1_ts: string | null;
  level_1_remarks: string | null;
  level_2_status: string | null;
  level_2_by: number | null;
  level_2_ts: string | null;
  level_2_remarks: string | null;
  level_3_status: string | null;
  level_3_by: number | null;
  level_3_ts: string | null;
  level_3_remarks: string | null;
  is_randomized: boolean;
  is_active: boolean;
  assigned_role_group: number;
  assigned_date: string;
  is_assigned: number;
  survey_status: string;
}
// export interface DistrictsOnlineProps {
//   district_code: string;
//   district_name: string;
// }

import {GeoJsonMultiPolygon} from '../geoJson';

// export interface TalukOnlineProps {
//   taluk_code: string;
//   taluk_name: string;
//   district_code?: DistrictsOnlineProps["district_code"];
// }
// export interface VillageOnlineProps {
//   village_code: string;
//   village_name: string;
//   taluk_code?: TalukOnlineProps["taluk_code"];
// }

export interface IUserOnlineProps {
  user_id: number;
  user_name: string;
  mobile_number: string;
  role: string;
  buffer_distance: number;
  buffer_unit: string;
  full_survey_btn_enable: boolean;
}

export interface CropTypeOnlineProps {
  id: number | string;
  crop_type: string;
  crop_type_name_in_tamil: string;
}


// Interface for a single village detail
export interface VillageDetail {
  district_lgd_code: number;
  district_code: number;
  district_name: string;
  taluk_lgd_code: number;
  taluk_code: number;
  taluk_name: string;
  village_lgd_code: string;
  village_code: string;
  village_name: string;
  centroid_latitude: number;
  centroid_longitude: number;
  xyz_link: string;
}

// Interface for the overall structure
export interface VillagesAssignedData {
  villages_assigned: number;
  village_details: VillageDetail[];
}

export interface SUrveyNumberOnlineProps {
  survey_number: string;
}
export interface SurveyNumberDropDown extends SUrveyNumberOnlineProps {}

export interface SubDivisionOnlineProps {
  id: string;
  district_code: string;
  taluk_code: string;
  village_code: string;
  patta_number: string;
  survey_number: string;
  sub_division_number: string;
  extent: string;
  land_type: string;
  farmer_name: string;
  owner_name: string;
  owner_type_id: number;
  farmer_data_type: string;
  theervai: string;
}

export interface SubDivisionDropDown extends SubDivisionOnlineProps {}

export interface CropClassificationOnlineProps {
  id: number | string;
  classification_name: string;
  crop_type_id?: CropTypeOnlineProps['id'];
  classification_name_in_tamil: string;
}

export interface CropOnlineProps {
  id: number | string;
  crop_name: string;
  crop_type_id?: CropTypeOnlineProps['id'];
  crop_classification_id?: CropClassificationOnlineProps['id'];
  crop_name_in_tamil: string;
  crop_season_type: string;
}

export interface MiscCropStageOnlineProps {
  crop_stage_id: string;
  crop_stage: string;
}

export interface MiscCroppingMethodOnlineProps {
  cropping_method_id: string;
  cropping_method: string;
}

export interface MiscCropSeasonTypeOnlineProps {
  crop_season_type_id: string;
  crop_season_type: string;
}

export interface MiscIrrigationSourceOnlineProps {
  id: number;
  irrigation_source: string;
}

export interface LandDetailsOnlineProps {
  type: string;
  features: GeoJsonMultiPolygon[];
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


export interface SeasonOnlineProps {
  season_id: number;
  district_code: string;
  taluk_code: string;
  village_code: string;
  season_name: string;
  master_season_id: string;
}

export interface OwnerDetailsOnlineProps {
  district_code: string;
  taluk_code: string;
  village_code: string;
  patta_number: string;
  survey_number: string;
  sub_division_number: string;
  extent: string;
  land_type: string;
  owner_name: string;
  farmer_name: string;
  owner_type_id: number;
  id: number|string;
  farmer_data_type: string;
  theervai: string;
}

export interface OwnerDetailSummaryProps {
  total_owner_records: number;
  total_page_count: number;
  page_limit: number;
}

export interface WebLinkOnlineProps {
  web_link_id: number;
  display_name: string;
  web_link: string;
}

export interface ApiTimestampOnlineProps {
  vector_tiles: string;
  land_detail: string;
  web_links: string;
  season: string;
  owner_details: string;
  crop_master_crop_classification: string;
  crop_master_crop_name: string;
  crop_master_crop_type: string;
  crop_master_major_crops: string;
  misc_cropping_method: string;
  misc_crop_season_type: string;
  misc_crop_stage: string;
  misc_irrigation_source: string;
  survey_status_summary: string;
}

export interface IGPSACcuracyOnflineProps {
  gps_accuracy?: number;
  gps_accuracy_unit?: string;
}

export interface DistrictsOnlineProps {
  districtCode: string;
  districtName: string;
}

export interface TalukOnlineProps {
  talukCode: string;
  talukName: string;
  districtCode?: DistrictsOnlineProps['districtCode'];
}

export interface VillageOnlineProps {
  villageCode: string;
  villageName: string;
  parentVillageCode?: string;
  talukCode?: TalukOnlineProps['talukCode'];
  lat?: string;
  lng?: string;
  xyzTileLink?: string;
}
