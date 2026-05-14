import React from 'react';
import {navigationRef} from './navigation';
import {NavigationContainer} from '@react-navigation/native';
import {useAuth} from '../hooks';

import AppStack from './AppStack';
import AuthStack from './AuthStack';
// import Download from './Download';
import {LoadingOverlay, LocationStatusBar} from '../components';
import {Box} from 'native-base';

export default function Index() {
  // const globalState = useGlobalState();
  const auth = useAuth();
  console.log('auth', auth.authStatus);
  console.log('auth.user', auth.user);
  const stack = () => {
    switch (auth?.authStatus) {
      case 'authenticated':
        // return <Download  />;
        if (['verifier'].includes(auth.user.role)) {
          return <AppStack screeName="VerifierHome" />;
        } else {
          // return <AppStack screeName="Home" />;
          return <AppStack screeName="VerifierHome" />;
        }
      // case 'download':
      //   // return <AppStack screeName="DownloadScreen" />;
      //   return <Download />;
      case 'unauthenticated':
        return <AuthStack />;
      default:
        return <AuthStack />;
    }
  };
  return (
    <NavigationContainer ref={navigationRef}>
      <Box flex={1} safeAreaBottom={false} safeAreaTop={false}>
        {stack()}
        <LocationStatusBar />
        <LoadingOverlay {...auth.loaderStatus} />
      </Box>
    </NavigationContainer>
  );
}
