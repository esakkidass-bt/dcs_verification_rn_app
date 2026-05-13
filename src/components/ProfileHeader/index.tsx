import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Box, Icon, Image, Pressable, Row, Text} from 'native-base';
import React, {memo} from 'react';
import {Platform} from 'react-native';
import {useAuth} from '../../hooks';
import useDict from '../../hooks/useDict';
import {navigation} from '../../routers/navigation';

interface Props {
  enableBackButton?: boolean;
  disableNavigation?: boolean;
}

function Index({enableBackButton, disableNavigation}: Props) {
  const ln = useDict();
  const auth = useAuth();

  return (
    <Box bg="primary.600">
      <Row alignItems={'center'}>
        {enableBackButton || Platform.OS === 'ios' ? (
          <Pressable m="1" onPress={navigation.goBack}>
            <Icon as={Entypo} name="chevron-left" size="6" color="white" />
          </Pressable>
        ) : null}
        <Box pt="2" pl="2" flex="1" justifyContent={'center'}>
          <Row alignItems="center">
            <Image
              source={{
                uri: 'https://smartcity.eletsonline.com/wp-content/uploads/2014/08/Tamil_Nadu_Emblem.png',
              }}
              alt="TNEGA"
              width={6}
              height={6}
              mr="2"
            />
            <Text color="white" fontSize={'md'} fontWeight="bold">
              {ln('appTitle')}
            </Text>

            {auth?.appMode === 'offline' ? (
              <Text color="white" fontSize={'sm'} ml="2">
                (Offline Mode)
              </Text>
            ) : null}
          </Row>
        </Box>

        {/* //?Profile */}
        <Box flex="1" pt="2" justifyContent={'center'}>
          <Pressable
            onPress={() => {
              if (disableNavigation) return;
              navigation.navigate('Profile');
            }}
            mr="2"
            opacity={disableNavigation ? 0.7 : 1}>
            <Row alignItems={'center'} justifyContent="flex-end">
              <MaterialCommunityIcons name="account" size={24} color="white" />
              <Box>
                <Text color={'white'} fontSize={'xs'} isTruncated bold>
                  {auth?.user.userName} ({auth?.user.role_group_id})
                </Text>
                <Text color="white">{auth?.user?.mobileNumber}</Text>
              </Box>
            </Row>
          </Pressable>
        </Box>
      </Row>
    </Box>
  );
}

export default memo(Index);
