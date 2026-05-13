// import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
// import {Box, Button, Row, ScrollView, Text} from 'native-base';
// import {Alert, BackHandler} from 'react-native';
// import {navigation} from '../../routers/navigation';
// import {FarmerDetailsCard, ProfileHeader} from '../../components';
// import {FormBlock1, LocationDetails, SurveyFormBlock} from './components';
// import {MaterialIcons} from '@expo/vector-icons';
// import {ICropFormProps, ICropSurvey} from '../../@types/form';
// import {useAuth, useStateContext} from '../../hooks';
// import api from '../../api';
// import useDict from '../../hooks/useDict';
// import {ColorType} from 'native-base/lib/typescript/components/types';
// import * as Network from '@react-native-community/netinfo';
// import {MiscCropSeasonTypeOfflineProps} from '../../@types';

// import {
//   AGRICULTURE_NO_USE_IDS,
//   croppingMethod,
//   cropSeasonType,
//   TREE_OR_BORDER_CROP,
// } from '../../const';

// const bgs: ColorType[] = [
//   '#fcf8f4',
//   '#fcfdfb',
//   '#f1f8fa',
//   '#fff6f6',
//   '#faf4ff',
//   '#f4f5ff',
//   '#fff5fc',
//   '#f7fffb',
//   '#fffbf8',
//   '#fcfdfb',
//   '#f6fdff',
//   '#fff6f6',
//   '#faf4ff',
//   '#f4f5ff',
//   '#fff5fc',
//   '#fcf8f4',
//   '#fcfdfb',
//   '#f1f8fa',
//   '#fff6f6',
//   '#faf4ff',
//   '#f4f5ff',
//   '#fff5fc',
//   '#f7fffb',
//   '#fffbf8',
//   '#fcfdfb',
//   '#f6fdff',
// ];

// interface Props {
//   route: any;
// }

// const Index = ({route}: Props) => {
//   const {gpsAccuracy} = route.params;

//   // ? context
//   const state = useStateContext();
//   const auth = useAuth();

//   // ? hooks
//   const ln = useDict();

//   // ? states
//   const [isPreviewModeEnabled, setIsPreviewModeEnabled] = useState(false);

//   const [formData, setFormData] = useState<ICropFormProps>({
//     method: croppingMethod.MONO,
//     formType: 'subDivisionForm',
//     season: '',
//     masterSeasonId: '',
//     gpsAccuracy,
//     surveys: [
//       {
//         cultivatorTypeId: '1',
//         id: new Date().getTime().toString(),
//         cropLandExtent: state.selectedLocationData.ownerDetails.extent,
//       } as ICropSurvey,
//     ],
//     // ...state?.cropFormData,
//   } as ICropFormProps);

//   const formDataMemo = useMemo(() => formData, [formData]);

//   const [btnState, setBtnState] = useState({
//     previewBtnIsDisabled: true,
//     surveyCardDeleteBtnIsEnabled: false,
//   });

//   // ? error
//   const [errors, setErrors] = useState<{id: string; error: string}[]>([]);

//   // ? handle functions
//   const handleBtnState = useCallback(
//     (key: keyof typeof btnState) => (value: any) => {
//       setBtnState(prevVal => {
//         return {...prevVal, [key]: value};
//       });
//     },
//     [setBtnState],
//   );

//   const handlePreview = async () => {
//     auth.updateLoaderStatus({
//       isLoading: true,
//       loadingText: 'Opening Preview...',
//     });

//     // sum of all the survey crop land extent
//     const totalExtent = parseFloat(
//       formData.surveys
//         ?.reduce((acc, curr) => {
//           // Convert the extent value to a number if it is a string
//           const extent =
//             typeof curr.cropLandExtent === 'string'
//               ? parseFloat(curr.cropLandExtent)
//               : curr.cropLandExtent;
//           // Add the extent value to the accumulator
//           return acc + extent;
//         }, 0)
//         .toFixed(4),
//     );
//     // console.log("totalExtent > ", totalExtent);

//     // if the method is mono then the total extent should be equal to the selected location extent else it should be equal or less than 3 times of the selected location extent
//     if (
//       formData.method === croppingMethod.MONO ||
//       formData.method === croppingMethod.INTER
//     ) {
//       if (
//         totalExtent ===
//         parseFloat(state.selectedLocationData.ownerDetails.extent)
//       ) {
//         await state?.setCropFormData(formData);
//         setIsPreviewModeEnabled(true);
//       } else {
//         // \n' + 'totalExtent\n' + 'balanceExtent'
//         Alert.alert(
//           ln('Error'),
//           ln('ExtentMissMatchErrorMsg')
//             .replace('${totalExtent}', totalExtent)
//             .replace(
//               '${balanceExtent}',
//               (
//                 parseFloat(state.selectedLocationData.ownerDetails.extent) -
//                 totalExtent
//               ).toFixed(4),
//             ),
//         );

