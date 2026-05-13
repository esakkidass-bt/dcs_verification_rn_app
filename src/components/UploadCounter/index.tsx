import {Box, Button, Center, Text} from 'native-base';
import * as Progress from 'react-native-progress';
import {useEffect, useState} from 'react';
import api from '../../api';
import {useAuth} from '../../hooks';
import {Alert} from 'react-native';
import logs from '../../helpers/logs';
import useDict from '../../hooks/useDict';

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

  async function handleUpload() {
    await logs.clearLogFile('uploadSurvey');
    await api.cropSurvey.uploadSurveyImage({
      userId: auth.user.userId,
      deviceId: auth.deviceId || '',
      surveyIds: props.surveyRecordIds,
      onImageUploadSuccess: async ([, data]) => {
        await logs.writeLogToFile({
          message: `
          image uploaded for - ${JSON.stringify(data)}
          `,
          _fileName: 'uploadSurvey',
        });
        await uploadSurveyIds(data.ids);
      },
      onImageUploadFailure: async ([, data]) => {
        console.error('>', data);
        for (let _ in data?.ids) {
          increaseCount('failureCount');
        }
        await logs.writeLogToFile({
          message: `
          Failed to upload image for - ${JSON.stringify(data)}
          `,
          _fileName: 'uploadSurvey',
        });
      },
    });
  }

  const handleSurveyUploadLog = async (
    status: number,
    res: string,
    surveyId: string,
  ) => {
    if ([404, 409].includes(status)) {
      Alert.alert('Warning!', `${res} - ${status}`);
      await logs.writeLogToFile({
        message: `
          Warning - (${surveyId}), ${res} - ${status}
          `,
        _fileName: 'uploadSurvey',
      });
      // break;
    } else if ([502, 503, 504].includes(status)) {
      Alert.alert(
        'Error!',
        `${
          res ||
          'Something went wrong on our side. Please try again after sometime'
        } - ${status}`,
      );
      await logs.writeLogToFile({
        message: `
        Error - (${surveyId}),
        ${
          res ||
          'Something went wrong on our side. Please try again after sometime'
        } - ${status}
          `,
        _fileName: 'uploadSurvey',
      });
      // break;
    } else {
      await logs.writeLogToFile({
        message: `
          Log - (${surveyId})
          ${res} - ${status}
          ----
          `,
        _fileName: 'uploadSurvey',
      });
    }
  };

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
      await api.cropSurvey.uploadSurvey({
        surveyId: surveyRecordIds[i],
        userId: auth.user.userId,
        deviceId: auth.deviceId || '',
        onUpdateSuccess: () => increaseCount('successCount'),
        onUpdateFail: async ([status, res]) => {
          await handleSurveyUploadLog(status, res, surveyRecordIds[i]);
          console.debug('upload survey failed for > ', surveyRecordIds[i]);
          await logs.writeLogToFile({
            message: `
            upload survey failed for > ${surveyRecordIds[i]}
            response : ${res},
            status :  ${status}
            `,
            _fileName: 'uploadSurvey',
          });
          increaseCount('failureCount');
        },
      });

      // await uploadSurvey(surveyRecordIds[i]).then(async ([status, res]) => {
      //   if ([404, 409].includes(status)) {
      //     Alert.alert("Warning!", `${res} - ${status}`);
      //     await logs.writeLogToFile({
      //       message: `
      //       Warning - (${surveyRecordIds[i]}), ${res} - ${status}
      //       `,
      //       _fileName: "uploadSurvey",
      //     });
      //     // break;
      //   } else if ([502, 503, 504].includes(status)) {
      //     Alert.alert(
      //       "Error!",
      //       `${res || "Something went wrong on our side. Please try again after sometime"} - ${status}`,
      //     );
      //     await logs.writeLogToFile({
      //       message: `
      //     Error - (${surveyRecordIds[i]}),
      //     ${res || "Something went wrong on our side. Please try again after sometime"} - ${status}
      //       `,
      //       _fileName: "uploadSurvey",
      //     });
      //     // break;
      //   } else {
      //     await logs.writeLogToFile({
      //       message: `
      //       Log - (${surveyRecordIds[i]})
      //       ${res} - ${status}
      //       ----
      //       `,
      //       _fileName: "uploadSurvey",
      //     });
      //   }
      // });
    }
    handleCompState('isUploading', false);
  };

  useEffect(() => {
    handleCompState('isUploading', true);
    handleUpload();
    return () => handleCompState('isUploading', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {compState, closeModal: handleCompState};
};

const Index = (props: Props) => {
  const {compState} = useUploadSurveys(props);

  const handleModel = (status: 'success' | 'cancel') => {
    if (status === 'cancel') {
      props?.onCancel();
    } else if (status === 'success') {
      props.onComplete();
    }
  };

  const ln = useDict();
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
        h="1/3"
        bg="white"
        w="5/6"
        shadow={'1'}
        justifyContent="center"
        alignItems={'center'}
        overflow="hidden">
        <Box style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text bold fontSize={'md'}>
            {ln('Uploading Records')}
          </Text>
          <Text>{`${ln('Uploaded')}: ${compState.completedCount} / ${
            props.surveyRecordIds.length
          }`}</Text>
          <Text>{`${ln('Success')}: ${compState.successCount} / ${ln(
            'Failure',
          )}: ${compState.failureCount}`}</Text>
          <Progress.Bar
            progress={compState.completedCount / props.surveyRecordIds?.length}
            width={200}
          />
          <Box mt={'1'}>
            <Text color={'muted.400'}>
              {ln('Upload started at')} {compState.startedAt}
            </Text>
          </Box>
          {compState.failureCount > 0 && (
            <Box mt={'1'}>
              <Text color={'danger.600'}>
                {ln(
                  'Some of the records are not synced, but they have been stored locally. Please try to sync again later.',
                )}
              </Text>
            </Box>
          )}
          {compState.completedCount >= props.surveyRecordIds.length ? (
            <Button my={'2'} onPress={() => handleModel('success')}>
              {ln('Okay')}
            </Button>
          ) : (
            <Text>{ln('Uploading')}...</Text>
          )}
        </Box>
      </Box>
    </Center>
  ) : null;
};

export default Index;
