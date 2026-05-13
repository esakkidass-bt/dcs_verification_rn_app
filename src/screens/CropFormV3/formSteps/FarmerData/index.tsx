import React, {useCallback, useEffect, useState} from 'react';
import {Box, Button, FlatList, Row, ScrollView, Text} from 'native-base';

import useDict from '../../../../hooks/useDict';
import {SubDivisionBlock} from './SubDivisionBlock';
import {ICropDataForm} from '../../type';
import {Alert, BackHandler} from 'react-native';
import {useStateContext} from '../../../../hooks';
import {LoadingOverlay} from '../../../../components';
import {
  CropClassificationOnlineProps,
  MiscCropSeasonTypeOnlineProps,
} from '../../../../@types';
import api from '../../../../api';
import {AGRICULTURE_NO_USE_IDS} from '../../../../const';

interface IFormState {
  subDivisionLoadedCount: number;
  currentPage: number;
  maxPage: number;
}

interface Props {
  onNext: (e: any) => void;
  onPrevious: () => void;
  cropData: ICropDataForm;
  closeLoader: (e: string, time?: number) => void;
  startLoading: () => void;
  isLoading: boolean;
  currentForm: 'farmerData' | 'cropData';
  cropClassifications: CropClassificationOnlineProps[];
}

function KeyValueLabel({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return value ? (
    <Box>
      <Box textAlign={'left'}>
        <Text bold fontSize={'sm'}>
          {label}
        </Text>
        <Text fontSize={'xs'} ml="2">
          {value}
        </Text>
      </Box>
    </Box>
  ) : null;
}

interface FieldOptions {
  cropClassifications: CropClassificationOnlineProps[];
  cropSeasonTypes: MiscCropSeasonTypeOnlineProps[];
}

export default function Index(props: Props) {
  const ln = useDict();
  const {selectedLocationData} = useStateContext();
  const [formState, setFormState] = useState<IFormState>({
    subDivisionLoadedCount: 0,
    currentPage: 0,
    maxPage: 0,
  });

  function handleFormState<K extends keyof IFormState>(
    key: K,
    value: IFormState[K],
  ) {
    setFormState(e => ({
      ...e,
      [key]: value,
    }));
  }

  const [formData, setFormData] = useState<any>();
  // function handleFormData<K extends keyof IFarmerDataForm>(key: keyof ICropDataForm, value: IFarmerDataForm[K]) {
  //   setFormData((prevVal: any) => ({
  //     ...prevVal, [key]: value
  //   }))
  // }
  const [fieldOptions, setFieldOptions] = useState<FieldOptions>({
    cropClassifications: props?.cropClassifications,
  } as FieldOptions);
  const handleFieldOptions = useCallback(
    <K extends keyof FieldOptions>(key: K) =>
      async (value: FieldOptions[K]) => {
        setFieldOptions(prevVal => {
          return {
            ...prevVal,
            [key]: value,
          };
        });
      },
    [],
  );

  const [chunckedSubDivisions, setChunckedSubDivisions] = useState<string[]>(
    [],
  );

  // function nextPage(){
  //   handleFormState('currentPage', formState.currentPage+1)
  // }
  // function prevPage(){
  //   if(formState.currentPage>0){
  //   handleFormState('currentPage', formState.currentPage-1)
  //   }else{
  //     props.onPrevious()
  //   }
  // }

  function handlePrevious() {
    props.onPrevious();
  }

  function handleNext() {
    console.log('formData', formData);
    const nullableValues = Object.values(formData).map(
      (e: any) => e.cultivatorId,
    );
    if (nullableValues.includes(null) || nullableValues.includes(undefined)) {
      Alert.alert('Warning', 'Please select the cultivator / owner');
    } else {
      props.onNext(formData);
    }
  }

  function backAction() {
    props.onPrevious();
    return true;
  }

  function splitArrayIntoChunks(array: any[], chunkSize: number) {
    const resultArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      resultArray.push(chunk);
    }
    return resultArray;
  }

  useEffect(() => {
    splitArrayIntoChunks(props.cropData.selectedSubDivisionNumbers, 5);
    props.closeLoader('farmer dta');

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  return (
    <Box flex="1">
      {props?.isLoading ? <LoadingOverlay isLoading={props.isLoading} /> : null}

      <ScrollView>
        <Box m={'2'} bg={'white'} py={'4'} px={'4'} borderRadius={'xl'}>
          <Box my="1">
            <Text bold fontSize={'md'} color={'primary.900'}>
              Crop Detail
            </Text>
          </Box>

          <KeyValueLabel
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
          />
        </Box>
        <FlatList
          data={props.cropData?.selectedSubDivisionNumbers}
          renderItem={({item: e}) => {
            return (
              <Box>
                <SubDivisionBlock
                  onChange={value => {
                    setFormData((prevVal: any) => ({
                      ...prevVal,
                      [value.subDivisionNumber]: value,
                    }));
                  }}
                  cropData={props.cropData}
                  subDivisionNumber={e}
                />
              </Box>
            );
          }}
          keyExtractor={item => item.toString()}
        />

        {/*{props.cropData?.selectedSubDivisionNumbers?.map((subDivision, idx) =>*/}
        {/*  <Box*/}
        {/*    key={idx}*/}
        {/*  >*/}
        {/*    /!*<SubDivisionBlockV2 *!/*/}
        {/*    /!*  cropData={props.cropData}*!/*/}
        {/*    /!*  subDivisionNumber={subDivision}/>*!/*/}
        {/*  <SubDivisionBlock*/}
        {/*   onChange={value=>{*/}
        {/*     setFormData((prevVal:any) => ({*/}
        {/*       ...prevVal,*/}
        {/*       [value.subDivisionNumber]:value*/}
        {/*     }));*/}
        {/*   }}*/}
        {/*    cropData={props.cropData}*/}
        {/*    subDivisionNumber={subDivision}*/}
        {/*  />*/}
        {/*  </Box>*/}
        {/*  )}*/}
        <Row space={'2'} p={'2'}>
          <Button flex={'1'} onPress={handlePrevious}>
            {ln('Previous')}
          </Button>
          <Button flex={'1'} onPress={handleNext}>
            {ln('Save')}
          </Button>
        </Row>
      </ScrollView>
    </Box>
  );
}