//         auth.closeLoader();
//         return;
//       }
//     } else {
//       if (
//         !(
//           totalExtent <=
//             parseFloat(state.selectedLocationData.ownerDetails.extent) * 2 &&
//           totalExtent >=
//             parseFloat(state.selectedLocationData.ownerDetails.extent)
//         )
//       ) {
//         auth.closeLoader();
//         Alert.alert(
//           ln('Error'),
//           ln('ExtentMissMatchErrorMsg')
//             .replace('${totalExtent}', totalExtent?.toString())
//             .replace(
//               '${balanceExtent}',
//               (
//                 parseFloat(state.selectedLocationData.ownerDetails.extent) * 2 -
//                 totalExtent
//               ).toFixed(2),
//             ),
//         );

//         auth.closeLoader();

//         return;
//       }

//       if (!(formData.surveys?.length > 1)) {
//         Alert.alert(ln('Error'), ln('Please add at least 2 surveys'));

//         auth.closeLoader();

//         return;
//       }

//       await state?.setCropFormData(formData);
//       setIsPreviewModeEnabled(true);

//       auth.closeLoader();
//     }

//     auth.closeLoader();
//   };

//   const handleSave = async () => {
//     try {
//       console.log('handleSave', formData);
//       const network = await Network?.fetch();
//       await api.local.cropSurvey
//         .post(formData as ICropFormProps)
//         .then(async () => {
//           await api.local.metaData.store({
//             name: 'cropFormV1PreloadData',
//             value: JSON.stringify({
//               sownDate: formData.surveys[0].sownDate,
//               expectedHarvestDate: formData.surveys[0].expectedHarvestDate,
//               cropStage: formData.surveys[0].cropStage,
//               cropTypeId: formData.surveys[0].cropTypeId,
//               cropSeasonType: formData.surveys[0].cropSeasonType,
//               croppingMethod: formData.surveys[0].croppingMethod,
//               cropClassificationId: formData.surveys[0].cropClassificationId,
//               cropNameId: formData.surveys[0].cropNameId,
//             }),
//           });
//           if (!auth.deviceId) {
//             Alert.alert(ln('Error'), ln('Device id error'));
//             return;
//           }
//           // const await Network?.getNetworkStateAsync())
//           if (network?.isInternetReachable) {
//             for (const survey of formData.surveys) {
//               await api.cropSurvey.uploadSurvey({
//                 userId: auth.user.userId,
//                 deviceId: auth?.deviceId || '',
//                 surveyId: survey.id,
//                 onUpdateFail: () => {
//                   Alert.alert(ln('Error'), ln('dataSavedButFailedToUpload'), [
//                     {
//                       text: ln('Okay'),
//                       onPress: () => navigation.goBack(),
//                     },
//                   ]);
//                   // return;
//                 },
//                 onUpdateSuccess: () => {
//                   Alert.alert('Success', ln('dataSacedAndUploaded'), [
//                     {
//                       text: ln('Okay'),
//                       onPress: () => navigation.goBack(),
//                     },
//                   ]);
//                 },
//               });
//             }
//             // formData.surveys?.map(async (survey) => {
//             //   await api.cropSurvey.uploadSurvey({
//             //     userId: auth.user.userId,
//             //     deviceId: auth?.deviceId || "",
//             //     surveyId: survey.id,
//             //     onUpdateFail: () => {
//             //       Alert.alert(
//             //           ln("Error"),
//             //           ln("dataSavedButFailedToUpload"),
//             //           [
//             //             {
//             //               text: ln("Okay"),
//             //               onPress: () => navigation.goBack(),
//             //             },
//             //           ]
//             //       );
//             //       // return;
//             //     },
//             //     onUpdateSuccess: ()=>{
//             //       Alert.alert(
//             //           "Success",
//             //           ln('dataSacedAndUploaded'),
//             //       );
//             //     }
//             //
//             //   });
//             // });
//           } else {
//             Alert.alert(
//               ln('NetworkNotReachable'),
//               ln('ErrorInUploadDueToNetwork'),
//               [
//                 {
//                   text: ln('Okay'),
//                 },
//               ],
//             );
//           }
//         });
//     } finally {
//       Alert.alert(
//         'Go Back',
//         'Survey data has been processed. press okay to go back',
//         [{text: ln('Okay'), onPress: () => navigation.goBack()}],
//       );
//     }
//   };

