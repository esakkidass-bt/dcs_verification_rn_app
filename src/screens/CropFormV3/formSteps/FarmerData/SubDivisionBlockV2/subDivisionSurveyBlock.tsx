import useDict from '../../../../../hooks/useDict';
import React, {useCallback, useState} from 'react';
import {
  CropClassificationOfflineProps,
  ICropFormV2SubDivisionSurveyForm,
  MiscCropSeasonTypeOfflineProps,
  OwnerDetailsOfflineProps,
} from '../../../../../@types';
import api from '../../../../../api';
import {Box, Icon, Pressable, Row, Select, Text} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {selectDefaultProps} from '../../../../../styles/defaultProps';
import {AGRICULTURE_NO_USE_IDS} from '../../../../../const';
import {LandExtentInput} from '../../../../../components';

interface FieldOptions {
  ownerDetails: OwnerDetailsOfflineProps[];
  cropSeasonTypes: MiscCropSeasonTypeOfflineProps[];
  // irrigationSources: MiscIrrigationSourceOfflineProps[];
  // cropStages: MiscCropStageOfflineProps[];
  // cropTypes: CropTypeOfflineProps[];
  cropClassifications: CropClassificationOfflineProps[];
  // crops: CropOfflineProps[];
}

interface SubDivisionSurveyBlockProps {
  data: ICropFormV2SubDivisionSurveyForm;
  updateSurveyData: (data: ICropFormV2SubDivisionSurveyForm) => void;
  onDelete: () => void;
  previewMode: boolean;
  cropSeasonTypes: MiscCropSeasonTypeOfflineProps[];
}

export function SubDivisionSurveyBlock(props: SubDivisionSurveyBlockProps) {
  const ln = useDict();
  const [values, setValues] = useState<ICropFormV2SubDivisionSurveyForm>(
    props.data,
  );

  const [fieldOptions, setFieldOptions] = useState<{
    cropClassifications: CropClassificationOfflineProps[];
  }>({} as any);
  const handleFieldOptions =
    (key: keyof FieldOptions) => async (value: any) => {
      setFieldOptions(prevVal => {
        return {...prevVal, [key]: value};
      });
    };

  //? get crop classifications
  const getCropClassifications = useCallback(async (cropTypeId: string) => {
    await api.local.cropClassifications.read({
      callback: handleFieldOptions('cropClassifications'),
      cropTypeId: cropTypeId,
    });
  }, []);
  const handleInputChange =
    (key: keyof ICropFormV2SubDivisionSurveyForm) => (value: any) => {
      setValues(e => {
        return {...e, [key]: value};
      });
    };

  // useEffect(() => {
  //   getCropClassifications(values.cropSeasonType);
  // }, [values.cropSeasonType]);
  //
  // useEffect(() => {
  //   props.updateSurveyData(values)
  // }, [values]);
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
          onValueChange={handleInputChange('cropSeasonType')}>
          {props.cropSeasonTypes
            ? props.cropSeasonTypes
                .filter(e =>
                  AGRICULTURE_NO_USE_IDS.includes(e.cropSeasonTypeId),
                )
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
                    key={e.cropClassificationId}
                    value={e.cropClassificationId.toString()}
                    label={e.cropClassificationName}
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
