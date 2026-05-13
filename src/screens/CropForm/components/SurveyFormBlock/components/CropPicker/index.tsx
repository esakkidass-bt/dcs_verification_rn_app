import api from '../../../../../../api';
import {CropOnlineProps} from '../../../../../../@types';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Box,
  Center,
  FlatList,
  Icon,
  Input,
  Pressable,
  Row,
  Text,
} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {Modal, View} from 'react-native';
import {useAuth, useStateContext} from '../../../../../../hooks';
import useDict from '../../../../../../hooks/useDict';

interface ListModalProps {
  isOpen: boolean;
  handleClose: () => void;
  onSelect: (e: any) => void;
  title: string;
  labelKey: string;
  labelEscape?: string;
  keyExtractor: string;
  keysToLookup: string[];
  disableSearch?: boolean;
  listEmptyMsg?: string;
  animationPreset?: 'fade' | 'slide';
}

function ListModal(props: ListModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [searchString, setSearchString] = useState<string>('');

  const {languageCode} = useStateContext();
  const auth = useAuth();

  async function getMajorCrops() {
    await api.cropMaster
      .getMajorCrops({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(async e => {
        if (e?.length) {
          // const majorCropOrder = e?.map(_ => _.id);
          // await asyncStorage.storeObj('majorCropOrder', majorCropOrder);
        }
      });
  }

  const getCrops = useCallback(
    async (cropNameStr: string, callBack: (e: any) => void) => {
      await api.cropMaster
        .getCrops({
          deviceId: auth.deviceId as string,
          userId: auth.user.userId,
        })
        .then(async crops => {
          if (!crops) {
            return;
          }
          await api.cropMaster
            .getMajorCrops({
              userId: auth.user.userId,
              deviceId: auth.deviceId as string,
            })
            .then(async majorCrops => {
              if (majorCrops?.length) {
                const majorCropOrder = majorCrops?.map(_ => _.id);
                // await asyncStorage.storeObj('majorCropOrder', majorCropOrder);
                //
                const majorCropOrderMap = new Map(
                  majorCropOrder.map((id, index) => [id, index]),
                );

                const orderedCrop = crops.sort((a, b) => {
                  // Compare by index in the order array
                  return (
                    (majorCropOrderMap.get(a.id) || Infinity) -
                    (majorCropOrderMap.get(b.id) || Infinity)
                  );
                });
                callBack(
                  orderedCrop?.filter(e =>
                    e.crop_name
                      ?.toLowerCase()
                      .includes(cropNameStr?.toLowerCase()),
                  ),
                  // crops?.filter(crop => {
                  //   if (languageCode === 'en') {
                  //     crop.crop_name.includes(cropNameStr);
                  //   } else {
                  //     crop.crop_name_in_tamil.includes(cropNameStr);
                  //   }
                  // }),
                );
              }
            });
        });
    },
    [auth.deviceId, auth.user.userId],
  );

  useEffect(() => {
    //filter the survey numbers based on the search valu
    getCrops(searchString, setData);
  }, [getCrops, searchString]);

  return (
    <Modal
      animationType="fade"
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '20px',
      }}
      transparent={true}
      visible={props.isOpen}
      onRequestClose={props.handleClose}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <Box
          bg="white"
          h="4/6"
          // minH="2/6"
          w="5/6"
          rounded={'xl'}
          overflow="hidden">
          <Row
            p="4"
            bg="primary.600"
            w="full"
            justifyContent="space-between"
            alignItems={'center'}>
            <Text color="white" bold fontSize={'md'}>
              {props.title}
            </Text>
            <Pressable onPress={props.handleClose}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </Pressable>
          </Row>
          {!props.disableSearch ? (
            <Box>
              <Input
                placeholder="Search"
                onChangeText={setSearchString}
                m="2"
                isDisabled={!setSearchString && data?.length < 1}
              />
            </Box>
          ) : null}

          {data?.length > 0 ? (
            <FlatList
              data={data}
              renderItem={({item}) => {
                function onPress() {
                  props.handleClose();
                  props.onSelect(item);
                  console.log(item);
                }
                return (
                  <Pressable
                    onPress={onPress}
                    _pressed={{
                      opacity: '0.7',
                      bgColor: 'gray.200',
                    }}>
                    <Box p="4">
                      <Text>
                        {item?.[props.labelKey] || props?.labelEscape}
                      </Text>
                    </Box>
                  </Pressable>
                );
              }}
              keyExtractor={item => item?.[props.keyExtractor]}
            />
          ) : (
            <Box flex="1" justifyContent={'center'}>
              <Center>
                <Box>
                  <Icon as={Entypo} name="emoji-sad" size="6" />
                </Box>
                <Text color={'gray.500'} mt="1">
                  {props?.listEmptyMsg ? props.listEmptyMsg : 'No data found'}
                </Text>
              </Center>
            </Box>
          )}
        </Box>
      </View>

      {/* <View
      style={{
        justifyContent:'center',
        alignItems:'center',
      }}
      >

      <Text>derkjlnflekjrnfelkjrn</Text>
      </View> */}
    </Modal>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (e: any) => void;
}

export default function CropPicker(props: Props) {
  const ln = useDict();

  return props.isOpen ? (
    <ListModal
      keyExtractor="id"
      labelKey="crop_name"
      labelEscape="Unknown"
      keysToLookup={['crop_name', 'crop_type_id']}
      isOpen={props.isOpen}
      handleClose={props.onClose}
      onSelect={(e: CropOnlineProps) => {
        props.onSelect(e);
      }}
      title={ln('Select Crop')}
    />
  ) : null;
}
