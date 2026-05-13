import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import MainBottomTab from "./MainBottomTab";
import {
  CropForm,
  // CropFormV2,
  CropFormV3,
  DeveloperSettings,
  Home,
  LoadingScreen,
  Profile,
  SurveyList,
  SurveyStatusTab,
  // SurveyStatusTab,
  ViewFinder,
  ViewFinderV2,
  WebView,
} from '../../screens';
import {colors} from '../../styles';
import VerifierHome from '../../screens.verifier/HomeV2';
import SurveyDetail from '../../screens.verifier/SurveyDetail';

const Stack = createNativeStackNavigator();
interface Props {
  screeName: string;
}
const Index = (props: Props) => {
  return (
    <Stack.Navigator initialRouteName={props.screeName}>
      <Stack.Screen
        component={LoadingScreen}
        name="LoadingScreen"
        options={{headerShown: false}}
      />

      <Stack.Screen
        component={Home}
        name="Home"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={CropForm}
        name="CropForm"
        options={{headerShown: false}}
      />
      {/* <Stack.Screen
        component={CropFormV2}
        name="CropFormV2"
        options={{headerShown: false}}
      /> */}
      <Stack.Screen
        component={CropFormV3}
        name="CropFormV3"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={Profile}
        name="Profile"
        options={{
          headerStyle: {
            backgroundColor: colors.primary[600],
            
          },
          headerTintColor: 'white',
        }}
      />

      <Stack.Screen
        component={SurveyStatusTab}
        name="SurveyStatusTab"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        component={ViewFinder}
        name="ViewFinder"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={ViewFinderV2}
        name="ViewFinderV2"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={WebView}
        name="WebView"
        options={{
          //   headerTintColor:'white',
          //   headerTitleStyle:{
          //     fontSize:16,
          //     fontWeight: 'bold'
          //
          //   },
          //   headerStyle:{
          //     backgroundColor:colors.primary["600"]
          // }
          headerShown: false,
        }}
        // options={{ headerShown: false }}
      />
      <Stack.Screen
        component={SurveyList}
        name="SurveyList"
        options={{headerShown: false}}
      />
      <Stack.Screen
        component={DeveloperSettings}
        name="DeveloperSettings"
        options={{headerShown: false}}
      />

      <Stack.Screen
        component={VerifierHome}
        name="VerifierHome"
        options={{headerShown: false}}
      />

      <Stack.Screen
        component={SurveyDetail}
        name="VerificationDetail"
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default Index;
