import {ResendOtpProps} from '../../@types';

import {POST} from '../../helpers';

// parse response to camelCase

const resendOtp = async (props: ResendOtpProps) => {
  const data = {
    type: 'send',
    user_id: props.userId,
    device_id: props.deviceId,
  };

  return await POST({
    name: 'resend_otp',
    path: 'resend_otp',
    data,
  }).then(([, res]) => {
    return res;
  });
};

export default resendOtp;
