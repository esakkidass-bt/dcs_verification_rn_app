import config from '../../../config';
// import {FIREBASE_URL_LIST, getUrlFromFirebase} from '../../firebase/urls';
import {Alert} from 'react-native';
import {FIREBASE_URL_LIST, getUrlFromFirebase} from '../../firebase/urls';
import {asyncStorage} from '../../asyncStorage';

interface GetProps {
  path: string;
  url?: string;
  name: string;
  headers?: any;
  queryParam?: Record<string, any>;
}

const GET = async (props: GetProps) => {
  console.debug(`${props.name} api initiated`);

  const deviceInfo = await asyncStorage.getObj('deviceInfo');

  const certificateSha256Digest = await asyncStorage.getString(
    'certificateSha256Digest',
  );
  const deviceModel = deviceInfo?.deviceModel || 'Unknown-Unknown';
  const headers: any = new Headers({
    'X-APP-KEY': config.xAppKey,
    'X-MOBILE-MAKE': deviceModel.split('-')[0] || 'Unknown',
    'X-MOBILE-MODEL': deviceModel.split('-')[1] || 'Unknown',
    'X-APP-INTEGRITY-TOKEN': certificateSha256Digest || '',
    'X-APP-VERSION': config.version,
    'X-USER-ID': props.headers?.['X-USER-ID'] || '3',
    'X-DEVICE-ID': props.headers?.['X-DEVICE-ID'] || '3',
    // "X-DEVICE-ID": await api.local.appSettings.getSetting({key:'deviceId', callback:()=>{}}),
    ...props.headers,
  });

  console.debug('>>>> headers ', headers);
  const queryParamString = props.queryParam
    ? '?' + new URLSearchParams(props.queryParam).toString()
    : '';

  // ? URL
  // let URL = props?.url || `${config.api_url}/${props.path}`;

  // if (FIREBASE_URL_LIST.includes(props.path)) {
  //   URL = await getUrlFromFirebase(props.path);
  // }
  // if (config.env === "training") {
  //   if (FIREBASE_URL_LIST.includes(props.path)) {
  //     URL = await getUrlFromFirebase(props.path);
  //   }
  // }

  let URL = `${config.api_url}/${props.path}`;

  if (props.path.startsWith('online_')) {
    const path = props.path.replace('online_', '');
    URL = `${config.api_url}/online/${path}`;
  } else {
    URL = `${config.api_url}/v3/${props.path}`;
  }

  if (!URL) {
    return [500, 'Url not found'];
  }

  console.debug('>get url > ', URL + queryParamString);

  return await fetch(URL + queryParamString, {
    method: 'GET',
    headers,
  })
    .then(async res => {
      let data;
      try {
        data = await res?.json();
        if (Array.isArray(data)) {
          data = data[0];
        }
      } catch (err) {
        data = {error: err};  
      }

      console.log('>get res > ', props.name, res.status, res.statusText, data);

      return [res.status, data];
    })
    .then(async ([status, res]) => {
      if ([504, 502].includes(status)) {
        Alert.alert(
          'Error',
          `Server is temporarily unavailable. Please try again later. (${status})`,
        );
      }
      return [status, res];
    })
    .catch(err => {
      console.error(`error in ${props.name} api req > `, err);
      return [500, err];
    });
};

export default GET;
