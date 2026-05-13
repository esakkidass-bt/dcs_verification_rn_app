import {Box, Image, Pressable, Row, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import useDict from '../../../hooks/useDict';
import {colors} from '../../../styles';
import {useAuth} from '../../../hooks';

interface CardProps {
  surveyData: any;
}

const ESCAPE_VALUES: any[] = ['', 'undefined', undefined, null, 'null'];

const DataRow = (props: {
  label: string;
  value: string | number;
  showNullValues?: boolean;
}) =>
  ESCAPE_VALUES?.includes(props.value) ? null : (
    <Row flex="1" space="1" my="1">
      <Text bold fontSize={'xs'}>
        {props.label}
      </Text>
      <Text isTruncated flex="1" fontSize={'xs'}>
        {props.value}
      </Text>
    </Row>
  );

interface ICardStateProps {
  isExpanded: boolean;
  talukName?: string;
  districtName?: string;
}

const Index = ({surveyData}: CardProps) => {
  const ln = useDict();
  const auth = useAuth();
  const [cardState, setCardState] = useState<ICardStateProps>({
    isExpanded: false,
    talukName: '',
    districtName: '',
  });

  function toggleCard() {
    setCardState({...cardState, isExpanded: !cardState.isExpanded});
  }

  useEffect(() => {
    const village = auth.user.assignedVillages.find(
      village => village?.villageCode === surveyData?.villageCode,
    );
    setCardState({
      ...cardState,
      talukName: village?.talukName || '',
      districtName: village?.districtName || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyData]);

  return (
    <Box m="2" p="4" py={'2'} bg="#f9fbf9" borderRadius={'xl'}>
      <DataRow label={ln('Farmer Name')} value={surveyData?.cultivatorName} />

      <Row>
        <DataRow
          label={ln('Survey No')}
          value={`${surveyData.surveyNumber}/${surveyData.subDivisionNumber}`}
          // value={`${surveyData.surveyNumber}/${surveyData.subDivisionNumber}, ${surveyData.villageName}`}
        />
      </Row>
      <Row>
        <DataRow label={ln('ID')} value={`${surveyData?.id}`} />
      </Row>

      {/*? Hidden card*/}
      <Box display={cardState.isExpanded ? 'flex' : 'none'}>
        <Row>
          <DataRow label={ln('Crop Stage')} value={surveyData?.cropStage} />
        </Row>
        <Row>
          <DataRow
            label={ln('Taluk')}
            value={`${cardState.talukName}, ${cardState.districtName}`}
          />
        </Row>

        <DataRow
          label={ln('Crop Season Type')}
          value={surveyData?.cropSeasonTypeName}
        />
        <DataRow
          label={ln('Cropping Method')}
          value={surveyData?.croppingMethodName}
        />
        <DataRow label={ln('Theervai')} value={surveyData?.theervai} />
        <DataRow
          label={ln('Orupoga/Irupoga Nanjai')}
          value={surveyData?.orupogaIrupogaNanjai}
        />
        <DataRow label={ln('Crop Age')} value={surveyData?.cropAge} />
        <DataRow
          label={ln('Tentative Harvest Month')}
          value={surveyData?.expectedHarvestDate}
        />
        <DataRow
          label={ln('Tentative Tentative Sown Month')}
          value={surveyData?.sownDate}
        />
        <DataRow label={ln('Form Type')} value={surveyData?.formType || ''} />
        <DataRow
          label={ln('App Version')}
          value={surveyData?.appVersion || ''}
        />
        <DataRow
          label={ln('GPS Accuracy')}
          value={surveyData?.gpsAccuracy || ''}
        />
        <DataRow
          label={ln('Image Sync Status')}
          value={surveyData?.imageSyncStatus || ''}
        />
        {/* <DataRow label={ln('Id')} value={surveyData?.id} /> */}
        {/* <DataRow label={ln('Survey Id')} value={surveyData?.cropSurveyId} /> */}

        {/**/}
        <Box flex="1" alignItems={'flex-end'}>
          <Text
            fontSize={'xs'}
            color={
              surveyData?.syncStatus === 'completed' ? 'primary.600' : 'red.600'
            }>
            {ln(surveyData?.syncStatus)}
          </Text>
        </Box>

        {/*image*/}
        <Image h="24" source={{uri: surveyData?.image}} alt="Survey Image" />
      </Box>

      <Pressable onPress={toggleCard} flex="1" alignItems={'flex-end'} p={'2'}>
        <Row flex="1" alignItems={'center'}>
          <Text color={colors.secondary['600']}>
            {!cardState.isExpanded ? ln('Show More') : ln('Show Less')}
          </Text>
        </Row>
      </Pressable>
    </Box>
  );
};

export default Index;
