import React, { useEffect, useState } from 'react';
import { Alert, NativeModules } from 'react-native';
import {
  IOfflineVillageDetail,
  IUser,
  ResendOtpProps,
  VerifyOtpProps,
} from '../../@types';
import api from '../../api';
import { navigation } from '../../routers/navigation';
import {
  AuthContextProps,
  IAuthProviderProps,
  IAuthStatusType,
  SignInProps,
} from './type';
import buildAssignedVillageFromApi from '../../helpers/parser/buildAssignedVillageFromApi';
import * as Network from '@react-native-community/netinfo';
import { LoadingOverlayProps } from '../../components/LoadingOverlay';
// import * as NetInfo from "@react-native-community/netinfo";
import useDict from '../../hooks/useDict';
import { asyncStorage } from '../../helpers/asyncStorage';
export const AuthContext = React.createContext<AuthContextProps>(
  {} as AuthContextProps,
);

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const ln = useDict();
  const { DeviceIdModule } = NativeModules;
  const [authStatus, setAuthStatus] =
    useState<IAuthStatusType>('unauthenticated');
  const [user, setUser] = useState<IUser>({} as IUser);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<'online' | 'offline'>('online');
  const [offlineVillage, setOfflineVillage] =
    useState<IOfflineVillageDetail | null>(null);
  const [tableCreated, setTableCreated] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState<LoadingOverlayProps>({
    isLoading: false,
  });
  const { BasicFunctions } = NativeModules;

  const checkDeveloperOptionEnabled = async () => {
    BasicFunctions.checkDeveloperOptionEnabled();
  };

  const updateLoaderStatus = (e: LoadingOverlayProps) => {
    setLoaderStatus(prevVal => {
      return { ...prevVal, ...e };
    });
  };

  const openLoader = (loadingText?: string) => {
    setLoaderStatus({ isLoading: true, loadingText });
  };
  const closeLoader = () => {
    setLoaderStatus({ isLoading: false });
  };

  async function signIn(e: SignInProps) {
    updateLoaderStatus({ isLoading: true, loadingText: 'Signing In...' });
    if (!deviceId) {
      Alert.alert('Error', 'Error while getting device id');
      return;
    }
    await api.auth.login({ deviceId, ...e }).then(([status, res]) => {
      if (status === 200) {
        switch (res?.success) {
          case 1:
            navigation.navigate('OTPVerification', {
              data: res?.data,
              mobileNumber: e.username,
            });
            break;

          case 2:
            console.log('device Id > ', deviceId);
            Alert.alert(
              `${res?.message}`,
              `please logout from old device. \nCurrent Device Id : ${deviceId}`,
            );
            break;

          default:
            Alert.alert('Error', `${status} - ${res?.message}`);
            break;
        }
      } else if (status === 400) {
        Alert.alert('Error', `${res?.success} - ${res?.message}`);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    });

    closeLoader();
  }

async function verifyOtp(e: VerifyOtpProps) {
  updateLoaderStatus({
    isLoading: true,
    loadingText: 'Verifying OTP...',
  });

  try {
    const [status, res] = await api.auth.verifyOtp(e);

    console.log('RAW RESPONSE => ', res);

    let parsedResponse: any = res;
    if (typeof res === 'string') {
      const trimmed = res.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedResponse = JSON.parse(trimmed);
        } catch (parseError) {
          console.warn('VERIFY OTP parse warning =>', parseError);
          parsedResponse = res;
        }
      }
    }

    const response = Array.isArray(parsedResponse)
      ? parsedResponse[0]
      : parsedResponse;

    console.log('FINAL RESPONSE => ', response);

    if (status !== 200) {
      closeLoader();

      return Alert.alert(
        'Error',
        `${status} - ${
          response?.message || 'Error while verifying OTP'
        }`,
      );
    }

    if (response?.success === 1) {
      const data = response?.data || {};

      let userData: IUser = {
        userId: data?.user_id,
        userName: data?.user_name,
        mobileNumber: data?.mobile_number,
        role: data?.role,
        role_group_id: data?.role_group_id,
        bufferDistance: data?.buffer_distance,
        bufferUnit: data?.buffer_unit,
        fullSurveyBtnEnable: data?.full_survey_btn_enable,
        assignedVillages: buildAssignedVillageFromApi(
          data?.assigned_villages || [],
        ),
        mode: data?.mode,
      };

      await asyncStorage.storeString(
        'gpsAccuracy',
        String(data?.gps_accuracy || ''),
      );

      await asyncStorage.storeString(
        'gpsAccuracyUnit',
        String(data?.gps_accuracy_unit || ''),
      );

      await asyncStorage.storeObj('user', userData);

      await asyncStorage.storeString('mode', 'online');

      setAppMode('online');

      setUser(userData);

      closeLoader();

      setAuthStatus('authenticated');
    } else {
      closeLoader();

      Alert.alert(
        ln('Error'),
        `${response?.message || 'error'} \nError Code : ${
          response?.success
        }`,
      );
    }
  } catch (error) {
    closeLoader();

    console.log('VERIFY OTP ERROR => ', error);

    Alert.alert('Error', 'Something went wrong');
  }
}

  async function resendOtp(e: ResendOtpProps) {
    await api.auth.resendOtp(e).then(res => {
      Alert.alert('Alert', `${res.message} \nError Code : ${res.success}`);
    });
  }

  async function signOut() {
    Alert.alert(
      ln('Are you sure you want to sign out?'),
      ln('if you signout your data will be deleted from this device'),
      [
        {
          text: ln('Cancel'),
          style: 'cancel',
        },
        {
          text: ln('SignOut'),
          onPress: async () => {
            updateLoaderStatus({
              isLoading: true,
              loadingText: ln('Signing out'),
            });
            if (!deviceId) return;
            const network = await Network.fetch();
            if (!network.isConnected || !network.isInternetReachable) {
              Alert.alert(
                ln('Error'),
                ln('Please check your internet connection'),
              );

              closeLoader();

              return;
            }

            await api.auth.logout({
              userId: user.userId,
              deviceId: deviceId,
              callBack: async () => {
                asyncStorage.storeObj('user', null);
                setAuthStatus('unauthenticated');
              },
            });

            closeLoader();
          },
        },
      ],
    );
  }

  async function checkDeviceIdAndGenerate() {
    const _deviceId = await DeviceIdModule.getDeviceId();
    setDeviceId(_deviceId);
  }

  async function fetchUser() {
    //TODO
    // updateLoaderStatus({isLoading: true, loadingText: ln('Checking user')});
    await checkDeviceIdAndGenerate();

    await asyncStorage.getObj('user', null).then(async (e: IUser) => {
      if (e?.userId) {
        setUser(e);
      } else {
        setUser({} as IUser);
      }
    });

    return;
  }

  function handleAppMode(mode: 'online' | 'offline') {
    setAppMode(mode);
    asyncStorage.storeString('mode', mode);
  }

  async function goOfflineMode(village: IOfflineVillageDetail) {
    setOfflineVillage(village);
    // handleAppMode('offline')

    asyncStorage.storeObj('villageOfflineData', village);
  }

  async function goOnlineMode() {
    setOfflineVillage(null);
    handleAppMode('online');
    api.local.tables.clearTables();
    asyncStorage.storeObj('villageOfflineData', null);
  }

  async function fetchOfflineData() {
    await asyncStorage
      .getObj('villageOfflineData')
      .then((e: IOfflineVillageDetail) => {
        setOfflineVillage(e);
      });
  }

  async function fetchAppMode() {
    await asyncStorage
      .getString('mode', 'online')
      .then(async (e: 'online' | 'offline') => {
        setAppMode(e);
        if (e === 'offline') {
          await fetchOfflineData();
        }
      });
  }

  useEffect(() => {
    fetchUser().then(async () => {
      await fetchAppMode().then(() => {
        closeLoader();
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('>>');
    if (user?.userId) {
      setAuthStatus('authenticated');
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        signIn,
        signOut,
        verifyOtp,
        resendOtp,
        fetchUser,
        deviceId,
        setDeviceId,
        tableCreated,
        setTableCreated,
        setUser,
        setAuthStatus,
        loaderStatus,
        updateLoaderStatus,
        openLoader,
        closeLoader,
        appMode,
        offlineVillage,
        goOfflineMode,
        goOnlineMode,
        handleAppMode,
        //checkDeveloperOptionEnabled,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
