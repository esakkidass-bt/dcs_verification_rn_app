import React, {useState} from 'react';
import {Box, Button, Center, Input, Pressable, Row, Text} from 'native-base';
import {SafeAreaView} from '../../../layout';
import useDict from '../../../hooks/useDict';
import {useAuth, useStateContext} from '../../../hooks';
import {Image} from 'native-base';
import config from '../../../config';
import {navigation} from '../../../routers/navigation';
interface ILogInterface {
  username: string;
}
const Index = () => {
  // hooks
  const ln = useDict();
  const auth = useAuth();
  const globalState = useStateContext();

  // States
  const [formData, setFormData] = useState<ILogInterface>({} as ILogInterface);
  const [isBtnDisabled] = useState(false);

  const handleInputChange = (key: keyof ILogInterface) => (e: any) => {
    setFormData(prevVal => {
      return {...prevVal, [key]: e};
    });
  };

  const onContinue = async () => {
    //FIXME
    if (formData.username === '9876543210') {
      // navigation.navigate('VerifierHome');
      auth.setUser({
        userId: 138233,
        userName: 'Verifier',
        mobileNumber: '9876543210',
        role: 'verifier',
        bufferDistance: 0.05,
        bufferUnit: 'km',
        fullSurveyBtnEnable: false,
        assignedVillages: {} as any,
      });
      auth.setAuthStatus('authenticated');
    }else{

      auth?.signIn({...formData});
    }
  };

  // UseEffects
  return (
    <SafeAreaView>
      <Box flex="1" bg="primary.100">
        <Box flex="1">
          <Center flex="1">
            <Box flex="1">
              <Box
                justifyContent="center"
                alignItems={'center'}
                my="2"
                flex="1">
                <Center w="5/6">
                  <Image
                    source={{
                      uri: 'https://smartcity.eletsonline.com/wp-content/uploads/2014/08/Tamil_Nadu_Emblem.png',
                    }}
                    alt="Crop Survey"
                    w="16"
                    h="16"
                  />
                  <Box>
                    <Text
                      color="primary.900"
                      fontSize={
                        globalState?.languageCode === 'en' ? '4xl' : '2xl'
                      }>
                      {ln('appTitle')}
                    </Text>
                  </Box>
                  <Text color="primary.900" fontSize={'md'}>
                    {ln('Online')}
                  </Text>
                  <Text
                    textAlign={'center'}
                    fontWeight={'bold'}
                    fontSize={globalState?.languageCode === 'en' ? 'md' : 'sm'}>
                    {ln('slogan')}
                  </Text>
                </Center>
              </Box>
              <Box flex="1">
                {/* //?input  */}

                <Box>
                  <Box>
                    <Text
                      textAlign={'center'}
                      fontWeight={'bold'}
                      fontSize={
                        globalState?.languageCode === 'en' ? 'md' : 'sm'
                      }>
                      {ln('enterMobileNumber')}
                    </Text>
                    <Row bg="white" borderRadius={'md'} marginY={2}>
                      <Input
                        padding={'2'}
                        borderRadius={'md'}
                        fontSize={'lg'}
                        leftElement={
                          <Box p="2">
                            <Text fontSize={'lg'}>+91</Text>
                          </Box>
                        }
                        flex="1"
                        // placeholder={ln("enterMobileNumber")}

                        value={formData.username}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={handleInputChange('username')}
                      />
                    </Row>
                  </Box>
                </Box>

                <Box>
                  <Button
                    onPress={onContinue}
                    width={'full'}
                    disabled={isBtnDisabled}
                    opacity={isBtnDisabled ? '0.7' : 1}>
                    {ln('continue')}
                  </Button>
                </Box>
                {config.env === 'dev' ? (
                  <Pressable
                    onPress={() => navigation.navigate('DeveloperSettings')}
                    alignItems={'center'}
                    my="4">
                    <Text fontSize={'md'} color="red.500">
                      Dev Settings
                    </Text>
                  </Pressable>
                ) : null}
                {/*
                <Button bg='red.500' onPress={dropTables}>Drop</Button>
                <Button bg='blue.500' onPress={auth.fetchUser}>fetchUser</Button> */}
              </Box>
            </Box>
          </Center>
        </Box>

        <Box bottom={'4'}>
          <Center>
            <Text textAlign={'center'}>{ln('termsAndConditions')}</Text>
          </Center>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default Index;
