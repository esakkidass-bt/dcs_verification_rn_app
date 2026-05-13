import React, {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Icon,
  Pressable,
  Radio,
  Row,
  Select,
  Spinner,
  Text,
  Input,
} from 'native-base';
import {parseLandExtent} from '../../../../../helpers/landExtent';
import useDict from '../../../../../hooks/useDict';
import {
  CropClassificationOnlineProps,
  ICropFormV2SubDivisionFormValueProps,
  ICropFormV2SubDivisionSurveyForm,
  MiscCropSeasonTypeOnlineProps,
  OwnerDetailsOnlineProps,
} from '../../../../../@types';
import api from '../../../../../api';
import {selectDefaultProps} from '../../../../../styles/defaultProps';
import {AGRICULTURE_NO_USE_IDS, cultiVatorTypes} from '../../../../../const';
import {LandExtentInput} from '../../../../../components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import UUID from 'react-native-uuid';
import {useAuth, useStateContext} from '../../../../../hooks';
import {ICropDataForm} from '../../../type';

interface Props {
  // subDivisionData: OwnerDetailsOnlineProps
  subDivisionNumber: string;
  previewMode?: boolean;
  cropData: ICropDataForm;

  // surveyData: ICropFormV2SubDivisionFormValueProps;
  onChange: (data: any) => void;
  // onDelete: () => void
}

interface FieldOptions {
  ownerDetails: OwnerDetailsOnlineProps[];
  cropSeasonTypes: MiscCropSeasonTypeOnlineProps[];
  // irrigationSources: MiscIrrigationSourceOnlineProps[];
  // cropStages: MiscCropStageOnlineProps[];
  // cropTypes: CropTypeOnlineProps[];
  cropClassifications: CropClassificationOnlineProps[];
  // crops: CropOnlineProps[];
}

interface IErrors {
  landExtentError: null | string;
}

// function KeyValueLabel({
//   label,
//   value,
// }: {
//   label: string;
//   value: string | number;
// }) {
//   return (
//     <Row space={'2'} alignItems={'center'}>
//       <Text bold>{label}</Text>
//       <Text>{value}</Text>
//     </Row>
//   );
// }

