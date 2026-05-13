// import { Box, FlatList, Row, ScrollView, Text } from "native-base";
// import data from "../../data.json";
// import React, { useEffect, useState } from "react";
// import { CropSurveyStatusCard } from "../../../../components";
// import * as SQLite from "expo-sqlite";
// import config from "../../../../config";
// import api from "../../../../api";
// import useDict from "../../../../hooks/useDict";
// import {ICropSurveyDetailsOfflineProps} from "../../../../@types";

// const Index = () => {
// const ln = useDict()
//   const [completedSurvey, setCompletedSurvey] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true)
//   const [groupedSurvey, setGroupedSurvey] = useState<any[]>([])

//   const getCompletedSurvey = async () => {
//     setIsLoading(true)
//     await api.local.cropSurvey.getCropSurveyDetail({
//       syncStatus:'completed',
//       callback: (e) => {
//         console.log(e)
//         const groupedData = e.reduce(
//           (groups: Record<string, any[]>, item: any) => {
//             const {
//               surveyNumber,
//               subDivisionNumber,
//               districtCode,
//               villageCode,
//               talukCode,
//             } = item;
//             const key = `${surveyNumber}-${subDivisionNumber}-${districtCode}-${villageCode}-${talukCode}`;

//             if (!groups[key]) {
//               groups[key] = [];
//             }

//             groups[key].push(item);

//             return groups;
//           },
//           {}
//         );

//         const groupedArray = Object.values(groupedData);
//         setGroupedSurvey(groupedArray);
//         setCompletedSurvey(e)},
//     });
//     setIsLoading(false)
//   };
//   useEffect(() => {
//     getCompletedSurvey()
//     return () => {
//       setCompletedSurvey([]);
//       setIsLoading(false)
//     }
//   }, [data]);
//   return (
//     <Box flex='1'>
//       <Row justifyContent="center">
//         <Box
//           justifyContent={"center"}
//           flex="1"
//           bg="#f9fbf9"
//           m="2"
//           p="4"
//           borderRadius={"xl"}
//         >
//           <Box alignItems={"center"}>
//             <Text fontSize={"xl"} color='primary.600'>{ln("Survey Completed")}</Text>
//             <Text bold fontSize={"2xl"}>
//               {completedSurvey?.length}
//             </Text>
//           </Box>
//         </Box>
//       </Row>

//       <FlatList
//       flex='1'
//         data={groupedSurvey}
//         renderItem={({ item }:{item:ICropSurveyDetailsOfflineProps[]}) => (

//         <>
//         <Box my='2'>

//           <Text bold letterSpacing={'2'}>{item[0].surveyNumber}/{item[0].subDivisionNumber}</Text>
//         </Box>
//         {
//           item.map((e, key)=><CropSurveyStatusCard surveyData={e} key={key} />)}
//         </>
//         )}
//         keyExtractor={(item,index)=>`${index}`}
//         refreshing={isLoading}
//         onRefresh={getCompletedSurvey}
//       />
//       {/* <FlatList
//       flex='1'
//         data={completedSurvey}
//         renderItem={({ item }) => <CropSurveyStatusCard surveyData={item} />}
//         keyExtractor={(item,index)=>`${item.id}-${index}`}
//         refreshing={isLoading}
//         onRefresh={getCompletedSurvey}
//       /> */}

//     </Box>
//   );
// };

// export default Index;
