import downloadCropMasterData from './downloadCropMasterData';
import downloadOwnerData from './downloadOwnerData';
import downloadSeasons from './downloadSeasons';
import downloadSpatialData from './downloadSpatialData';
import downloadMiscData from './downloadMiscData';
import {
  DownloadProgressStatus,
  HandleDownloadProgressFunction,
  ISurveyStatusSummaryOfflineProps,
  IUser,
} from '../../@types';
import api from '../../api';
// import downloadWebLinks from './downloadWebLinks'

interface Props {
  user: IUser;
  deviceId: string;
  handleDownloadProgress: HandleDownloadProgressFunction;
  villageCode: string;
  talukCode: string;
  districtCode: string;
  handleVillageProgress?: (status: DownloadProgressStatus) => void;
  handleVillageDataProgress?: (
    villageCode: string,
    statusName: 'fmbStatus' | 'vectorTileStatus' | 'ownerDetailsStatus',
    status: DownloadProgressStatus,
  ) => void;
}

const index = async ({
  user,
  deviceId,
  handleDownloadProgress,
  ...props
}: Props) => {
  // await api.local.tables.clearSelectedTable({tables:['cropSurvey'], callback:async()=>{

  // }})

  //   await downloadWebLinks({
  //     userId: user.userId,
  //     deviceId,
  //     handleDownloadProgress,
  //   });

  await downloadCropMasterData({
    userId: user.userId,
    deviceId,
    handleDownloadProgress,
  });

  await downloadSeasons({
    userId: user.userId,
    deviceId,
    handleDownloadProgress,
  });

  await downloadMiscData({
    userId: user.userId,
    deviceId,
    handleDownloadProgress,
  });

  await downloadSpatialData({
    userId: user.userId,
    districtCode: props.districtCode,
    talukCode: props.talukCode,
    villageCode: props.villageCode,
    deviceId,
    handleDownloadProgress: e => {
      handleDownloadProgress('spatialData', e);
    },
  });

  await downloadOwnerData({
    userId: user.userId,
    districtCode: props.districtCode,
    talukCode: props.talukCode,
    villageCode: props.villageCode,
    deviceId,
    handleDownloadProgress: e => {
      console.debug('ownerData offline >', {
        districtCode: props.districtCode,
        talukCode: props.talukCode,
        villageCode: props.villageCode,
      });
      handleDownloadProgress('ownerData', e);
    },
  });

  await api.spatialData.vectorTiles({
    userId: user.userId,
    districtCode: props.districtCode,
    talukCode: props.talukCode,
    villageCode: props.villageCode,
    deviceId,
    handleDownloadProgress: e => {
      handleDownloadProgress('vectorTiles', e);
    },
  });

  // await api.local.apiTimestamp.compare({
  //   apiName:''
  // })
  //   handleDownloadProgress('surveyStats', 'downloading');

  //   await api.surveyStats.stats({userId: user.userId, deviceId}).then(e => {
  //     if (e) {
  //       handleDownloadProgress('surveyStats', 'completed');
  //     } else {
  //       handleDownloadProgress('surveyStats', 'failed');
  //     }
  //   });

  // await api.surveyStatusSummary
  //   .status({
  //     userId: user.userId,
  //     deviceId,
  //   })
  //   .then(async e => {
  //     try {
  //       if (e) {
  //         const statusList: ISurveyStatusSummaryOfflineProps[] = [];
  //         const parseData = (item: any, status: string) =>
  //           ({
  //             id: `${item.district_code}_${item.taluk_code}_${item.village_code}_${status}`,
  //             villageCode: item.village_code,
  //             parrentVillageCode: item.village_code,
  //             talukCode: item.taluk_code,
  //             districtCode: item.district_code,
  //             part: item.part,
  //             count: item.count,
  //             webView: item.web_view,
  //             status,
  //           } as ISurveyStatusSummaryOfflineProps);
  //         for (const item of e['completed']) {
  //           statusList.push(parseData(item, 'completed'));
  //         }
  //         for (const item of e['pending']) {
  //           statusList.push(parseData(item, 'pending'));
  //         }

  //         await api.local.surveyStatusSummary.storeRecords({
  //           data: statusList,
  //         });
  //         // handleDownloadProgress('surveyStatusSummary', 'completed')
  //       } else {
  //         // handleDownloadProgress('surveyStatusSummary', 'failed')
  //       }
  //     } catch (e) {
  //       // handleDownloadProgress('surveyStatusSummary', 'failed')
  //       console.error('Error while parsing > ', e);
  //     }
  //   });

  //   props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", "downloading");

  //             await api.spatialData.vectorTiles({
  //               userId: user.userId,
  //               districtCode: village.districtCode,
  //               talukCode: village.talukCode,
  //               villageCode: village.villageCode,
  //               villageName: village.villageName.replaceAll(/'/g, "~"),
  //               deviceId,
  //               handleDownloadProgress: (status) =>
  //                 props.handleVillageDataProgress(village.villageCode, "vectorTileStatus", status),
  //             });
};

export default index;
