import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Button, Center, Row, ScrollView, Text} from 'native-base';
import {Alert, BackHandler} from 'react-native';
import {navigation} from '../../routers/navigation';
import {
  FarmerDetailsCard,
  LoadingOverlay,
  ProfileHeader,
  UploadCounter,
} from '../../components';
import {FormBlock1, LocationDetails, SurveyFormBlock} from './components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ICropFormProps, ICropSurvey} from '../../@types/form';
import {useAuth, useStateContext} from '../../hooks';
import api from '../../api';
import useDict from '../../hooks/useDict';

import Network from '@react-native-community/netinfo';
import {
  CropClassificationOnlineProps,
  CropOnlineProps,
  CropTypeOnlineProps,
  MiscCropSeasonTypeOnlineProps,
  MiscIrrigationSourceOnlineProps,
  OwnerDetailsOnlineProps,
} from '../../@types';

import {
  AGRICULTURE_NO_USE_IDS,
  croppingMethod,
  cropSeasonType,
  TREE_OR_BORDER_CROP,
} from '../../const';
import config from '../../config';
import {generateRandomNumber} from '../../helpers';

const LAND_EXTENT_MULTIPLIER = {
  base: 1.5,
};
interface Props {
  route: any;
}

async function getCropTypes(
  props: {userId: number; deviceId?: string},
  setCropTypes: (e: CropTypeOnlineProps[]) => void,
) {
  await api.cropMaster
    .getCropTypes({
      userId: props?.userId,
      deviceId: props?.deviceId as string,
    })
    .then(e => {
      setCropTypes(e as CropTypeOnlineProps[]);
    });
}

const getCropClassifications = async (
  props: {userId: number; deviceId?: string},
  callback: (e: CropClassificationOnlineProps[]) => void,
) => {
  await api.cropMaster
    .getCropClassifications({
      userId: props?.userId,
      deviceId: props?.deviceId as string,
    })
    .then(cropClassification => {
      callback(cropClassification as CropClassificationOnlineProps[]);
    });
};

//? get crop names
async function getCrops(
  props: {userId: number; deviceId?: string},
  callback: (e: CropOnlineProps[]) => void,
) {
  await api.cropMaster
    .getCrops({
      userId: props?.userId,
      deviceId: props?.deviceId as string,
    })
    .then(crops => {
      callback(crops as CropOnlineProps[]);
      console.log('crops > ', crops);
    });
}

//? get crop names
async function getIrrigationSource(
  props: {userId: number; deviceId?: string},
  callback: (e: MiscIrrigationSourceOnlineProps[]) => void,
) {
  await api.misc
    .irrigationSource({
      userId: props?.userId,
      deviceId: props?.deviceId as string,
    })
    .then(crops => {
      callback(crops as MiscIrrigationSourceOnlineProps[]);
    });
}

