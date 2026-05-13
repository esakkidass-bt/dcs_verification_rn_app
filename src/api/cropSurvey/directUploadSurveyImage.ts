import {POST} from '../../helpers';

interface Props {
  deviceId: string;
  userId: string;
  data: {
    image_id: string;
    survey_number: string;
    village_code: string;
    crop_name_id: any;
    crop_image: {
      uri: string;
      name: string;
      type: string;
    };
  };
}

export default async function uploadImage(props: Props) {
  return await POST({
    name: 'crop_image',
    path: 'crop_image',
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-DEVICE-ID': props.deviceId,
      'X-USER-ID': props.userId,
    },
    data: props.data,
  });
}

// const uploadImage = async (
//   data: IUploadImageApiProps,
//   props: {deviceId: string; userId: string},
// ) => {
//   return await POST({
//     name: 'crop_image',
//     path: 'crop_image',
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       'X-DEVICE-ID': props.deviceId,
//       'X-USER-ID': props.userId,
//     },
//     data: data,
//   });
// };
