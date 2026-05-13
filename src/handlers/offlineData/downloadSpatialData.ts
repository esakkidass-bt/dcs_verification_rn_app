import {
  LandDetailsOnlineProps,
  IUser,
  LandDetailsOfflineProps,
  DownloadProgressStatus,
} from '../../@types';
import api from '../../api';

interface Props {
  userId: IUser['userId'];
  districtCode: string;
  talukCode: string;
  villageCode: string;
  deviceId: string;
  handleDownloadProgress: (status: DownloadProgressStatus) => void;
}

const index = async (props: Props) => {
  const landDetails = await api.spatialData.landDetails({
    userId: props.userId,
    districtCode: props.districtCode,
    talukCode: props.talukCode,
    villageCode: props.villageCode,
    deviceId: props.deviceId,
  });

  let landDetailsParsed: LandDetailsOfflineProps[] = [];

  // convert LandDetailsOnlineProps response to LandDetailsOfflineProps
  if (landDetails) {
    landDetails.forEach((features: LandDetailsOnlineProps) => {
      features.features.forEach(feature => {
        landDetailsParsed.push({
          surveyNumber: feature.properties.survey_number,
          subDivisionNumber: feature.properties.sub_division_number,
          villageCode: feature.properties.village_code.toString(),
          districtCode: feature.properties.district_code.toString(),
          talukCode: feature.properties.taluk_code.toString(),
          geoJsonFeature: feature,
          lon: feature.properties.centroid_longitude,
          lat: feature.properties.centroid_latitude,
        });
      });
    });
  }

  if (landDetailsParsed?.length === 0) {
    props.handleDownloadProgress('dataNotFound');
  }
  await api.local.landDetails.store({
    data: landDetailsParsed,

    callback: () => {
      if (landDetailsParsed?.length > 0) {
        props.handleDownloadProgress('completed');
      }
    },
    errorCallback: () => {
      props.handleDownloadProgress('failed');
    },
  });
};

export default index;