const Index = ({route}: Props) => {
  const {gpsAccuracy} = route.params;
  const [surveyRecordUploadState, setSurveyRecordUploadState] = useState<{
    isUploading: boolean;
    surveyIds: string[];
  }>({isUploading: false, surveyIds: []});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // ? context
  const state = useStateContext();
  const auth = useAuth();

  // ? hooks
  const ln = useDict();

  // ? states
  const [isPreviewModeEnabled, setIsPreviewModeEnabled] = useState(false);

  const [formData, setFormData] = useState<ICropFormProps>({
    method: croppingMethod.MONO,
    formType: 'subDivisionForm',
    season: '',
    masterSeasonId: '',
    gpsAccuracy,
    surveys: [
      {
        cultivatorTypeId: '1',
        id: new Date().getTime().toString(),
        cropLandExtent: state.selectedLocationData.ownerDetails?.extent || 0,
      } as ICropSurvey,
    ],
    // ...state?.cropFormData,
  } as ICropFormProps);

  const formDataMemo = useMemo(() => formData, [formData]);

  const [btnState, setBtnState] = useState({
    previewBtnIsDisabled: true,
    surveyCardDeleteBtnIsEnabled: false,
  });

  // ? error
  const [errors] = useState<{id: string; error: string}[]>([]);

  // ? handle functions
  const handleBtnState = useCallback(
    (key: keyof typeof btnState) => (value: any) => {
      setBtnState(prevVal => {
        return {...prevVal, [key]: value};
      });
    },
    [setBtnState],
  );

  const [ownerDetails, setOwnerDetails] = useState<OwnerDetailsOnlineProps[]>();

  //? get Owner details
  async function getOwnerDetails() {
    if (auth.appMode === 'online') {
      await api.surveyDropdown
        .ownerDetail({
          userId: auth.user.userId,
          deviceId: auth.deviceId as string,
          district_code: state.selectedLocationData.district,
          taluk_code: state.selectedLocationData.taluk,
          village_code: state.selectedLocationData.village,
          sub_division: state.selectedLocationData.subDivisionNumber,
          survey_number: state.selectedLocationData.surveyNumber,
        })
        .then(e => {
          if (e) {
            setOwnerDetails(e);
          }
        });
    } else {
      await api.local.ownerDetails.read({
        callback: e => {
          setOwnerDetails(e);
        },
        subDivisionNumber: state.selectedLocationData.subDivisionNumber,
        surveyNumber: state.selectedLocationData.surveyNumber,
        villageCode: state.selectedLocationData.village,
      });
    }
  }

  const handlePreview = async () => {
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Opening Preview...',
    });

    // sum of all the survey crop land extent
    const totalExtent = parseFloat(
      formData.surveys
        ?.reduce((acc, curr) => {
          // Convert the extent value to a number if it is a string
          const extent =
            typeof curr.cropLandExtent === 'string'
              ? parseFloat(curr.cropLandExtent)
              : curr.cropLandExtent;
          // Add the extent value to the accumulator
          return acc + extent;
        }, 0)
        .toFixed(4),
    );
    // console.log("totalExtent > ", totalExtent);

    // if the method is mono then the total extent should be equal to the selected location extent else it should be equal or less than 3 times of the selected location extent
    if (
      formData.method === croppingMethod.MONO 
      // ||
      // formData.method === croppingMethod.INTER
    ) {
      if (
        totalExtent ===
        parseFloat(state.selectedLocationData.ownerDetails.extent)
      ) {
        await state?.setCropFormData(formData);
        setIsPreviewModeEnabled(true);
      } else {
        // \n' + 'totalExtent\n' + 'balanceExtent'
        Alert.alert(
          ln('Error'),
          ln('ExtentMissMatchErrorMsg')
            .replace('${totalExtent}', totalExtent.toString())
            .replace(
              '${balanceExtent}',
              (
                parseFloat(state.selectedLocationData.ownerDetails.extent) -
                totalExtent
              ).toFixed(4),
            ),
        );

        auth.closeLoader();
        return;
      }
    } else {
      if (
        !(
          totalExtent <=
            parseFloat(state.selectedLocationData.ownerDetails.extent) *
              LAND_EXTENT_MULTIPLIER.base &&
          totalExtent >=
            parseFloat(state.selectedLocationData.ownerDetails.extent)
        )
      ) {
        auth.closeLoader();
        Alert.alert(
          ln('Error'),
          ln('ExtentMissMatchErrorMsg')
            .replace('${totalExtent}', totalExtent.toString())
            .replace(
              '${balanceExtent}',
              (
                parseFloat(state.selectedLocationData.ownerDetails.extent) *
                  LAND_EXTENT_MULTIPLIER.base -
                totalExtent
              ).toFixed(2),
            ),
        );

        auth.closeLoader();

        return;
      }

      if (!(formData.surveys?.length > 1)) {
        Alert.alert(ln('Error'), ln('Please add at least 2 surveys'));

        auth.closeLoader();

        return;
      }

      await state?.setCropFormData(formData);
      setIsPreviewModeEnabled(true);

      auth.closeLoader();
    }

    auth.closeLoader();
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      console.log('handleSave', formData);
      const network = await Network?.fetch();

      if (auth.appMode === 'online') {
        if (!network.isInternetReachable) {
          Alert.alert(
            'No internet connection',
            'Please connect to stable internet',
          );
        }

        for (const survey of formData.surveys) {
          const imageId = survey.image
            ?.split('/')
            .pop()
            ?.split('.')[0] as string;
          const crop_image = {
            uri: survey.image,
            name: `${imageId}-${generateRandomNumber(4)}.jpg`,
            type: 'image/jpeg',
          };
          await api.cropSurvey
            .directUploadSurvey({
              deviceId: auth.deviceId as string,
              userId: auth.user.userId?.toString(),
              imageId,
              onUpdateFail: e => console.error(e),
              onUpdateSuccess: () => console.info('success'),
              data: {
                district_code: survey.districtCode,
                irrigationSourceId: survey.irrigationSourceId,
                taluk_code: survey.talukCode,
                village_code: survey.villageCode,
                survey_number: survey.surveyNumber,
                sub_division_number: survey.subDivisionNumber,
                season_id: formData.season,
                cropping_method: formData.method,
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
                gps_accuracy: formData.gpsAccuracy,
                form_type: formData.formType,
                id: survey.id,
                crop_image: crop_image,
                app_version: config.version,
              },
            })
            .then(([status]) => {
              if (status !== 200) {
                Alert.alert(
                  'Error',
                  'Error while uploading survey, please try again later',
                );
              } else {
                console.log('upload success');
              }
            });
          // await api.cropSurvey
          //   .directUploadSurveyImage({
          //     deviceId: auth.deviceId as string,
          //     userId: auth.user.userId?.toString(),
          //     data: {
          //       crop_image,
          //       crop_name_id: survey.cropNameId,
          //       image_id: imageId,
          //       survey_number: state.selectedLocationData.surveyNumber,
          //       village_code: state.selectedLocationData.village,
          //     },
          //   })
          //   .then(async ([status, res]) => {
          //     if (status !== 200) {
          //       Alert.alert('Error while uploading the image', `${res}`);
          //     }
          //   })
          //   .then(async () => {

          //   });
        }
        Alert.alert('Success', 'Survey uploaded sucessfully', [
          {
            onPress: () => {
              setIsUploading(false);
            },
            text: ln('Okay'),
          },
        ]);
      } else {
        await api.local.cropSurvey
          .post(formData as ICropFormProps)
          .then(async () => {
            if (!auth.deviceId) {
              Alert.alert(ln('Error'), ln('Device id error'));
              return;
            }
            // const await Network?.getNetworkStateAsync())
            if (network?.isInternetReachable) {
              setSurveyRecordUploadState({
                isUploading: true,
                surveyIds: formData.surveys?.map(e => e.id),
              });
            } else {
              Alert.alert(
                ln('NetworkNotReachable'),
                ln('ErrorInUploadDueToNetwork'),
                [
                  {
                    text: ln('Okay'),
                    onPress: navigation.goBack,
                  },
                ],
              );
            }
          });
      }
      navigation.goBack();
    } catch (err) {
      console.log('error in cropform > ', err);
    } finally {
    }
  };

  const updateSurveyInFormData = useCallback((data: ICropSurvey) => {
    // console.log("updateSurveyInFormData", data);
    setFormData(prevVal => {
      return {
        ...prevVal,
        surveys: prevVal.surveys.map(survey => {
          if (survey.id === data.id) {
            return data;
          } else {
            return survey;
          }
        }),
      };
    });
  }, []);

  //? event functions
  const onBlock1Change = useCallback(
    (key: any) => (value: any) => {
      setFormData((prevVal: any) => {
        return {...prevVal, [key]: value};
      });
    },
    [setFormData],
  );

  // function to find the functions execution time

  function getDefaultValuesFromSurveyCard(surveyCardIndex: number = 0) {
    // ! by default will get values from first survey card

    let data = {
      id: new Date().getTime().toString(),
      cropSeasonType: formData.surveys[surveyCardIndex]?.cropSeasonType || '1',
      cultivatorTypeId:
        formData.surveys[surveyCardIndex]?.cultivatorTypeId || '1',

      // // disabled for oct28 changes
      irrigationSourceId:
        formData.surveys[surveyCardIndex]?.irrigationSourceId || null,
      expectedHarvestDate:
        formData.surveys[surveyCardIndex]?.expectedHarvestDate,

      // // disabled for oct28 changes
      // cropStage: formData.surveys[surveyCardIndex]?.cropStage,
      sownDate: formData.surveys[surveyCardIndex]?.sownDate,
    } as ICropSurvey;

    if (AGRICULTURE_NO_USE_IDS.includes(data.cropSeasonType)) {
      // ! add crop type tid to the next card if the cropSeasonType is in AGRICULTURE_NO_USE_IDS
      // data['cropTypeId'] = formData.surveys[surveyCardIndex]?.cropTypeId
      data = {
        ...data,
        cropTypeId: formData.surveys[surveyCardIndex]?.cropTypeId,
      };
    }

    return data;
  }

  const getTotalExtent = useMemo(() => {
    return formData.surveys?.reduce((acc, curr) => {
      //? Convert the extent value to a number if it is a string
      const extent = parseFloat(curr.cropLandExtent);
      //? Add the extent value to the accumulator
      return acc + extent;
    }, 0);
  }, [formData.surveys]);

  const addSurveyInFormData = useCallback(async () => {
    const defaultData = getDefaultValuesFromSurveyCard();
    //? sum of all the survey crop land extent
    const totalExtent = getTotalExtent;
    const landExtent = parseFloat(
      state.selectedLocationData.ownerDetails.extent,
    );

    let cropLandExtent: number;
    let canAddSurvey = true;

    // Different logic based on cropping method
    if (
      formData.method === croppingMethod.MONO 
      // ||
      // formData.method === croppingMethod.INTER
    ) {
      // For MONO : remaining land = landExtent - totalExtent
      cropLandExtent = landExtent - totalExtent;
      if (cropLandExtent <= 0) {
        canAddSurvey = false;
      }
    } else {
      const maxAllowedExtent = landExtent * LAND_EXTENT_MULTIPLIER.base;
      cropLandExtent = maxAllowedExtent - totalExtent;
      if (cropLandExtent <= 0) {
        canAddSurvey = false;
      }
    }

    if (!canAddSurvey) {
      Alert.alert(ln('Warning'), ln('Survey exeeded for the land area'));
    } else {
      setFormData(prevState => {
        return {
          ...prevState,
          surveys: [
            ...prevState.surveys,
            {
              ...defaultData,
              cropLandExtent:
                cropLandExtent < 0 ? '' : cropLandExtent.toString(),
            } as ICropSurvey,
          ],
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.surveys]);

  //? function to delete data from list using index position
  const deleteByIndex = (index: number) => {
    setFormData(prevVal => {
      let surveys = prevVal.surveys;
      surveys.splice(index, 1);
      return {
        ...prevVal,
        surveys,
      };
    });
  };

  const [cropSeasonTypes, setCropSeasonTypes] = useState<
    MiscCropSeasonTypeOnlineProps[]
  >([]);

  async function getCroppingSeasons() {
    await api.misc
      .cropSeasonType({
        deviceId: auth.deviceId as string,
        userId: auth.user.userId,
      })
      .then(e => {
        setCropSeasonTypes(e as MiscCropSeasonTypeOnlineProps[]);
      });
  }

  const validate = useCallback((values: ICropSurvey) => {
    let value = false;

    if (
      [...AGRICULTURE_NO_USE_IDS, cropSeasonType.PERENNIAL].includes(
        values.cropSeasonType,
      )
    ) {
      value = Boolean(
        values.cropClassificationId &&
          (values.cropLandExtent || values.cropLandExtent == '0') &&
          values.cultivatorTypeId &&
          values.cultivatorId &&
          values.image,
      );
    } else {
      if (TREE_OR_BORDER_CROP.includes(values.cropSeasonType)) {
        // ? if perennial and border/row crop
        value = Boolean(
          values.cropTypeId &&
            values.cropClassificationId &&
            values.cropNameId &&
            parseFloat(values.cropCount) >= 1 &&
            values.cultivatorTypeId &&
            values.cultivatorId &&
            values.image &&
            values.sownDate &&
            values.expectedHarvestDate,
          // // disabled for oct28 changes
          // values.cropStage
          // // disabled for oct28 changes
          // values.irrigationSourceId &&
        );
      } else {
        value = Boolean(
          values.cropTypeId &&
            values.cropClassificationId &&
            values.cropNameId &&
            // // disabled for oct28 changes
            // values.irrigationSourceId &&
            (values.cropLandExtent || values.cropLandExtent == '0') &&
            values.cultivatorTypeId &&
            values.cultivatorId &&
            values.image &&
            values.sownDate &&
            values.expectedHarvestDate,
          // // disabled for oct28 changes
          // values.cropStage,
        );
      }
    }

    return value;
  }, []);

  useEffect(() => {
    //
    formData.surveys?.forEach(survey => {
      if (validate(survey)) {
        handleBtnState('previewBtnIsDisabled')(false);
      } else {
        handleBtnState('previewBtnIsDisabled')(true);
        return;
      }
    });
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.surveys.length]);

  const backAction = () => {
    Alert.alert(ln('HoldOn'), ln('formExitWarningMsg'), [
      {
        text: ln('Cancel'),
        onPress: () => null,
        style: 'cancel',
      },
      {text: ln('Yes'), onPress: () => navigation.goBack()},
    ]);
    return true;
  };

  const [cropTypes, setCropTypes] = useState<CropTypeOnlineProps[]>();
  const [cropClassifications, setCropClassifications] =
    useState<CropClassificationOnlineProps[]>();
  const [cropIrrigationSource, setCropIrrigationSource] =
    useState<MiscIrrigationSourceOnlineProps[]>();
  const [crops, setCrops] = useState<CropOnlineProps[]>();

  async function getData() {
    try {
      setIsLoading(true);
      await Promise.all([
        getOwnerDetails(),
        getCroppingSeasons(),
        getCropTypes(
          {
            userId: Number(auth.user.userId),
            deviceId: auth.deviceId as string,
          },
          setCropTypes,
        ),
        getCropClassifications(
          {
            userId: Number(auth.user.userId),
            deviceId: auth.deviceId as string,
          },
          setCropClassifications,
        ),
        getCrops(
          {
            userId: Number(auth.user.userId),
            deviceId: auth.deviceId as string,
          },
          setCrops,
        ),
        getIrrigationSource(
          {
            userId: Number(auth.user.userId),
            deviceId: auth.deviceId as string,
          },
          setCropIrrigationSource,
        ),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      // Handle the error as needed (e.g., set an error state)
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(()=>{console.debug('formData > ', formData)},[formData])
  return isLoading ? (
    <Box>
      <Center>
        <Text>Loading...</Text>
      </Center>
    </Box>
  ) : (
    <Box flex="1">
      <ProfileHeader disableNavigation />
      <LocationDetails showSurveyNumber={true} showSubDivisionNumber={true} />
      {surveyRecordUploadState?.isUploading &&
      surveyRecordUploadState?.surveyIds?.length > 0 ? (
        <UploadCounter
          surveyRecordIds={surveyRecordUploadState?.surveyIds}
          onCancel={() => {
            setSurveyRecordUploadState({isUploading: false, surveyIds: []});
          }}
          onComplete={() => {
            setSurveyRecordUploadState({isUploading: false, surveyIds: []});
            navigation.goBack();
          }}
          show={surveyRecordUploadState?.isUploading}
        />
      ) : null}

      {isUploading ? (
        <LoadingOverlay isLoading={isUploading} loadingText="Uploading" />
      ) : null}
      <ScrollView flex="1">
        {errors.length > 0 ? (
          <Box bg="red.100" p="4" m="2" borderRadius={'xl'}>
            {errors.map((error, idx) => (
              <Box key={idx}>
                <Text color="red.500">{error.error}</Text>
              </Box>
            ))}
          </Box>
        ) : null}
        <FormBlock1
          onChange={onBlock1Change}
          formData={formDataMemo}
          previewMode={isPreviewModeEnabled}
        />
        {cropSeasonTypes?.length > 0
          ? formDataMemo.surveys.map((surveyData, idx) => (
              <SurveyFormBlock
                cropTypes={cropTypes as CropTypeOnlineProps[]}
                cropClassifications={
                  cropClassifications as CropClassificationOnlineProps[]
                }
                irrigationSources={
                  cropIrrigationSource as MiscIrrigationSourceOnlineProps[]
                }
                ownerDetails={ownerDetails as OwnerDetailsOnlineProps[]}
                crops={crops as CropOnlineProps[]}
                cropSeasonTypes={cropSeasonTypes}
                onChange={updateSurveyInFormData}
                idx={idx}
                key={idx}
                data={surveyData}
                previewMode={isPreviewModeEnabled}
                handleValidation={isValid => {
                  handleBtnState('previewBtnIsDisabled')(!isValid);
                }}
                onDelete={() => deleteByIndex(idx)}
                enableDelete={idx !== 0}
                bg={'white'}
              />
            ))
          : null}
        {!isPreviewModeEnabled && !btnState.previewBtnIsDisabled ? (
          <Box flex="1" m="2">
            <Button
              onPress={addSurveyInFormData}
              bgColor="secondary.900"
              leftIcon={<MaterialIcons name="add" color="white" size={16} />}>
              {ln('Add Crop Survey')}
            </Button>
          </Box>
        ) : null}
      </ScrollView>

      <Box mx="2" bg="white">
        {/* <SubDivisionSelector disableAllFields /> */}

        <FarmerDetailsCard />

        <Box py="1">
          {!isPreviewModeEnabled ? (
            !btnState.previewBtnIsDisabled ? (
              <Button
                onPress={handlePreview}
                disabled={btnState.previewBtnIsDisabled}
                opacity={btnState.previewBtnIsDisabled ? 0.7 : 1}
                leftIcon={
                  <MaterialIcons name="view-day" color="white" size={16} />
                }>
                {ln('Preview')}
              </Button>
            ) : null
          ) : (
            <Row space="2">
              <Button
                flex="1"
                bg="blue.500"
                onPress={() => setIsPreviewModeEnabled(false)}
                leftIcon={
                  <MaterialIcons name="edit" color="white" size={16} />
                }>
                {ln('Edit')}
              </Button>
              <Button
                flex="1"
                onPress={handleSave}
                leftIcon={
                  <MaterialIcons name="view-day" color="white" size={16} />
                }>
                {ln('Save')}
              </Button>
            </Row>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default memo(Index);
