import React, {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Icon,
  Input,
  Pressable,
  Radio,
  Row,
  ScrollView,
  Select,
  Text,
} from 'native-base';

import useDict from '../../../../hooks/useDict';
import {useAuth, useStateContext} from '../../../../hooks';
import {
  AGRICULTURE_NO_USE_IDS,
  cropSeasonPeriodBySeasonType,
  cropSeasonPeriodInMonthsBySeasonType,
  cropSeasonType,
} from '../../../../const';
import {LoadingOverlay} from '../../../../components';

import api from '../../../../api';
import {Alert, BackHandler} from 'react-native';
import {
  CropClassificationOnlineProps,
  CropOnlineProps,
  CropTypeOnlineProps,
  MiscCropSeasonTypeOnlineProps,
  MiscIrrigationSourceOnlineProps,
  OwnerDetailsOnlineProps,
} from '../../../../@types';
import {ICropDataForm, ICropFormV3CameraProps} from '../../type';
import {
  HarvestDatePicker,
  SownDatePicker,
} from '../../../../components/DatePicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {CropPicker} from '../../../CropForm/components/SurveyFormBlock/components';
import {selectDefaultProps} from '../../../../styles/defaultProps';
import {customSort} from '../../../../helpers/sort';
import {navigation} from '../../../../routers/navigation';
import CameraBlock from '../../components/CameraBlock';
import UUID from 'react-native-uuid';
import {calculateMonthDifference} from '../../../../helpers/datetime';

interface IFormState {
  showDatePicker: 'sownDate' | 'expectedHarvestDate' | '';
  showCropPicker: boolean;
  isLoading: boolean;
  formType: 'agricultural' | 'nonAgricultural';
}

interface Props {
  onNext: (e: ICropDataForm) => void;
  cropData: ICropDataForm;
  imageData: ICropFormV3CameraProps;

  closeLoader: (e: string, time?: number) => void;
  isLoading: boolean;

  startLoading: () => void;
}

interface FieldOptions {
  ownerDetails: OwnerDetailsOnlineProps[];
  subDivisions: string[];
  // // // disabled for oct28 changes
  irrigationSources: MiscIrrigationSourceOnlineProps[];
  // cropStages: MiscCropStageOfflineProps[];
  cropTypes: CropTypeOnlineProps[];
  cropClassifications: CropClassificationOnlineProps[];
  crops: CropOnlineProps[];
  cropSeasonTypes: MiscCropSeasonTypeOnlineProps[];
}

