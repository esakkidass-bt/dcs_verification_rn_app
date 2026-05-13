export interface IFeedbackGroup {
  [key: string]: {
    code: string;
    message: string;
    status: 'failed' | 'success';
    type: 'Error' | 'Warning' | 'Info' | 'Success';
  };
}

export type DownloadProgressStatus =
  | 'pending'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'dataNotFound';

export interface IDownloadProgressProps {
  label: string;
  status: DownloadProgressStatus;
  name: string;
  subTitle?: string;
}

export interface IDownloadProgress {}

export interface IDownloadStatus {
  // villageData: DownloadProgressStatus;
  cropMasterData: DownloadProgressStatus;
  miscData: DownloadProgressStatus;
  seasonData: DownloadProgressStatus;
  spatialData: DownloadProgressStatus;
  ownerData: DownloadProgressStatus;
  vectorTiles  : DownloadProgressStatus
}

export type HandleDownloadProgressFunction = (
  name: keyof IDownloadStatus,
  status: DownloadProgressStatus,
) => void;
