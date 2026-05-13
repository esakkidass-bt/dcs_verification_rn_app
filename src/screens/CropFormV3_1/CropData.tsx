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

import useDict from '../../hooks/useDict';
import {useAuth, useStateContext} from '../../hooks';
import {
  AGRICULTURE_NO_USE_IDS,
  cropSeasonPeriodBySeasonType,
  cropSeasonPeriodInMonthsBySeasonType,
  cropSeasonType,
} from '../../const';
import {LoadingOverlay} from '../../components';

import api from '../../api';
import {Alert, BackHandler} from 'react-native';
import {
  CropClassificationOfflineProps,
  CropOfflineProps,
  CropTypeOfflineProps,
  MiscCropSeasonTypeOfflineProps,
  MiscCropStageOfflineProps,
  MiscIrrigationSourceOfflineProps,
  OwnerDetailsOfflineProps,
} from '../../@types';

import {HarvestDatePicker, SownDatePicker} from '../../components/DatePicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {CropPicker} from '../CropForm/components/SurveyFormBlock/components';
import {selectDefaultProps} from '../../styles/defaultProps';
import {customSort} from '../../helpers/sort';
import {navigation} from '../../routers/navigation';
import UUID from 'react-native-uuid';
import {calculateMonthDifference} from '../../helpers/datetime';
import {ICropDataForm, ICropFormV3CameraProps} from '../CropFormV3/type';
import CameraBlock from './components/CameraBlock';

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
  ownerDetails: OwnerDetailsOfflineProps[];
  subDivisions: string[];
  irrigationSources: MiscIrrigationSourceOfflineProps[];
  cropStages: MiscCropStageOfflineProps[];
  cropTypes: CropTypeOfflineProps[];
  cropClassifications: CropClassificationOfflineProps[];
  crops: CropOfflineProps[];
  cropSeasonTypes: MiscCropSeasonTypeOfflineProps[];
}

