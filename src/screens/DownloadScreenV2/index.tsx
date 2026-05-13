// import {
//   Box,
//   Button,
//   Center,
//   Icon,
//   Row,
//   Text,
//   Image,
//   ScrollView,
//   Spinner,
// } from 'native-base';
// // import React, { useEffect, useState } from "react";
// // import api from "../../api";
// // import appIcon from "../../assets/icon.png";
// // import { useAppDataDownload, useAuth, useStateContext } from "../../hooks";
// // import { Feather } from "@expo/vector-icons";
// import useDict from '../../hooks/useDict';
// import {IProgressProps} from 'native-base/lib/typescript/components/composites';
// import {BottomTabBar} from '@react-navigation/bottom-tabs';

// const Index = () => {
//   const {user, deviceId, setAuthStatus} = useAuth();
//   const ln = useDict();
//   const [otherData, setOtherData] = useState({
//     lastRefreshInitiatedTime: null,
//   });
//   const handleOtherDataChange = (key: string) => (value: string) => {
//     setOtherData(prevVal => {
//       return {...prevVal, [key]: value};
//     });
//   };
//   const appData = useAppDataDownload({
//     deviceId: deviceId || '',
//   });
//   const handleContinue = () => {
//     // navigation.navigate("Home");
//     api.local.metaData.store({
//       name: 'isDataDownloaded',
//       value: '1',
//     });
//     setAuthStatus('authenticated');
//   };

//   const [isBtnDisabled, setIsBtnDisabled] = useState(true);
//   const [isAnythingFailed, setIsAnythingFailed] = useState(false);
//   const [isAnythingPending, setIsAnythingPending] = useState(true);

//   const downloadData = async () => {
//     api.local.metaData.store({
//       name: 'lastRefreshInitiatedTime',
//       value: Date.now().toString(),
//     });

//     setIsAnythingFailed(false);
//     setIsAnythingPending(true);
//     await appData.setDownloadStatus('downloading');
//     await appData
//       .download({user})
//       .then(() =>
//         appData.setDownloadStatus(e =>
//           e !== 'failed' ? 'downloaded' : 'failed',
//         ),
//       );
//   };

//   useEffect(() => {
//     api.local.metaData.read({
//       key: 'lastRefreshInitiatedTime',
//       callback: e => {
//         console.log(e);
//         handleOtherDataChange('lastRefreshInitiatedTime')(e);
//       },
//     });
//     api.local.metaData.store({
//       name: 'isDataDownloaded',
//       value: '0',
//     });
//     downloadData();
//   }, []);

//   // useEffect(() => {
//   //   const isDownloadComplete = downloadProgress.every(
//   //     (item) => item.status === "completed"
//   //   );
//   //   if (isDownloadComplete) {
//   //     setIsBtnDisabled(false);
//   //   }
//   // }, [downloadProgress]);

//   const ProgressItem = ({data, type}: any) => {
//     const icon = (status: string) => {
//       switch (status) {
//         case 'completed':
//           return (
//             <Icon size="lg" as={<Feather name="check" />} color="green.500" />
//           );
//         case 'pending':
//           return (
//             <Icon size="lg" as={<Feather name="clock" />} color="yellow.500" />
//           );
//         case 'failed':
//           return <Icon size="lg" as={<Feather name="x" />} color="red.500" />;
//       }
//     };
//     const render = () => {
//       switch (type) {
//         case 'other':
//           return (
//             <Row mt="1" alignItems={'center'}>
//               <Text flex="2">{ln(data.label)}</Text>
//               <Box>{icon(data.status)}</Box>
//             </Row>
//           );
//         case 'village':
//           return (
//             <Box mt="2" w="full">
//               <Text bold fontSize={'md'}>
//                 {ln('Village')}
//               </Text>
//               <Box>
//                 {Object?.entries(data || {})?.map(
//                   ([villageCode, value]: any, i: any) => (
//                     <Box key={i}>
//                       <Text flex="2" fontSize={'sm'} fontWeight={'bold'}>
//                         {value.villageName}
//                       </Text>

//                       <Row mt="1" alignItems={'center'}>
//                         <Text flex="1">{ln('FMB Data')}</Text>

//                         <Box>{icon(value?.fmbStatus)}</Box>
//                       </Row>
//                       <Row mt="1" alignItems={'center'}>
//                         <Text flex="1">{ln('Vector Tiles')}</Text>
//                         <Box>{icon(value?.vectorTileStatus)}</Box>
//                       </Row>
//                     </Box>
//                   ),
//                 )}
//               </Box>
//             </Box>
//           );
//       }
//     };
//     return <>{render()}</>;
//   };

//   // sort array alphabetically
//   const compare = (a: any, b: any) => {
//     if (a[0] < b[0]) {
//       return -1;
//     }
//     if (a[0] > b[0]) {
//       return 1;
//     }
//     return 0;
//   };