export function SubDivisionBlock(props: Props) {
  const {subDivisionNumber, previewMode} = props;
  const ln = useDict();
  const auth = useAuth();
  const {selectedLocationData, cropData} = useStateContext();

  const [isLoaded, setIsLoaded] = useState(false);

  // const [isValid, setIsValid] = useState(true)
  const [subDivisionData, setSubDivisionData] = useState(
    {} as OwnerDetailsOnlineProps,
  );

  const [formValues, setFormValues] =
    useState<ICropFormV2SubDivisionFormValueProps>({
      subDivisionNumber: subDivisionNumber,

      surveys: [] as ICropFormV2SubDivisionSurveyForm[],
      cultivatorTypeId: '1',
    } as ICropFormV2SubDivisionFormValueProps);

  const [errors, setErrors] = useState<IErrors>({
    landExtentError: null,
  });

  const addError = (key: keyof IErrors, errorMsg: string | null) => {
    setErrors(e => {
      return {...e, [key]: errorMsg};
    });
  };

  const removeError = (key: keyof IErrors) => {
    setErrors(e => {
      return {...e, [key]: null};
    });
  };

  const [fieldOptions, setFieldOptions] = useState<FieldOptions>(
    {} as FieldOptions,
  );
  const handleFieldOptions = useCallback(
    (key: keyof FieldOptions) => async (value: any) => {
      setFieldOptions(prevVal => {
        return {...prevVal, [key]: value};
      });
    },
    [],
  );

  const getOwnerDetails = async () => {
    if (auth.appMode === 'offline') {
      await api.local.ownerDetails.read({
        callback: e => {
          if (e) {
            handleFieldOptions('ownerDetails')(e);
            setSubDivisionData(e[0]);

            handleInputChange('remainingLandExtent')(e[0]?.extent);
            setIsLoaded(true);
          }
        },

        villageCode: selectedLocationData.village,
        subDivisionNumber: subDivisionNumber,
        surveyNumber: selectedLocationData.surveyNumber,
      });
    } else {
      await api.surveyDropdown
        .ownerDetail({
          userId: auth.user.userId,
          deviceId: auth.deviceId as string,
          district_code: selectedLocationData.district,
          taluk_code: selectedLocationData.taluk,
          village_code: selectedLocationData.village,
          sub_division: subDivisionNumber,
          survey_number: selectedLocationData.surveyNumber,
        })
        .then(e => {
          if (e) {
            handleFieldOptions('ownerDetails')(e);
            setSubDivisionData(e[0]);

            // handleCultivatorIdChange(
            //   e?.filter((e) => e?.owner_type_id?.toString() === ownerTypeId)?.[0]
            //     ?.id
            // );
            handleInputChange('remainingLandExtent')(e[0]?.extent);
            setIsLoaded(true);
          }
        });
    }
  };

  //? get Owner details
  // async function getOwnerDetails(ownerTypeId?: string) {
  //   await api.surveyDropdown
  //     .ownerDetail({
  //       userId: auth.user.userId,
  //       deviceId: auth.deviceId as string,
  //       district_code: selectedLocationData.district,
  //       taluk_code: selectedLocationData.taluk,
  //       village_code: selectedLocationData.village,
  //       sub_division: subDivisionNumber,
  //       survey_number: selectedLocationData.surveyNumber,
  //     })
  //     .then(e => {
  //       if (e) {
  //         handleFieldOptions('ownerDetails')(e);
  //         setSubDivisionData(e[0]);

  //         // handleCultivatorIdChange(
  //         //   e?.filter((e) => e?.owner_type_id?.toString() === ownerTypeId)?.[0]
  //         //     ?.id
  //         // );
  //         handleInputChange('remainingLandExtent')(e[0]?.extent);
  //         setIsLoaded(true);
  //       }
  //     });
  //   // local.ownerDetails?.read({
  //   //   // ownerTypeId: ownerTypeId,
  //   //   callback: e => {
  //   //     // if (e.length > 0) {
  //   //     //   handleCultivatorIdChange(
  //   //     //     e?.filter((e) => e?.ownerTypeId?.toString() === ownerTypeId)?.[0]
  //   //     //       ?.id
  //   //     //   );
  //   //     // }
  //   //   },
  //   //   subDivisionNumber: subDivisionNumber,
  //   //   surveyNumber: selectedLocationData.surveyNumber,
  //   //   villageCode: selectedLocationData.village,
  //   // });
  // }

  const handleInputChange =
    (key: keyof ICropFormV2SubDivisionFormValueProps) => (value: any) => {
      setFormValues(e => {
        return {
          ...e,
          [key]: value,
        };
      });
    };

  async function handleCultivatorTypeChange(ownerTypeId: string) {
    // await handleCultivatorIdChange("");
    handleInputChange('cultivatorTypeId')(ownerTypeId);
    // await getOwnerDetails(ownerTypeId);
  }

  // const [cropSeasonTypes, setCropSeasonTypes] = useState<
  //   MiscCropSeasonTypeOnlineProps[]
  // >([]);

  const addSubDivisionSurveyForm = () => {
    setFormValues(e => {
      return {
        ...e,
        surveys: [
          ...e.surveys,
          {
            id: UUID.v4().toString(),
            cropSeasonType: AGRICULTURE_NO_USE_IDS[0],
            cropClassificationId: '',
            extent: '0',
          },
        ],
      };
    });
  };

  const deleteSubDivisionSurveyForm = (id: string) => {
    setFormValues(e => {
      return {
        ...e,
        surveys: e.surveys.filter(survey => survey.id != id),
      };
    });
  };

  const updateSurveyData = (data: ICropFormV2SubDivisionSurveyForm) => {
    setFormValues(prevVal => {
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
  };

  useEffect(() => {
    getOwnerDetails();
  }, []);

  useEffect(() => {
    // ? select the
    if (formValues.cultivatorTypeId && fieldOptions.ownerDetails) {
      const i = fieldOptions?.ownerDetails?.filter(
        e => e?.owner_type_id?.toString() == formValues?.cultivatorTypeId,
      )?.[0]?.id;
      handleInputChange('cultivatorId')(i);
    }
  }, [formValues.cultivatorTypeId, fieldOptions.ownerDetails]);

  function getTotalLandExtent() {
    return parseFloat(
      formValues.surveys
        ?.reduce((acc, curr) => {
          // Convert the extent value to a number if it is a string
          const extent =
            typeof curr.extent === 'string'
              ? parseFloat(curr.extent)
              : curr.extent;
          // Add the extent value to the accumulator
          return acc + extent;
        }, 0)
        .toFixed(4),
    );
  }

  function getRemainingLandExtent() {
    const totalExtent = getTotalLandExtent();
    return (parseFloat(subDivisionData?.extent) - totalExtent).toFixed(4);
  }

  function checkLandExtent() {
    const remainingExtent = getRemainingLandExtent();
    handleInputChange('remainingLandExtent')(remainingExtent);
    const totalExtent = getTotalLandExtent();
    if (parseFloat(remainingExtent) < 0 && totalExtent !== 0) {
      addError('landExtentError', 'Please check the are that you have entered');
    } else {
      removeError('landExtentError');
    }
  }

  useEffect(() => {
    if (formValues.cultivatorId) {
      handleInputChange('cultivatorName')(
        fieldOptions?.ownerDetails?.find(
          e => e.id.toString() === formValues.cultivatorId,
        )?.owner_name,
      );
    }
  }, [formValues.cultivatorId]);

  useEffect(() => {
    checkLandExtent();
  }, [formValues.surveys]);

  useEffect(() => {
    console.log('>props.cropData ', JSON.stringify(props));
    props.onChange(formValues);
  }, [formValues]);

  return (
    <Box m={'2'} bg={'white'} py={'4'} px={'4'} borderRadius={'xl'}>
      <Row alignItems={'center'} justifyContent={'space-between'}>
        <Text bold fontSize={'md'} color={'primary.900'}>
          {ln('Sub Division')}: {subDivisionNumber}
        </Text>
      </Row>

      {isLoaded ? (
        <Box>
          {/* <KeyValueLabel
            label={ln('Cropping Season Type')}
            value={props.cropData.labelCropSesonType?.toString()}
          />
          <KeyValueLabel
            label={ln('Crop Type')}
            value={props.cropData.labelCropType?.toString()}
          />
          <KeyValueLabel
            label={ln('Crop Classification')}
            value={props.cropData.labelCropClassification?.toString()}
          />
          <KeyValueLabel
            label={ln('Crop Name')}
            value={props.cropData.labelCropName}
          />
          <KeyValueLabel
            label={ln('Tentative Tentative Sown Month')}
            value={props.cropData.sownDate}
          />
          <KeyValueLabel
            label={ln('Tentative Harvest Month')}
            value={props.cropData.expectedHarvestDate}
          /> */}
          {/* // // disabled for oct28 changes */}
          {/* <KeyValueLabel label={ln("Crop Stage")} value={props.cropData.labelCropStage}/> */}

          {/* // // disabled for oct28 changes */}
          {/* <KeyValueLabel label={ln("Irrigation Source")} value={props.cropData.labelIrrigationSource}/> */}

          <Row space={'2'} alignItems={'center'}>
            <Text bold>{ln('Area')}</Text>
            <Text>
              {parseLandExtent(subDivisionData?.extent).landExtendValueString}
            </Text>
          </Row>

          <Row space={'2'} alignItems={'center'}>
            <Text bold>{ln('Cultivable Area')}</Text>
            <Text>
              {
                parseLandExtent(formValues.remainingLandExtent)
                  .landExtendValueString
              }
            </Text>
          </Row>

          {/* <Box my="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Theervai')} - {formValues.theervai}
            </Text>

            <Input
              // keyboardType={'number-pad'}
              onChangeText={e => {
                // console.log(e?.match(/[.]/g)?.length||0)
                // console.log(((e?.match(/[.]/g)?.length || 0) <= 1))
                // if (((e?.match(/[.]/g)?.length || 0) <= 1) &&!e?.match(/[-,:;a-zA-Z ]/g)) {
                // if(e.split('.')[0]?.length<=3){
                // console.log(/^(\d{0,4})(\.\d{0,2})?$/.test(e))
                if (/^(\d{0,4})(\.\d{0,2})?$/.test(e)) {
                  handleInputChange('theervai')(e.replaceAll(/[-, ]/g, ''));
                }

                // }
              }}
              // maxLength={}
              keyboardType={'numeric'}
              value={formValues?.theervai || ''}
              placeholder={ln('Theervai')}
              leftElement={
                <Box pl={'2'}>
                  <Text>Rs.</Text>
                </Box>
              }
            />
          </Box> */}

          <Box my="2">
            <Text fontSize={'xs'} bold color="primary.600">
              {ln('Cultivator Type')}
            </Text>
            {/* <Row space="4">
              <Radio.Group
                name="cultivatorTypeId"
                onChange={handleCultivatorTypeChange}
                isDisabled={previewMode}
                defaultValue={formValues.cultivatorTypeId}>
                <Row space="4" mt="2" flexWrap={'wrap'}>
                  {cultiVatorTypes?.map((e, i) => (
                    <Radio
                      key={i}
                      value={e.value}
                      isDisabled={
                        !Boolean(
                          fieldOptions?.ownerDetails?.find(
                            od => e?.value === od?.owner_type_id.toString(),
                          ),
                        ) || props.previewMode
                      }>
                      {ln(e.label as any)}
                    </Radio>
                  ))}
                </Row>
              </Radio.Group>
            </Row> */}

            <Box mt="1">
              <Select
                {...selectDefaultProps}
                accessibilityLabel={`${
                  cultiVatorTypes
                    .find(e => e.value === formValues?.cultivatorTypeId)
                    ?.label.toLowerCase() || 'Cultivator'
                }`}
                placeholder={`${
                  ' Owner'
                  // cultiVatorTypes
                  //   ?.find((e) => e?.value === values?.cultivatorTypeId)
                  //   ?.label.toLowerCase() || "Cultivator"
                }`}
                selectedValue={formValues?.cultivatorId}
                onValueChange={handleInputChange('cultivatorId')}
                isDisabled={previewMode}>
                {fieldOptions?.ownerDetails
                  ? fieldOptions?.ownerDetails
                      .filter(
                        e =>
                          e?.owner_type_id?.toString() ===
                          formValues?.cultivatorTypeId,
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
          </Box>

          {formValues.surveys?.map((e, idx) => (
            <SubDivisionSurveyBlock
              key={idx}
              previewMode={previewMode || false}
              cropSeasonTypes={fieldOptions.cropSeasonTypes}
              updateSurveyData={updateSurveyData}
              onDelete={() => deleteSubDivisionSurveyForm(e.id)}
              data={e}
            />
          ))}

          <Box>
            {errors?.landExtentError ? (
              <Text color={'red.300'}>{errors.landExtentError}</Text>
            ) : null}
          </Box>
          <Row space={'2'} my={'2'}>
            <Button
              onPress={addSubDivisionSurveyForm}
              disabled={props.previewMode}
              opacity={props.previewMode ? 0.7 : 1}>
              {ln('Add row')}
            </Button>
            {/*<Button onPress={() => console.log(formValues)}>Log</Button>*/}
          </Row>
        </Box>
      ) : (
        <Box alignItems={'center'}>
          <Spinner size={'lg'} color={'primary.500'} />
          <Text>{'Loading....'}</Text>
        </Box>
      )}
    </Box>
  );
}

interface SubDivisionSurveyBlockProps {
  data: ICropFormV2SubDivisionSurveyForm;
  updateSurveyData: (data: ICropFormV2SubDivisionSurveyForm) => void;
  onDelete: () => void;
  previewMode: boolean;
  cropSeasonTypes: MiscCropSeasonTypeOnlineProps[];
}

function SubDivisionSurveyBlock(props: SubDivisionSurveyBlockProps) {
  const ln = useDict();
  const [values, setValues] = useState<ICropFormV2SubDivisionSurveyForm>(
    props.data,
  );
  const {cropData} = useStateContext();

  const [fieldOptions, setFieldOptions] = useState<{
    cropClassifications: CropClassificationOnlineProps[];
  }>({} as any);
  const handleFieldOptions =
    (key: keyof FieldOptions) => async (value: any) => {
      setFieldOptions(prevVal => {
        return {...prevVal, [key]: value};
      });
    };

  //? get crop classifications
  // const getCropClassifications = useCallback(
  //   async (cropTypeId: string) => {
  //     props.cropClassifications?.filter(
  //       cropClassification =>
  //         cropClassification.crop_type_id === Number(cropTypeId),
  //     );
  //   },
  //   [props.cropClassifications],
  // );
  const getCropClassifications = useCallback(async (cropTypeId: string) => {
    // await api.local.cropClassifications.read({
    //   callback: handleFieldOptions('cropClassifications'),
    //   cropTypeId: cropTypeId,
    // });
    //

    handleFieldOptions('cropClassifications')(
      cropData.cropClassifications.filter(
        e => e.crop_type_id?.toString() === cropTypeId,
      ),
    );
  }, []);
  const handleInputChange =
    (key: keyof ICropFormV2SubDivisionSurveyForm) => (value: any) => {
      setValues(e => {
        return {...e, [key]: value};
      });
    };

  function handleCropSeasonTypeChange(e: string) {
    handleInputChange('cropSeasonType');
    getCropClassifications(values.cropSeasonType);
  }

  useEffect(() => {
    props.updateSurveyData(values);
  }, [values]);

  useEffect(() => {
    getCropClassifications(values.cropSeasonType);
  }, []);
  return (
    <Box>
      <Box mt={'2'}>
        <Row alignItems={'center'} my={'2'}>
          <Text fontSize={'xs'} bold color="primary.600" flex={'1'}>
            {ln('Cropping Season Type')}
          </Text>

          <Pressable onPress={props.onDelete} disabled={props.previewMode}>
            <Icon
              as={MaterialIcons}
              size={'sm'}
              name="delete-outline"
              color={'red.500'}
            />
          </Pressable>
        </Row>
        <Select
          {...selectDefaultProps}
          selectedValue={props.data.cropSeasonType}
          accessibilityLabel={ln('Select crop stage')}
          placeholder={ln('Select crop stage')}
          isDisabled={props.previewMode}
          onValueChange={handleCropSeasonTypeChange}>
          {props.cropSeasonTypes
            ? props.cropSeasonTypes
                .filter(e =>
                  AGRICULTURE_NO_USE_IDS.includes(
                    e.crop_season_type_id?.toString(),
                  ),
                )
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

      {values?.cropSeasonType ? (
        <Box mt="2">
          <Text fontSize={'xs'} bold color="primary.600">
            {!AGRICULTURE_NO_USE_IDS.includes(values?.cropSeasonType)
              ? ln('Crop Classification')
              : ln('Classification')}
          </Text>
          <Select
            {...selectDefaultProps}
            accessibilityLabel={
              !AGRICULTURE_NO_USE_IDS.includes(values?.cropSeasonType)
                ? ln('Crop Classification')
                : ln('Classification')
            }
            placeholder={
              !AGRICULTURE_NO_USE_IDS.includes(values?.cropSeasonType)
                ? ln('Crop Classification')
                : ln('Classification')
            }
            isDisabled={props.previewMode}
            selectedValue={values.cropClassificationId}
            onValueChange={handleInputChange('cropClassificationId')}>
            {fieldOptions?.cropClassifications
              ? fieldOptions?.cropClassifications.map(e => (
                  <Select.Item
                    key={e.id}
                    value={e.id.toString()}
                    label={e.classification_name}
                  />
                ))
              : null}
          </Select>
        </Box>
      ) : null}

      <Box mt={'2'}>
        <Text fontSize={'xs'} bold color="primary.600">
          {ln('Land Extent')}
        </Text>
        <LandExtentInput
          value={props.data.extent}
          onChangeText={handleInputChange('extent')}
          previewMode={props.previewMode}
        />
      </Box>
      <Box borderBottomWidth={1} borderBottomColor={'muted.200'} my={'2'} />
    </Box>
  );
}
