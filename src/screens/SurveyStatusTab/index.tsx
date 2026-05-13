
import React from 'react';
import {ManualSyncSurvey} from './components';

import {ProfileHeader} from '../../components';

const Index = ({}: any) => {
  return (
    <>
      <ProfileHeader disableNavigation enableBackButton />
      <ManualSyncSurvey />
    </>
  );
};

export default Index;

// <ProfileHeader disableNavigation enableBackButton />
// <Tab.Navigator initialRouteName={tabName || "ManualSyncSurvey"} screenOptions={{}}>
//   {/* <Tab.Screen
//   name="ViewSurvey"
//   component={ViewSurvey}
//   options={{
//     ...tabBarStyle,
//     tabBarLabel:({color})=><Text bold color={color} isTruncated>View</Text>

//   }}
//   /> */}
//   <Tab.Screen
//     name={"ManualSyncSurvey"}
//     component={ManualSyncSurvey}
//     options={{
//       ...tabBarStyle,
//       tabBarLabel: ({ color }) => (
//         <Text bold color={color} isTruncated>
//           {ln("Manual Sync")}
//         </Text>
//       ),
//     }}
//   />
//   {/* <Tab.Screen
//     name="CompletedSurvey"
//     component={CompletedSurvey}
//     options={{
//       ...tabBarStyle,

//       tabBarLabel: ({ color }) => (
//         <Text bold color={color} isTruncated>
//           Synced
//         </Text>
//       )
//     }}
//   /> */}
// </Tab.Navigator>
