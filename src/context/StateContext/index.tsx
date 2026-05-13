import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ICropFormProps, ISelectedLocationDataProps} from '../../@types/form';
import {handleLanguageChange} from '../../handlers';
import {LanguageCodeTypes} from '../../hooks/useDict/type';
import {AuthContext} from '../AuthContext';
import {
  ISelectedFeaturesProps,
  StateContextProps,
  StateProviderProps,
} from './type';
import {ICropFormV3CameraProps} from '../../screens/CropFormV3/type';
import {asyncStorage} from '../../helpers/asyncStorage';
import {CropClassificationOnlineProps, VillageOnlineProps} from '../../@types';
import api from '../../api';

export const StateContext = React.createContext<StateContextProps>(
  {} as StateContextProps,
);

export const StateProvider = ({children}: StateProviderProps) => {
  const auth = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  // crop classification
  const [cropClassifications, setCropClassifications] = useState<
    CropClassificationOnlineProps[]
  >([]);

  const [otherMetaData, setOtherMetaData] = useState({
    cropName: null,
  });

  const handleOtherMetaData = useCallback(
    (key: keyof typeof otherMetaData, value: any) => {
      setOtherMetaData(prevVal => {
        return {...prevVal, [key]: value};
      });
    },

    [],
  );

  //? camera
  const [capturedImageData, setCapturedImageData] =
    useState<ICropFormV3CameraProps>({} as ICropFormV3CameraProps);

  function onImageCapture(e: ICropFormV3CameraProps) {
    console.log('captureds', e);
    setCapturedImageData(e);
  }

  function removeImageData() {
    setCapturedImageData({} as ICropFormV3CameraProps);
  }

  // current location

  const [DISTANCE_ACCURACY_THRESHOLD, setDISTANCE_ACCURACY_THRESHOLD] =
    useState(auth.user.bufferDistance);
  const [languageCode, setLanguageCode] = useState<LanguageCodeTypes>();
  const [cropFormData, setCropFormData] = useState<ICropFormProps>(
    {} as ICropFormProps,
  );

  const [selectedLocationData, setSelectedLocationData] =
    React.useState<ISelectedLocationDataProps>(
      {} as ISelectedLocationDataProps,
    );

  const [selectedFeatures, setSelectedFeatures] =
    useState<ISelectedFeaturesProps>({
      village: [],
      land: [],
    });
  const handleSelectedFeature =
    (key: keyof ISelectedFeaturesProps) => (value: any) => {
      setSelectedFeatures(prevVal => {
        return {...prevVal, [key]: value};
      });
    };

  const assignVillageLatLon = (lat: string, lon: string) => {
    setSelectedLocationData(prevVal => {
      return {...prevVal, villageLat: lat, villageLon: lon};
    });
  };

  const toggleLanguage = () => {
    if (languageCode === 'en') {
      setLanguageCode('ta');
    } else {
      setLanguageCode('en');
    }
  };

  const handleVillageSelect = ({
    villageCode,
    parentVillageCode,
    ...props
  }: VillageOnlineProps & {
    districtName?: string
    talukName?: string
  }) => {
    setSelectedLocationData(prevVal => {
      return {
        district: prevVal.district,
        village: villageCode,
        taluk: prevVal.taluk,
        parentVillageCode: parentVillageCode,
        surveyNumber: '',
        villageLat: props.lat,
        villageLon: props.lng,
        xyzTileLink: props.xyzTileLink,
        districtName: props.districtName,
        talukName: props.talukName,
        villageName: props.villageName,
      } as ISelectedLocationDataProps ;
    });
  };

  const handleSelectedLocationData =
    (key: keyof ISelectedLocationDataProps) => (value: any) => {
      setSelectedLocationData(prevVal => {
        let data = prevVal;
        switch (key) {
          case 'district':
            data = {} as ISelectedLocationDataProps;
            break;

          case 'taluk':
            data = {district: prevVal.district} as ISelectedLocationDataProps;
            break;

          // case 'village':
          //   setError(null);

          //   data = {
          //     district: prevVal.district,
          //     taluk: prevVal.taluk,
          //     surveyNumber: '',
          //   } as ISelectedLocationDataProps;
          //   break;

          case 'surveyNumber':
            setError(null);
            data = {
              district: prevVal.district,
              taluk: prevVal.taluk,
              village: prevVal.village,
              villageLat: prevVal.villageLat,
              villageLon: prevVal.villageLon,
              parentVillageCode: prevVal.parentVillageCode,
              subDivisionNumber: '',
              xyzTileLink: prevVal?.xyzTileLink,
            } as ISelectedLocationDataProps;
            break;

          case 'parentVillageCode':
            setError(null);
            data = {...prevVal};

            break;

          default:
            break;
        }
        return {...data, [key]: value};
      });
    };

  //? offline
  useEffect(() => {
    if (auth.offlineVillage?.villageCode) {
      setSelectedLocationData(
        prevVal =>
          ({
            ...prevVal,
            village: auth?.offlineVillage?.villageCode,
            taluk: auth?.offlineVillage?.talukCode,
            district: auth?.offlineVillage?.districtCode,
            parentVillageCode: auth?.offlineVillage?.villageCode,
          } as ISelectedLocationDataProps),
      );
    }
  }, [auth.offlineVillage]);

  const getLanguage = async () =>
    (await asyncStorage.getString('languageCode', 'en')) as LanguageCodeTypes;
  useEffect(() => {
    // get language code from local storage and store if changed
    if (!languageCode) {
      getLanguage().then(setLanguageCode);
    } else {
      handleLanguageChange(languageCode);
    }
  }, [languageCode]);

  useEffect(() => {
    if (auth.user.userId) {
      setDISTANCE_ACCURACY_THRESHOLD(auth.user.bufferDistance);
    }
  }, [auth.user]);

  // useEffect(() => {
  //   // set default location in location selector
  //   if (auth.user?.assignedVillages?.length === 0) return;
  //   handleSelectedLocationData('district')(
  //     auth.user?.assignedVillages?.[0].districtCode,
  //   );
  //   handleSelectedLocationData('taluk')(
  //     auth.user?.assignedVillages?.[0].talukCode,
  //   );
  //   handleSelectedLocationData('village')(
  //     auth.user?.assignedVillages?.[0].villageCode,
  //   );
  //   handleSelectedLocationData('parentVillageCode')(
  //     auth.user?.assignedVillages?.[0].parentVillageCode,
  //   );
  // }, [auth.user.assignedVillages]);

  const getCropClassifications = async () => {
    await api.cropMaster
      .getCropClassifications({
        userId: auth?.user?.userId,
        deviceId: auth?.deviceId as string,
      })
      .then(cropClassification => {
        setCropClassifications(
          cropClassification as CropClassificationOnlineProps[],
        );
      });
  };

  useEffect(() => {
    // getMajorCrops();
    getCropClassifications();
  }, []);

  const value: StateContextProps = {
    languageCode,
    setLanguageCode,
    cropFormData,
    setCropFormData,
    selectedLocationData,
    handleSelectedLocationData,
    DISTANCE_ACCURACY_THRESHOLD,
    setDISTANCE_ACCURACY_THRESHOLD,
    assignVillageLatLon,
    toggleLanguage,
    selectedFeatures,
    handleSelectedFeature,
    error,
    capturedImageData,
    onImageCapture,
    removeImageData,
    setError,
    handleVillageSelect,
    cropData: {
      cropClassifications,
    },
    handleOtherMetaData,
    otherMetaData,
  };
  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};
