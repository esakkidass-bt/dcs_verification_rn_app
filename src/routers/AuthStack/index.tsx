import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  DeveloperSettings,
  InitializingScreen,
  LogIn,
  OtpVerification,
} from '../../screens';

const Stack = createNativeStackNavigator();

const Index = () => {
  return (
    <Stack.Navigator initialRouteName="InitializingScreen">
      <Stack.Screen
        component={InitializingScreen}
        name="InitializingScreen"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={LogIn}
        name="LogIn"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={OtpVerification}
        name="OTPVerification"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={DeveloperSettings}
        name="DeveloperSettings"
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default Index;
