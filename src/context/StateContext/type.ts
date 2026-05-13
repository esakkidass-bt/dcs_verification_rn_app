import {CropClassificationOnlineProps, VillageOnlineProps} from '../../@types';
import {ICropFormProps, ISelectedLocationDataProps} from '../../@types/form';
import {LanguageCodeTypes} from '../../hooks/useDict/type';
import {ICropFormV3CameraProps} from '../../screens/CropFormV3/type';

export interface ISelectedFeaturesProps {
  village: any[];
  land: any[];
}
export interface StateContextProps {
  error: string | null;
  setError: (e: string | null) => void;
  languageCode: LanguageCodeTypes | undefined;
  setLanguageCode: (e: LanguageCodeTypes) => void;
  cropFormData?: ICropFormProps;
  setCropFormData: (e: ICropFormProps) => void;
  handleSelectedLocationData: (
    e: keyof ISelectedLocationDataProps,
  ) => (value: any) => void;
  selectedLocationData: ISelectedLocationDataProps;
  DISTANCE_ACCURACY_THRESHOLD: number;
  setDISTANCE_ACCURACY_THRESHOLD: (e: number) => void;
  assignVillageLatLon: (lat: string, lon: string) => void;
  toggleLanguage: () => void;
  selectedFeatures: ISelectedFeaturesProps;
  handleSelectedFeature: (
    key: keyof ISelectedFeaturesProps,
  ) => (e: any) => void;

  onImageCapture: (e: ICropFormV3CameraProps) => void;
  capturedImageData: ICropFormV3CameraProps;
  removeImageData: () => void;
  handleVillageSelect: (props: VillageOnlineProps & {
      districtName?: string
      talukName?: string
    }) => void;
  cropData: {
    cropClassifications: CropClassificationOnlineProps[];
  };

  handleOtherMetaData: (key:'cropName', value:string)=>void,
  otherMetaData: {
    cropName: string;
  }
}
export interface StateProviderProps {
  children: React.ReactNode;
}
