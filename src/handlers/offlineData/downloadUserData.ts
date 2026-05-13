import { refreshOfflineData } from ".";
import { DownloadProgressStatus, HandleDownloadProgressFunction, IUser } from "../../@types";
import {
  DistrictsOfflineProps,
  TalukOfflineProps,
  VillageOfflineProps,
} from "../../@types/offlineTypes";
import api from "../../api";

type AssignedVillagesOnlineType = {
  district_code: string;
  district_name: string;
  taluk_code: string;
  taluk_name: string;
  village_code: string;
  village_name: string;
};
type AssignedVillagesOfflineType = {
  districtCode: string;
  districtName: string;
  talukCode: string;
  talukName: string;
  villageCode: string;
  villageName: string;
};

interface Props {
  assigned_villages: AssignedVillagesOfflineType[];
  user_id: string;
  user_name: string;
  mobile_number: string;
  role: string;
  handleDownloadProgress: HandleDownloadProgressFunction
}
const download = async (props: Props) => {
  let districts: DistrictsOfflineProps[] = [];
  let taluks: TalukOfflineProps[] = [];
  let villages: VillageOfflineProps[] = [];
   props.assigned_villages.forEach(async (village) => {
    districts.push({
      districtCode: village.districtCode,
      districtName: village.districtName.replaceAll(/'/g, '~'),
    });

    taluks.push({
      talukCode: village.talukCode,
      talukName: village.talukName.replaceAll(/'/g, '~'),
      districtCode: village.districtCode,
    });
    villages.push({
      villageCode: village.villageCode,
      villageName: village.villageName.replaceAll(/'/g, '~'),
      talukCode: village.talukCode,
    });
    // remove duplicate district based on district code
    districts =  districts.filter(
      (district, index, self) =>
        index ===
        self.findIndex((t) => t.districtCode === district.districtCode)
    );
    // remove duplicate district based on district code
    taluks =  taluks.filter(
      (district, index, self) =>
        index === self.findIndex((t) => t.talukCode === district.talukCode)
    );
    // remove duplicate district based on district code
    villages =  villages.filter(
      (district, index, self) =>
        index === self.findIndex((t) => t.villageCode === district.villageCode)
    );
  });

  // ? save data in db
  await api.local.districts.addDistricts({
    data: districts,
    callback: async () => {
      await api.local.taluks.addTaluks({
        data: taluks,
        callback: async () => {
          await api.local.villages.addVillages({
            data: villages,
            callback: async () => {
              props.handleDownloadProgress("userData", "completed");
            },
          });
        },
      });
    },
  });

};

export default download;