//   const validateVillage = (villageData: any) => {
//     const village = Object.entries(villageData).find(
//       (item: any) => item[1].fmbStatus === 'completed',
//     );
//     if (village) {
//       return true;
//     }
//     return false;
//   };

//   const checkFailedApi = async () => {
//     const {villageData, ...otherData} = appData.progress;
//     return (
//       Object.values(otherData).some((item: any) => item.status === 'failed') ||
//       Object.values(villageData).some((e: any) => e.fmbStatus === 'failed') ||
//       Object.values(villageData).some(e => e.vectorTileStatus === 'failed')
//     );
//   };

//   const checkForPendingApi = async () => {
//     const {villageData, ...otherData} = appData.progress;

//     return (
//       Object.values(otherData).some((item: any) => item.status === 'pending') ||
//       Object.values(villageData).some((e: any) => e.fmbStatus === 'pending') ||
//       Object.values(villageData).some(e => e.vectorTileStatus === 'pending')
//     );
//   };

//   const validate = async () => {
//     const {villageData, ...otherData} = appData.progress;
//     setIsAnythingFailed(await checkFailedApi());
//     setIsAnythingPending(await checkForPendingApi());
//     const isValid =
//       Object.values(villageData).every(e => e.fmbStatus !== 'pending') &&
//       Object.values(villageData).every(e => e.vectorTileStatus !== 'pending') &&
//       validateVillage(villageData) &&
//       Object.values(otherData).every(
//         (item: any) => item.status === 'completed' && item.status !== 'pending',
//       );
//     return isValid;
//   };

//   useEffect(() => {
//     setIsBtnDisabled(!validate());
//   }, [appData.progress]);

//   const bottomBar = () => {
//     if (isAnythingPending) {
//       return (
//         <Box>
//           <Spinner />
//           <Text fontSize={'sm'} my="2" mx="4" textAlign={'center'}>
//             {ln('Please wait while we load & prepare your datasets')}
//           </Text>
//         </Box>
//       );
//     } else if (isAnythingFailed) {
//       return (
//         <>
//           <Text>{ln('Download Failed')}</Text>
//           <Button
//             onPress={downloadData}
//             bg="secondary.900"
//             rightIcon={
//               <Icon
//                 size="sm"
//                 as={<Feather name="refresh-cw" />}
//                 color="white"
//               />
//             }>
//             {ln('Refresh Data')}
//           </Button>
//         </>
//       );
//     } else {
//       return (
//         <>
//           <Text fontSize={'sm'} my="2" mx="4" textAlign={'center'}>
//             {ln('Data loaded, please proceed for survey')}
//           </Text>
//           <Row space="2">
//             <Button
//               onPress={downloadData}
//               bg="secondary.900"
//               rightIcon={
//                 <Icon
//                   size="sm"
//                   as={<Feather name="refresh-cw" />}
//                   color="white"
//                 />
//               }>
//               {ln('Refresh Data')}
//             </Button>
//             <Button
//               isDisabled={isBtnDisabled}
//               onPress={handleContinue}
//               rightIcon={
//                 <Icon
//                   size="sm"
//                   as={<Feather name="arrow-right" />}
//                   color="white"
//                 />
//               }>
//               {ln('continue')}
//             </Button>
//           </Row>
//         </>
//       );
//     }
//   };

//   return (
//     <Box flex="1" bg="white">
//       <Box flex="1">
//         <Center>
//           <Image source={appIcon} alt="app icon" size="xl" />
//           <Text fontSize={'xl'} color="primary.900" bold>
//             {ln('Welcome')}
//           </Text>
//           <Text fontSize={'xl'} color="primary.900" bold>
//             {user.userName}
//           </Text>
//           <Text fontSize={'sm'} color="primary.900">
//             {user.mobileNumber}
//           </Text>

//           {otherData.lastRefreshInitiatedTime ? (
//             <Text>
//               {ln('Last refreshed on')}{' '}
//               {new Date(
//                 parseInt(otherData.lastRefreshInitiatedTime),
//               ).toLocaleString()}
//             </Text>
//           ) : null}
//         </Center>
//         <Box mt="8" flex="1">
//           <ScrollView px="8" flex="1">
//             {Object.entries(appData.progress)
//               .sort(compare)
//               .map(([key, value], i) => {
//                 if (key === 'villageData') {
//                   return <ProgressItem key={i} data={value} type="village" />;
//                 } else {
//                   return <ProgressItem key={i} data={value} type="other" />;
//                 }
//               })}
//           </ScrollView>
//         </Box>
//       </Box>

//       <Center my="4">{bottomBar()}</Center>
//     </Box>
//   );
// };

// export default Index;
