import {
  DownloadProgressStatus,
  IUser,
  OwnerDetailsOnlineProps,
} from '../../@types';
import api from '../../api';
import {Alert} from 'react-native';

interface DownloadOwnerDataPaginatedProps {
  userId: IUser['userId'];
  deviceId: string;
  handleDownloadProgress: (status: DownloadProgressStatus) => void;
  districtCode: string;
  talukCode: string;
  villageCode: string;
  pageNumber: number;
}

const downloadOwnerDataPaginated = async (
  props: DownloadOwnerDataPaginatedProps,
) => {
  const ownerDetails = await api.ownerDetails.getOwnerDataPageinated({
    userId: props.userId,
    deviceId: props.deviceId,
    pageNumber: props.pageNumber,
    villageCode: props.villageCode,
    talukCode: props.talukCode,
    districtCode: props.districtCode,
  });

  let ownerDetailsParsed: OwnerDetailsOnlineProps[] = [];

  // convert OwnerDetailsOnlineProps to OwnerDetailsOfflineProps
  if (ownerDetails && ownerDetails?.length > 0) {
    for (const ownerDetail of ownerDetails) {
      ownerDetailsParsed.push({
        district_code: ownerDetail?.district_code,
        taluk_code: ownerDetail?.taluk_code,
        village_code: ownerDetail?.village_code,
        patta_number: ownerDetail?.patta_number,
        survey_number: ownerDetail?.survey_number,
        sub_division_number: ownerDetail?.sub_division_number,
        extent: ownerDetail?.extent,
        land_type: ownerDetail?.land_type,
        owner_name: ownerDetail?.owner_name?.replaceAll(/'/g, '~'),
        farmer_name: ownerDetail?.farmer_name?.replaceAll(/'/g, '~'),
        owner_type_id: ownerDetail?.owner_type_id,
        id: `${ownerDetail?.id.toString()}$$${ownerDetail?.village_code}_${
          ownerDetail?.survey_number
        }_${ownerDetail?.sub_division_number}`,
        farmer_data_type: ownerDetail?.farmer_data_type,
        theervai: ownerDetail?.theervai,
      });
    }
    await api.local.ownerDetails.store({
      data: ownerDetailsParsed,
      callback: async () => {},
      errCallback: () => {
        props.handleDownloadProgress('failed');
      },
    });
  } else {
    props.handleDownloadProgress('dataNotFound');
    Alert.alert('Warning', `No Farmer data available for ${props.villageCode}`);
  }
};

interface Props {
  userId: IUser['userId'];
  deviceId: string;
  handleDownloadProgress: (status: DownloadProgressStatus) => void;
  districtCode: string;
  talukCode: string;
  villageCode: string;
}

async function index({
  deviceId,
  userId,
  villageCode,
  districtCode,
  talukCode,
  handleDownloadProgress,
}: Props) {
  const ownerDetailsSummary = await api.ownerDetails.getOwnerDetailSummary({
    userId: userId,
    deviceId,
    villageCode: villageCode,
    talukCode: talukCode,
    districtCode: districtCode,
  });

  if (ownerDetailsSummary && ownerDetailsSummary.total_page_count) {
    handleDownloadProgress('downloading');

    const ownerDetailsStatusList: DownloadProgressStatus[] = [];
    for (let i = 1; i <= ownerDetailsSummary.total_page_count; i++) {
      await downloadOwnerDataPaginated({
        userId: userId,
        districtCode: districtCode,
        talukCode: talukCode,
        villageCode: villageCode,
        deviceId,
        pageNumber: i,
        handleDownloadProgress: (status: any) => {
          ownerDetailsStatusList.push(status);
          // props.handleVillageDataProgress(villageCode, "ownerDetailsStatus", status)
        },
      });
    }

    // const status = ownerDetailsStatusList.some(e => 'dataNotFound') ? 'dataNotFound' : 'completed'
    let status: DownloadProgressStatus = 'completed';
    if (ownerDetailsStatusList.includes('failed')) {
      status = 'failed';
    } else if (ownerDetailsStatusList.includes('dataNotFound')) {
      status = 'dataNotFound';
    }
    handleDownloadProgress(status);
  } else {
    handleDownloadProgress('dataNotFound');
  }
}

export default index;
