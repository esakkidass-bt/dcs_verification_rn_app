import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Box,
  Button,
  Icon,
  Image,
  Input,
  Pressable,
  Radio,
  Row,
  Select,
  Text,
} from 'native-base';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {
  CropClassificationOnlineProps,
  CropOnlineProps,
  CropTypeOnlineProps,
  MiscCropSeasonTypeOnlineProps,
  MiscIrrigationSourceOnlineProps,
  OwnerDetailsOnlineProps,
} from '../../../../@types';
import {ICropSurvey} from '../../../../@types/form';
import {useStateContext} from '../../../../hooks';
import {navigation} from '../../../../routers/navigation';
import {colors} from '../../../../styles';
import {Alert, LogBox} from 'react-native';
import useDict from '../../../../hooks/useDict';
import {
  HarvestDatePicker,
  SownDatePicker,
} from '../../../../components/DatePicker';
import {ColorType} from 'native-base/lib/typescript/components/types';
import {CropPicker} from './components';
import {parseLandExtent} from '../../../../helpers/landExtent';
import {LandExtentInput} from '../../../../components';

import {
  AGRICULTURE_NO_USE_IDS,
  cropSeasonPeriodBySeasonType,
  cropSeasonPeriodInMonthsBySeasonType,
  cropSeasonType,
  cultiVatorTypes,
  TREE_OR_BORDER_CROP,
} from '../../../../const';
import {selectDefaultProps} from '../../../../styles/defaultProps';
import {calculateMonthDifference} from '../../../../helpers/datetime';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// let C = 0;

interface Props {
  onDelete?: () => void;
  onChange: (data: ICropSurvey) => void;
  data: ICropSurvey;
  idx: number;
  previewMode: boolean;
  handleValidation?: (e: boolean) => void;
  enableDelete?: boolean;
  bg: ColorType;
  cropSeasonTypes: MiscCropSeasonTypeOnlineProps[];
  cropTypes: CropTypeOnlineProps[];
  cropClassifications: CropClassificationOnlineProps[];
  irrigationSources: MiscIrrigationSourceOnlineProps[];
  crops: CropOnlineProps[];
  ownerDetails: OwnerDetailsOnlineProps[];
}

interface FieldOptions {
  ownerDetails: OwnerDetailsOnlineProps[];
  irrigationSources: MiscIrrigationSourceOnlineProps[];
  // cropStages: MiscCropStageOnlineProps[];
  cropTypes: CropTypeOnlineProps[];
  cropClassifications: CropClassificationOnlineProps[];
  crops: CropOnlineProps[];
  cropSeasonTypes: MiscCropSeasonTypeOnlineProps[];
}

interface IFormStateProps {
  formType: 'agricultural' | 'nonAgricultural';
}

