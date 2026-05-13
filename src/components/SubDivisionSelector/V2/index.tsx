import {Box, Pressable, Row, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import api from '../../../api';
import {useAuth, useStateContext} from '../../../hooks';
import useDict from '../../../hooks/useDict';
import ListModal from '../../ListModal';
import Entypo from 'react-native-vector-icons/Entypo';
import {colors} from '../../../styles';
import {useIsFocused} from '@react-navigation/native';
import {SubDivisionDropDown, SurveyNumberDropDown} from '../../../@types';
import * as turf from '@turf/turf';
import {combineSubDivisionNumbers} from '../../../helpers/geo/combineSubDivisions';

interface Props {
  disableAllFields?: boolean;
}

export default function Index(props: Props) {
  const ln = useDict();
  const state = useStateContext();
  const auth = useAuth();

  const [showSubDivisionModal, setShowSubDivisionModal] = useState(false);
  const [showSurveyNumberModal, setShowSurveyNumberModal] = useState(false);

  const [surveyNumbers, setSurveyNumbers] = useState<SurveyNumberDropDown[]>(
    [],
  );
  const [subDivisionNumbers, setSubDivisionNumbers] = useState<
    SubDivisionDropDown[]
  >([]);

  const getSelectedLandGeoJsonFeature = async (surveyNumber: string) => {
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Fetching land data...',
    });

    console.log(
      'state.selectedLocationData.surveyNumber',
      state.selectedLocationData.surveyNumber,
    );
    try {
      await api.local.landDetails.read({
        districtCode: state.selectedLocationData.district,
        talukCode: state.selectedLocationData.taluk,
        villageCode: state.selectedLocationData.village,
        surveyNumber: surveyNumber,
        callback: async res => {
          if (res?.length === 0) {
            // Alert.alert(
            //   "Data not found",
            //   "No data found for the selected location. Refresh the data or please contact admin"
            // );
            state.setError(
              ln(
                'Survey and Sub Division Polygon not found but you can continue to survey inside the village',
              ),
            );

            auth.closeLoader();
            return;
          } else {
            console.debug('getSelectedLandGeoJsonFeature > ', {
              districtCode: state.selectedLocationData.district,
              talukCode: state.selectedLocationData.taluk,
              villageCode: state.selectedLocationData.village,
              surveyNumber: state.selectedLocationData.surveyNumber,
            });
            // console.debug(await combineSubDivisionNumbers(res))
            // const d = res?.filter(e=>e.properties?.sub_division_number!==null)
            const isSubDivisionNumberPresent = res?.find(
              e => e.properties?.sub_division_number === null,
            );
            if (isSubDivisionNumberPresent) {
              // setSurveyNumberPolygon(isSubDivisionNumberPresent);
              console.debug(
                '>setSurveyNumberPolygon',
                isSubDivisionNumberPresent,
              );
            } else {
              const _polygons = res.map(
                multiPolygon => turf.flatten(multiPolygon).features,
              );

              // Flatten the array of arrays into a single array
              const flatPolygons = _polygons.flat();
              // setSurveyNumberPolygon(await combineSubDivisionNumbers(flatPolygons));
              console.debug(
                '>setSurveyNumberPolygon',
                combineSubDivisionNumbers(flatPolygons),
              );
            }

            console.debug('land records > ', res?.length);
            state.handleSelectedFeature('land')(res); // feature
            // console.debug(JSON.stringify(res))
            state.setError(null);
          }
          // // const center = await turf.center({
          // //   type: "FeatureCollection",
          // //   features: res,
          // // }).geometry.coordinates;
          // changeRegion({
          //   latitude: res[0]?.properties?.centroid_latitude,
          //   longitude: res[0]?.properties?.centroid_longitude,
          //   ...zoomToDelta(state.selectedLocationData.surveyNumber ? ZOOM_LEVEL : -1),
          // });
          // // if (res?.length > 0) {
          // //   state.handleSelectedFeature("land")(res); // feature
          // // }else{
          // // }
          auth.closeLoader();
        },
      });
    } catch (error) {
      console.error(
        'Error fetching getSelectedLandGeoJsonFeature features: ',
        error,
      );
      // handle error
    } finally {
    }
  };

  const getSurveyNumberBoudary = async (surveyNumber: string) => {
    console.debug('rere');
    if (auth.appMode === 'online') {
      await api.spatialData
        .fullSurveyNumberBoundary({
          deviceId: auth.deviceId as string,
          userId: auth.user.userId,
          districtCode: state.selectedLocationData.district.toString(),
          talukCode: state.selectedLocationData.taluk,
          villageCode: state.selectedLocationData.village,
          surveyNumber: surveyNumber,
        })
        .then(e => {
          console.debug('features >', JSON.stringify(e?.features));
          if (e) {
            state.handleSelectedFeature('land')(e.features);
            state.setError(null);
          } else {
            state.setError(
              'Survey Number polygon not found but you can survey within the village boundary',
            );
          }
        });
    } else {
      getSelectedLandGeoJsonFeature(surveyNumber);
    }
  };

  const getSurveyNumbersOffline = async () => {
    await api.local.ownerDetails.read({
      villageCode: state.selectedLocationData.village,
      fields: ['o.survey_number'],
      callback: e => {
        // get unique survey numbers
        const uniqueSurveyNumbers = e.reduce((acc: any, current: any) => {
          const x = acc.find(
            (item: any) => item.survey_number === current.survey_number,
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        setSurveyNumbers(
          uniqueSurveyNumbers?.map((e: any) => ({
            survey_number: e.survey_number,
          })),
        );
      },
    });
  };

  const getSurveyNumbers = async () => {
    setSubDivisionNumbers([]);
    setSurveyNumbers([]);

    if (auth.appMode === 'online') {
      console.debug('surveyNumber online>', {
        district_code: state.selectedLocationData.district,
        taluk_code: state.selectedLocationData.taluk,
        village_code: state.selectedLocationData.village,
      });
      await api.surveyDropdown
        .surveyNumber({
          deviceId: auth.deviceId as string,
          userId: auth.user.userId,
          district_code: state.selectedLocationData.district,
          taluk_code: state.selectedLocationData.taluk,
          village_code: state.selectedLocationData.village,
          role_group_id: auth.user?.role_group_id?.toString(),
        })
        .then(surveyNumberList => {
          if (surveyNumberList) {
            setSurveyNumbers(surveyNumberList);
          }
        });
    } else {
      // await api.local.landDetails.getSurveyNumber({
      //   villageCode: state.selectedLocationData.village,
      //   callback: (surveyNumberList: SurveyNumberDropDown[]) => {
      //     if (surveyNumberList) {
      //       setSurveyNumbers(surveyNumberList);
      //     }
      //   },
      // });
      getSurveyNumbersOffline();
    }
  };

  const getSubDivisionNumbersOffline = async () => {
    await api.local.ownerDetails.read({
      districtCode: state.selectedLocationData.district,
      talukCode: state.selectedLocationData.taluk,
      villageCode: state.selectedLocationData.village,
      surveyNumber: state.selectedLocationData.surveyNumber,
      fields: ['o.sub_division_number'],
      callback: e => {
        const uniqueSubDivisionNumbers = e.reduce((acc: any, current: any) => {
          const x = acc.find(
            (item: any) =>
              item.sub_division_number === current.sub_division_number,
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        const sortByAscending = (sortBy: string) => (a: any, b: any) => {
          if (a?.[sortBy] < b?.[sortBy]) {
            return -1;
          }
          if (a?.[sortBy] > b?.[sortBy]) {
            return 1;
          }
          return 0;
        };
        uniqueSubDivisionNumbers.sort(sortByAscending('sub_division_number'));
        console.log('uniqueSubDivisionNumbers', uniqueSubDivisionNumbers);
        setSubDivisionNumbers(uniqueSubDivisionNumbers);
        if (uniqueSubDivisionNumbers.length === 1) {
          state.handleSelectedLocationData('subDivisionNumber')(
            uniqueSubDivisionNumbers[0].subDivisionNumber,
          );
        }
      },
    });
  };
  const getSubDivisionNumbers = async () => {
    if (auth.appMode === 'online') {
      await api.surveyDropdown
        .subDivision({
          deviceId: auth.deviceId as string,
          userId: auth.user.userId,
          district_code: state.selectedLocationData.district,
          taluk_code: state.selectedLocationData.taluk,
          village_code: state.selectedLocationData.village,
          survey_number: state.selectedLocationData.surveyNumber,
          role_group_id: auth.user?.role_group_id?.toString(),
        })
        .then(subDivisionsList => {
          if (subDivisionsList) {
            const uniqueSubDivisionNumbers = subDivisionsList.reduce(
              (acc: any, current: any) => {
                const x = acc.find(
                  (item: any) =>
                    item.sub_division_number === current.sub_division_number,
                );
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              },
              [],
            );
            const sortByAscending = (sortBy: string) => (a: any, b: any) => {
              if (a?.[sortBy] < b?.[sortBy]) {
                return -1;
              }
              if (a?.[sortBy] > b?.[sortBy]) {
                return 1;
              }
              return 0;
            };
            uniqueSubDivisionNumbers.sort(
              sortByAscending('sub_division_number'),
            );
            setSubDivisionNumbers(uniqueSubDivisionNumbers);
            if (uniqueSubDivisionNumbers.length === 1) {
              state.handleSelectedLocationData('subDivisionNumber')(
                uniqueSubDivisionNumbers[0].sub_division_number,
              );
            }

            setSubDivisionNumbers(uniqueSubDivisionNumbers);
          }
        });
    } else {
      getSubDivisionNumbersOffline();
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    state.handleSelectedLocationData('surveyNumber')('');
    state.handleSelectedLocationData('subDivisionNumber')('');
    if (state.selectedLocationData.village) {
      getSurveyNumbers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedLocationData.village, isFocused]);

  useEffect(() => {
    if (state.selectedLocationData.surveyNumber) {
      getSubDivisionNumbers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedLocationData.surveyNumber]);

  //? sort list of object by key in ascending order
  // const sortByAscending = (sortBy: string) => (a: any, b: any) => {
  //   if (a?.[sortBy] < b?.[sortBy]) {
  //     return -1;
  //   }
  //   if (a?.[sortBy] > b?.[sortBy]) {
  //     return 1;
  //   }
  //   return 0;
  // };
  //
  async function handleSurveyNumberSelection(surveyNumber: string) {
    state.handleSelectedLocationData('surveyNumber')(surveyNumber);
    await getSurveyNumberBoudary(surveyNumber);
  }

  return (
    <Box bg="white">
      <Row space="2" p="1" px="2">
        <Box flex="1">
          <Pressable
            p="1"
            alignItems="center"
            flexDir={'row'}
            onPress={() => setShowSurveyNumberModal(true)}
            isDisabled={props.disableAllFields}
            opacity={props.disableAllFields ? 0.7 : 1}>
            <Row alignItems="center">
              <Row flex="1">
                <Text color="dark.600" bold>
                  {ln('Survey Number')}
                </Text>
                <Text color="black" bold px="2">
                  {state.selectedLocationData.surveyNumber}
                </Text>
              </Row>
              <Box>
                <Entypo
                  name="chevron-down"
                  size={24}
                  color={colors.dark[600]}
                />
              </Box>
            </Row>
          </Pressable>
          {showSurveyNumberModal ? (
            <ListModal
              // keyExtractor="survey_number"
              labelKey="survey_number"
              data={surveyNumbers}
              isOpen={showSurveyNumberModal}
              keysToLookup={['survey_number']}
              handleClose={() => setShowSurveyNumberModal(false)}
              onSelect={e => {
                handleSurveyNumberSelection(e.survey_number?.toString());
              }}
              title={ln('Survey Number')}
            />
          ) : null}
        </Box>
        <Box borderWidth={'1'} borderColor="primary.600" />
        <Box flex="1">
          <Pressable
            alignItems={'center'}
            p="1"
            flexDir="row"
            onPress={() => setShowSubDivisionModal(true)}
            isDisabled={props.disableAllFields}
            opacity={props.disableAllFields ? 0.7 : 1}>
            <Row alignItems="center">
              <Row flex="1" space="2">
                <Text color="dark.600" bold>
                  {ln('Sub Division')}
                </Text>
                <Text color="black" bold isTruncated={true} flex="1">
                  {state.selectedLocationData.subDivisionNumber}
                  {/* {subDivisionNumbers?.length === 1
                    ? "No Sub Division"
                    : state.selectedLocationData.subDivisionNumber || ""} */}
                </Text>
              </Row>
              <Box>
                <Entypo
                  name="chevron-down"
                  size={24}
                  color={colors.dark[600]}
                />
              </Box>
            </Row>
          </Pressable>

          {showSubDivisionModal ? (
            <ListModal
              // keyExtractor="sub_division_number"
              labelKey="sub_division_number"
              labelEscape="All"
              keysToLookup={['sub_division_number']}
              data={subDivisionNumbers}
              isOpen={showSubDivisionModal}
              handleClose={() => setShowSubDivisionModal(false)}
              onSelect={e => {
                // console.log(
                //   'state.selectedFeatures?.land?.find(e=>e.properties?.sub_division_number==e.sub_division_number)',
                //   typeof e.sub_division_number,
                //   e.sub_division_number,
                //   state.selectedFeatures?.land?.find(
                //     e =>
                //       e.properties?.sub_division_number ==
                //       e.sub_division_number,
                //   ),
                // );
                if (
                  !state.selectedFeatures?.land?.find(
                    _ =>
                      _.properties?.sub_division_number ===
                      e.sub_division_number,
                  )
                ) {
                  state.setError(
                    'Sub division polygon not found but you can survey within the survey number boundary',
                  );
                } else {
                  state.setError(null);
                }
                state.handleSelectedLocationData('subDivisionNumber')(
                  e.sub_division_number,
                );
              }}
              title={ln('Sub Division')}
            />
          ) : null}
        </Box>
      </Row>
    </Box>
  );
}

// surveyNumber online> {"district_code": "584", "taluk_code": "5736", "village_code": "633755"}
//  (NOBRIDGE) LOG  {"district_code": "584", "taluk_code": "5736", "village_code": "633755"}
//  (NOBRIDGE) DEBUG  online > survey_dropdown  fetch options > https://cropsurveyapi.tnega.org/app/api/online/survey_dropdown {"body": {"_parts": [[Array], [Array], [Array], [Array]]}, "headers": {"map": {"x-app-key": "crop$urvey!", "x-device-id": "bec40f39d641bf39", "x-user-id": "1"}}, "method": "POST"}
// village_code:633755
// taluk_code:5736
// district_code:584

// ownerData offline > {"districtCode": "584", "talukCode": "5736", "villageCode": "633755"}
//  (NOBRIDGE) DEBUG  owner_details_paginated  fetch options > https://cropsurveyapi.tnega.org/app/api/v3/owner_details_paginated {"body": {"_parts": [[Array], [Array], [Array], [Array]]}, "headers": {"map": {"x-app-key": "crop$urvey!", "x-device-id": "bec40f39d641bf39", "x-user-id": "1"}}, "method": "POST"}
//  (NOBRIDGE) LOG  >  owner_details_paginated undefined https://cropsurveyapi.tnega.org/app/api/v3/owner_details_paginated
