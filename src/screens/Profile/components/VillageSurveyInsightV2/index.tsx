import {Box, Icon, Pressable, Row, Text} from 'native-base';
import {navigation} from '../../../../routers/navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import React, {useEffect, useState} from 'react';
import useDict from '../../../../hooks/useDict';
import api from '../../../../api';
import {ISurveyStatusSummaryOfflineProps} from '../../../../@types';
import {useAuth} from '../../../../hooks';
import {asyncStorage} from '../../../../helpers/asyncStorage';

interface Props {
  villageName: string;
  villageCode: string;
  pending: {count: string; webView?: string; part?: string};
  completed: {count: string; webView?: string; part?: string};
}
const Index = ({village}: {village: Props}) => {
  const ln = useDict();
  const auth = useAuth();
  // const [onlineSurveyStatus, setOnlineSurveyStatus] = useState({
  // 	completed: 0, pending: 0,
  // });

  // console.log('>village ', village);

  const [status, setStatus] = useState<Props>();

  useEffect(() => {
    setStatus({
      villageName: village?.villageName,
      villageCode: village?.villageCode,
      completed: {
        count: village?.completed?.count,
        webView: village?.completed?.webView,
        part: village?.completed?.part,
      },
      pending: {
        count: village?.pending?.count,
        webView: village?.pending?.webView,
        part: village?.pending?.part,
      },
    });
  }, [village]);

  const [localSurveyStatus, setLocalSurveyStatus] = useState({
    completed: 0,
    pending: 0,
  });

  // const getOnlineSurveyStatus = async () => {
  // 	await api.local.surveyStats.insights({callback: setOnlineSurveyStatus, villageCode:village?.villageCode});
  // };
  const getLocalSurveyStatus = async () => {
    await api.local.cropSurvey.stats({
      callback: setLocalSurveyStatus,
      villageCode: village?.villageCode,
    });

    await asyncStorage
      .getObj('surveyStatusData')
      .then((data: ISurveyStatusSummaryOfflineProps[]) => {
        if (data) {
          const villageData = data.filter(
            v => v.villageCode === village?.villageCode,
          );
          const completed = villageData?.find(v => v.status === 'completed');
          const pending = villageData?.find(v => v.status === 'pending');
          if (villageData) {
            setStatus({
              completed: {
                count: Number(completed?.count || '0')?.toString(),
              },
              pending: {
                count: Number(pending?.count || '0')?.toString(),
              },

              villageCode: village?.villageCode,
              villageName: village?.villageName,
            } as any);
          }
        }
      });
  };

  useEffect(() => {
    // getOnlineSurveyStatus();
    if (auth?.appMode === 'offline') {
      getLocalSurveyStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Text fontSize={'sm'} fontWeight={'bold'}>
        {status?.villageName}
      </Text>

      <Box justifyContent={'center'} alignItems={'center'}>
        <Text bold>{ln('Total Surveys')}</Text>
        <Text bold fontSize={'lg'} color="blue.500">
          {parseInt(status?.completed?.count || '0', 10) +
            parseInt(status?.pending?.count || '0', 10)}
        </Text>
      </Box>

      <Row mx="2" my="2" space="2">
        <Pressable
          flex="1"
          justifyContent={'center'}
          alignItems={'center'}
          onPress={() => {
            navigation.navigate('WebView', {
              link: status?.completed?.webView,
              title: ' ',
            });
          }}>
          <Row space="2" alignItems={'center'} justifyContent={'center'}>
            <Icon color="muted.400" size="sm" as={MaterialIcons} name="cloud" />
            <Text bold>{ln('Synced')}</Text>
          </Row>

          <Text color="green.500" fontSize={'lg'}>
            {status?.completed?.count || '0'}
            {/* {auth.appMode === 'online'
              ? status?.completed?.count
              : Number(status?.completed?.count) +
                Number(localSurveyStatus?.completed)} */}
            {/* {onlineSurveyStatus?.completed} */}
          </Text>
          <Row alignItems={'center'} space="2">
            <Text color="muted.500">{ln('View')}</Text>
            <Icon
              size="sm"
              as={Ionicons}
              name="chevron-forward-circle-outline"
              color="muted.500"
            />
          </Row>
        </Pressable>
        <Pressable
          flex="1"
          justifyContent={'center'}
          alignItems={'center'}
          onPress={() => {
            navigation.navigate('WebView', {
              link: status?.pending?.webView,
              title: ' ',
            });
          }}>
          <Row space="2" alignItems={'center'} justifyContent={'center'}>
            <Icon color="muted.400" size="sm" as={MaterialIcons} name="cloud" />
            <Text bold>{ln('Pending')}</Text>
          </Row>
          <Text color="red.500" fontSize={'lg'}>
            {Number(status?.pending?.count) -
              Number(localSurveyStatus?.pending) || 0}
          </Text>
          <Row alignItems={'center'} space="2">
            <Text color="muted.500">{ln('View')}</Text>
            <Icon
              size="sm"
              as={Ionicons}
              name="chevron-forward-circle-outline"
              color="muted.500"
            />
          </Row>
        </Pressable>
      </Row>
      {/* {auth?.appMode === 'offline' && (
      )} */}
      <Row mx="2" my="2" space="2">
        <Pressable
          flex="1"
          justifyContent={'center'}
          alignItems={'center'}
          // onPress={() => {
          //   navigation.navigate('WebView', {
          //     link: status?.completed?.webView,
          //     title: ' ',
          //   });
          // }}
        >
          <Row space="2" alignItems={'center'} justifyContent={'center'}>
            <Icon
              color="muted.400"
              size="sm"
              as={MaterialIcons}
              name="smartphone"
            />
            <Text bold>{ln('Synced and On Device')}</Text>
          </Row>

          <Text color="green.500" fontSize={'lg'}>
            {localSurveyStatus?.completed}
            {/* {auth.appMode === 'online'
              ? status?.completed?.count
              : Number(status?.completed?.count) +
                Number(localSurveyStatus?.completed)} */}
            {/* {onlineSurveyStatus?.completed} */}
          </Text>
          {/* <Row alignItems={'center'} space="2">
              <Text color="muted.500">{ln('View')}</Text>
              <Icon
                size="sm"
                as={Ionicons}
                name="chevron-forward-circle-outline"
                color="muted.500"
              />
            </Row> */}
        </Pressable>
        <Pressable
          flex="1"
          justifyContent={'center'}
          alignItems={'center'}
          // onPress={() => {
          //   navigation.navigate('WebView', {
          //     link: status?.pending?.webView,
          //     title: ' ',
          //   });
          // }}
        >
          <Row space="2" alignItems={'center'} justifyContent={'center'}>
            <Icon
              color="muted.400"
              size="sm"
              as={MaterialIcons}
              name="smartphone"
            />
            <Text bold>{ln('Pending to sync')}</Text>
          </Row>
          <Text color="red.500" fontSize={'lg'}>
            {localSurveyStatus?.pending}
          </Text>
        </Pressable>
      </Row>
    </>
  );
};

export default Index;
