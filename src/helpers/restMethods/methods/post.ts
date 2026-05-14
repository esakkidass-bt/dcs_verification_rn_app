import {Alert} from 'react-native';
import config from '../../../config';
import {jsonToFormData} from '../../form';
import * as Network from '@react-native-community/netinfo';
import {FIREBASE_URL_LIST, getUrlFromFirebase} from '../../firebase/urls';
import {asyncStorage} from '../../asyncStorage';
// import {getValueFromHTMLResponse} from '../../parser/htmlParser';
// import {FIREBASE_URL_LIST, getUrlFromFirebase} from '../../firebase/urls';

interface PostProps {
  path: string;
  url?: string;
  data: any;
  name: string;
  headers?: any;
  log?: {
    text?: boolean;
  };
}

const POST = async (props: PostProps): Promise<[number, any]> => {
  // console.debug(`${props.name} api initiated
  //   >>>> payload : ${JSON.stringify(props.data)} `);
  try {
    const deviceInfo = await asyncStorage.getObj('deviceInfo');
    const certificateSha256Digest = await asyncStorage.getString(
      'certificateSha256Digest',
    );

    const deviceModel = deviceInfo?.deviceModel || 'Unknown-Unknown';

    const headers = new Headers({
      'X-APP-KEY': config.xAppKey,
      'X-MOBILE-MAKE': deviceModel.split('-')[0] || 'Unknown',
      'X-MOBILE-MODEL': deviceModel.split('-')[1] || 'Unknown',
      'X-APP-INTEGRITY-TOKEN': certificateSha256Digest || '',
      'X-APP-VERSION': config.version,
      'X-USER-ID': props.headers?.['X-USER-ID'] || '3',
      'X-DEVICE-ID': props.headers?.['X-DEVICE-ID'] || '3',
      ...props.headers,
    });

    let formData = null;
    try {
      formData = props.data !== null ? await jsonToFormData(props.data) : null;
    } catch (error) {
      console.log('>>>', error);
    }

    const fetchOptions = {
      method: 'POST',
      headers,
      ...(formData && {body: formData}),
    };
    // console.log(formData)

    if ((await Network.fetch()).isInternetReachable === false) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again',
        [{text: 'OK'}],
      );
      return [500, [{message: 'Network error', success: 0}]];
    }

    // ? URL
    // let URL =
    //   (await getUrlFromFirebase('baseURL')) + `/${props.path}` ||
    //   `${config.api_url}/${props.path}`;

    // if (props.path === 'survey_status_summary') {
    //   URL = `${config.survey_status_summary_api}/${props.path}`;
    // }

    // if (FIREBASE_URL_LIST.includes(props.path)) {
    //   URL = await getUrlFromFirebase(props.path);
    // }
    // if(config.env==='training'){

    //  }

    let URL = `${config.api_url}/${props.path}`;

    if (props.path.includes('online')) {
      const path = props.path.replace('online_', '');
      URL = `${config.api_url}/online/${path}`;
    } else {
      URL = `${config.api_url}/v3/${props.path}`;
    }

    if (!URL) {
      return [500, 'Url not found'];
    }
    console.debug(`${props.name}  fetch options >`, URL, fetchOptions);
    //
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok: ' + response.statusText);
    //   }
    //
    //   const contentType = response.headers.get('content-type');
    //
    //   if (contentType && contentType.includes('application/json')) {
    //     // Check if response is empty or null
    //     if (response.headers.get('content-length') === '0' || response.body === null) {
    //       // Empty or null response, return an appropriate value or handle it as needed
    //       return null;
    //     }
    //
    //     // Parse JSON
    //     return response.json();
    //   } else {
    //     // If content-type is not JSON, handle it accordingly
    //     return response.text();
    //   }
    // })

    console.log('> ', props.name, 'url > ', URL);
    console.log(
      '> ',
      props.name,
      'fetch options > ',
      JSON.stringify(fetchOptions),
    );

    return await fetch(URL, fetchOptions)
      .then(async res => {
        console.log('> ', props.name, res.status);
        // console.log('> ', props.name, props.url, URL);
        if (props?.log?.text) {
          let data = await res.text();
          console.log('> data > ', data);
        }

        // if (props.path === 'online_assigned_survey_dropdown') {
        //   await res.text().then(text => {
        //     console.error(`Error response: ${text}`);
        //     throw new Error(`API error: ${res.status}`);
        //   });
        // }

        const contentType = res.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          let status: number = res.status;
          if (typeof status !== 'number' || status < 200 || status > 599) {
            status = 500; // Default to 500 for invalid status
          }
          console.log(`POST ${props.name} response status: `, status);
          try {
            if ([502, 504].includes(status)) {
              return [
                status,
                `Server is temporarily unavailable. Please try again later. (${status})`,
              ];
            }
            if (
              res.headers.get('content-length') === '0' ||
              res.body === null
            ) {
              return [status, 'No data found in the response'];
            } else if (status === 503) {
              return [status, 'Service Unavailable. Please Contact Support'];
            } else if (status === 404) {
              let data = await res.json();
              if (Array.isArray(data)) {
                data = data[0];
              }
              return [status, data?.message] as [number, any];
            } else if (status === 409) {
              console.error('Error payload> ', JSON.stringify(formData));
              let data = await res.json();
              if (Array.isArray(data)) {
                data = data[0];
              }

              return [status, data?.message] as [number, any];
            } else if (!status.toString().startsWith('2')) {
              try {
                let data = await res.json();
                console.error('Error1', data);
                return [status, data?.message] as [number, any];
              } catch (e) {
                console.error('Error2', e?.toString());

                return [status, e?.toString()] as [number, any];
              }
            } else {
              let data = await res.json();
              console.log('response > ', data);
              if (Array.isArray(data)) {
                data = data[0];
              }
              return [status, data] as [number, any];
            }
          } catch (err) {
            console.error('>', err);
            return [status || 500, 'Parsing errors'] as [number, any];
          }
        } else if (res.headers.get('content-type')?.includes('text')) {
          const html = await res.text();
          let data: any = html;
          const trimmed = html?.trim();
          if (trimmed?.startsWith('{') || trimmed?.startsWith('[')) {
            try {
              data = JSON.parse(trimmed);
            } catch (error) {
              console.warn(`POST ${props.name} text response is not valid JSON`, error);
            }
          }
          return [res.status as number, data];
        } else {
          return [500, 'Unknown error'] as [number, any];
        }
      })
      .then(async ([status, res]) => {
        if (![200, '200'].includes(status)) {
          console.error(status, res);
        }
        return [parseInt(status?.toString()), res] as [number, any];
      })
      .catch(err => {
        console.debug(URL);
        console.debug(JSON.stringify(props));
        console.error(`error in ${props.name} api req > `, err);
        return [500, `${err}`];
      });
  } catch (err) {
    console.log('catch', err);
  }
};

export default POST;
