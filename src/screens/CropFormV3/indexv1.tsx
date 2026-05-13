// import React, {useEffect, useState} from 'react'
// import {Box, Button, Center, Column, Row, Text} from "native-base";
// import {FsCropData, FsFarmerData} from "./formSteps";
// import SafeArea from "../../layout/SafeArea";
// import {ICropFormV2CameraProps, SeasonOfflineProps} from "../../@types";
// import api from "../../api";
// import {Alert} from "react-native";
// import {useAuth, useStateContext} from "../../hooks";
// import useDict from "../../hooks/useDict";
// import {ProfileHeader} from "../../components";
// import {LocationDetails} from "../CropForm/components";
// import {ICropDataForm, IFormDataV3} from "./type";
// import {croppingMethod} from "../../const";
// import formV3ToV1Converter from "./formDataConverter";
// import * as Network from "expo-network";
// import {navigation} from "../../routers/navigation";

// interface IFormState {
//   formStep: 'cropData' | 'farmerData',
//   isLoading: boolean
// }

// export default function Index({route}:any) {
//   const { gpsAccuracy } = route.params;

//   const ln = useDict()
//   const {selectedLocationData,capturedImageData, removeImageData} = useStateContext();
//   // useSTat
// const auth = useAuth()
//   const [formState, setFormState] = useState<IFormState>({
//     formStep: 'cropData', isLoading: true
//   });

//   function startLoader() {
//     handleFormState('isLoading', true)
//   }

//   function closeLoader(name: string, time: number = 1000) {
//     console.log(name + ' > initiated close loader ', formState.formStep)
//     setTimeout(() => {
//       console.log(name + ' > loader cloased ', formState.formStep)
//       handleFormState('isLoading', false)
//     }, time)
//   }

//   const [formData, setFormData] = useState<IFormDataV3>({
//     farmerData: {},
//     imageData:capturedImageData ,
//     cropData: {
//       method: croppingMethod.MONO,
//       villageCode: selectedLocationData.village,
//       talukCode: selectedLocationData.taluk,
//       surveynumber: selectedLocationData.surveyNumber,
//       districtCode: selectedLocationData.district,
//       orupogaIrupogaNanjai:'0',
//       // season:'',
//       // masterSeasonId:'',
//       // "cropClassificationId": "15",
//       // "cropNameId": "54",
//       // "cropSeasonType": "2",
//       // "cropStage": "flowering",
//       // "cropTypeId": "1",
//       // "expectedHarvestDate": "2023/11/30",
//       // "irrigationSourceId": "5",
//       // "labelCropClassification": "Cereals",
//       // "labelCropName": "Pearl Millet",
//       // "labelCropSesonType": "Seasonal",
//       // "labelCropStage": "Flowering",
//       // "labelCropType": "Agriculture",
//       // "labelIrrigationSource": "Pond",
//       // "sownDate": "2023/10/1",

//       "selectedSubDivisionNumbers": [] as ICropDataForm['selectedSubDivisionNumbers'],
//     }as ICropDataForm
//     //   {
//     //   selectedSubDivisionNumbers:[] as ICropDataForm['selectedSubDivisionNumbers']
//     // } as ICropDataForm
//   })

//   async function getSeasons() {
//     await api.local.seasons.read({
//       villageCode: selectedLocationData.village, callback: (e) => {
//         if (e.length === 0) {
//           Alert.alert(ln("No Season Found"), ln(`NoSeasonFoundErrorMsg`));
//           return
//         }
//         handleCropData("season", e[0].seasonId.toString());
//         handleCropData("labelSeason", e[0].seasonName.toString());
//         handleCropData("masterSeasonId", e[0].masterSeasonId.toString());
//       },
//     });
//   };

//   function handleFormState<K extends keyof IFormState>(key: K, value: IFormState[K]) {
//     setFormState(e => ({...e, [key]: value}))
//   }

//   function handleCropData<K extends keyof ICropDataForm>(key: K, value: ICropDataForm[K]) {
//     setFormData(e => ({...e, cropData: {...e.cropData, [key]: value}}))
//   }

