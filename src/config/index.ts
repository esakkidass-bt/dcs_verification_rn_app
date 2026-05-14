// import { ENV } from "../../env";
import { Platform } from 'react-native';
import { EnvTypes, IConfigProps } from '../@types';

const ENV: EnvTypes = 'dev'
const VERSION = '1.0.3';

const ANDROID_BUILD_VERSION_CODE = 5;
const ANDROID_APP_BUILD_NUMBER = 1;
const ANDROID_VERSION_AND_BUILD = `V ${VERSION} (Build ${ANDROID_BUILD_VERSION_CODE}.${ANDROID_APP_BUILD_NUMBER})`;

const IOS_BUILD_VERSION_CODE = 1;
const IOS_APP_BUILD_NUMBER = 1;
const IOS_VERSION_AND_BUILD = `V ${VERSION} (Build ${IOS_BUILD_VERSION_CODE}.${IOS_APP_BUILD_NUMBER})`;

const $: IConfigProps[] = [
  {
    env: 'dev',
    api_url:
      // 'http://ec2-13-235-45-34.ap-south-1.compute.amazonaws.com/crop_survey_api/api/v3',
      'https://dcs.bontonsoftwares.com/cropSurveyVerification/app/api',
    survey_status_summary_api:
      // 'http://ec2-13-235-45-34.ap-south-1.compute.amazonaws.com/crop_survey_api/api/v3',
      'https://dcs.bontonsoftwares.com/cropSurveyVerification/app/api',
    localDb: `tnega-crop-survey–01-${ENV}.db`,
    xAppKey: 'crop$urvey!',
    version: VERSION,
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
  {
    env: 'test',
    api_url: 'https://dcs.bontonsoftwares.com/cropSurveyVerification',
    survey_status_summary_api: 'https://dcs.bontonsoftwares.com/cropSurveyVerification',

    localDb: `tnega_crop-survey-01-${ENV}.db`,
    xAppKey: 'crop$urvey!',
    version: '1.0.3',
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
  {
    env: 'production',
    // api_url: 'http://13.203.149.20/app/api',
    // survey_status_summary_api: 'http://13.203.149.20/app/api/v4',
    api_url: 'https://cropverification.tnega.org/app/api',
    survey_status_summary_api: 'https://cropverification.tnega.org/app/api',
    // api_url: 'https://cropsurveyapi.tnega.org/app/api/v3',

    localDb: `tnega-crop-survey-231214-${ENV}.db`,
    xAppKey: 'crop$urvey!',
    version: VERSION,
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
  {
    env: 'staging',
    // api_url: 'http://13.203.149.20/app/api',
    // survey_status_summary_api: 'http://13.203.149.20/app/api/v4',
    api_url:
      'https://tngis.tnega.org/crop-survey/app/dcs_verification_php/app/api',
    survey_status_summary_api:
      'https://tngis.tnega.org/crop-survey/app/dcs_verification_php/app/api',
    // api_url: 'https://cropsurveyapi.tnega.org/app/api/v3',

    localDb: `tnega-crop-survey-231214-${ENV}.db`,
    xAppKey: 'crop$urvey!',
    version: VERSION,
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
  {
    env: 'pilot',
    // api_url: 'http://13.203.149.20/app/api',
    // survey_status_summary_api: 'http://13.203.149.20/app/api/v4',
    api_url:
      'http://crop-verification-env.eba-uyy5yxzm.ap-south-1.elasticbeanstalk.com/app/api',
    survey_status_summary_api:
      'http://crop-verification-env.eba-uyy5yxzm.ap-south-1.elasticbeanstalk.com/app/api',
    // api_url: 'https://cropsurveyapi.tnega.org/app/api/v3',

    localDb: `tnega-crop-survey-231214-${ENV}.db`,
    xAppKey: 'crop$urvey!',
    version: VERSION,
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
  {
    env: 'beta',
    api_url: 'https://cropsurvey.tnega.org/crop_survey_api/api/v3',
    survey_status_summary_api:
      'https://cropsurvey.tnega.org/crop_survey_api/api/v4',

    localDb: `tnega-crop-survey–231214-production.db`,
    xAppKey: 'crop$urvey!',
    version: VERSION,
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
  {
    env: 'training',
    api_url:
      'http://ec2-13-235-45-34.ap-south-1.compute.amazonaws.com/crop_survey_api/api/v3',
    survey_status_summary_api:
      'http://ec2-13-235-45-34.ap-south-1.compute.amazonaws.com/crop_survey_api/api/v4',
    // api_url: "https://tngis.tn.gov.in/apps/crop_survey/app/api/v3",
    // survey_status_summary_api: "https://tngis.tn.gov.in/apps/crop_survey/app/api/v3",

    localDb: `tnega-crop-survey–231214-${ENV}.db`,
    xAppKey: 'crop$urvey!',
    version: VERSION,
    androidBuildNumber: ANDROID_BUILD_VERSION_CODE,
    buildVersion:
      Platform.OS === 'android'
        ? ANDROID_VERSION_AND_BUILD
        : IOS_VERSION_AND_BUILD,
  },
];

const config = { ...($.find(e => e.env === ENV) as IConfigProps) };

export default config;
