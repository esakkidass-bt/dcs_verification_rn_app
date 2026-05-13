// import { Box, FlatList, Row, ScrollView, Text } from "native-base";
// import data from "../../data.json";
// import React, { useEffect, useState } from "react";
// import {
//   CropSurveyStatusCard,
// } from "../../../../components";
// import * as SQLite from "expo-sqlite";
// import config from "../../../../config";
// import api from "../../../../api";
// import {  ICropSurveyOfflineProps } from "../../../../@types/form";
// import useDict from "../../../../hooks/useDict";

// const Index = () => {
//   const [survey, setSurvey] = useState<ICropSurveyOfflineProps[]>([]);
// const [isLoading, setIsLoading] = useState(true)

// const ln = useDict()

//   const getAllSurvey =async()=>{
//     setIsLoading(true)
//     await api.local.cropSurvey.get({callback:setSurvey, orderBy:'ASC',})
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     getAllSurvey()
//     return ()=>{
//       setSurvey([])
//       setIsLoading(false)
//     }
//   }, []);
//   return (
//     <Box flex="1">
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
//             <Text fontSize={"sm"} color="primary.600">
//               {ln("Synced")}
//             </Text>
//             <Text bold fontSize={"2xl"}>
//               {survey?.filter((e) => e.syncStatus === "completed")?.length}
//             </Text>
//           </Box>
//         </Box>
//         <Box
//           justifyContent={"center"}
//           flex="1"
//           bg="#f9fbf9"
//           m="2"
//           p="4"
//           borderRadius={"xl"}
//         >
//           <Box alignItems={"center"}>
//             <Text fontSize={"sm"} color="red.600">
//               {ln("pending")}
//             </Text>
//             <Text bold fontSize={"2xl"}>
//               {survey?.filter((e) => e.syncStatus === "pending")?.length}
//             </Text>
//           </Box>
//         </Box>
//       </Row>

//       <FlatList
//       flex='1'
//         data={survey}
//         renderItem={({ item }) => <CropSurveyStatusCard surveyData={item} />}
//         keyExtractor={(item,index)=>`${item.id}-${index}`}
//         refreshing={isLoading}
//         onRefresh={getAllSurvey}
//       />

//     </Box>
//   );
// };

// export default Index;
