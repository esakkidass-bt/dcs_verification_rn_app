import {
  IUser,
  TalukOnlineProps,
  DistrictsOnlineProps,
  VillageOnlineProps,
  DownloadProgressStatus,
} from '../../@types';
import config from '../../config';

import {NativeModules} from 'react-native';
import { getUrlFromFirebase } from '../../helpers/firebase/urls';

const {DarkZipFileModule} = NativeModules;
interface Props {
  userId: IUser['userId'];
  districtCode: DistrictsOnlineProps['districtCode'];
  talukCode: TalukOnlineProps['talukCode'];
  villageCode: VillageOnlineProps['villageCode'];
  deviceId: string;
  handleDownloadProgress?: (status: DownloadProgressStatus) => void;
}

const index = async (props: Props) => {
  // console.log(data);
  const fileName = `${props.districtCode}${props.talukCode}${props.villageCode}.zip`;

  // fetch function to download zip file from api
  const fetchFunction = async () => {
    // let URL = `${config.api_url}${'/vector_tiles'}`
    let URL = `${config.api_url}`;
      URL = await getUrlFromFirebase('vector_tiles')
    // if(config.env==='training'){

    // }
    if (!URL) {
      props.handleDownloadProgress?.('failed');
      return [500, 'Url not found'];
    }
    try {
      console.debug(
        '>>>>>>>>>>>>>vector tiles,',
        props.districtCode,
        props.talukCode,
        props.villageCode,
      );

      await DarkZipFileModule.downloadTiles(
        URL,
        props.userId.toString(),
        props.deviceId,
        config.xAppKey,
        'village',
        props.districtCode,
        props.talukCode,
        props.villageCode,
        fileName,
        'vectors',
        async () => {
          console.log('vector tiles error ');
          props.handleDownloadProgress?.('failed');
        },
        async () => {
          // const db = await new SQLiteService().getDb();
          // db.transaction(async tx => {
          //   await api.local.apiTimestamp.apiInsertTimestampQuery(
          //     tx,
          //     'vector_tiles',
          //     props.villageCode,
          //   );
          // });
          props.handleDownloadProgress?.('completed');
        },
      );
    } catch (error) {
      console.log('error', error);
      // props.handleDownloadProgress?.("failed");
    }
  };
  await fetchFunction();
  // props.handleDownloadProgress?.("completed")
};

export default index;
