import {IUser} from '../../@types';

export default function buildAssignedVillageFromApi(
  assignedVillages: any,
): IUser['assignedVillages'] {
  let villages: IUser['assignedVillages'] = [];
  assignedVillages.forEach((v: any) => {
    villages.push({
      districtCode: v.district_code,
      districtName: v.district_name,
      talukCode: v.taluk_code,
      talukName: v.taluk_name,
      villageCode: v.village_code,
      villageName: v.village_name,
      villageSpatialData: v.village_spatial_data,
      parentVillageCode: v.parent_village_code || v.village_code,
    });
  });
  return villages;
}
