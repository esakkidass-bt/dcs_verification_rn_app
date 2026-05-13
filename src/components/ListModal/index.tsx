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
import React, {useEffect, useState} from 'react';
import {Modal} from 'react-native';
import useDict from '../../hooks/useDict';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  onSelect: (e: any) => void;
  data: any[];
  title: string;
  labelKey: string;
  labelEscape?: string;
  keyExtractor?: string;
  keysToLookup: string[];
  disableSearch?: boolean;
  listEmptyMsg?: string;
  animationPreset?: 'fade' | 'slide';
}

export default function Index(props: Props) {
  const ln = useDict();
  const [data, setData] = useState<any[]>(props.data);
  const [searchString, setSearchString] = useState<string>();

  useEffect(() => {
    //filter the survey numbers based on the search value
    if (searchString) {
      // use the keys to lookup array to filter the data based on the search string
      const filteredData = props.data.filter(e => {
        let found = false;
        props.keysToLookup?.forEach(key => {
          if (e[key].toLowerCase().includes(searchString.toLowerCase())) {
            found = true;
          }
        });
        return found;
      });
      setData(filteredData);
    } else {
      setData(props.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  const style = {
    disabled: {disabled: true, opacity: '0.5'},
  };

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
      <Box
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <Box
          bg="white"
          maxH="4/6"
          minH="2/6"
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
                placeholder={ln('Search')}
                onChangeText={setSearchString}
                m="2"
                isDisabled={!setSearchString && data?.length < 1}
              />
            </Box>
          ) : null}

          {data?.length > 0 ? (
            <FlatList
              data={data}
              renderItem={({item}) => (
                <Pressable
                  {...(item?.disabled ? style.disabled : {})}
                  onPress={() => {
                    props.onSelect(item);
                    props.handleClose();
                  }}
                  _pressed={{
                    opacity: '0.7',
                    bgColor: 'gray.200',
                  }}>
                  <Box p="4">
                    <Text>{item?.[props.labelKey] || props?.labelEscape}</Text>
                  </Box>
                </Pressable>
              )}
              keyExtractor={(item, index) =>
                props.keyExtractor
                  ? item?.[props.keyExtractor]
                  : index.toString()
              }
            />
          ) : (
            <Box flex="1" justifyContent={'center'}>
              <Center>
                <Box>
                  <Icon as={Entypo} name="emoji-sad" size="6" />
                </Box>
                <Text color={'gray.500'} mt="1">
                  {props?.listEmptyMsg
                    ? props.listEmptyMsg
                    : ln('No data found')}
                </Text>
              </Center>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
