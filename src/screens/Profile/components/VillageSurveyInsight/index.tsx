import {Box, Icon, Pressable, Row, Text} from 'native-base';
import {navigation} from '../../../../routers/navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import React, {useEffect, useState} from 'react';
import useDict from '../../../../hooks/useDict';
import api from '../../../../api';
import {VillageOfflineProps} from '../../../../@types';
import {useIsFocused} from '@react-navigation/native';

const Index = ({
  village,
}: {
  village: {
    villageCode: string;
    villageName: string;
  };
}) => {
  const isFocused = useIsFocused();

  const ln = useDict();
  const [onlineSurveyStatus, setOnlineSurveyStatus] = useState({
    completed: 0,
    pending: 0,
  });
  const [localSurveyStatus, setLocalSurveyStatus] = useState({
    completed: 0,
    pending: 0,
  });

  // const getOnlineSurveyStatus = async () => {
  //   await api.local.surveyStats.insights({
  //     callback: setOnlineSurveyStatus,
  //     villageCode: village?.villageCode,
  //   });
  // };
  const getLocalSurveyStatus = async () => {
    await api.local.cropSurvey.stats({
      callback: setLocalSurveyStatus,
      villageCode: village?.villageCode,
    });
  };

  useEffect(() => {
    if (!isFocused) return;
    getOnlineSurveyStatus();
    getLocalSurveyStatus();
  }, [isFocused]);

  return (
    <>
      <Text fontSize={'sm'} fontWeight={'bold'}>
        {village.villageName}
      </Text>

      <Box justifyContent={'center'} alignItems={'center'}>
        <Text bold>{ln('Total Surveys')}</Text>
        <Text bold fontSize={'lg'} color="blue.500">
          {onlineSurveyStatus.completed + onlineSurveyStatus.pending}
        </Text>
      </Box>

      <Row mx="2" my="2" space="2">
        <Pressable
          flex="1"
          justifyContent={'center'}
          alignItems={'center'}
          onPress={() =>
            navigation.navigate('SurveyList', {
              surveyStatus: 'completed',
              village,
            })
          }>
          <Row space="2" alignItems={'center'} justifyContent={'center'}>
            <Icon color="muted.400" size="sm" as={MaterialIcons} name="cloud" />
            <Text bold>{ln('Synced')}</Text>
          </Row>

          <Text color="green.500" fontSize={'lg'}>
            {onlineSurveyStatus.completed || onlineSurveyStatus.completed === 0
              ? onlineSurveyStatus.completed + localSurveyStatus.completed
              : 0}
            {/* {onlineSurveyStatus.completed} */}
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
          onPress={() =>
            navigation.navigate('SurveyList', {
              surveyStatus: 'pending',
              village,
            })
          }>
          <Row space="2" alignItems={'center'} justifyContent={'center'}>
            <Icon color="muted.400" size="sm" as={MaterialIcons} name="cloud" />
            <Text bold>{ln('Pending')}</Text>
          </Row>
          <Text color="red.500" fontSize={'lg'}>
            {onlineSurveyStatus.pending || onlineSurveyStatus.pending === 0
              ? onlineSurveyStatus.pending - localSurveyStatus.completed
              : 0}
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
      <Row mx="2" mt="2" space="2">
        {/*<Pressable*/}
        {/*  flex="1"*/}
        {/*  justifyContent={"center"}*/}
        {/*  alignItems={"center"}*/}
        {/*  // onPress={()=>navigation.navigate('SurveyStatusTab',{tabName:'CompletedSurvey'})}*/}
        {/*>*/}
        {/*  <Text bold>{ln("Sync Completed")}</Text>*/}
        {/*  <Text color="green.500" fontSize={"lg"}>*/}
        {/*    {localSurveyStatus.completed}*/}
        {/*  </Text>*/}
        {/* <Row alignItems={"center"} space="2">
                <Text color="muted.500">View</Text>
                <Icon
                  size="sm"
                  as={Ionicons}
                  name="chevron-forward-circle-outline"
                  color="muted.500"
                />
              </Row> */}
        {/*</Pressable>*/}
        <Pressable
          flex="1"
          justifyContent={'center'}
          alignItems={'center'}
          // onPress={()=>navigation.navigate('SurveyStatusTab',{tabName:'ManualSyncSurvey'})}
        >
          <Text bold>{ln('Pending to sync')}</Text>
          <Text color="red.500" fontSize={'lg'}>
            {localSurveyStatus.pending}
          </Text>
          {/* <Row alignItems={"center"} space="2">
                <Text color="muted.500">View</Text>
                <Icon
                  size="sm"
                  as={Ionicons}
                  name="chevron-forward-circle-outline"
                  color="muted.500"
                />
              </Row> */}
        </Pressable>
      </Row>
    </>
  );
};

export default Index;