export default function Index(props: Props) {
  const ln = useDict();
  const {languageCode, capturedImageData} = useStateContext();
  const auth = useAuth();
  const {
    selectedLocationData,
    handleSelectedLocationData,
    handleOtherMetaData,
  } = useStateContext();

  const [otherValues, setOtherValues] = useState({
    cropName: '',
  });

  const handleOtherValueChange = useCallback(
    (key: keyof typeof otherValues) => {
      return function (value: any) {
        setOtherValues(prevVal => {
          return {...prevVal, [key]: value};
        });
      };
    },
    [],
  );

  const [formState, setFormState] = useState<IFormState>({
    showDatePicker: '',
    showCropPicker: false,
    isLoading: true,
    formType: 'agricultural',
  });

  const [formData, setFormData] = useState<ICropDataForm>({
    ...props.cropData,
  } as ICropDataForm);
  const [fieldOptions, setFieldOptions] = useState<FieldOptions>(
    {} as FieldOptions,
  );

  async function getCroppingSeasons() {
    await api.misc
      .cropSeasonType({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(cropSeasonTypes => {
        if (cropSeasonTypes) {
          handleFieldOptions('cropSeasonTypes')(cropSeasonTypes);
        }
      });
  }

  async function getCropTypes() {
    await api.cropMaster
      .getCropTypes({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(cropTypes => {
        if (cropTypes) {
          handleFieldOptions('cropTypes')(cropTypes);
        }
      });
  }

  // // // disabled for oct28 changes
  // async function getIrrigationSources() {
  //   await api.local.irrigationSource.read({
  //     callback: handleFieldOptions("irrigationSources"),
  //   });
  // }

  // disabled for oct28 changes
  // async function getCropStages() {
  // 	await api.local.cropStage.read({
  // 		callback: handleFieldOptions("cropStages"),
  // 	});
  // }

  function handleFormState<K extends keyof IFormState>(
    key: K,
    value: IFormState[K],
  ) {
    setFormState(e => ({...e, [key]: value}));
  }

  const handleFieldOptions = useCallback(
    <K extends keyof FieldOptions>(key: K) =>
      async (value: FieldOptions[K]) => {
        setFieldOptions(prevVal => {
          return {...prevVal, [key]: value};
        });
      },
    [],
  );

  //? get crop names
  const getCrops = useCallback(
    async (cropClassificationId?: string) => {
      await api.cropMaster
        .getCrops({
          userId: auth.user.userId,
          deviceId: auth.deviceId as string,
        })
        .then(crops => {
          if (crops) {
            if (cropClassificationId) {
              handleFieldOptions('crops')(
                crops?.filter(
                  (crop: CropOnlineProps) =>
                    crop.crop_classification_id?.toString() ===
                    cropClassificationId,
                ),
              );
            } else {
              handleFieldOptions('crops')(crops);
            }
          }
        });
    },
    [auth.deviceId, auth.user.userId, handleFieldOptions],
  );

  //? get crop names
  const getIrrigationSources = useCallback(async () => {
    await api.misc
      .irrigationSource({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(irrigationSource => {
        handleFieldOptions('irrigationSources')(irrigationSource);
      });
  }, [auth.deviceId, auth.user.userId, handleFieldOptions]);
  //? get crop classifications
  const getCropClassifications = useCallback(
    async (cropTypeId?: string) => {
      await api.cropMaster
        .getCropClassifications({
          userId: auth.user.userId,
          deviceId: auth.deviceId as string,
        })
        .then(cropClassifications => {
          if (cropClassifications) {
            if (cropTypeId) {
              // console.log(
              //   'getCropClassifications > ',
              //   cropTypeId,
              //   cropClassifications?.length,
              // );
              handleFieldOptions('cropClassifications')(
                cropClassifications?.filter(
                  (classificatoin: CropClassificationOnlineProps) =>
                    classificatoin.crop_type_id?.toString() === cropTypeId,
                ),
              );
            } else {
              handleFieldOptions('cropClassifications')(cropClassifications);
            }
          }
        });
    },
    [auth.deviceId, auth.user.userId, handleFieldOptions],
  );

  async function getData() {
    await getCroppingSeasons();
    await getCropTypes();

    // // disabled for oct28 changes
    await getIrrigationSources();
    // // disabled for oct28 changes
    // await getCropStages();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleFormData<K extends keyof ICropDataForm>(
    key: keyof ICropDataForm,
    value: any,
  ) {
    setFormData((prevVal: any) => ({
      ...prevVal,
      [key]: value,
    }));
  }

  const handleCropPickerSelection = useCallback(
    async (crop: CropOnlineProps) => {
      await getCropClassifications();
      await getCrops();
      handleFormData('cropTypeId', crop.crop_type_id as string);
      handleOtherValueChange('cropName')(crop.crop_name);
      handleOtherMetaData('cropName', crop.crop_name);
      handleFormData(
        'cropClassificationId',
        crop.crop_classification_id as string,
      );

      handleFormData('cropNameId', crop.id as string);

      handleFormData('cropSeasonType', crop.crop_season_type as string);
    },

    [getCropClassifications, getCrops],
  );

  const handleCropSelection = useCallback(
    async (cropId: string) => {
      handleFormData('cropNameId', cropId as string);
      const crop = fieldOptions.crops?.find(e => e.id?.toString() === cropId);

      if (crop) {
        handleCropPickerSelection(crop);
      }
    },
    [fieldOptions.crops],
  );

  function handleClassificationChange(classificationId: string) {
    handleFormData('cropNameId', '');
    handleOtherValueChange('cropName')(null);
    handleOtherMetaData('cropName', '');
    handleFormData('cropClassificationId', classificationId.toString());
    getCrops(classificationId);
  }

  const handleCropTypeSelection = useCallback(async (id: string) => {
    console.debug('handleCropTypeSelection', id);
    getCropClassifications(id);
    handleFormData('cropClassificationId', '');
    handleFormData('cropNameId', '');
    handleOtherValueChange('cropName')(null);
    handleOtherMetaData('cropName', '');
    handleFormData('cropTypeId', id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAllSubdivision = useCallback(() => {
    handleFormData('selectedSubDivisionNumbers', fieldOptions.subDivisions);
  }, [fieldOptions.subDivisions]);

  const deSelectAllSubdivision = useCallback(() => {
    handleFormData('selectedSubDivisionNumbers', []);
  }, []);

  // async function handleAutoFill() {}

  // async function openLoader() {
  //   auth.openLoader('Fetching old data...');
  //   return;
  // }

  // async function getPreLoadedData() {
  //   try {
  //     await api.local.metaData.read({
  //       key: 'cropFormV1PreloadData',
  //       callback: async prevData => {
  //         if (prevData) {
  //           const {
  //             cropNameId,
  //             cropClassificationId,
  //             cropTypeId,
  //             cropSeasonType,
  //             ...parsedPreloadData
  //           } = JSON.parse(prevData);

  //           if (AGRICULTURE_NO_USE_IDS.includes(cropSeasonType)) {
  //             handleFormState('formType', 'nonAgricultural');
  //             handleCropSeasonTypeSelection(cropSeasonType);
  //             handleClassificationChange(cropClassificationId);
  //           } else {
  //             handleFormState('formType', 'agricultural');

  //             await handleCropTypeSelection(cropTypeId)
  //               .then(() => {
  //                 handleClassificationChange(cropClassificationId);
  //               })
  //               .then(() => {
  //                 handleCropSelection(cropNameId);
  //               });

  //             handleFormData('sownDate', parsedPreloadData?.sownDate);
  //             handleFormData(
  //               'expectedHarvestDate',
  //               parsedPreloadData?.expectedHarvestDate,
  //             );
  //             // // disabled for oct28 changes
  //             // handleFormData('cropStage', parsedPreloadData?.cropStage)
  //           }
  //         } else {
  //           Alert.alert('Oops!', 'there is no previous data to fill');
  //         }
  //       },
  //     });
  //   } finally {
  //     setTimeout(() => auth.closeLoader(), 500);
  //   }
  // }

  async function handleNext() {
    // if(!formData?.sownDate||!formData?.expectedHarvestDate){
    //
    //   Alert.alert('Date', "Please select the sowwen and harvested date")
    //   return
    // }
    // if(calculateMonthDifference(formData?.sownDate, formData?.expectedHarvestDate) > cropSeasonPeriodInMonthsBySeasonType[formData.cropSeasonType]){
    //   Alert.alert('Date Range', "Please ensure the date range in sowen and" +
    //     " harvest date")
    //   return
    // }

    if (!capturedImageData.image) {
      Alert.alert('Image Error', 'Please capture image');
      return;
    }

    if (await validate(formData)) {
      console.log('labelCropType', {
        labelCropType: fieldOptions.cropTypes.find(
          e => e.id?.toString() === formData.cropTypeId?.toString(),
        )?.crop_type as string,
      });
      props.onNext({
        ...formData,
        labelCropType: fieldOptions.cropTypes.find(
          e => e.id?.toString() === formData.cropTypeId?.toString(),
        )?.crop_type as string,
        labelCropClassification: fieldOptions.cropClassifications.find(
          e => e.id?.toString() === formData.cropClassificationId?.toString(),
        )?.classification_name as string,
        labelCropName: fieldOptions.crops.find(
          e => e.id?.toString() === formData.cropNameId?.toString(),
        )?.crop_name as string,
        labelCropSesonType: fieldOptions.cropSeasonTypes.find(
          e =>
            e.crop_season_type_id?.toString() ===
            formData.cropSeasonType?.toString(),
        )?.crop_season_type as string,

        // // disabled for oct28 changes
        // labelIrrigationSource: fieldOptions.irrigationSources.find(
        //   (e) => e.id === formData.irrigationSourceId,
        // )?.irrigationSource as string,
        //
        // // disabled for oct28 changes
        // "labelCropStage": fieldOptions.cropStages.find(e => e.cropStageId === formData.cropStage)?.cropStage as string,
      });
    } else {
      Alert.alert('Error', 'Please ensure that all fields are filled');
    }
  }

  const validate = async (values: ICropDataForm) => {
    let value = false;
    if ([...AGRICULTURE_NO_USE_IDS].includes(values.cropSeasonType)) {
      value = Boolean(values.cropClassificationId);
      //         values.image
    } else if (cropSeasonType.PERENNIAL === values.cropSeasonType) {
      value = Boolean(
        values.cropNameId,
        // // disabled for oct28 changes
        // && values.irrigationSourceId
      );
    } else {
      value = Boolean(
        values.cropNameId && values.sownDate && values.expectedHarvestDate,
        // // disabled for oct28 changes
        // && values.cropStage,
        // // disabled for oct28 changes
        // values.irrigationSourceId,
      );
    }
    return value;
  };

  const getSubDivisionNumbersOffline = async () => {
    await api.local.ownerDetails.read({
      districtCode: selectedLocationData.district,
      talukCode: selectedLocationData.taluk,
      villageCode: selectedLocationData.village,
      surveyNumber: selectedLocationData.surveyNumber,
      fields: ['o.sub_division_number'],
      callback: e => {
        let uniqueSubDivisionNumbers = e.reduce((acc: any, current: any) => {
          const x = acc.find(
            (item: any) =>
              item.sub_division_number === current.sub_division_number,
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        uniqueSubDivisionNumbers = customSort(
          uniqueSubDivisionNumbers.map((e: any) => e.sub_division_number),
        );
        console.log('uniqueSubDivisionNumbers', uniqueSubDivisionNumbers);

        handleFieldOptions('subDivisions')(uniqueSubDivisionNumbers);

        if (formData?.selectedSubDivisionNumbers?.length === 0) {
          handleFormData(
            'selectedSubDivisionNumbers',
            uniqueSubDivisionNumbers,
          );
        }
        if (uniqueSubDivisionNumbers.length === 1) {
          handleSelectedLocationData('subDivisionNumber')(
            uniqueSubDivisionNumbers[0].sub_division_number,
          );
        }
        handleFormState('isLoading', false);
      },
    });
  };

  const getSubDivisionNumbers = async () => {
    if (auth.appMode === 'online') {
      await api.surveyDropdown
        .subDivision({
          deviceId: auth.deviceId as string,
          userId: auth.user.userId,
          district_code: selectedLocationData.district,
          taluk_code: selectedLocationData.taluk,
          village_code: selectedLocationData.village,
          survey_number: selectedLocationData.surveyNumber,
        })
        .then(subDivisioinsList => {
          if (subDivisioinsList) {
            let uniqueSubDivisionNumbers = subDivisioinsList.reduce(
              (acc: any, current: any) => {
                const x = acc.find(
                  (item: any) =>
                    item.sub_division_number === current.sub_division_number,
                );
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              },
              [],
            );
            uniqueSubDivisionNumbers = customSort(
              uniqueSubDivisionNumbers.map((e: any) => e.sub_division_number),
            );
            handleFieldOptions('subDivisions')(uniqueSubDivisionNumbers);
            if (formData?.selectedSubDivisionNumbers?.length === 0) {
              handleFormData(
                'selectedSubDivisionNumbers',
                uniqueSubDivisionNumbers,
              );
            }
            if (uniqueSubDivisionNumbers.length === 1) {
              handleSelectedLocationData('subDivisionNumber')(
                uniqueSubDivisionNumbers[0].sub_division_number,
              );
            }
            handleFormState('isLoading', false);
          }
        });
    } else {
      getSubDivisionNumbersOffline();
    }
    // await api.local.ownerDetails.read({
    //   districtCode: selectedLocationData.district,
    //   talukCode: selectedLocationData.taluk,
    //   villageCode: selectedLocationData.village,
    //   surveyNumber: selectedLocationData.surveyNumber,
    //   fields: ['o.subDivisionNumber'],
    //   callback: async e => {
    //     let uniqueSubDivisionNumbers = e.reduce((acc: any, current: any) => {
    //       const x = acc.find(
    //         (item: any) => item.subDivisionNumber === current.subDivisionNumber,
    //       );
    //       if (!x) {
    //         return acc.concat([current]);
    //       } else {
    //         return acc;
    //       }
    //     }, []);
    //     uniqueSubDivisionNumbers = customSort(
    //       uniqueSubDivisionNumbers.map((e: any) => e.subDivisionNumber),
    //     );
    //     handleFieldOptions('subDivisions')(uniqueSubDivisionNumbers);
    //     if (formData?.selectedSubDivisionNumbers?.length === 0) {
    //       handleFormData(
    //         'selectedSubDivisionNumbers',
    //         uniqueSubDivisionNumbers,
    //       );
    //     }
    //     if (uniqueSubDivisionNumbers.length === 1) {
    //       handleSelectedLocationData('subDivisionNumber')(
    //         uniqueSubDivisionNumbers[0].subDivisionNumber,
    //       );
    //     }
    //     handleFormState('isLoading', false);
    //   },
    // });
  };

  function backAction() {
    Alert.alert(
      ln('HoldOn'),
      ln(
        'Are you sure you want to go back. All data in this page will be lost',
      ),
      [
        {
          text: ln('Cancel'),
          onPress: () => null,
          style: 'cancel',
        },
        {text: ln('Yes'), onPress: () => navigation.goBack()},
      ],
    );
    return true;
  }

  useEffect(() => {
    props.startLoading();
    props.closeLoader('cropData');
    getData();
    getSubDivisionNumbers().then(() => {});
    if (formData.cropClassificationId && formData.cropTypeId) {
      getCropClassifications(formData.cropTypeId);
      getCrops(formData.cropClassificationId);
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const handleImageCapture = (data:  ICropFormV2CameraProps) => {
  //   props.onImageCapture(data)
  // }

  function handleCropSeasonTypeSelection(value: string) {
    if (AGRICULTURE_NO_USE_IDS.includes(value)) {
      handleFormData('cropTypeId', value);
      getCropClassifications(value);
      handleFormData('cropNameId', null);
      handleOtherValueChange('cropName')(null);
      handleOtherMetaData('cropName', '');
      // // disabled for oct28 changes
      handleFormData('irrigationSourceId', null);
      handleFormData('sownDate', null);
      handleFormData('expectedHarvestDate', null);
      // // disabled for oct28 changes
      // handleFormData("cropStage", null);
    } else {
      // if (TREE_OR_BORDER_CROP.includes(value)) {
      //   handleFormData("",0);
      // }
      handleFormData('cropTypeId', '');

      handleFormData('cropNameId', '');
      handleOtherValueChange('cropName')(null);
      handleOtherMetaData('cropName', '');
    }
    // if (value !== cropSeasonType.PERENNIAL) {
    //   handleBorderOrRowCrop(null);
    // } else {
    //   handleBorderOrRowCrop(false);
    // }
    handleFormData('cropSeasonType', value);
    handleFormData('cropClassificationId', '');
    handleFormData('sownDate', '');
    handleFormData('expectedHarvestDate', '');
  }

  return (
    <Box flex={'1'}>
      {props?.isLoading ? <LoadingOverlay isLoading={props.isLoading} /> : null}
      <>
        <ScrollView flex={'1'}>
          <Box m={'2'} bg={'white'} py={'4'} px={'2'} borderRadius={'xl'}>
            <Text bold fontSize={'lg'} color={'dark.600'}>
              {ln('Survey No')}: {selectedLocationData.surveyNumber}
            </Text>
            <Text fontSize={'sm'} color={'orange.400'}>
              {ln('formV2Desclimer')}
            </Text>
            <Text bold fontSize={'sm'} color={'dark.500'}>
              {ln('Cropping Method')} : {ln('Mono')}
            </Text>
            <Text bold fontSize={'sm'} color={'muted.500'}>
              {ln('Season')} : {props.cropData.labelSeason}
            </Text>
          </Box>

          <Box px={'2'} bg={'white'} mx={'2'} borderRadius={'xl'} py={'4'}>
            <Text bold fontSize={'lg'} color={'dark.600'}>
              {ln('Crop Master Data')}
            </Text>
            {/* <Box alignItems={'center'}>
              <Pressable
                onPress={async () => {
                  openLoader().then(async () => {
                    setTimeout(() => {
                      // getPreLoadedData();
                    }, 500);
                  });
                }}
                // p="4"
                // flex={'1'}
              >
                <Text color={'primary.600'}>
                  {ln('Auto Fill Previous Data')}
                </Text>
              </Pressable>
            </Box> */}

            <Box mb={'2'}>
              <Text fontSize={'sm'} bold color="primary.600">
                {ln('Form Type')}
              </Text>
              <Row space="4">
                <Radio.Group
                  name="formType"
                  onChange={e => {
                    handleFormData('sownDate', '');
                    handleFormData('expectedHarvestDate', '');
                    handleFormData('cropClassificationId', null);
                    handleFieldOptions('cropClassifications')([]);
                    handleFieldOptions('crops')([]);
                    handleFormData('cropTypeId', '');
                    handleFormData('cropSeasonType', '');

                    // // disabled for oct28 changes
                    // handleFormData("orupogaIrupogaNanjai", "0");
                    handleFormData('cropNameId', null);
                    handleOtherValueChange('cropName')(null);
                    handleOtherMetaData('cropName', '');
                    // // disabled for oct28 changes
                    handleFormData('irrigationSourceId', null);
                    //
                    // // disabled for oct28 changes
                    // handleFormData("cropStage", null);

                    handleFormState('formType', e as IFormState['formType']);
                  }}
                  defaultValue={formState.formType}
                  value={formState.formType}>
                  <Row space="4" flexWrap={'wrap'}>
                    <Radio value={'agricultural'} size="sm">
                      {ln('Agricultural')}
                    </Radio>
                    <Radio value={'nonAgricultural'} size="sm">
                      {ln('Non-Agricultural')}
                    </Radio>
                  </Row>
                </Radio.Group>
              </Row>
            </Box>

            {/*Crop picker*/}
            {formState.formType === 'agricultural' ? (
              <>
                <Button
                  alignItems={'center'}
                  justifyContent="center"
                  my="2"
                  borderRadius={'sm'}
                  p="2"
                  onPress={() => handleFormState('showCropPicker', true)}
                  // isDisabled={props.previewMode}
                  // opacity={props.previewMode ? 0.5 : 1}
                >
                  <Row space="4" alignItems={'center'}>
                    <Icon
                      as={MaterialIcons}
                      size={'sm'}
                      name="search"
                      color="white"
                    />
                    <Text color="white">{ln('Search Crops By Name')}</Text>
                  </Row>
                </Button>
                <CropPicker
                  isOpen={formState.showCropPicker}
                  onClose={() => {
                    handleFormState('showCropPicker', false);
                  }}
                  onSelect={handleCropPickerSelection}
                />
              </>
            ) : null}

            <Box>
              <Text fontSize={'xs'} bold color="primary.600">
                {ln('Cropping Season Type')}
              </Text>
              <Select
                {...selectDefaultProps}
                selectedValue={formData.cropSeasonType?.toString()}
                accessibilityLabel={ln('Select crop season')}
                placeholder={ln('Select crop season')}
                isDisabled={formState.formType === 'agricultural'}
                onValueChange={handleCropSeasonTypeSelection}>
                {fieldOptions.cropSeasonTypes
                  ? fieldOptions.cropSeasonTypes
                      .filter(e => {
                        if (formState.formType === 'nonAgricultural') {
                          return AGRICULTURE_NO_USE_IDS.includes(
                            e.crop_season_type_id?.toString(),
                          );
                        }
                        return e;
                      })
                      .map(e => (
                        <Select.Item
                          key={e.crop_season_type_id}
                          value={e.crop_season_type_id.toString()}
                          label={e.crop_season_type}
                        />
                      ))
                  : null}
              </Select>
            </Box>

            {/* //? crop type*/}
            {formState.formType === 'agricultural' ? (
              <>
                <Box mt="2">
                  <Text fontSize={'xs'} bold color="primary.600">
                    {ln('Crop Type')}
                  </Text>

                  <Select
                    {...selectDefaultProps}
                    // selectedValue={locationData.district}
                    accessibilityLabel={ln('Select crop type')}
                    placeholder={ln('Select crop type')}
                    // isDisabled={props.previewMode}
                    selectedValue={formData?.cropTypeId?.toString()}
                    onValueChange={handleCropTypeSelection}>
                    {fieldOptions?.cropTypes
                      ? fieldOptions?.cropTypes
                          .filter(
                            e =>
                              !AGRICULTURE_NO_USE_IDS.includes(
                                e.id?.toString(),
                              ),
                          )
                          .map(e => {
                            // return <Select.Item
                            //   key={e.cropTypeId}
                            //   value={e.cropTypeId.toString()}
                            //   label={e.cropTypeName}
                            // />
                            return (
                              <Select.Item
                                key={e.id}
                                value={e.id.toString()}
                                label={
                                  languageCode === 'en'
                                    ? e.crop_type
                                    : e?.crop_type_name_in_tamil
                                }
                              />
                            );
                          })
                      : null}
                  </Select>
                </Box>
              </>
            ) : null}

            {/* crop classification*/}
            <Box mt="2">
              <Text fontSize={'xs'} bold color="primary.600">
                {!AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType)
                  ? ln('Crop Classification')
                  : ln('Classification')}
              </Text>
              <Select
                {...selectDefaultProps}
                accessibilityLabel={
                  !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType)
                    ? ln('Crop Classification')
                    : ln('Classification')
                }
                placeholder={
                  !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType)
                    ? ln('Crop Classification')
                    : ln('Classification')
                }
                // isDisabled={props.previewMode}
                selectedValue={formData?.cropClassificationId?.toString()}
                onValueChange={handleClassificationChange}>
                {fieldOptions?.cropClassifications
                  ? fieldOptions?.cropClassifications.map(e => (
                      <Select.Item
                        key={e.id}
                        value={e.id.toString()}
                        label={
                          languageCode === 'en'
                            ? e.classification_name
                            : e.classification_name_in_tamil
                        }
                      />
                    ))
                  : null}
              </Select>
            </Box>

            {/* Crop name*/}
            {formState.formType === 'agricultural' ? (
              <>
                <Box mt={'2'}>
                  <Text fontSize={'xs'} bold color="primary.600">
                    {ln('Crop Name')}
                  </Text>

                  <Select
                    {...selectDefaultProps}
                    flex="1"
                    accessibilityLabel={ln('Select crop name')}
                    placeholder={ln('Select crop name')}
                    // isDisabled={props.previewMode}
                    selectedValue={formData?.cropNameId?.toString()}
                    onValueChange={e => handleCropSelection(e)}>
                    {fieldOptions?.crops
                      ? fieldOptions?.crops.map(e => (
                          <Select.Item
                            key={e.id}
                            value={e.id.toString()}
                            label={
                              languageCode === 'en'
                                ? `${e.crop_name}`
                                : e.crop_name_in_tamil
                            }
                          />
                        ))
                      : null}
                  </Select>
                </Box>
              </>
            ) : null}

            {/*/!* // ? crop season type*!/*/}
            {/*<Row space={'2'} mt={'2'}>*/}
            {/*  <Text bold color="primary.600">*/}
            {/*    {ln("Cropping Season Type")}*/}
            {/*  </Text>*/}
            {/*  <Text bold>*/}
            {/*    {formData.cropSeasonType && formData?.cropNameId ? fieldOptions.cropSeasonTypes?.find(e => e.cropSeasonTypeId === formData.cropSeasonType)?.cropSeasonType : "-"}*/}
            {/*  </Text>*/}
            {/*</Row>*/}

            {/* //? irrigation */}
            {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}
            {formData?.cropTypeId &&
            !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType) ? (
              <Box mt="2">
                <Text fontSize={'xs'} bold color="primary.600">
                  {ln('Irrigation Source')}
                </Text>
                <Select
                  {...selectDefaultProps}
                  selectedValue={formData?.irrigationSourceId}
                  accessibilityLabel={ln('Select crop irrigationSource')}
                  placeholder={ln('Select crop irrigationSource')}
                  // isDisabled={props.previewMode}
                  onValueChange={e => handleFormData('irrigationSourceId', e)}>
                  {fieldOptions?.irrigationSources
                    ? fieldOptions?.irrigationSources.map(e => (
                        <Select.Item
                          key={e.id}
                          value={e.id.toString()}
                          label={e.irrigation_source}
                        />
                      ))
                    : null}
                </Select>
              </Box>
            ) : null}

            {/* //?date */}
            {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}
            {formData?.cropTypeId &&
            ![...AGRICULTURE_NO_USE_IDS, cropSeasonType.PERENNIAL].includes(
              formData?.cropSeasonType,
            ) ? (
              <Row mt="2">
                <Box flex="1">
                  <Pressable
                    onPress={() => {
                      handleFormState('showDatePicker', 'sownDate');
                    }}
                    // opacity={props.previewMode ? 0.5 : 1}
                    // disabled={props.previewMode}
                  >
                    <Text
                      fontSize={'xs'}
                      flex="1"
                      isTruncated
                      bold
                      color="primary.600">
                      {ln('Tentative Tentative Sown Month')}
                    </Text>
                    <Box
                      borderRadius={'md'}
                      borderWidth="1"
                      borderColor={'gray.300'}
                      p="2"
                      mr="2">
                      {formData?.sownDate ? (
                        <Text>
                          {formData.sownDate?.substring(
                            0,
                            formData.sownDate.lastIndexOf('/'),
                          )}
                        </Text>
                      ) : (
                        <Text color="gray.400">{ln('Select sown date')}</Text>
                      )}
                    </Box>
                  </Pressable>
                  {/* rn date picker
                   */}
                </Box>
                <Box flex="1">
                  <Pressable
                    onPress={() => {
                      handleFormState('showDatePicker', 'expectedHarvestDate');
                    }}
                    // opacity={props.previewMode ? 0.5 : 1}
                    // disabled={props.previewMode}
                  >
                    <Text
                      fontSize={'xs'}
                      flex="1"
                      isTruncated
                      bold
                      color="primary.600">
                      {ln('Tentative Harvest Month')}
                    </Text>

                    <Box
                      borderRadius={'md'}
                      borderWidth="1"
                      borderColor={'gray.300'}
                      p="2"
                      mr="2">
                      {formData?.expectedHarvestDate ? (
                        <Text>
                          {formData.expectedHarvestDate?.substring(
                            0,
                            formData.expectedHarvestDate.lastIndexOf('/'),
                          )}
                        </Text>
                      ) : (
                        <Text color="gray.400">
                          {ln('Select harvest date')}
                        </Text>
                      )}
                    </Box>
                  </Pressable>
                </Box>
              </Row>
            ) : null}

            {formData.sownDate &&
            formData?.expectedHarvestDate &&
            calculateMonthDifference(
              formData.sownDate,
              formData?.expectedHarvestDate,
            ) >
              cropSeasonPeriodInMonthsBySeasonType[formData.cropSeasonType] ? (
              <Box my={'2'} p={'2'}>
                <Text color={'yellow.600'}>
                  {ln('sownDateDifferenceWarning').replace(
                    '${months}',
                    cropSeasonPeriodInMonthsBySeasonType[
                      formData.cropSeasonType
                    ].toString(),
                  )}
                </Text>
              </Box>
            ) : null}

            {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}
            {/* // disabled for oct28 changes */}
            {/* {formData?.cropTypeId && !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType) ? (
              <Box mt="2">
                <Text fontSize={"xs"} bold color="primary.600">
                  {ln("Crop Stage")}
                </Text>
                <Select
                  {...selectDefaultProps}
                  selectedValue={formData?.cropStage}
                  accessibilityLabel={ln("Select crop stage")}
                  placeholder={ln("Select crop stage")}
                  // isDisabled={props.previewMode}
                  onValueChange={(e) => handleFormData("cropStage", e)}
                >
                  {fieldOptions?.cropStages
                    ? fieldOptions?.cropStages.map((e) => (
                        <Select.Item
                          key={e.cropStageId}
                          value={e.cropStageId.toString()}
                          label={e.cropStage}
                        />
                      ))
                    : null}
                </Select>
              </Box>
            ) : null} */}

            {formData?.cropSeasonType == cropSeasonType.PERENNIAL ? (
              <Box mt="2">
                <Text fontSize={'xs'} bold color="primary.600">
                  {ln('Crop Age')}
                </Text>
                <Input
                  keyboardType={'numeric'}
                  onChangeText={e => handleFormData('cropAge', e)}
                  placeholder={ln('Crop Age')}
                />
              </Box>
            ) : null}

            {/*one time filling*/}
            <Box
              mt={'4'}
              mb={'2'}
              borderColor={'muted.300'}
              borderBottomWidth={'1'}
            />

            {/* // disabled for oct28 changes */}
            {/* {formData?.cropTypeId && !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType) ? (
              <>
                <Box mt="2">
                  <Text fontSize={"xs"} bold color="primary.600">
                    {ln("Orupoga/Irupoga Nanjai")}
                  </Text>

                  <Select
                    defaultValue={formData.orupogaIrupogaNanjai}
                    onValueChange={(e) => handleFormData("orupogaIrupogaNanjai", e)}
                  >
                    <Select.Item label={"-"} value={"0"} />
                    <Select.Item label={ln("Orupoga Nanjai")} value={"1"} />
                    <Select.Item label={ln("Irupoga Nanjai")} value={"2"} />
                    <Select.Item label={ln("Moondru Nanjai")} value={"3"} />
                  </Select>
                </Box>
              </>
            ) : null} */}

            {/*<Box mt="2">*/}
            {/*	<Text fontSize={"xs"} bold color="primary.600">*/}
            {/*		{ln("Theervai")} - {formData.theervai}*/}
            {/*	</Text>*/}

            {/*	<Input*/}
            {/*		// keyboardType={'number-pad'}*/}
            {/*		onChangeText={e => {*/}
            {/*			// console.log(e?.match(/[.]/g)?.length||0)*/}
            {/*			// console.log(((e?.match(/[.]/g)?.length || 0) <= 1))*/}
            {/*			// if (((e?.match(/[.]/g)?.length || 0) <= 1) &&!e?.match(/[-,:;a-zA-Z ]/g)) {*/}
            {/*			// if(e.split('.')[0]?.length<=3){*/}
            {/*			// console.log(/^(\d{0,4})(\.\d{0,2})?$/.test(e))*/}
            {/*			if (/^(\d{0,4})(\.\d{0,2})?$/.test(e)) {*/}
            {/*				handleFormData("theervai", e.replaceAll(/[-, ]/g, ''))*/}
            {/*			}*/}

            {/*			// }*/}
            {/*		}}*/}
            {/*		// maxLength={}*/}
            {/*		keyboardType={'numeric'}*/}

            {/*		value={formData?.theervai || ''}*/}
            {/*		placeholder={ln('Theervai')}*/}
            {/*		leftElement={<Box pl={'2'}><Text>Rs.</Text></Box>}*/}
            {/*	/>*/}
            {/*</Box>*/}
          </Box>

          <Box m={'2'} bg={'white'} py={'4'} px={'2'} borderRadius={'xl'}>
            <Text bold fontSize={'lg'} color={'primary.900'}>
              {ln('Crop Image')}
            </Text>
            <CameraBlock
              cropName={otherValues?.cropName}
              surveyId={UUID.v4().toString()}
              // handleInputChange={handleImageCapture}
              previewMode={false}
              formType={formState?.formType}
            />
          </Box>

          <Box
            px={'2'}
            bg={'white'}
            mx={'2'}
            my={'2'}
            borderRadius={'xl'}
            py={'4'}>
            <Text bold fontSize={'lg'} color={'dark.600'}>
              {ln('Choose Sub Division No.')}
            </Text>
            <Text fontSize={'sm'} color={'muted.500'}>
              {ln('Select the survey number to add to the survey')}
            </Text>

            <Box>
              {formData?.selectedSubDivisionNumbers?.length ===
              fieldOptions.subDivisions?.length ? (
                <Button onPress={deSelectAllSubdivision}>
                  {ln('Unselect All')}
                </Button>
              ) : (
                <Button onPress={selectAllSubdivision}>
                  {ln('Select All')}
                </Button>
              )}
            </Box>

            <Row space={'1'} flexWrap={'wrap'} justifyContent={'center'}>
              {/*<FlatList*/}
              {/*  // flexWrap={'wrap'}*/}
              {/*  data={fieldOptions.subDivisions}*/}
              {/*  renderItem={({item: e}) => {*/}
              {/*    return <Box*/}

              {/*      my={'1'}*/}
              {/*      w={'1/6'}*/}
              {/*      justifyContent={'center'}*/}
              {/*      alignItems={'center'}*/}

              {/*      borderRadius={'lg'}*/}
              {/*      borderWidth={'1'}*/}
              {/*      borderColor={'muted.500'}*/}
              {/*      bg={formData?.selectedSubDivisionNumbers?.includes(e) ? 'primary.600' : 'white'}*/}

              {/*    ><Pressable*/}
              {/*      onPress={() => {*/}
              {/*        handleFormData('selectedSubDivisionNumbers', formData?.selectedSubDivisionNumbers?.includes(e) ? formData?.selectedSubDivisionNumbers?.filter(i => i !== e) : [...formData.selectedSubDivisionNumbers, e])*/}
              {/*      }}*/}
              {/*      p={'2'}*/}
              {/*    >*/}
              {/*      <Text*/}
              {/*        color={formData?.selectedSubDivisionNumbers?.includes(e) ? 'white' : 'primary.600'}*/}
              {/*      >{e}</Text>*/}
              {/*    </Pressable></Box>*/}
              {/*  }}*/}
              {/*  keyExtractor={(item) => item.toString()}*/}
              {/*/>*/}
              {fieldOptions.subDivisions?.map(e => (
                <Box
                  key={`${e}`}
                  my={'1'}
                  w={'1/6'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  borderRadius={'lg'}
                  borderWidth={'1'}
                  borderColor={'muted.500'}
                  bg={
                    formData?.selectedSubDivisionNumbers?.includes(e)
                      ? 'primary.600'
                      : 'white'
                  }>
                  <Pressable
                    onPress={() => {
                      handleFormData(
                        'selectedSubDivisionNumbers',
                        formData?.selectedSubDivisionNumbers?.includes(e)
                          ? formData?.selectedSubDivisionNumbers?.filter(
                              i => i !== e,
                            )
                          : [...formData.selectedSubDivisionNumbers, e],
                      );
                    }}
                    p={'2'}>
                    <Text
                      color={
                        formData?.selectedSubDivisionNumbers?.includes(e)
                          ? 'white'
                          : 'primary.600'
                      }>
                      {e}
                    </Text>
                  </Pressable>
                </Box>
              ))}
            </Row>

            <Row space={'2'} my={'2'}>
              <Row space={'2'} alignItems={'center'}>
                <Box
                  borderRadius={'lg'}
                  bg={'primary.600'}
                  borderWidth={'1'}
                  borderColor={'muted.500'}
                  w={'8'}
                  h={'6'}
                />
                <Text>{ln('Selected')}</Text>
              </Row>
              <Row space={'2'} alignItems={'center'}>
                <Box
                  borderRadius={'lg'}
                  bg={'white'}
                  borderWidth={'1'}
                  borderColor={'muted.500'}
                  w={'8'}
                  h={'6'}
                />
                <Text>{ln('Not-Selected')}</Text>
              </Row>
            </Row>
          </Box>
        </ScrollView>

        <Box p={'2'}>
          <Button
            onPress={() => {
              handleNext();
            }}>
            {ln('Next')}
          </Button>
        </Box>
      </>

      <SownDatePicker
        yearsLength={cropSeasonPeriodBySeasonType[formData?.cropSeasonType]}
        isOpen={formState.showDatePicker === 'sownDate'}
        close={() => handleFormState('showDatePicker', '')}
        onChange={e => {
          formState.showDatePicker && handleFormData('sownDate', e);
        }}
      />
      <HarvestDatePicker
        yearsLength={cropSeasonPeriodBySeasonType[formData?.cropSeasonType]}
        isOpen={formState.showDatePicker === 'expectedHarvestDate'}
        close={() => handleFormState('showDatePicker', '')}
        onChange={e => {
          formState.showDatePicker && handleFormData('expectedHarvestDate', e);
        }}
      />
    </Box>
  );
}
