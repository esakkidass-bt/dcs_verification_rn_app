import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Box, Button, Icon, Pressable, Row, ScrollView, Text} from 'native-base';
import React from 'react';
import {Modal} from 'react-native';
import useDict from '../../../../hooks/useDict';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

function Index({isOpen, handleClose}: Props) {
  const ln = useDict();
  const croppingMethods = [
    {
      title: ln('croppingMethod:Mono:title'),
      desc: ln('croppingMethod:Mono:desc'),
    },
    {
      title: ln('croppingMethod:Inter:title'),
      desc: ln('croppingMethod:Inter:desc'),
    },
    {
      title: ln('croppingMethod:Multilevel:title'),
      desc: ln('croppingMethod:Multilevel:desc'),
    },
    {
      title: ln('croppingMethod:Mixed:title'),
      desc: ln('croppingMethod:Mixed:desc'),
    },
  ];
  return isOpen ? (
    <Modal
      visible={isOpen}
      onRequestClose={handleClose}
      animationType="fade"
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '20px',
      }}
      transparent={true}>
      <Box
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <Box
          bg="white"
          p="2"
          pb="8"
          w="5/6"
          maxH="4/6"
          rounded={'xl'}
          overflow="hidden">
          <Box px="2">
            <Row py="4" justifyContent={'space-between'} alignItems={'center'}>
              <Text bold fontSize={'md'}>
                {ln('Cropping Method')}
              </Text>

              <Pressable onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </Pressable>
            </Row>
            <ScrollView showsVerticalScrollIndicator={false}>
              {croppingMethods?.map(({title, desc}, i) => (
                <Box p="2" key={i}>
                  <Text bold fontSize={'sm'}>
                    {title}
                  </Text>
                  <Text fontSize={'xs'}>{desc}</Text>
                </Box>
              ))}
            </ScrollView>
          </Box>
        </Box>
      </Box>
    </Modal>
  ) : null;
}

export default Index;
