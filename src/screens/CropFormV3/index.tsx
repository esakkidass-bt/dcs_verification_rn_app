import React, {useCallback, useEffect, useState} from 'react';
import {LoadingOverlay, ProfileHeader, UploadCounter} from '../../components';
import {AGRICULTURE_NO_USE_IDS, croppingMethod} from '../../const';
import {useAuth, useStateContext} from '../../hooks';
import SafeArea from '../../layout/SafeArea';
import {LocationDetails} from '../CropForm/components';
import formV3ToV1Converter from './formDataConverter';
import {FsCropData, FsFarmerData} from './formSteps';
import {ICropDataForm, IFormDataV3} from './type';

import {CropClassificationOnlineProps, SeasonOnlineProps} from '../../@types';
import api from '../../api';
import {generateRandomNumber} from '../../helpers';
import {navigation} from '../../routers/navigation';
import config from '../../config';
import {Alert} from 'react-native';
import useDict from '../../hooks/useDict';
import Network from '@react-native-community/netinfo';

interface IFormState {
  formStep: 'cropData' | 'farmerData';
  isLoading: boolean;
}

export default function Index({route}: any) {
  const {
    // gpsAccuracy
  } = route.params;
  const [surveyRecordUploadState, setSurveyRecordUploadState] = useState<{
    isUploading: boolean;
    surveyIds: string[];
  }>({
    isUploading: false,
    surveyIds: [],
  });
  const ln = useDict();
  const [isUploading, setIsuploading] = useState(false);
  // const ln = useDict();
  const {selectedLocationData, capturedImageData, removeImageData} =
    useStateContext();
  // useSTat
  const auth = useAuth();
  const [formState, setFormState] = useState<IFormState>({
    formStep: 'cropData',
    isLoading: true,
  });

  function startLoader() {
    handleFormState('isLoading', true);
  }

  function closeLoader(name: string, time: number = 1000) {
    console.log(name + ' > initiated close loader ', formState.formStep);
    setTimeout(() => {
      console.log(name + ' > loader cloased ', formState.formStep);
      handleFormState('isLoading', false);
    }, time);
  }

  const [formData, setFormData] = useState<IFormDataV3>({
    farmerData: {},
    imageData: capturedImageData,
    cropData: {
      method: croppingMethod.MONO,
      villageCode: selectedLocationData.village,
      talukCode: selectedLocationData.taluk,
      surveynumber: selectedLocationData.surveyNumber,
      districtCode: selectedLocationData.district,

      // disabled for oct28 changes
      // orupogaIrupogaNanjai: "0",

      selectedSubDivisionNumbers:
        [] as ICropDataForm['selectedSubDivisionNumbers'],
    } as ICropDataForm,
  });

  const getSeasons = useCallback(async () => {
    await api.season
      .getSeasons({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(([status, res]) => {
        if (status === 200) {
          const seasons = res as SeasonOnlineProps[];
          const season = seasons?.find(
            e => e.village_code === selectedLocationData.village,
          );
          if (season) {
            handleCropData('season', season.season_id.toString());
            handleCropData(
              'masterSeasonId',
              season.master_season_id.toString(),
            );
            handleCropData('labelSeason', season.season_name.toString());
          }
        }
      });
  }, [auth.deviceId, auth.user.userId, selectedLocationData.village]);

  function handleFormState<K extends keyof IFormState>(
    key: K,
    value: IFormState[K],
  ) {
    setFormState(e => ({
      ...e,
      [key]: value,
    }));
  }

  function handleCropData<K extends keyof ICropDataForm>(
    key: K,
    value: ICropDataForm[K],
  ) {
    setFormData(e => ({
      ...e,
      cropData: {
        ...e.cropData,
        [key]: value,
      },
    }));
  }

  const handleSave = async (e: any) => {
    setIsuploading(true);
    try {
      const surveyData = await formV3ToV1Converter({
        cropData: formData.cropData,
        surveys: Object.values(e),
        imageData: capturedImageData,
      });

      const network = await Network?.fetch();

      if (auth.appMode === 'online') {
        console.debug('handleSave', surveyData);
        const imageId = capturedImageData.image
          ?.split('/')
          .pop()
          ?.split('.')[0] as string;
        const crop_image = {
          uri: capturedImageData.image,
          name: `${imageId}-${generateRandomNumber(4)}.jpg`,
          type: 'image/jpeg',
        };
        await api.cropSurvey
          .directUploadSurveyImage({
            deviceId: auth.deviceId as string,
            userId: auth.user.userId?.toString(),
            data: {
              crop_image,
              crop_name_id: formData.cropData.cropNameId,
              image_id: imageId,
              survey_number: selectedLocationData.surveyNumber,
              village_code: selectedLocationData.village,
            },
          })
          .then(async ([status, res]) => {
            if (status !== 200) {
              Alert.alert('Error while uploading the image', `${res}`);
              throw new Error(res || 'Error while Uploading the image');
            }
            for (const survey of surveyData.surveys) {
              await api.cropSurvey.directUploadSurvey({
                deviceId: auth.deviceId as string,
                userId: auth.user.userId?.toString(),
                imageId,
                onUpdateFail: e => {
                  console.error(e);
                  throw new Error(
                    res ||
                      'Error while Uploading the survey, Please Try again later',
                  );
                },
                onUpdateSuccess: () => {
                  console.info('success');

                  Alert.alert('Success', 'Survey uploaded sucessfully', [
                    {
                      onPress: () => {
                        setIsuploading(false);
                      },
                      text: ln('Okay'),
                    },
                  ]);
                  navigation.goBack();
                },
                data: {
                  district_code: survey.districtCode,
                  irrigationSourceId: survey.irrigationSourceId,
                  taluk_code: survey.talukCode,
                  village_code: survey.villageCode,
                  survey_number: survey.surveyNumber,
                  sub_division_number: survey.subDivisionNumber,
                  season_id: surveyData.season,
                  cropping_method: surveyData.method,
                  crop_season_type: survey.cropSeasonType,
                  crop_type_id: survey.cropTypeId,
                  crop_classification_id: survey.cropClassificationId,
                  crop_name_id: survey.cropNameId,
                  crop_land_extent: survey.cropLandExtent,
                  sown_date: survey.sownDate,
                  expected_harvested_date: survey.expectedHarvestDate,
                  cultivator_type_id: survey.cultivatorTypeId,
                  cultivator_id: survey.cultivatorId,
                  cultivator_name: survey.cultivatorName,
                  crop_image_latitude: survey.imgLat,
                  crop_image_longitude: survey.imgLon,
                  crop_image_orientation_x: survey.imgOrientationX,
                  crop_image_orientation_y: survey.imgOrientationY,
                  crop_image_orientation_z: survey.imgOrientationZ,
                  crop_image_timestamp: survey.imgTimestamp,
                  is_border_or_row_crop: survey.isBorderOrRowCrop,
                  crop_age: survey.cropAge,
                  crop_count: survey.cropCount,
                  gps_accuracy: surveyData.gpsAccuracy,
                  form_type: surveyData.formType,
                  id: survey.id,
                  crop_image: crop_image,
                  app_version: config.version,
                },
              });
            }
          });
      } else {
        await api.local.cropSurvey
          .post({
            ...surveyData,
            gpsAccuracy: surveyData.gpsAccuracy,
            formType: 'surveyNumberForm',
          })
          .then(async () => {
            if (!auth.deviceId) {
              Alert.alert(ln('Error'), ln('Device id error'));
              return;
            }

            if (network?.isInternetReachable) {
              setSurveyRecordUploadState({
                isUploading: true,
                surveyIds: surveyData.surveys.map(e => e?.id),
              });
            } else {
              Alert.alert(
                ln('Network not reachable'),
                ln(
                  'Data has been stored safely in your device. please sync to server once you got network',
                ),
                [
                  {
                    text: ln('Okay'),
                    onPress: () => navigation.goBack(),
                  },
                ],
              );
            }
          });
      }
    } catch (err) {
      console.error('form v3 error > ', err);
      setIsuploading(false);
    }
  };

  const [nonAgriCropClassification, setNonAgriCropClassification] = useState<
    CropClassificationOnlineProps[]
  >([]);
  const getAllNonAgriCulturalCropClassification = useCallback(async () => {
    await api.cropMaster
      .getCropClassifications({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(cropClassifications => {
        setNonAgriCropClassification(
          cropClassifications?.filter((e: CropClassificationOnlineProps) =>
            AGRICULTURE_NO_USE_IDS.includes(e.crop_type_id?.toString()),
          ) as CropClassificationOnlineProps[],
        );
      });
  }, [auth.deviceId, auth.user.userId]);

  useEffect(() => {
    getSeasons();
    getAllNonAgriCulturalCropClassification();
    return () => {
      removeImageData();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderFormStep() {
    switch (formState.formStep) {
      case 'cropData':
        return (
          <FsCropData
            imageData={formData?.imageData}
            closeLoader={closeLoader}
            startLoading={startLoader}
            cropData={formData.cropData}
            isLoading={formState.isLoading}
            onNext={e => {
              startLoader();
              setFormData(prevVal => ({
                ...prevVal,
                cropData: {...prevVal.cropData, ...e},
              }));
              handleFormState('formStep', 'farmerData');
            }}
          />
        );
      case 'farmerData':
        return (
          <FsFarmerData
            cropClassifications={nonAgriCropClassification}
            currentForm={formState.formStep}
            onNext={e => handleSave(e)}
            closeLoader={closeLoader}
            startLoading={startLoader}
            isLoading={formState.isLoading}
            cropData={formData.cropData}
            onPrevious={() => handleFormState('formStep', 'cropData')}
          />
        );
    }
  }

  return (
    <SafeArea>
      <ProfileHeader disableNavigation />
      <LocationDetails showSurveyNumber={true} />
      {isUploading ? (
        <LoadingOverlay isLoading={isUploading} loadingText="Uploading" />
      ) : null}

      {renderFormStep()}
      {surveyRecordUploadState?.isUploading &&
      surveyRecordUploadState?.surveyIds?.length > 0 ? (
        <UploadCounter
          surveyRecordIds={surveyRecordUploadState?.surveyIds}
          onCancel={() => {
            setSurveyRecordUploadState({
              isUploading: false,
              surveyIds: [],
            });
          }}
          onComplete={() => {
            setSurveyRecordUploadState({
              isUploading: false,
              surveyIds: [],
            });
            navigation.goBack();
          }}
          show={surveyRecordUploadState?.isUploading}
        />
      ) : null}
    </SafeArea>
  );
}
