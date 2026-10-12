import {
  IOfflineVillageDetail,
  IUser,
  ResendOtpProps,
  VerifyOtpProps,
} from '../../@types';
import {LoadingOverlayProps} from '../../components/LoadingOverlay';

export type IAuthStatusType = 'unauthenticated' | 'authenticated';

export type SignInProps = {
  username: string;
};

export type SignInFuncType = (param: SignInProps) => void;

export type SignOutProps = {};
export type SignOutFuncType = (param?: SignOutProps) => void;

export interface AuthContextProps {
  authStatus: IAuthStatusType;
  user: IUser;
  signIn: SignInFuncType;
  signOut: SignOutFuncType;
  verifyOtp: (param: VerifyOtpProps) => void;
  resendOtp: (param: ResendOtpProps) => void;
  fetchUser: () => void;
  deviceId: string | null;
  setDeviceId: (e: string) => void;
  tableCreated: boolean;
  setTableCreated: (e: boolean) => void;
  setUser: (e: IUser) => void;
  setAuthStatus: (e: IAuthStatusType) => void;
  loaderStatus: LoadingOverlayProps;
  updateLoaderStatus: (e: LoadingOverlayProps) => void;
  openLoader: (loadingText?: string) => void;
  closeLoader: () => void;
  appMode: 'online' | 'offline';
  offlineVillage: IOfflineVillageDetail | null;
  goOfflineMode: (village: IOfflineVillageDetail) => void;
  goOnlineMode: () => void;
  handleAppMode: (mode: 'online' | 'offline') => void;
  //checkDeveloperOptionEnabled: () => void;
}
export interface IAuthProviderProps {
  children: React.ReactNode;
}
