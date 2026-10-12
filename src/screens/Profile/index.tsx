import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  Icon,
  Image,
  Pressable,
  Row,
  ScrollView,
  Text,
  VStack,
} from 'native-base';
import { InterfacePressableProps } from 'native-base/lib/typescript/components/primitives/Pressable/types';
import { ColorType } from 'native-base/lib/typescript/components/types';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import {
  DownloadProgressStatus,
  IDeviceInfo,
  IDownloadStatus,
  IOfflineVillageDetail,
  ISurveyStatusSummaryOfflineProps,
  VillageDetail,
  VillagesAssignedData,
  WebLinkOnlineProps,
} from '../../@types';
import api from '../../api';
import config from '../../config';

import { useAuth, useStateContext } from '../../hooks';
import useDict from '../../hooks/useDict';
import { navigation } from '../../routers/navigation';
import * as Network from '@react-native-community/netinfo';

import { useIsFocused } from '@react-navigation/native';
// import * as Sharing from "expo-sharing";
// import logs from '../../helpers/logs';
import { VillageSurveyInsightV2 } from './components';
import { asyncStorage } from '../../helpers/asyncStorage';
import appUpdate from '../../helpers/appUpdate';
import offlineData from '../../handlers/offlineData';
import { ISurveyStatusOnlineProps } from '../../api/surveyStats/stats';
import { ICheckStatsData } from '../../@types/stats';


interface SettingsMenuProps {
  onPress: () => void;
  label: string;
  _pressed?: InterfacePressableProps;
  color?: ColorType;
  hideBottomBorder?: boolean;
  icon?: React.ReactNode;
  componentRight?: React.ReactNode;
}

const SettingsMenu = (props: SettingsMenuProps) => {
  const defaultPressed = {
    bg: 'gray.100',
  };
  return (
    <Box
      mt="1"
      {...(!props.hideBottomBorder && {
        borderBottomWidth: '1',
        borderBottomColor: 'gray.200',
      })}>
      <Pressable
        _pressed={{ ...defaultPressed, ...props._pressed }}
        p="2"
        onPress={props.onPress}>
        <Row my="1" alignItems={'center'}>
          {props.icon && (
            <Box mr="2" alignItems="center">
              {props.icon}
            </Box>
          )}

          <Text color={props.color || 'black'}>{props.label}</Text>
          {props.componentRight && (
            <Box ml="auto" alignItems="center">
              {props.componentRight}
            </Box>
          )}
        </Row>
      </Pressable>
    </Box>
  );
};

