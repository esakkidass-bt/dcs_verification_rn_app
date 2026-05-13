export type EnvTypes =
  | 'dev'
  | 'test'
  | 'local'
  | 'production'
  | 'training'
  | 'beta'
  | 'staging'
  | 'pilot';

export interface IConfigProps {
  env: EnvTypes;
  api_url: string;
  survey_status_summary_api: string;
  localDb: string;
  xAppKey: string;
  version: string;
  androidBuildNumber: number;
  buildVersion: string;
}
