import {Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';

interface Props {
  minute: number;
  second: number;
  fontsize?: number;
  fontfamily?: string;
  textColor?: string;
  labelFontSize?: number;
  labelFontFamily?: string;
  labelColor?: string;
  labelText?: string;
  onResendOtp: () => void;
  isOtpSend: boolean;
}

const RnOtpTimer = ({
  minute,
  second,
  fontsize,
  fontfamily,
  textColor,
  labelFontSize,
  labelFontFamily,
  labelColor,
  labelText = '',
  onResendOtp,
}: Props) => {
  const [resendOtpPressed, setResendOtpPressed] = useState(false);

  const [secH, setSecH] = useState<number | null>(null);

  let min = minute;
  let sec: number;
  if (second == 0) {
    sec = 59;
    min = min - 1;
  } else {
    sec = second;
  }
  let hsec = 0;

  const [minV, setMinV] = useState(min);
  const [secV, setSecV] = useState(sec);

  function startTimer() {
    var countdownTimer = setInterval(function () {
      sec = sec - 1;
      if (min != 0 && sec == -1) {
        sec = 59;
        min = min - 1;
        setMinV(prevMinV => prevMinV - 1);
        setSecH(null);
      }
      if (sec < 10) {
        setSecH(hsec);
      }
      secV != 0 && setSecV(prevSecV => prevSecV - 1);
      setSecV(sec);

      if (min == 0 && sec <= 0) {
        clearInterval(countdownTimer);
        setResendOtpPressed(false);
        setSecH(null);
        setSecV(second);
        setMinV(minute);
      }
    }, 1000);
  }

  const resendOtp = () => {
    setResendOtpPressed(true);
    onResendOtp();
    startTimer();
  };

  useEffect(() => {
    setResendOtpPressed(true);
    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      {/* புதிய OTP கோர {minV}:{secH} {secV} என காத்திருங்கள் */}
      {resendOtpPressed ? (
        <Text
          style={{
            color: textColor || 'red',
            fontFamily: fontfamily || '',
            fontSize: fontsize || 15,
          }}>
          Wait for {minV}:{secH}
          {secV} to request new OTP
        </Text>
      ) : (
        <TouchableOpacity
          hitSlop={{top: 5, bottom: 5, left: 50, right: 50}}
          onPress={resendOtp}>
          <Text
            style={{
              color: labelColor || 'red',
              fontFamily: labelFontFamily || '',
              fontSize: labelFontSize || 15,
            }}>
            {labelText || 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RnOtpTimer;