const Index = () => {
  const auth = useAuth();
  const ln = useDict();
  const [stats, setStats] = useState<ICheckStatsData>({} as ICheckStatsData);
  const isFocused = useIsFocused();

  const [deviceInfo, setDeviceInfo] = useState<IDeviceInfo>()
  const [offlineDataDownloadStatus, setOfflineDataDownloadStatus] = useState<
    'downloading' | 'downloaded' | null
  >(null);


  async function getStats() {
    await api.checkStats({ userId: auth.user.userId, deviceId: deviceInfo?.deviceId }).then((res) => {
      if (res)
        return setStats(res);
      return {} as ICheckStatsData;
    });
  }

  useEffect(() => {
    getStats();
  }, []);

  // const {BasicFunctions} = NativeModules;
  useEffect(() => {

    asyncStorage.getObj('deviceInfo').then(setDeviceInfo);

   // auth.checkDeveloperOptionEnabled();
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);


  useEffect(() => {
    if (!isFocused) return;
    appUpdate.checkAppBuildVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);


  const settingsMenus: SettingsMenuProps[] = [


    ...(auth?.user?.role?.toLocaleLowerCase() === 'dev'
      ? [
        {
          label: 'Developer Settings',
          icon: <Icon size="sm" as={MaterialIcons} name="developer-mode" />,
          onPress: () => {
            navigation.navigate('DeveloperSettings');
          },
        },
      ]
      : []),

    {
      label: ln('Logout'),
      onPress: auth.signOut,
      color: 'red.500',
      icon: <Icon size="sm" color="red.500" as={MaterialIcons} name="logout" />,
      _pressed: {
        bg: 'red.100',
      },
    },
  ];

  return (
    <Box flex="1">
      <ScrollView flex="1" p="2">
        <Row p="4" my="2" m="1" rounded="xl" alignItems={'center'} bg="white">
          <Box>
            <Image
              width={'16'}
              height={'16'}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png', // uri: `file:///storage/emulated/0/Android/data/org.tnega.cropsurvey/7357/3.png`,
              }}
              alt="user image"
            />
          </Box>

          <Box ml="8" px="2">
            <Row alignItems={'center'} flexWrap="wrap">
              <Text bold fontSize={'lg'}>
                {auth.user.userName}
              </Text>
              <Box
                justifyContent={'center'}
                py="1"
                px="2"
                ml="2"
                bg="primary.900"
                rounded={'full'}>
                <Text fontSize={'xs'} color="white" letterSpacing={'lg'}>
                  {auth.user.role}
                </Text>
              </Box>
            </Row>
            <Box>
              <Text fontSize={'sm'}>{auth.user.mobileNumber}</Text>
            </Box>
          </Box>
        </Row>

        {stats?.showStats && stats?.totalSurveys > 0 && (
          <Box
            // p="5"
            // m="3"
            // borderRadius="xl"
            // bg="blue.50"
            // borderWidth="1"

            p="4" bg="white" m="1" rounded="xl"
          >
            {/* FIXED TITLE */}
            <Text fontSize={'md'} bold mb={3}>
              {ln('Survey Overview')}
            </Text>

            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.700">
                  {ln('Total Surveys')}
                </Text>
                <Text fontSize="sm" bold>
                  {stats?.totalSurveys || 0}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.700">
                  {ln('Total Completed')}
                </Text>
                <Text fontSize="sm" bold>
                  {stats?.totalCompleted || 0}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.700">
                  {ln('Total Verified')}
                </Text>
                <Text fontSize="sm" bold>
                  {stats?.totalVerified || 0}
                </Text>
              </HStack>

              <Divider my="2" />

              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.700">
                  Completion
                </Text>
                <Text fontSize="sm" bold color="green.600">
                  {stats.completionPercentage || '0%'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.700">
                  Verified
                </Text>
                <Text fontSize="sm" bold color="purple.600">
                  {stats.verifiedPercentage || '0%'}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        <Box p="4" bg="white" m="1" rounded="xl">
          <Text fontSize={'md'} bold>
            {ln('Settings')}
          </Text>
          {settingsMenus?.map((menu, index) => (
            <SettingsMenu
              key={index}
              {...menu}
              hideBottomBorder={settingsMenus?.length === index + 1}
            />
          ))}
        </Box>
        <Center my="2">
          <Text color="gray.400" fontSize={'2xs'} isTruncated>
            {auth.deviceId}
          </Text>

          <Text color="gray.400" fontSize={'2xs'} isTruncated>
            {config.buildVersion}
            {config.env !== 'production'
              ? `(${config.env.toLocaleUpperCase()})`
              : ''}
          </Text>

          <Text color="gray.400" fontSize={'2xs'} isTruncated>
            Api Version - {config.api_url.split('/').pop()}
          </Text>
          <Text color="gray.400" fontSize={'2xs'} isTruncated>
            Device - {deviceInfo?.makeModel || 'Unknown Device'}
          </Text>
        </Center>
      </ScrollView>

      {offlineDataDownloadStatus === 'downloading' ? (
        <OfflineModeModal
          handleClose={() => {
            setOfflineDataDownloadStatus('downloaded');
          }}
        />
      ) : null}
    </Box>
  );
};

export default Index;

const icon = (status: DownloadProgressStatus) => {
  switch (status) {
    case 'completed':
      return <Icon size="lg" as={<Feather name="check" />} color="green.500" />;
    case 'pending':
      return (
        <Icon size="lg" as={<Feather name="clock" />} color="yellow.500" />
      );

    case 'downloading':
      return (
        <Icon
          size="lg"
          as={<Feather name="download-cloud" />}
          color="blue.500"
        />
      );
    case 'failed':
      return <Icon size="lg" as={<Feather name="x" />} color="red.500" />;
    case 'dataNotFound':
      return (
        <Icon
          size="lg"
          as={
            <MaterialCommunityIcons
              name="file-cancel-outline"
              size={24}
              color="black"
            />
          }
          color="red.500"
        />
      );
  }
};

interface OfflineModeModalProps {
  handleClose: () => void;
}
function OfflineModeModal(props: OfflineModeModalProps) {
  const auth = useAuth();
  // const state = useStateContext();
  const ln = useDict();
  const [isDownloading, setIsDownloading] = useState(true);

  const [downloadStatus, setDownloadStatus] = useState<IDownloadStatus>({
    // villageData: 'pending',
    cropMasterData: 'pending',
    miscData: 'pending',
    seasonData: 'pending',
    spatialData: 'pending',
    ownerData: 'pending',
    vectorTiles: 'pending',
  });

  function handleDownloadStatus(
    name: keyof IDownloadStatus,
    status: DownloadProgressStatus,
  ) {
    setDownloadStatus(prev => {
      const _value = {
        ...prev,
        [name]: status,
      };

      if (
        Object.values(_value)?.every(
          e => e === 'completed' || e === 'dataNotFound' || e === 'failed',
        )
      ) {
        setIsDownloading(false);
      }
      return _value;
    });
  }

  useEffect(() => {
    if (auth.offlineVillage?.villageCode) {
      offlineData.makeVillageDataOffline({
        user: auth.user,
        deviceId: auth.deviceId || '',
        villageCode: auth.offlineVillage?.villageCode as string,
        talukCode: auth.offlineVillage?.talukCode as string,
        districtCode: auth.offlineVillage?.districtCode as string,
        handleDownloadProgress: handleDownloadStatus,
      });
    }
    return () => { };
  }, [
    auth.deviceId,
    auth.offlineVillage?.districtCode,
    auth.offlineVillage?.talukCode,
    auth.offlineVillage?.villageCode,
    auth.user,
  ]);

  function handleClose() {
    auth.handleAppMode('offline');
    props.handleClose();
  }

  return (
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
        h="1/2"
        bg="white"
        w="5/6"
        shadow={'1'}
        // justifyContent="center"
        alignItems={'center'}
        overflow="hidden">
        <Box mt="4">
          <Text fontSize={'md'} bold>
            {ln('Downloading Offline Data')}
          </Text>
          <Text fontSize={'sm'} bold>
            Village : {auth.offlineVillage?.villageName}
          </Text>
        </Box>
        <Box width={'100%'} p="2">
          <Row mt="1" alignItems={'center'}>
            <Box flex={'1'}>
              <Text flex="1">{ln('Crop Master Data')}</Text>
            </Box>

            <Box>{icon(downloadStatus?.cropMasterData)}</Box>
          </Row>
          <Row mt="1" alignItems={'center'}>
            <Box flex={'1'}>
              <Text flex="1">{ln('Crop Master Data')}</Text>
            </Box>

            <Box>{icon(downloadStatus?.cropMasterData)}</Box>
          </Row>
          <Row mt="1" alignItems={'center'}>
            <Box flex={'1'}>
              <Text flex="1">{ln('Misc Data')}</Text>
            </Box>

            <Box>{icon(downloadStatus?.miscData)}</Box>
          </Row>

          <Row mt="1" alignItems={'center'}>
            <Box flex="1">
              <Text flex="1">{ln('Season Data')}</Text>
            </Box>

            <Box>{icon(downloadStatus?.seasonData)}</Box>
          </Row>

          <Row mt="1" alignItems={'center'}>
            <Box flex={'1'}>
              <Text flex="1">{ln('Owner Details')}</Text>
            </Box>

            <Box>{icon(downloadStatus?.ownerData)}</Box>
          </Row>
          <Row mt="1" alignItems={'center'}>
            <Box flex={'1'}>
              <Text flex="1">{ln('Vector Tiles')}</Text>
            </Box>

            <Box>{icon(downloadStatus?.vectorTiles)}</Box>
          </Row>
        </Box>
        <Box>
          {!isDownloading ? (
            <Button onPress={handleClose}>{ln('Okay')}</Button>
          ) : null}
        </Box>
      </Box>
    </Center>
  );
}