const Index = (props: Props) => {
  const {selectedLocationData, languageCode} = useStateContext();
  const ln = useDict();

  const [otherValues, setOtherValues] = useState({
    cropName: '',
    subDivision: selectedLocationData?.subDivisionNumber,
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

  const [showDatePicker, setShowDatePicker] = useState<
    'sownDate' | 'expectedHarvestDate' | ''
  >('');

  const [values, setValues] = useState<ICropSurvey>({
    ...props.data,
    isBorderOrRowCrop: '',
    cropCount: '0',
    villageCode: selectedLocationData.village,
    districtCode: selectedLocationData.district,
    talukCode: selectedLocationData.taluk,
    subDivisionNumber: selectedLocationData.subDivisionNumber,
    surveyNumber: selectedLocationData.surveyNumber,
  });

  const [fieldOptions, setFieldOptions] = useState<FieldOptions>({
    ownerDetails: props.ownerDetails,
    irrigationSources: props.irrigationSources,
    cropTypes: props.cropTypes,
    cropSeasonTypes: props.cropSeasonTypes,
    cropClassifications: [],
    crops: props.crops,
  } as FieldOptions);
  const [showCropPicker, setShowCropPicker] = useState(false);

  function closeCropPicker() {
    setShowCropPicker(false);
  }

  const [formState, setFormState] = useState<IFormStateProps>({
    formType: 'agricultural',
  });

  function handleFormState<K extends keyof IFormStateProps>(
    key: K,
    value: IFormStateProps[K],
  ) {
    setFormState(e => ({...e, [key]: value}));
  }

  // handel field options
  const handleFieldOptions = useCallback(
    (key: keyof FieldOptions) => async (value: any) => {
      setFieldOptions(prevVal => {
        return {...prevVal, [key]: value};
      });
    },
    [],
  );

  const [hideForm, setHideForm] = useState(false);
  const toggleForm = useCallback(() => {
    setHideForm(!hideForm);
  }, [hideForm]);

  // async function openLoader() {
  //   auth.openLoader('Fetching old data...');
  //   return;
  // }

  const handleInputChange = useCallback((key: keyof ICropSurvey) => {
    return function (value: any) {
      // console.log("value", value);
      setValues(prevVal => {
        return {...prevVal, [key]: value};
      });
    };
  }, []);

  const handleCultivatorIdChange = useCallback((id: any) => {
    handleInputChange('cultivatorId')(id);
    handleFieldOptions('ownerDetails')(
      props.ownerDetails.filter(
        e => e.owner_type_id.toString() === id?.toString(),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ? select the
    if (values.cultivatorTypeId) {
      const i = fieldOptions?.ownerDetails?.filter(
        e => e?.owner_type_id?.toString() === values?.cultivatorTypeId,
      )?.[0]?.id;
      handleInputChange('cultivatorId')(i);
    }
  }, [fieldOptions?.ownerDetails, handleInputChange, values.cultivatorTypeId]);

  useEffect(() => {
    if (values.cultivatorId) {
      handleInputChange('cultivatorName')(
        fieldOptions?.ownerDetails?.find(
          e => e.id?.toString() === values.cultivatorId,
        )?.owner_name,
      );
    }
  }, [fieldOptions?.ownerDetails, handleInputChange, values.cultivatorId]);

  // //? get crop classifications
  const getCropClassifications = useCallback(
    async (cropTypeId?: string) => {
      console.log(' cropTypeId', cropTypeId);
      cropTypeId
        ? handleFieldOptions('cropClassifications')(
            props.cropClassifications?.filter(
              cropClassification =>
                cropClassification.crop_type_id?.toString() === cropTypeId,
            ),
          )
        : [];
    },
    [handleFieldOptions, props.cropClassifications],
  );

  // //? get crop classifications
  const getCrops = useCallback(
    async (cropClassificationId?: string) => {
      cropClassificationId
        ? handleFieldOptions('crops')(
            props.crops?.filter(
              crop =>
                crop.crop_classification_id === Number(cropClassificationId),
            ),
          )
        : props.crops;
    },
    [handleFieldOptions, props.crops],
  );

  const handleCropTypeSelection = useCallback(
    async (id: string) => {
      getCropClassifications(id);
      handleInputChange('cropClassificationId')('');
      handleInputChange('cropNameId')('');
      handleOtherValueChange('cropName')(null);
      handleInputChange('cropTypeId')(id);
      handleFieldOptions('crops')(
        props.crops.filter(e => e.crop_type_id == id),
      );
    },
    [
      getCropClassifications,
      handleInputChange,
      handleFieldOptions,
      props.crops,
    ],
  );

  const handleCropPickerSelection = useCallback(
    async (crop: CropOnlineProps) => {
      handleFieldOptions('crops')([]);
      await getCrops(crop.crop_classification_id?.toString());
      await getCropClassifications(crop.crop_type_id?.toString());
      // await getCropTypes();
      handleInputChange('cropNameId')(crop.id?.toString());
      handleOtherValueChange('cropName')(crop.crop_name);
      handleInputChange('cropTypeId')(crop.crop_type_id as string);
      handleInputChange('cropClassificationId')(
        crop.crop_classification_id?.toString(),
      );
      handleInputChange('cropSeasonType')(crop.crop_season_type as string);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleInputChange],
  );

  const handleCropSelection = useCallback(
    async (cropId: string) => {
      const _crop = props.crops.find(crop => crop.id === Number(cropId));

      if (_crop) {
        handleOtherValueChange('cropName')(_crop.crop_name);
        handleInputChange('cropTypeId')(_crop.crop_type_id as string);
        handleInputChange('cropNameId')(_crop.id?.toString());
        handleInputChange('cropSeasonType')(_crop.crop_season_type as string);
        // handleCropPickerSelection(_crop);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleInputChange, props.crops],
  );

  function handleClassificationChange(classificationId: string) {
    handleInputChange('cropNameId')('');
    handleOtherValueChange('cropName')(null);
    handleInputChange('cropClassificationId')(classificationId);
    handleFieldOptions('crops')(
      props.crops.filter(e => e.crop_classification_id == classificationId),
    );

    // getCrops(classificationId);
  }

  // async function handleCultivatorTypeChange(ownerTypeId: string) {
  //   // await handleCultivatorIdChange("");
  //   await handleInputChange('cultivatorTypeId')(ownerTypeId);
  //   // await getOwnerDetails(ownerTypeId);
  // }

  function handleCropSeasonTypeSelection(value: string) {
    if (AGRICULTURE_NO_USE_IDS.includes(value)) {
      handleInputChange('cropTypeId')(value);
      getCropClassifications(value);
      handleInputChange('cropNameId')(null);
      handleOtherValueChange('cropName')(null);
      // // disabled for oct28 changes
      handleInputChange('irrigationSourceId')(null);
      handleInputChange('sownDate')(null);
      handleInputChange('expectedHarvestDate')(null);
      // // disabled for oct28 changes
      // handleInputChange("cropStage")(null);
    } else {
      if (TREE_OR_BORDER_CROP.includes(value)) {
        handleInputChange('cropLandExtent')(0);
      }
      handleInputChange('cropTypeId')('');

      handleInputChange('cropNameId')('');
      handleOtherValueChange('cropName')(null);
    }
    // if (value !== cropSeasonType.PERENNIAL) {
    //   handleBorderOrRowCrop(null);
    // } else {
    //   handleBorderOrRowCrop(false);
    // }
    handleInputChange('cropSeasonType')(value);
    handleInputChange('cropClassificationId')('');
    handleInputChange('sownDate')('');
    handleInputChange('expectedHarvestDate')('');
  }

  const [timeStamp, setTimeStamp] = useState('');

  // useEffect(() => {
  //   setTimeStamp(new Date().toLocaleString());
  // }, [values.image]);

  const captureBtnOnPress = useCallback(() => {
    if (formState.formType === 'agricultural' && !otherValues?.cropName) {
      Alert.alert(
        'Please Select Crop',
        'To continue please select the crop name',
      );
      return;
    }
    navigation.navigate('ViewFinder', {
      surveyId: values.id,
      onCapture: handleInputChange,
      setTimeStamp,
      cropName: otherValues.cropName,
      subDivision: otherValues?.subDivision,
    });
  }, [
    handleInputChange,
    values.id,
    otherValues?.cropName,
    otherValues?.subDivision,
    formState.formType,
  ]);
  // function validate() {
  //   let value = false;
  //   if (AGRICULTURE_NO_USE_IDS.includes(values.cropSeasonType)) {
  //     value = Boolean(
  //       values.cropClassificationId &&
  //         (values.cropLandExtent || values.cropLandExtent == "0") &&
  //         values.cultivatorTypeId &&
  //         values.cultivatorId &&
  //         values.image
  //     );
  //   } else {
  //     value = Boolean(
  //       values.cropTypeId &&
  //         values.cropClassificationId &&
  //         values.cropNameId &&
  //         values.irrigationSourceId &&
  //         (values.cropLandExtent || values.cropLandExtent == "0") &&
  //         values.cultivatorTypeId &&
  //         values.cultivatorId &&
  //         values.image &&
  //         values.sownDate &&
  //         values.expectedHarvestDate &&
  //         values.cropStage
  //     );
  //   }

  //   return value;
  // }

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
            // // disabled for oct28 changes
            // values.irrigationSourceId &&
            parseFloat(values.cropCount) >= 1 &&
            values.cultivatorTypeId &&
            values.cultivatorId &&
            values.image &&
            values.sownDate &&
            values.expectedHarvestDate,
          // // disabled for oct28 changes
          // values.cropStage,
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
    // && calculateMonthDifference(values.sownDate, values?.expectedHarvestDate)<= cropSeasonPeriodInMonthsBySeasonType[values.cropSeasonType] ;
  }, []);

  useEffect(() => {
    props.onChange(values);
    props.handleValidation?.(validate(values));
    return () => {};
  }, [props, validate, values]);

  async function getData() {
    handleFieldOptions('cropTypes')(props.cropTypes);
    handleFieldOptions('crops')(props.crops);
    handleFieldOptions('cropSeasonTypes')(props.cropSeasonTypes);
    handleFieldOptions('ownerDetails')(props.ownerDetails);
    // handleFieldOptions('cropClassifications')(props.cropClassifications);
    // await handleCultivatorTypeChange(values.cultivatorTypeId);
    // -- // await getOwnerDetails(values.cultivatorTypeId);
  }

  useEffect(() => {
    if (values.cropTypeId) {
      // ! get the crop classifications if the cropTypeId is passed to the card while rendering the crop record Card
      // getCropClassifications(values.cropTypeId);
    }
    getData();
    return () => {
      setFieldOptions({} as FieldOptions);
      setValues({} as ICropSurvey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log("values", C++, values.id);

  return (
    <Box
      bg={props.bg || 'white'}
      m="2"
      borderRadius={'xl'}
      overflow="hidden"
      shadow="2">
      <Box>
        <Row alignItems="center">
          <Pressable onPress={toggleForm} flex="1" p="4">
            <Row space="2" flex="1" alignItems={'center'}>
              <Entypo
                name={hideForm ? 'chevron-thin-down' : 'chevron-thin-up'}
                size={20}
                color={colors.primary[600]}
              />

              <Text fontSize={'md'} color="green.600" bold>
                {ln('Crop Record')} {props.idx + 1}
              </Text>
            </Row>
          </Pressable>
          {props.enableDelete && !props.previewMode ? (
            <Pressable onPress={props.onDelete} p="4">
              <Icon
                as={MaterialIcons}
                size={'sm'}
                name="delete-outline"
                color={'red.500'}
              />
            </Pressable>
          ) : null}
        </Row>
        {/* <Box alignItems={'flex-end'}>
          {!props.previewMode ? (
            <Pressable
              onPress={async () => {
                getPreLoadedData();
              }}
              p="4">
              <Text color={'primary.600'}>{ln('Auto Fill Previous Data')}</Text>
            </Pressable>
          ) : null}
        </Box> */}
      </Box>

      {/* //? form */}
      <Box display={hideForm ? 'none' : 'flex'} px="4" pb="4">
        {/* {config.env === "dev" ? (
          <Button onPress={() => devLog(values)}>devLog</Button>
        ) : null} */}
        {/* //? annual seasonal Perennial  */}
        <Box mb={'2'}>
          <Text fontSize={'sm'} bold color="primary.600">
            {ln('Form Type')}
          </Text>
          <Row space="4">
            <Radio.Group
              isDisabled={props.previewMode}
              name="croppingMethod"
              onChange={e => {
                if (!props.previewMode) {
                  handleInputChange('sownDate')('');
                  handleInputChange('expectedHarvestDate')('');
                  handleInputChange('cropTypeId')('');
                  handleInputChange('cropNameId')('');
                  handleOtherValueChange('cropName')(null);
                  handleFieldOptions('cropClassifications')([]);
                  handleInputChange('cropSeasonType')('');
                  handleInputChange('cropClassificationId')('');

                  // // disabled for oct28 changes
                  handleInputChange('irrigationSourceId')('');
                  // // disabled for oct28 changes
                  // handleInputChange("orupogaIrupogaNanjai")("0");
                  // if (e === 'nonAgricultural') {
                  // }
                  handleFormState('formType', e as IFormStateProps['formType']);
                }
              }}
              defaultValue={formState.formType}
              value={formState.formType}>
              <Row space="4" flexWrap={'wrap'}>
                <Radio
                  value={'agricultural'}
                  isDisabled={props.previewMode}
                  size="sm">
                  {ln('Agricultural')}
                </Radio>
                <Radio
                  value={'nonAgricultural'}
                  isDisabled={props.previewMode}
                  size="sm">
                  {ln('Non-Agricultural')}
                </Radio>
              </Row>
            </Radio.Group>
          </Row>
        </Box>

        {formState.formType === 'agricultural' ? (
          <>
            <Button
              alignItems={'center'}
              justifyContent="center"
              my="2"
              borderRadius={'sm'}
              p="2"
              onPress={() => setShowCropPicker(true)}
              isDisabled={props.previewMode}
              opacity={props.previewMode ? 0.5 : 1}>
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
              isOpen={showCropPicker}
              onClose={closeCropPicker}
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
            selectedValue={values.cropSeasonType?.toString()}
            accessibilityLabel={ln('Select crop season')}
            placeholder={ln('Select crop season')}
            isDisabled={
              formState.formType === 'agricultural' || props.previewMode
            }
            onValueChange={handleCropSeasonTypeSelection}>
            {props.cropSeasonTypes
              ? props.cropSeasonTypes
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

        {/* {props?.data?.cropSeasonType === cropSeasonType.PERENNIAL ? (
          <Box mt="2">
            <Checkbox.Group>
              <Checkbox
                isDisabled={props.previewMode}
                value={"isBorderOrRowCrop"}
                onChange={handleBorderOrRowCrop}
              >
                {ln("Border / Row Crop")}
              </Checkbox>
            </Checkbox.Group>
          </Box>
        ) : null} */}

        {/* //? Crop search button */}

        {/* //? cropType */}
        {formState.formType === 'agricultural' ? (
          <Box mt="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Crop Type')}
            </Text>

            <Select
              {...selectDefaultProps}
              accessibilityLabel={ln('Select crop type')}
              placeholder={ln('Select crop type')}
              isDisabled={props.previewMode}
              selectedValue={values.cropTypeId?.toString()}
              onValueChange={handleCropTypeSelection}>
              {fieldOptions?.cropTypes
                ? fieldOptions?.cropTypes
                    .filter(
                      e => !AGRICULTURE_NO_USE_IDS.includes(e.id?.toString()),
                    )
                    .map(cropType => {
                      return (
                        <Select.Item
                          key={cropType.id}
                          value={cropType.id.toString()}
                          label={
                            languageCode === 'en'
                              ? cropType.crop_type
                              : cropType.crop_type_name_in_tamil
                          }
                        />
                      );
                    })
                : null}
            </Select>
          </Box>
        ) : null}

        {/* //? classification */}
        {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}
        {/* {values.cropTypeId ? ( */}
        <Box mt="2">
          <Text fontSize={'xs'} bold color="primary.600">
            {!AGRICULTURE_NO_USE_IDS.includes(
              values?.cropSeasonType?.toString(),
            )
              ? ln('Crop Classification')
              : ln('Classification')}
          </Text>
          <Select
            {...selectDefaultProps}
            accessibilityLabel={
              ln('Select') +
              !AGRICULTURE_NO_USE_IDS.includes(
                values?.cropSeasonType?.toString(),
              )
                ? ln('Crop Classification')
                : ln('Classification')
            }
            placeholder={
              ln('Select') +
              !AGRICULTURE_NO_USE_IDS.includes(values?.cropSeasonType?.toString)
                ? ln('Crop Classification')
                : ln('Classification')
            }
            isDisabled={props.previewMode}
            selectedValue={values.cropClassificationId?.toString()}
            onValueChange={handleClassificationChange}>
            {fieldOptions?.cropClassifications
              ? fieldOptions?.cropClassifications.map(classification => (
                  <Select.Item
                    key={classification.id}
                    value={classification.id.toString()}
                    label={
                      languageCode === 'en'
                        ? classification.classification_name
                        : classification.classification_name_in_tamil
                    }
                  />
                ))
              : null}
          </Select>
        </Box>
        {/* ) : null} */}

        {/* //? name */}
        {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}

        {formState.formType === 'agricultural' ? (
          <Box mt="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Crop Name')}
            </Text>
            <Row>
              <Select
                {...selectDefaultProps}
                flex="1"
                accessibilityLabel={ln('Select crop name')}
                placeholder={ln('Select crop name')}
                isDisabled={props.previewMode}
                selectedValue={values.cropNameId}
                onValueChange={handleCropSelection}>
                {fieldOptions?.crops && values.cropClassificationId
                  ? fieldOptions?.crops.map(crop => (
                      <Select.Item
                        key={crop.id}
                        value={crop.id.toString()}
                        label={
                          languageCode === 'en'
                            ? crop.crop_name
                            : crop.crop_name_in_tamil
                        }
                      />
                    ))
                  : null}
              </Select>
            </Row>
          </Box>
        ) : null}

        {/* {showCropPicker ? cropPicker() : null} */}

        {/* //? irrigation */}
        {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}

        {/* // // disabled for oct28 changes */}
        {values.cropTypeId &&
        !AGRICULTURE_NO_USE_IDS.includes(values?.cropSeasonType) ? (
          <Box mt="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Irrigation Source')}
            </Text>
            <Select
              {...selectDefaultProps}
              selectedValue={values.irrigationSourceId}
              accessibilityLabel={ln('Select crop irrigationSource')}
              placeholder={ln('Select crop irrigationSource')}
              isDisabled={props.previewMode}
              onValueChange={handleInputChange('irrigationSourceId')}>
              {fieldOptions.irrigationSources
                ? fieldOptions?.irrigationSources.map(
                    (e: MiscIrrigationSourceOnlineProps) => (
                      <Select.Item
                        key={e.id}
                        value={e.id.toString()}
                        label={e.irrigation_source}
                      />
                    ),
                  )
                : null}
            </Select>
          </Box>
        ) : null}

        {/* //?date */}
        {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}
        {values.cropTypeId &&
        ![...AGRICULTURE_NO_USE_IDS, cropSeasonType.PERENNIAL].includes(
          values?.cropSeasonType,
        ) ? (
          <Row mt="2">
            <Box flex="1">
              <Pressable
                onPress={() => {
                  setShowDatePicker('sownDate');
                }}
                opacity={props.previewMode ? 0.5 : 1}
                disabled={props.previewMode}>
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
                  {values.sownDate ? (
                    <Text>
                      {values.sownDate?.substring(
                        0,
                        values.sownDate.lastIndexOf('/'),
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
                  setShowDatePicker('expectedHarvestDate');
                }}
                opacity={props.previewMode ? 0.5 : 1}
                disabled={props.previewMode}>
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
                  {values.expectedHarvestDate ? (
                    <Text>
                      {values.expectedHarvestDate?.substring(
                        0,
                        values.expectedHarvestDate.lastIndexOf('/'),
                      )}
                    </Text>
                  ) : (
                    <Text color="gray.400">{ln('Select harvest date')}</Text>
                  )}
                </Box>
              </Pressable>
            </Box>
          </Row>
        ) : null}

        {values.sownDate &&
        values?.expectedHarvestDate &&
        calculateMonthDifference(values.sownDate, values?.expectedHarvestDate) >
          cropSeasonPeriodInMonthsBySeasonType[values.cropSeasonType] ? (
          <Box my={'2'} p={'2'}>
            <Text color={'red.600'}>
              {ln('sownDateDifferenceWarning').replace(
                '${months}',
                cropSeasonPeriodInMonthsBySeasonType[
                  values.cropSeasonType
                ].toString(),
              )}
            </Text>
          </Box>
        ) : null}

        {/* //? area */}
        {!TREE_OR_BORDER_CROP.includes(values.cropSeasonType) ? (
          <Box mt="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Land Extent')}
            </Text>
            <Text fontSize={'xs'}>
              {parseLandExtent(values.cropLandExtent).landExtendValueString}
            </Text>
            <LandExtentInput
              value={values.cropLandExtent}
              previewMode={props.previewMode}
              onChangeText={e => {
                handleInputChange('cropLandExtent')(e);
              }}
            />
          </Box>
        ) : (
          <Box mt="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Crop / Tree count')}
            </Text>
            <Input
              placeholder={ln('Crop / Tree count')}
              py="1"
              px="2"
              mt="1"
              keyboardType="numeric"
              name="cropCount"
              isDisabled={props.previewMode}
              value={values.cropCount}
              onChangeText={e => {
                // if(/^[+-]?(\d*\.)?\d+$/.test(e) ){
                handleInputChange('cropCount')(e);
                // }
              }}
            />
          </Box>
        )}

        {/* //? category */}
        {/* //! hide the field if crop type is "non-agriculture use" or "agriculture no crop" */}

        {/* // // disabled for oct28 changes */}
        {/* {values.cropTypeId && !AGRICULTURE_NO_USE_IDS.includes(values?.cropSeasonType) ? (
          <Box mt="2">
            <Text fontSize={"xs"} bold color="primary.600">
              {ln("Crop Stage")}
            </Text>
            <Select
              {...selectDefaultProps}
              selectedValue={values.cropStage}
              accessibilityLabel={ln("Select crop stage")}
              placeholder={ln("Select crop stage")}
              isDisabled={props.previewMode}
              onValueChange={handleInputChange("cropStage")}
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

        {values?.cropSeasonType == cropSeasonType.PERENNIAL ? (
          <Box mt="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Crop Age')}
            </Text>
            <Input
              keyboardType={'numeric'}
              isDisabled={props.previewMode}
              onChangeText={e => handleInputChange('cropAge')(e)}
              placeholder={ln('Crop Age')}
            />
          </Box>
        ) : null}

        {/* // // disabled for oct28 changes */}
        {/* <Box mt="2">
          <Text fontSize={"xs"} bold color="primary.600">
            {ln("Orupoga/Irupoga Nanjai")}
          </Text>

          <Select
            defaultValue={values.orupogaIrupogaNanjai}
            onValueChange={(e) => handleInputChange("orupogaIrupogaNanjai")(e)}
          >
            <Select.Item label={"-"} value={"0"} />
            <Select.Item label={ln("Orupoga Nanjai")} value={"1"} />
            <Select.Item label={ln("Irupoga Nanjai")} value={"2"} />
            <Select.Item label={ln("Moondru Nanjai")} value={"3"} />
          </Select>
        </Box> */}

        {/* // // disabled for oct28 changes */}
        {/* <Box mt="2">
          <Text fontSize={"xs"} bold color="primary.600">
            {ln("Theervai")}
          </Text>
          <Input
            isDisabled={props.previewMode}
            keyboardType={"numeric"}
            onChangeText={(e) => {
              // console.log('onC > ',e, e.replaceAll(/[-, ]/g,''),/^(\d{0,4})(\.\d{0,2})?$/.test(e))

              if (/^(\d{0,4})(\.\d{0,2})?$/.test(e)) {
                handleInputChange("theervai")(e.replaceAll(/[-, ]/g, ""));
              }
            }}
            value={values?.theervai || ""}
            placeholder={ln("Theervai")}
            leftElement={
              <Box pl={"2"}>
                <Text>Rs.</Text>
              </Box>
            }
          />
        </Box> */}

        {/* //? cultivator  */}
        <Box my="2">
          <Text fontSize={'xs'} bold color="primary.600">
            {ln('Cultivator Type')}
          </Text>
          {/* <Row space="4">
            <Radio.Group
              name="cultivatorTypeId"
              onChange={handleCultivatorTypeChange}
              isDisabled={props.previewMode}
              defaultValue={values.cultivatorTypeId}>
              <Row space="4" mt="2" flexWrap={'wrap'}>
                {cultiVatorTypes?.map((e, i) => (
                  <Radio
                    key={i}
                    value={e.value}
                    isDisabled={
                      !Boolean(
                        fieldOptions.ownerDetails?.find(
                          od =>
                            e?.value?.toString() ===
                            od?.owner_type_id.toString(),
                        ),
                      ) || props.previewMode
                    }>
                    {ln(e.label as any)}
                  </Radio>
                ))}
              </Row>
            </Radio.Group>
          </Row> */}

          {/* //? cultivated by dropdown */}
          {values.cultivatorTypeId ? (
            <Box mt="1">
              <Select
                {...selectDefaultProps}
                accessibilityLabel={`${
                  ln('Select') +
                    ' ' +
                    cultiVatorTypes
                      .find(e => e.value === values.cultivatorTypeId)
                      ?.label.toLowerCase() || 'Cultivator'
                }`}
                placeholder={`${
                  ln('Select') +
                    ' ' +
                    cultiVatorTypes
                      ?.find(e => e?.value === values?.cultivatorTypeId)
                      ?.label.toLowerCase() || 'Cultivator'
                }`}
                // placeholder={ln("Select Cultivator")}
                selectedValue={values.cultivatorId}
                onValueChange={handleCultivatorIdChange}
                isDisabled={props.previewMode}>
                {fieldOptions?.ownerDetails
                  ? fieldOptions?.ownerDetails
                      .filter(
                        e =>
                          e?.owner_type_id?.toString() ===
                          values?.cultivatorTypeId,
                      )
                      ?.map(e => (
                        <Select.Item
                          key={e.id}
                          value={e.id.toString()}
                          label={`${e.owner_name}`}
                        />
                      ))
                  : null}
              </Select>
            </Box>
          ) : null}
        </Box>

        {/* //? camera */}
        <Box mt="1">
          {/* //? image */}
          {values?.image ? (
            <Box h={'24'}>
              <Image
                source={{uri: values.image}}
                flex="1"
                alt="Camera preview"
              />
            </Box>
          ) : null}
          <Box mt="1">
            {/* //? image buttons */}
            {!values?.image ? (
              <Button
                onPress={captureBtnOnPress}
                bgColor="black"
                leftIcon={
                  <Icon
                    as={MaterialIcons}
                    name="camera-alt"
                    color="white"
                    size="sm"
                  />
                }
                isDisabled={props.previewMode}>
                {ln('Capture Image')}
              </Button>
            ) : (
              <Row space="4">
                <Button
                  flex="1"
                  onPress={() => {
                    handleInputChange('image')('');
                    handleInputChange('imgLat')(null);
                    handleInputChange('imgLon')(null);
                    handleInputChange('imgTimestamp')(null);
                    handleInputChange('imgOrientationZ')(null);
                    handleInputChange('imgOrientationY')(null);
                    handleInputChange('imgOrientationX')(null);
                  }}
                  bgColor="red.600"
                  leftIcon={
                    <Icon
                      as={MaterialIcons}
                      name="delete"
                      color="white"
                      size="sm"
                    />
                  }
                  isDisabled={props.previewMode}>
                  {ln('Remove')}
                </Button>
                <Button
                  flex="1"
                  onPress={captureBtnOnPress}
                  bgColor="secondary.900"
                  leftIcon={
                    <Icon
                      as={MaterialIcons}
                      name="camera-alt"
                      color="white"
                      size="sm"
                    />
                  }
                  isDisabled={props.previewMode}>
                  {ln('Re-Take')}
                </Button>
              </Row>
            )}

            {values?.imgLat ? (
              <Box>
                <Text>
                  Lat:{values.imgLat}, Lon:{values.imgLon}
                </Text>
                <Text>
                  X:{values.imgOrientationX}, Y:{values.imgOrientationY}, Z:
                  {values.imgOrientationZ}
                </Text>
                <Text>{timeStamp}</Text>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>

      <SownDatePicker
        yearsLength={cropSeasonPeriodBySeasonType[values.cropSeasonType]}
        isOpen={showDatePicker === 'sownDate'}
        close={() => setShowDatePicker('')}
        onChange={e => {
          showDatePicker && handleInputChange('sownDate')(e);
        }}
      />
      <HarvestDatePicker
        yearsLength={cropSeasonPeriodBySeasonType[values.cropSeasonType]}
        isOpen={showDatePicker === 'expectedHarvestDate'}
        close={() => setShowDatePicker('')}
        onChange={e => {
          showDatePicker && handleInputChange('expectedHarvestDate')(e);
        }}
      />
    </Box>
  );
};

export default memo(Index);
