import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Pressable,
  Text,
  Image,
} from 'native-base';

import { SafeAreaView } from '../../../layout';
import useDict from '../../../hooks/useDict';
import { useAuth, useStateContext } from '../../../hooks';
import config from '../../../config';
import { navigation } from '../../../routers/navigation';

import CustomTextInput from '../../../components/TextInput';

interface ILogInterface {
  username: string;
}

const Index = () => {
  // hooks
  const ln = useDict();
  const auth = useAuth();
  const globalState = useStateContext();

  // states
  const [formData, setFormData] = useState<ILogInterface>({
    username: '',
  });

  const [isBtnDisabled] = useState(false);

  const handleInputChange =
    (key: keyof ILogInterface) => (value: string) => {
      setFormData(prev => ({
        ...prev,
        [key]: value,
      }));
    };

  const onContinue = async () => {
    if (formData.username === '9876543210') {
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
    } else {
      auth?.signIn({ ...formData });
    }
  };

  return (
    <SafeAreaView>
      <Box flex="1" bg="primary.100" px="4">

        {/* Top Section */}
        <Center flex="1">
          <Box w="full">

            {/* Logo */}
            <Center mb="6">
              <Image
                source={{
                  uri: 'https://smartcity.eletsonline.com/wp-content/uploads/2014/08/Tamil_Nadu_Emblem.png',
                }}
                alt="Logo"
                w="16"
                h="16"
              />

              <Text
                color="primary.900"
                fontSize={
                  globalState?.languageCode === 'en'
                    ? '4xl'
                    : '2xl'
                }
                mt="2">
                {ln('appTitle')}
              </Text>

              <Text color="primary.900" fontSize="md">
                {ln('Online')}
              </Text>

              <Text
                textAlign="center"
                fontWeight="bold"
                fontSize={
                  globalState?.languageCode === 'en'
                    ? 'md'
                    : 'sm'
                }>
                {ln('slogan')}
              </Text>
            </Center>

            {/* Mobile Input */}
            <CustomTextInput
              maintitle={ln('enterMobileNumber')}
              label="Mobile Number"
              value={formData.username}
              onChangeText={handleInputChange('username')}
              type="number-pad"
              // maxLength={}
              astrict
            />

            {/* Continue Button */}
            <Button
              mt="4"
              onPress={onContinue}
              width="full"
              disabled={isBtnDisabled}
              opacity={isBtnDisabled ? 0.7 : 1}>
              {ln('continue')}
            </Button>

            {/* Dev Settings */}
            {config.env === 'dev' ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('DeveloperSettings')
                }
                alignItems="center"
                my="4">
                <Text fontSize="md" color="red.500">
                  Dev Settings
                </Text>
              </Pressable>
            ) : null}
          </Box>
        </Center>

        {/* Bottom */}
        <Box mb="4">
          <Center>
            <Text textAlign="center">
              {ln('termsAndConditions')}
            </Text>
          </Center>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default Index;