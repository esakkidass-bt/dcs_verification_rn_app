import {Box, Button, Row, Text} from 'native-base';
import React from 'react';
import FA5I from 'react-native-vector-icons/FontAwesome5';
// import api from '../../../api';
import {ICropSurveyOfflineProps} from '../../../@types/form';
import {Alert} from 'react-native';
import useDict from '../../../hooks/useDict';

interface ManualSyncCardProps {
  surveyData: ICropSurveyOfflineProps;
  // onSelect?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onSync?: () => void;
  // isSelected?: boolean;
  isSyncBtnDisabled?: boolean;
}

const DataRow = (props: {label: string; value: string | number}) => (
  <Row flex="1" space="1" my="1">
    <Text bold fontSize={'sm'}>
      {props.label}
    </Text>
    <Text isTruncated flex="1" fontSize={'sm'}>
      {props.value}
    </Text>
  </Row>
);

const Index = ({surveyData, ...props}: ManualSyncCardProps) => {
  const ln = useDict();
  const handleDelete = async () => {
    Alert.alert(
      'Delete',
      ln('Are you sure you want to delete this survey?'),
      [
        {
          text: ln('Cancel'),
          style: 'cancel',
        },
        {
          text: ln('Delete'),
          onPress: async () => {
            props.onDelete?.();
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <Box>
      <Box my="2" p="4" bg="#f9fbf9" borderRadius={'xl'}>
        <DataRow label={ln('Farmer Name')} value={surveyData.cultivatorName} />
        <Row>
          <DataRow label={ln('Survey No')} value={surveyData.surveyNumber} />
          <DataRow label={ln('Crop Name')} value={surveyData.cropNameId} />
        </Row>
        <Row>
          {/* <DataRow label={ln('Crop Stage')} value={surveyData.cropStage} /> */}
          <DataRow label={ln('Area')} value={surveyData.cropLandExtent} />
        </Row>

        <Row space="3" flexWrap={'wrap'}>
          <Row alignItems={'center'} space="2">
            {/* <Checkbox
              accessibilityLabel="Select"
              value=""
              isChecked={props.isSelected}
              onChange={props.onSelect}
              isDisabled={surveyData.isSyncEnabled == 0 }
            /> */}
            <Button
              bg="blue.600"
              onPress={props.onSync}
              isDisabled={surveyData.isSyncEnabled == 0}>
              <Row alignItems={'center'} space="2">
                <FA5I name="sync-alt" color="white" />
                <Text color={'white'}>{ln('Sync')}</Text>
              </Row>
            </Button>
          </Row>
          {/* <Button>
            <Row alignItems={"center"} space="2">
              <FA5I name="eye" color="white" />
              <Text color={"white"}>View</Text>
            </Row>
          </Button> */}
          <Button bg="red.600" onPress={handleDelete}>
            <Row alignItems={'center'} space="2">
              <FA5I name="trash" color="white" />
              <Text color={'white'}>{ln('Delete')}</Text>
            </Row>
          </Button>
        </Row>
      </Box>
    </Box>
  );
};

export default Index;
