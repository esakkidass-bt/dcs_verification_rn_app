import {Box, Button, Center, Text} from 'native-base';
import * as Progress from 'react-native-progress';
import {useEffect, useState} from 'react';
import api from '../../api';
import {useAuth} from '../../hooks';
import {Alert} from 'react-native';
import logs from '../../helpers/logs';

interface Props {
  show?: boolean;
  enableElapsedTime?: boolean;
  onCancel: () => void;
  onComplete: () => void;
  surveyRecordIds: string[];
}

interface ICopmStateProps {
  isUploading: boolean;
  completedCount: number;
  successCount: number;
  failureCount: number;
}

const initialState = {
  isUploading: false,
  completedCount: 0,
  successCount: 0,
  failureCount: 0,
  startedAt: new Date().toLocaleTimeString(),
};

const useUploadSurveys = (props: Props) => {
  const auth = useAuth();
  const [compState, setCompState] = useState(initialState);

  const increaseCount = (key: 'successCount' | 'failureCount') => {
    setCompState(prevState => ({
      ...prevState,
      completedCount: prevState.completedCount + 1,
      [key]: prevState[key] + 1,
    }));
  };

  const handleCompState = <T extends keyof ICopmStateProps>(
    key: T,
    value: ICopmStateProps[T],
  ) => {
    setCompState(prevState => ({...prevState, [key]: value}));
  };

  const uploadSurvey = async (surveyId: string) => {
    let response: [number, any] = [200, null];
    await api.cropSurvey.uploadSurvey({
      surveyId,
      userId: auth.user.userId,
      deviceId: auth.deviceId || '',
      onUpdateSuccess: () => increaseCount('successCount'),
      onUpdateFail: err => {
        if (err) response = err;
        console.debug('upload survey failed for > ', surveyId);
        increaseCount('failureCount');
      },
    });
    return response;
  };

  async function handleUpload() {
    await logs.clearLogFile('uploadSurvey');
    await api.cropSurvey.uploadSurveyImage({
      userId: auth.user.userId,
      deviceId: auth.deviceId || '',
      surveyIds: props.surveyRecordIds,
      onImageUploadSuccess: async ([statusCode, data]) => {
        await uploadSurveyIds(data.ids);
      },
      onImageUploadFailure: async ([statusCode, data]) => {
        console.error('>', data);
      },
    });
  }

  const uploadSurveyIds = async (surveyRecordIds: any[]) => {
    await logs.writeLogToFile({
      message: `
      Survey ids: ${surveyRecordIds?.join(', ')}
      total records: ${surveyRecordIds?.length}
      ________________________________________________________________
      `,
      _fileName: 'uploadSurvey',
    });
    for (let i = 0; i < surveyRecordIds.length; i++) {
      const [status, res] = await uploadSurvey(surveyRecordIds[i]);
      if ([404, 409].includes(status)) {
        Alert.alert('Warning!', `${res} - ${status}`);
        // break;
      } else if ([502, 503, 504].includes(status)) {
        Alert.alert(
          'Error!',
          `${
            res ||
            'Something went wrong on our side. Please try again after sometime'
          } - ${status}`,
        );
        // break;
      } else {
      }
    }
    handleCompState('isUploading', false);
  };

  useEffect(() => {
    handleCompState('isUploading', true);
    handleUpload();
    return () => handleCompState('isUploading', false);
  }, []);

  return {compState, closeModal: handleCompState};
};

const Index = (props: Props) => {
  const {compState, closeModal} = useUploadSurveys(props);

  const handleModel = (status: 'success' | 'cancel') => {
    if (status === 'cancel') {
      props?.onCancel();
    } else if (status === 'success') {
      props.onComplete();
    }
  };

  return props.show ? (
    <Center
      zIndex={10}
      top="0"
      left={0}
      right={0}
      bottom={0}
      position={'absolute'}
      justifyContent="center"
      bg="rgba(0,0,0,0.5)">
      <Box
        h="1/4"
        bg="white"
        w="5/6"
        shadow={'1'}
        justifyContent="center"
        alignItems={'center'}
        overflow="hidden">
        <Box style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text bold fontSize={'md'}>
            Uploading Records
          </Text>
          <Text>{`Uploaded: ${compState.completedCount} / ${props.surveyRecordIds.length}`}</Text>
          <Text>{`Success: ${compState.successCount} / Failure: ${compState.failureCount}`}</Text>
          <Progress.Bar
            progress={compState.completedCount / props.surveyRecordIds?.length}
            width={200}
          />
          <Box mt={'1'}>
            <Text color={'muted.400'}>
              Upload started at {compState.startedAt}
            </Text>
          </Box>
          {compState.failureCount > 0 && (
            <Box mt={'1'}>
              <Text color={'danger.600'}>
                Some of the records are not synced, but they have been stored
                locally. Please try to sync again later.
              </Text>
            </Box>
          )}
          {compState.isUploading ? (
            <Text>Uploading...</Text>
          ) : (
            <Button my={'2'} onPress={() => handleModel('success')}>
              Okay
            </Button>
          )}
        </Box>
      </Box>
    </Center>
  ) : null;
};

export default Index;