//   const updateSurveyInFormData = useCallback((data: ICropSurvey) => {
//     // console.log("updateSurveyInFormData", data);
//     setFormData(prevVal => {
//       return {
//         ...prevVal,
//         surveys: prevVal.surveys.map(survey => {
//           if (survey.id === data.id) {
//             return data;
//           } else {
//             return survey;
//           }
//         }),
//       };
//     });
//   }, []);

//   //? event functions
//   const onBlock1Change = useCallback(
//     (key: any) => (value: any) => {
//       setFormData((prevVal: any) => {
//         return {...prevVal, [key]: value};
//       });
//     },
//     [setFormData],
//   );

//   // function to find the functions execution time

//   function getDefaultValuesFromSurveyCard(surveyCardIndex: number = 0) {
//     // ! by default will get values from first survey card

//     let data = {
//       id: new Date().getTime().toString(),
//       cropSeasonType: formData.surveys[surveyCardIndex]?.cropSeasonType || '1',
//       cultivatorTypeId:
//         formData.surveys[surveyCardIndex]?.cultivatorTypeId || '1',
//       irrigationSourceId: formData.surveys[surveyCardIndex]?.irrigationSourceId,
//       expectedHarvestDate:
//         formData.surveys[surveyCardIndex]?.expectedHarvestDate,
//       cropStage: formData.surveys[surveyCardIndex]?.cropStage,
//       sownDate: formData.surveys[surveyCardIndex]?.sownDate,
//     } as ICropSurvey;

//     if (AGRICULTURE_NO_USE_IDS.includes(data.cropSeasonType)) {
//       // ! add crop type tid to the next card if the cropSeasonType is in AGRICULTURE_NO_USE_IDS
//       // data['cropTypeId'] = formData.surveys[surveyCardIndex]?.cropTypeId
//       data = {
//         ...data,
//         cropTypeId: formData.surveys[surveyCardIndex]?.cropTypeId,
//       };
//     }

//     return data;
//   }

//   const getTotalExtent = useMemo(() => {
//     return formData.surveys?.reduce((acc, curr) => {
//       //? Convert the extent value to a number if it is a string
//       const extent = parseFloat(curr.cropLandExtent);
//       //? Add the extent value to the accumulator
//       return acc + extent;
//     }, 0);
//   }, [formData.surveys]);

//   const addSurveyInFormData = useCallback(async () => {
//     const defaultData = getDefaultValuesFromSurveyCard();
//     //? sum of all the survey crop land extent
//     const totalExtent = getTotalExtent;

//     let cropLandExtent =
//       parseFloat(state.selectedLocationData.ownerDetails.extent) - totalExtent;
//     if (cropLandExtent <= 0) {
//       Alert.alert(ln('Warning'), ln('Survey exeeded for the land area'));
//     } else {
//       setFormData(prevState => {
//         return {
//           ...prevState,
//           surveys: [
//             ...prevState.surveys,
//             {
//               ...defaultData,
//               cropLandExtent:
//                 cropLandExtent < 0 ? '' : cropLandExtent.toString(),
//             } as ICropSurvey,
//           ],
//         };
//       });
//     }
//   }, [formData.surveys]);

//   //? function to delete data from list using index position
//   const deleteByIndex = (index: number) => {
//     setFormData(prevVal => {
//       let surveys = prevVal.surveys;
//       surveys.splice(index, 1);
//       return {
//         ...prevVal,
//         surveys,
//       };
//     });
//   };

//   const [cropSeasonTypes, setCropSeasonTypes] = useState<
//     MiscCropSeasonTypeOfflineProps[]
//   >([]);

//   async function getCroppingSeasons() {
//     await api.local.cropSeasonType.read({callback: setCropSeasonTypes});
//   }

//   const validate = useCallback((values: ICropSurvey) => {
//     let value = false;

//     if (
//       [...AGRICULTURE_NO_USE_IDS, cropSeasonType.PERENNIAL].includes(
//         values.cropSeasonType,
//       )
//     ) {
//       value = Boolean(
//         values.cropClassificationId &&
//           (values.cropLandExtent || values.cropLandExtent == '0') &&
//           values.cultivatorTypeId &&
//           values.cultivatorId &&
//           values.image,
//       );
//     } else {
//       if (TREE_OR_BORDER_CROP.includes(values.cropSeasonType)) {
//         // ? if perennial and border/row crop
//         value = Boolean(
//           values.cropTypeId &&
//             values.cropClassificationId &&
//             values.cropNameId &&
//             values.irrigationSourceId &&
//             parseFloat(values.cropCount) >= 1 &&
//             values.cultivatorTypeId &&
//             values.cultivatorId &&
//             values.image &&
//             values.sownDate &&
//             values.expectedHarvestDate &&
//             values.cropStage,
//         );
//       } else {
//         value = Boolean(
//           values.cropTypeId &&
//             values.cropClassificationId &&
//             values.cropNameId &&
//             values.irrigationSourceId &&
//             (values.cropLandExtent || values.cropLandExtent == '0') &&
//             values.cultivatorTypeId &&
//             values.cultivatorId &&
//             values.image &&
//             values.sownDate &&
//             values.expectedHarvestDate &&
//             values.cropStage,
//         );
//       }
//     }

