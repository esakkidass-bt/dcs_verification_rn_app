import {Row} from 'native-base';
import {Box, Button, Center, Text} from 'native-base';
import React, {useState, useRef, useEffect} from 'react';
import {Alert, TextInput} from 'react-native';
import {useAuth} from '../../../hooks';
import useDict from '../../../hooks/useDict';
import {Timer} from '../../../components';
import {colors} from '../../../styles';

const boxStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  width: 40,
  borderWidth: 1,
  borderColor: '#cecece',
  borderRadius: 5,
  height: 40,
};
const Index = ({route}: any) => {
  const {data, mobileNumber} = route?.params;
  const [otp, setOtp] = useState<string>('');
  const [, setIsLoading] = useState<boolean>(false);

  const otp1 = useRef(null);
  const otp2 = useRef(null);
  const otp3 = useRef(null);
  const otp4 = useRef(null);

  // hooks
  const auth = useAuth();
  const ln = useDict();

  // functions
  const onVerify = async () => {
    setIsLoading(true);
    if (!auth.deviceId) {
      Alert.alert(
        'Device Id not found',
        'Please restart the app and try again',
      );
      return;
    }
    auth?.verifyOtp({
      userId: data?.user_id,
      otp,
      deviceId: auth.deviceId,
    });
  };

  // place string in given index without substr
  const placeString = (str: string, index: number, value: string) => {
    // return str.substr(0, index) + value + str.substr(index + value.length);

    return str.slice(0, index) + value + str.slice(index + value.length);
  };

  const handleOtpInput =
    (index: number, prev: any, next: any) => (e: string) => {
      if (e === '') {
        prev?.current?.focus();
        setOtp(prevVal => prevVal.slice(0, -1));
      } else {
        setOtp(prevVal => placeString(prevVal, index, e));
        next?.current?.focus();
      }
    };

  const handleOtpResend = async () => {
    if (!auth.deviceId) {
      Alert.alert(
        'Device Id not found',
        'Please restart the app and try again',
      );
      return;
    }
    auth?.resendOtp({userId: data?.user_id, deviceId: auth.deviceId});
  };

  return (
    <Box flex="1" bg="white">
      <Box flex="1" justifyContent={'center'}>
        <Center>
          <Box>
            <Text fontSize={'xl'} m="2">
              {ln('OTP has been sent to')} {mobileNumber || ''}.
            </Text>
            <Center my="2">
              <Row space="2">
                <TextInput
                  style={{...boxStyle} as any}
                  textAlign="center"
                  keyboardType="number-pad"
                  onChangeText={handleOtpInput(0, null, otp2)}
                  // onKeyPress={(e) => {console.log(e.nativeEvent.key)}}
                  value={otp?.charAt(0)}
                  ref={otp1}
                  maxLength={1}
                />
                <TextInput
                  style={{...boxStyle} as any}
                  textAlign="center"
                  keyboardType="number-pad"
                  ref={otp2}
                  value={otp?.charAt(1)}
                  onChangeText={handleOtpInput(1, otp1, otp3)}
                  maxLength={1}
                />
                <TextInput
                  style={{...boxStyle} as any}
                  textAlign="center"
                  ref={otp3}
                  value={otp?.charAt(2)}
                  keyboardType="number-pad"
                  onChangeText={handleOtpInput(2, otp2, otp4)}
                  maxLength={1}
                />
                <TextInput
                  style={{...boxStyle} as any}
                  textAlign="center"
                  value={otp?.charAt(3)}
                  ref={otp4}
                  keyboardType="number-pad"
                  onChangeText={handleOtpInput(3, otp3, null)}
                  maxLength={1}
                />
              </Row>
            </Center>
            <Center my="2">
              <Button
                onPress={onVerify}
                disabled={otp?.length !== 4}
                opacity={otp?.length !== 4 ? 0.5 : 1}>
                {ln('Verify')}
              </Button>
            </Center>
            <Center>
              <Center>
                <Text>{ln("Didn't received otp ?")}</Text>

                <Timer
                  // minute={3}
                  // second={0}
                  minute={0}
                  second={5}
                  labelText={ln('Resend OTP')}
                  labelColor={colors.primary[600]}
                  textColor={colors.primary[600]}
                  isOtpSend
                  onResendOtp={() => {
                    handleOtpResend();
                  }}
                />
              </Center>
            </Center>
          </Box>
        </Center>
      </Box>
    </Box>
  );
};

export default Index;

// otp screen with keyboard avoiding view with native base in react native app
