import { POST } from '../../helpers';

interface Props {
  username: string;
  deviceId: string;
}

const login = async (props: Props) => {
  const data = {
    mobile_number: props.username,
    device_id: props.deviceId,
  };
  return await POST({
    name: 'login',
    path: 'login',
    data,
  }).then(([status, res]) => {
    console.log('status LOGIN>> ', status);
    console.log('res LOGIN>> ', res);
    return [status, res];
  });
};

export default login;