//   const handleSave = async (e:any) => {
//     try{
//     const surveyData = await formV3ToV1Converter({cropData: formData.cropData, surveys: Object.values(e), imageData: capturedImageData})
//     console.log("handleSave", surveyData);
//     const network = await Network?.getNetworkStateAsync();
//     await api.local.cropSurvey.post({...surveyData, gpsAccuracy, formType:'surveyNumberForm'}).then(async () => {
//       if (!auth.deviceId) {
//         Alert.alert(ln("Error"), "Device id error");
//         return;
//       }
//       // console.log(surveyData)
//       // const await Network?.getNetworkStateAsync())
//       if (network?.isInternetReachable) {
//         for(const survey of surveyData.surveys){
//           await api.local.metaData.store({
//             name:'cropFormV1PreloadData',
//             value: JSON.stringify({
//               sownDate:survey.sownDate,
//               expectedHarvestDate:survey.expectedHarvestDate,
//               cropStage:survey.cropStage,
//               cropSeasonType:survey.cropSeasonType,
//               cropTypeId:survey.cropTypeId,
//               croppingMethod:survey.croppingMethod,
//               cropClassificationId:survey.cropClassificationId,
//               cropNameId:survey.cropNameId,
//             })
//           })
//           await api.cropSurvey.uploadSurvey({
//             userId: auth.user.userId,
//             deviceId: auth?.deviceId || "",
//             surveyId: survey.id,
//             onUpdateFail: () => {
//               Alert.alert(ln("Error"), ln("Data has been saved locally but failed to upload to server"), [{
//                 text: ln("Okay"), onPress: () => navigation.goBack(),
//               },]);
//               // return;
//             },
//             onUpdateSuccess:()=>{
//               Alert.alert("Success", ln("Data has been saved locally and uploaded successfully"), [{
//                 text: ln("Okay"),
//                 onPress: () => navigation.goBack(),
//               }]);
//             }
//           });
//         }
//         // surveyData.surveys?.map(async (survey) => {
//         //   await api.local.metaData.store({
//         //     name:'cropFormV1PreloadData',
//         //     value: JSON.stringify({
//         //       sownDate:survey.sownDate,
//         //       expectedHarvestDate:survey.expectedHarvestDate,
//         //       cropStage:survey.cropStage,
//         //       cropSeasonType:survey.cropSeasonType,
//         //       cropTypeId:survey.cropTypeId,
//         //       croppingMethod:survey.croppingMethod,
//         //       cropClassificationId:survey.cropClassificationId,
//         //       cropNameId:survey.cropNameId,
//         //     })
//         //   })
//         //   await api.cropSurvey.uploadSurvey({
//         //     userId: auth.user.userId,
//         //     deviceId: auth?.deviceId || "",
//         //     surveyId: survey.id,
//         //     onUpdateFail: () => {
//         //       Alert.alert(ln("Error"), "Data has been saved locally but failed to upload to server", [{
//         //         text: ln("Okay"), onPress: () => navigation.goBack(),
//         //       },]);
//         //       // return;
//         //     },
//         //     onUpdateSuccess:()=>{
//         //       Alert.alert("Success", "Data has been saved locally and uploaded successfully", [{
//         //         text: ln("Okay"),
//         //       }]);
//         //     }
//         //   });
//         // });

//       } else {
//         Alert.alert(ln("Network not reachable"), ln("Data has been stored safely in your device. please sync to server once you got network"), [{
//           text: ln("Okay"), onPress: () => navigation.goBack(),
//         },]);
//       }
//     });}
//     finally{
//       Alert.alert(
//           ln("Go Back"),
//           ln('Survey data has been processed. press okay to go back'),
//           [{text: ln("Okay"), onPress: () => navigation.goBack()}]
//       );
//     }
//   };

//   // async function handleSave(e?: any) {
//   //   console.debug('save > ', await formV3ToV1Converter({cropData: formData.cropData, surveys: Object.values(e)}))
//   // }

//   useEffect(() => {
//     getSeasons()
//     return ()=>{
//       removeImageData();
//     }
//   }, []);

//   function renderFormStep() {
//     switch (formState.formStep) {
//       case 'cropData':
//         return <FsCropData
//           imageData={formData?.imageData}
//           closeLoader={closeLoader}
//           startLoading={startLoader}
//           cropData={formData.cropData}
//           isLoading={formState.isLoading}

//           onNext={(e) => {
//             startLoader()
//             setFormData(prevVal => ({...prevVal, cropData: {...prevVal.cropData, ...e}}))
//             // closeLoader('dummy', 5000)
//             console.log(e)
//             handleFormState('formStep', 'farmerData')
//           }}/>
//       case 'farmerData':
//         return <FsFarmerData
//           currentForm={formState.formStep}
//           onNext={(e) => handleSave(e)}
//           closeLoader={closeLoader}
//           startLoading={startLoader}
//           isLoading={formState.isLoading}
//           cropData={formData.cropData}
//           onPrevious={() => handleFormState('formStep', 'cropData')}/>

//     }
//   }

//   return <SafeArea>
//     <ProfileHeader disableNavigation/>
//     <LocationDetails showSurveyNumber={true}/>
//     {renderFormStep()}

//   </SafeArea>
// }
