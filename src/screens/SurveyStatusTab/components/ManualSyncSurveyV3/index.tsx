import {
  ArrowBackIcon,
  ArrowForwardIcon,
  Box,
  Button,
  Checkbox,
  FlatList,
  Pressable,
  Row,
  Text,
} from 'native-base';
import {CropSurveyStatusCard, UploadCounter} from '../../../../components';
import React, {useEffect, useState} from 'react';
import FA5I from 'react-native-vector-icons/FontAwesome5';

import useDict from '../../../../hooks/useDict';
import {
  ICropSurveyDetailsOfflineProps,
  ICropSurveyOfflineProps,
} from '../../../../@types';
import api from '../../../../api';
import {useAuth} from '../../../../hooks';
import {InteractionManager} from 'react-native';

const Index = () => {
  const ln = useDict();
  const auth = useAuth();

  const [isUpload, setIsUpload] = useState(false);
  const [survey, setSurvey] = useState<
    {
      records: ICropSurveyDetailsOfflineProps[];
      key: string;
      isSyncEnabled: boolean;
    }[]
  >([]);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState<any[]>([]);

  const [screenState, setScreenState] = useState({
    currentPage: 1,
    pageSize: 20,
    totalRecords: 0,
    totalPages: 0,
  });

  // function to handle screenState by keys
  const handleScreenState = (key: keyof typeof screenState, value: any) => {
    setScreenState(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };
  const handleSelectSurvey = async (surveyId: string | number) => {
    setSelectedSurveyIds(prevVal => {
      return [...prevVal, surveyId];
    });
  };

  const selectAllSurvey = async () => {
    let ids: any[] = [];
    survey?.forEach(s => {
      ids.push(s.key);
    });
    setSelectedSurveyIds(ids);
  };

  const clearSelection = async () => {
    setSelectedSurveyIds([]);
  };

  const unSelectSurvey = async (surveyId: string | number) => {
    setSelectedSurveyIds(prevVal => {
      return [...prevVal.filter(e => e != surveyId)];
    });
  };

  const handleDeleteSelected = async () => {
    const surveyIds = await getSurveyIdsOfSelectedSurveyNumberGroup();

    for (let i = 0; i < surveyIds.length; i++) {
      await api.local.cropSurvey.remove({id: surveyIds[i]});
    }
    await getPendingSurvey();
  };

  const getSurveyIdOfSurveyNumber = (key: string) => {
    const surveyRecords: ICropSurveyOfflineProps[] = survey.find(
      e => e.key === key,
    )?.records as ICropSurveyOfflineProps[];
    return surveyRecords.map(e => e.id);
  };

  const getSurveyIdsOfSelectedSurveyNumberGroup = () => {
    const groupedSurveyRecordIds: any[] = [];
    for (const e of selectedSurveyIds) {
      groupedSurveyRecordIds.push(getSurveyIdOfSurveyNumber(e));
    }

    const surveyIds: string[] = [];
    for (const surveyRecordIds of groupedSurveyRecordIds) {
      for (const id of surveyRecordIds) {
        surveyIds.push(id);
      }
    }

    return surveyIds;
  };

  const handleSyncSelected = async () => {
    setIsUpload(true);
  };

  const getPendingSurvey = async (limit?: number, offset?: number) => {
    await api.local.cropSurvey.getSurveyDetailPaginated({
      syncStatus: 'pending',
      limit: limit || 20,
      offset: offset || 0,
      callback: e => {
        handleScreenState('totalRecords', e.totalRecords);
        handleScreenState(
          'totalPages',
          Math.ceil(e.totalRecords / screenState.pageSize),
        );
        const groupedData = e.surveys?.reduce(
          (
            groups: Record<
              string,
              {
                records: ICropSurveyOfflineProps[];
                key: string;
                isSyncEnabled: boolean;
              }
            >,
            item: ICropSurveyOfflineProps,
          ) => {
            const {
              surveyNumber,
              subDivisionNumber,
              districtCode,
              villageCode,
              talukCode,
            } = item;
            const key = `${districtCode}-${talukCode}-${villageCode}-${surveyNumber}-${subDivisionNumber}`;

            if (!groups[key]) {
              groups[key] = {
                key: key,
                records: [],
                isSyncEnabled: Boolean(item.isSyncEnabled),
              };
            }
            groups[key].records.push(item);
            return groups;
          },
          {},
        );
        const groupedArray: any[] = Object.values(groupedData);
        setSurvey(groupedArray);
        clearSelection();
        auth.closeLoader();
        console.log('close loader');
      },
    });
  };

  async function fetchPage(pageNumber: number) {
    // if (auth.loaderStatus?.isLoading ) return;
    auth.updateLoaderStatus({
      isLoading: true,
      loadingText: 'Getting pending survey...',
    });
    console.log('>fetching ', pageNumber);
    const limit = screenState.pageSize;
    const offset = (pageNumber - 1) * limit;
    await getPendingSurvey(limit, offset);
  }

  function nextPage() {
    if (screenState.totalPages === screenState.currentPage) return;
    setSelectedSurveyIds([]);
    handleScreenState('currentPage', screenState.currentPage + 1);
    fetchPage(screenState.currentPage + 1);
  }

  // function for previous page
  function previousPage() {
    if (screenState.currentPage === 1) return;
    setSelectedSurveyIds([]);
    handleScreenState('currentPage', screenState.currentPage - 1);
    fetchPage(screenState.currentPage - 1);
  }

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (!isUpload) {
        fetchPage(1);
      }
    });

    return () => task.cancel();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpload]);

  return (
    <Box flex={'1'}>
      {isUpload ? (
        <UploadCounter
          surveyRecordIds={getSurveyIdsOfSelectedSurveyNumberGroup()}
          onCancel={() => {
            setIsUpload(false);
          }}
          onComplete={() => {
            setIsUpload(false);
          }}
          show={isUpload}
        />
      ) : null}

      <Row justifyContent="center">
        <Box
          justifyContent={'center'}
          flex="1"
          bg="#f9fbf9"
          m="2"
          p="4"
          borderRadius={'xl'}>
          <Box alignItems={'center'}>
            <Text fontSize={'xl'} color="blue.600">
              {ln('Pending to sync')}
            </Text>
            <Text bold fontSize={'2xl'}>
              {screenState.totalRecords}
            </Text>
          </Box>
        </Box>
      </Row>

      <Row alignItems={'center'} justifyContent="space-between" m="2">
        <Row space={'2'} alignItems={'center'}>
          <Checkbox
            value=""
            accessibilityLabel="Select All"
            isChecked={
              selectedSurveyIds?.length > 0 &&
              selectedSurveyIds?.length === survey?.length
            }
            onChange={() => {
              if (selectedSurveyIds?.length === survey?.length) {
                clearSelection();
              } else {
                selectAllSurvey();
              }
            }}
          />
          {/* {selectedSurveyIds?.length > 0 ? <Text>{selectedSurveyIds?.length}</Text> : null} */}
          <Button
            backgroundColor="blue.600"
            size={'sm'}
            onPress={() => {
              // auth.openLoader('loading')
              setTimeout(() => {
                handleSyncSelected();
              }, 1000);
            }}
            // onPress={()=>console.log('>')}
            isDisabled={
              selectedSurveyIds?.length === 0
              // ||
              // survey.some((s) => s.isSyncEnabled == 0)
            }>
            <Row alignItems={'center'} space="2">
              <FA5I name="sync-alt" color="white" />
              <Text color={'white'}>
                {ln('manualSyncBtn').replace(
                  '${selectedSurveyIdsLength}',
                  selectedSurveyIds?.length?.toString(),
                )}
              </Text>
            </Row>
          </Button>
          <Button
            backgroundColor="red.600"
            size={'sm'}
            onPress={handleDeleteSelected}
            isDisabled={selectedSurveyIds?.length === 0}>
            <Row alignItems={'center'} space="2">
              <FA5I name="sync-alt" color="white" />
              <Text color={'white'}>
                {ln('deleteSyncBtn').replace(
                  '${selectedSurveyIdsLength}',
                  selectedSurveyIds?.length?.toString(),
                )}
              </Text>

              {/* <Text color={"white"}>Delete {selectedSurveyIds?.length} Data</Text> */}
            </Row>
          </Button>
        </Row>
      </Row>

      {/* pagination button with next and previous button */}
      {screenState.totalPages > 1 && (
        <Row justifyContent="space-between" m="2" alignItems={'center'}>
          <Pressable
            onPress={previousPage}
            isDisabled={screenState.currentPage === 1}>
            <Row alignItems={'center'}>
              <ArrowBackIcon
                color={
                  screenState.currentPage === 1 ? 'muted.300' : 'muted.600'
                }
              />

              <Text
                ml="2"
                color={
                  screenState.currentPage === 1 ? 'muted.300' : 'muted.600'
                }>
                Previous
              </Text>
            </Row>
          </Pressable>
          <Text mx="2">
            Page {screenState.currentPage} of {screenState.totalPages}
          </Text>
          <Pressable
            onPress={nextPage}
            isDisabled={screenState.currentPage === screenState.totalPages}>
            <Row alignItems={'center'}>
              <Text
                mr="2"
                color={
                  screenState.currentPage === screenState.totalPages
                    ? 'muted.300'
                    : 'muted.600'
                }>
                Next
              </Text>
              <ArrowForwardIcon
                color={
                  screenState.currentPage === screenState.totalPages
                    ? 'muted.300'
                    : 'muted.600'
                }
              />
            </Row>
          </Pressable>
        </Row>
      )}

      <FlatList
        flex="1"
        data={survey}
        renderItem={({item}: {item: any}) =>
          item?.records?.length > 0 ? (
            <Box borderBottomColor={'gray.300'} borderBottomWidth={'1'} mt="3">
              <Box my="2">
                <Pressable
                  onPress={() => {
                    if (selectedSurveyIds.includes(item?.key)) {
                      unSelectSurvey(item?.key);
                    } else {
                      handleSelectSurvey(item?.key);
                    }
                  }}>
                  <Row space="2">
                    <Checkbox
                      accessibilityLabel="Select"
                      value=""
                      isChecked={selectedSurveyIds.includes(item.key)}
                    />
                    <Text bold letterSpacing={'2'}>
                      {item?.records[0]?.surveyNumber}/
                      {item?.records[0]?.subDivisionNumber}
                    </Text>
                  </Row>
                </Pressable>
              </Box>
              {/*<Text>{item.records[0]?.id}</Text>*/}
              {item?.records.map((e: any, idx: number) => (
                <CropSurveyStatusCard surveyData={e} key={idx} />
              ))}
            </Box>
          ) : null
        }
        keyExtractor={(item, index) => `${index}`}
        refreshing={auth.loaderStatus.isLoading}
        onRefresh={getPendingSurvey}
        // onEndReached={loadMoreData}
        onEndReachedThreshold={0.1}
      />
    </Box>
  );
};

export default Index;