export default function Index(props: Props) {
  const ln = useDict();
  const {languageCode, capturedImageData} = useStateContext();
  const auth = useAuth();
  const {selectedLocationData, handleSelectedLocationData} = useStateContext();

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
    await api.local.cropSeasonType.read({
      callback: e => handleFieldOptions('cropSeasonTypes')(e),
    });
  }

  async function getCropTypes() {
    await api.local.cropTypes.getCropTypes({
      callback: handleFieldOptions('cropTypes'),
      language: languageCode,
    });
  }

  async function getIrrigationSources() {
    await api.local.irrigationSource.read({
      callback: handleFieldOptions('irrigationSources'),
    });
  }

  async function getCropStages() {
    await api.local.cropStage.read({
      callback: handleFieldOptions('cropStages'),
    });
  }

  //? get crop names
  async function getCrops(cropClassificationId: string) {
    await api.local.crops.read({
      callback: handleFieldOptions('crops'),
      cropClassificationId: cropClassificationId,
      limit: 'all',
      language: languageCode,
      majorCrops: true,
    });
  }

  //? get crop classifications
  async function getCropClassifications(cropTypeId?: string) {
    await api.local.cropClassifications.read({
      callback: handleFieldOptions('cropClassifications'),
      cropTypeId: cropTypeId,
      language: languageCode,
    });
  }

  async function getData() {
    await getCroppingSeasons();
    await getCropTypes();
    await getIrrigationSources();
    await getCropStages();
  }

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
    async (crop: CropOfflineProps) => {
      getCropClassifications(crop.cropTypeId as string);
      getCrops(crop.cropClassificationId as string);
      handleFormData('cropTypeId', crop.cropTypeId as string);

      handleFormData(
        'cropClassificationId',
        crop.cropClassificationId as string,
      );

      handleFormData('cropNameId', crop.cropId as string);

      handleFormData('cropSeasonType', crop.cropSeasonType as string);
    },
    [],
  );

  const handleCropSelection = useCallback(async (cropId: string) => {
    handleFormData('cropNameId', cropId as string);
    await api.local.crops.read({
      callback: e => {
        const crop = e[0];

        handleFormData('cropSeasonType', crop.cropSeasonType as string);
        if (crop) {
        }
      },
      cropId,
    });
  }, []);

  function handleClassificationChange(classificationId: string) {
    handleFormData('cropNameId', '');
    handleFormData('cropClassificationId', classificationId);
    getCrops(classificationId);
  }

  const handleCropTypeSelection = useCallback(async (id: string) => {
    getCropClassifications(id);
    handleFormData('cropClassificationId', '');
    handleFormData('cropNameId', '');
    handleFormData('cropTypeId', id);
  }, []);

  const selectAllSubdivision = useCallback(() => {
    handleFormData('selectedSubDivisionNumbers', fieldOptions.subDivisions);
  }, [fieldOptions.subDivisions]);

  const deSelectAllSubdivision = useCallback(() => {
    handleFormData('selectedSubDivisionNumbers', []);
  }, []);

  async function handleAutoFill() {}

  async function openLoader() {
    auth.openLoader('Fetching old data...');
    return;
  }

  async function getPreLoadedData() {
    try {
      await api.local.metaData.read({
        key: 'cropFormV1PreloadData',
        callback: async prevData => {
          if (prevData) {
            const {
              cropNameId,
              cropClassificationId,
              cropTypeId,
              cropSeasonType,
              ...parsedPreloadData
            } = JSON.parse(prevData);

            if (AGRICULTURE_NO_USE_IDS.includes(cropSeasonType)) {
              handleFormState('formType', 'nonAgricultural');
              handleCropSeasonTypeSelection(cropSeasonType);
              handleClassificationChange(cropClassificationId);
            } else {
              handleFormState('formType', 'agricultural');

              await handleCropTypeSelection(cropTypeId)
                .then(() => {
                  handleClassificationChange(cropClassificationId);
                })
                .then(() => {
                  handleCropSelection(cropNameId);
                });

              handleFormData('sownDate', parsedPreloadData?.sownDate);
              handleFormData(
                'expectedHarvestDate',
                parsedPreloadData?.expectedHarvestDate,
              );
              handleFormData('cropStage', parsedPreloadData?.cropStage);
            }
          } else {
            Alert.alert('Oops!', 'there is no previous data to fill');
          }
        },
      });
    } finally {
      setTimeout(() => auth.closeLoader(), 500);
    }
  }

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
      props.onNext({
        ...formData,
        labelCropType: fieldOptions.cropTypes.find(
          e => e.cropTypeId === formData.cropTypeId,
        )?.cropTypeName as string,
        labelCropClassification: fieldOptions.cropClassifications.find(
          e => e.cropClassificationId === formData.cropClassificationId,
        )?.cropClassificationName as string,
        labelCropName: fieldOptions.crops.find(
          e => e.cropId === formData.cropNameId,
        )?.cropName as string,
        labelCropSesonType: fieldOptions.cropSeasonTypes.find(
          e => e.cropSeasonTypeId === formData.cropSeasonType,
        )?.cropSeasonType as string,
        labelIrrigationSource: fieldOptions.irrigationSources.find(
          e => e.id === formData.irrigationSourceId,
        )?.irrigationSource as string,
        labelCropStage: fieldOptions.cropStages.find(
          e => e.cropStageId === formData.cropStage,
        )?.cropStage as string,
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
        values.cropNameId &&
          values.irrigationSourceId &&
          values.irrigationSourceId,
      );
    } else {
      value = Boolean(
        values.cropNameId &&
          values.sownDate &&
          values.expectedHarvestDate &&
          values.irrigationSourceId &&
          values.irrigationSourceId &&
          values.cropStage,
      );
    }
    return value;
  };

  const getSubDivisionNumbers = async () => {
    await api.local.ownerDetails.read({
      districtCode: selectedLocationData.district,
      talukCode: selectedLocationData.taluk,
      villageCode: selectedLocationData.village,
      surveyNumber: selectedLocationData.surveyNumber,
      fields: ['o.subDivisionNumber'],
      callback: async e => {
        let uniqueSubDivisionNumbers = e.reduce((acc: any, current: any) => {
          const x = acc.find(
            (item: any) => item.subDivisionNumber === current.subDivisionNumber,
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        uniqueSubDivisionNumbers = customSort(
          uniqueSubDivisionNumbers.map((e: any) => e.subDivisionNumber),
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
            uniqueSubDivisionNumbers[0].subDivisionNumber,
          );
        }

        handleFormState('isLoading', false);
      },
    });
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
  }, []);

  // const handleImageCapture = (data:  ICropFormV2CameraProps) => {
  //   props.onImageCapture(data)
  // }

  function handleCropSeasonTypeSelection(value: string) {
    if (AGRICULTURE_NO_USE_IDS.includes(value)) {
      handleFormData('cropTypeId', value);
      getCropClassifications(value);
      handleFormData('cropNameId', null);
      handleFormData('irrigationSourceId', null);
      handleFormData('sownDate', null);
      handleFormData('expectedHarvestDate', null);
      handleFormData('cropStage', null);
    } else {
      // if (TREE_OR_BORDER_CROP.includes(value)) {
      //   handleFormData("",0);
      // }
      handleFormData('cropTypeId', '');

      handleFormData('cropNameId', '');
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
            <Box alignItems={'center'}>
              <Pressable
                onPress={async () => {
                  openLoader().then(async () => {
                    setTimeout(() => {
                      getPreLoadedData();
                    }, 500);
                  });
                }}
                // p="4"
                // flex={'1'}
              >
                <Text color={'primary.600'}>Auto Fill Previous Data</Text>
              </Pressable>
            </Box>

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
                    handleFormData('cropTypeId', '');
                    handleFormData('cropSeasonType', null);

                    handleFormData('orupogaIrupogaNanjai', '0');
                    handleFormData('cropNameId', null);
                    handleFormData('irrigationSourceId', null);
                    handleFormData('cropStage', null);
                    // if (e === 'nonAgricultural') {
                    // }
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
                selectedValue={formData.cropSeasonType}
                accessibilityLabel={ln('Select crop season')}
                placeholder={ln('Select crop season')}
                isDisabled={formState.formType === 'agricultural'}
                onValueChange={handleCropSeasonTypeSelection}>
                {fieldOptions.cropSeasonTypes
                  ? fieldOptions.cropSeasonTypes
                      .filter(e => {
                        if (formState.formType === 'nonAgricultural') {
                          return AGRICULTURE_NO_USE_IDS.includes(
                            e.cropSeasonTypeId,
                          );
                        }
                        return e;
                      })
                      .map(e => (
                        <Select.Item
                          key={e.cropSeasonTypeId}
                          value={e.cropSeasonTypeId.toString()}
                          label={e.cropSeasonType}
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
                    selectedValue={formData?.cropTypeId}
                    onValueChange={handleCropTypeSelection}>
                    {fieldOptions?.cropTypes
                      ? fieldOptions?.cropTypes
                          .filter(
                            e => !AGRICULTURE_NO_USE_IDS.includes(e.cropTypeId),
                          )
                          .map(e => {
                            // return <Select.Item
                            //   key={e.cropTypeId}
                            //   value={e.cropTypeId.toString()}
                            //   label={e.cropTypeName}
                            // />
                            return (
                              <Select.Item
                                key={e.cropTypeId}
                                value={e.cropTypeId.toString()}
                                label={e.cropTypeName}
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
                selectedValue={formData?.cropClassificationId}
                onValueChange={handleClassificationChange}>
                {fieldOptions?.cropClassifications
                  ? fieldOptions?.cropClassifications.map(e => (
                      <Select.Item
                        key={e.cropClassificationId}
                        value={e.cropClassificationId.toString()}
                        label={e.cropClassificationName}
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
                    selectedValue={formData?.cropNameId}
                    onValueChange={e => handleCropSelection(e)}>
                    {fieldOptions?.crops
                      ? fieldOptions?.crops.map(e => (
                          <Select.Item
                            key={e.cropId}
                            value={e.cropId.toString()}
                            label={e.cropName}
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
                          label={e.irrigationSource}
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
                    cropSeasonPeriodInMonthsBySeasonType?.[
                      formData.cropSeasonType
                    ] as any,
                  )}
                </Text>
              </Box>
            ) : null}

            {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}
            {formData?.cropTypeId &&
            !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType) ? (
              <Box mt="2">
                <Text fontSize={'xs'} bold color="primary.600">
                  {ln('Crop Stage')}
                </Text>
                <Select
                  {...selectDefaultProps}
                  selectedValue={formData?.cropStage}
                  accessibilityLabel={ln('Select crop stage')}
                  placeholder={ln('Select crop stage')}
                  // isDisabled={props.previewMode}
                  onValueChange={e => handleFormData('cropStage', e)}>
                  {fieldOptions?.cropStages
                    ? fieldOptions?.cropStages.map(e => (
                        <Select.Item
                          key={e.cropStageId}
                          value={e.cropStageId.toString()}
                          label={e.cropStage}
                        />
                      ))
                    : null}
                </Select>
              </Box>
            ) : null}

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

            {formData?.cropTypeId &&
            !AGRICULTURE_NO_USE_IDS.includes(formData?.cropSeasonType) ? (
              <>
                <Box mt="2">
                  <Text fontSize={'xs'} bold color="primary.600">
                    {ln('Orupoga/Irupoga Nanjai')}
                  </Text>
                  {/*<Input*/}
                  {/*  keyboardType={'numeric'}*/}
                  {/*  onChangeText={e => handleFormData("orupogaNrupogaNanjai", e)}*/}
                  {/*  placeholder={ln('Orupoga/Irupoga Nanjai')}*/}
                  {/*/>*/}

                  <Select
                    defaultValue={formData.orupogaIrupogaNanjai}
                    onValueChange={e =>
                      handleFormData('orupogaIrupogaNanjai', e)
                    }>
                    <Select.Item label={'-'} value={'0'} />
                    <Select.Item label={ln('Orupoga Nanjai')} value={'1'} />
                    <Select.Item label={ln('Irupoga Nanjai')} value={'2'} />
                    <Select.Item label={ln('Moondru Nanjai')} value={'3'} />
                  </Select>
                </Box>
              </>
            ) : null}

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
              surveyId={UUID.v4().toString()}
              // handleInputChange={handleImageCapture}
              previewMode={false}
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
                <Button onPress={deSelectAllSubdivision}>Unselect All</Button>
              ) : (
                <Button onPress={selectAllSubdivision}>Select All</Button>
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
                <Text>Selected</Text>
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
                <Text>Not-Selected</Text>
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