//     return value;
//   }, []);

//   useEffect(() => {
//     //
//     formData.surveys?.forEach(survey => {
//       if (validate(survey)) {
//         handleBtnState('previewBtnIsDisabled')(false);
//       } else {
//         handleBtnState('previewBtnIsDisabled')(true);
//         return;
//       }
//     });
//     //
//   }, [formData.surveys.length]);

//   const backAction = () => {
//     Alert.alert(ln('HoldOn'), ln('formExitWarningMsg'), [
//       {
//         text: ln('Cancel'),
//         onPress: () => null,
//         style: 'cancel',
//       },
//       {text: ln('Yes'), onPress: () => navigation.goBack()},
//     ]);
//     return true;
//   };

//   useEffect(() => {
//     getCroppingSeasons();
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction,
//     );
//     return () => backHandler.remove();
//   }, []);

//   // useEffect(()=>{console.debug('formData > ', formData)},[formData])
//   return (
//     <Box flex="1">
//       <ProfileHeader disableNavigation />
//       <LocationDetails showSurveyNumber={true} showSubDivisionNumber={true} />
//       <ScrollView flex="1">
//         {errors.length > 0 ? (
//           <Box bg="red.100" p="4" m="2" borderRadius={'xl'}>
//             {errors.map((error, idx) => (
//               <Box key={idx}>
//                 <Text color="red.500">{error.error}</Text>
//               </Box>
//             ))}
//           </Box>
//         ) : null}
//         <FormBlock1
//           onChange={onBlock1Change}
//           formData={formDataMemo}
//           previewMode={isPreviewModeEnabled}
//         />

//         {cropSeasonTypes?.length > 0
//           ? formDataMemo.surveys.map((surveyData, idx) => (
//               <SurveyFormBlock
//                 cropSeasonTypes={cropSeasonTypes}
//                 onChange={updateSurveyInFormData}
//                 idx={idx}
//                 key={idx}
//                 data={surveyData}
//                 previewMode={isPreviewModeEnabled}
//                 handleValidation={isValid => {
//                   handleBtnState('previewBtnIsDisabled')(!isValid);
//                 }}
//                 onDelete={() => deleteByIndex(idx)}
//                 enableDelete={idx !== 0}
//                 bg={'white'}
//               />
//             ))
//           : null}
//         {!isPreviewModeEnabled && !btnState.previewBtnIsDisabled ? (
//           <Box flex="1" m="2">
//             <Button
//               onPress={addSurveyInFormData}
//               bgColor="secondary.900"
//               leftIcon={<MaterialIcons name="add" color="white" size={16} />}>
//               {ln('Add Crop Survey')}
//             </Button>
//           </Box>
//         ) : null}
//       </ScrollView>

//       <Box mx="2" bg="white">
//         {/* <SubDivisionSelector disableAllFields /> */}

//         <FarmerDetailsCard />

//         <Box py="1">
//           {!isPreviewModeEnabled ? (
//             !btnState.previewBtnIsDisabled ? (
//               <Button
//                 onPress={handlePreview}
//                 disabled={btnState.previewBtnIsDisabled}
//                 opacity={btnState.previewBtnIsDisabled ? 0.7 : 1}
//                 leftIcon={
//                   <MaterialIcons name="view-day" color="white" size={16} />
//                 }>
//                 {ln('Preview')}
//               </Button>
//             ) : null
//           ) : (
//             <Row space="2">
//               <Button
//                 flex="1"
//                 bg="blue.500"
//                 onPress={() => setIsPreviewModeEnabled(false)}
//                 leftIcon={
//                   <MaterialIcons name="edit" color="white" size={16} />
//                 }>
//                 {ln('Edit')}
//               </Button>
//               <Button
//                 flex="1"
//                 onPress={handleSave}
//                 leftIcon={
//                   <MaterialIcons name="view-day" color="white" size={16} />
//                 }>
//                 {ln('Save')}
//               </Button>
//             </Row>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default memo(Index);
