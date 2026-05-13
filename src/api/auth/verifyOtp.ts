import {VerifyOtpProps} from '../../@types';
import {POST} from '../../helpers';

// parse response to camelCase

const verifyOtp = async (props: VerifyOtpProps) => {
  const data = {
    type: 'check',
    otp: props.otp,
    user_id: props.userId,
    device_id: props.deviceId,
  };

  return await POST({
    name: 'verifyOtp',
    path: 'otp',
    data,
    log: {
      text: false,
    },
  }).then(([status, res]) => {
    return [status, res];
  });
};

export default verifyOtp;
