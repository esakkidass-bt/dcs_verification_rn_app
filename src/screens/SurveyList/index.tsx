import {Box, FlatList, Row, Text} from "native-base";

import React, {useEffect, useState} from "react";
import api from "./../../api";
import useDict from "./../../hooks/useDict";
import {ISurveyStatusOfflineProps, VillageOfflineProps} from "../../@types";
import {ProfileHeader} from "../../components";
import {useStateContext} from "../../hooks";


const Index = ({route}: any) => {
	const {surveyStatus, village}: {
		surveyStatus: 'completed' | 'pending', village: VillageOfflineProps
	} = route.params;
	const [survey, setSurvey] = useState<ISurveyStatusOfflineProps[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const ln = useDict();

	const {selectedLocationData} = useStateContext()
	const [searchString, setSearchString] = useState('')

	const getAllSurvey = async () => {
		setIsLoading(true);
		await api.local.surveyStats.read({
			callback: setSurvey, status: surveyStatus, orderBy: 'DESC', orderByKey: 'surveyNumber', // surveyNumber:'11'
			villageCode: village.villageCode
		});
		setIsLoading(false);
	};

	useEffect(() => {
		getAllSurvey();
		return () => {
			setSurvey([]);
			setIsLoading(false);
		};
	}, []);

	// useEffect(() => {
	// //filter the survey numbers based on the search value
	// if (searchString) {
	//   // use the keys to lookup array to filter the data based on the search string
	//   const filteredData = survey.filter((e) => {
	//     let found = false;
	//     props.keysToLookup?.forEach((key) => {
	//       if (e[key].toLowerCase().includes(searchString.toLowerCase())) {
	//         found = true;
	//       }
	//     });
	//     return found;
	//   });
	//   setData(filteredData);
	// } else {
	//   setData(props.data);
	// }
	// }, [searchString]);

	const Card = (props: ISurveyStatusOfflineProps) => {
		return (<Box bg='white' rounded={'sm'} p='2' m='1' mx='2' w={'16'}
					 h={'16'} justifyContent={'center'}>
			<Text textAlign={'center'}>
				{props.surveyNumber}/{props.subDivisionNumber}
			</Text>
		</Box>);
	};
	// const Card = (props: ISurveyStatusOfflineProps) => {
	//   return (<Box bg='white' rounded={'sm'} p='2' m='1' mx='2'>
	//       <Row justifyContent={'space-between'}>
	//
	//
	//         <Box>
	//           <Text>{props.villageName}</Text>
	//         </Box>
	//         <Row space="2" flex='1'>
	//           {/* <Text>Survey Number</Text>  */}
	//           <Text flex='1' textAlign={'center'}>
	//             {props.surveyNumber}/{props.subDivisionNumber}
	//           </Text>
	//         </Row>
	//
	//         <Box>
	//           <Text>{props.status}</Text>
	//         </Box>
	//       </Row>
	//
	//     </Box>);
	// };

	return (<>
		<ProfileHeader disableNavigation enableBackButton/>
		{/*<LocationSelector/>*/}

		<Box flex="1">
			<Row justifyContent="center">
				<Box
					justifyContent={"center"}
					flex="1"
					bg="#f9fbf9"
					m="2"
					p="4"
					borderRadius={"xl"}
				>
					<Box alignItems={"center"}>
						<Text fontSize={'md'} bold>{village.villageName}</Text>
						<Text fontSize={"sm"}
							  color={surveyStatus === 'completed' ? "primary.600" : "danger.500"}>
							{ln(surveyStatus)}
						</Text>
						<Text bold fontSize={"2xl"}>
							{survey?.length}
						</Text>
					</Box>
				</Box>

			</Row>
			{/*<Row>*/}
			{/*  <Input*/}
			{/*    placeholder={ln("Search")}*/}
			{/*    onChangeText={setSearchString}*/}
			{/*    m="2"*/}
			{/*    isDisabled={!setSearchString && survey?.length < 1}*/}
			{/*  />*/}
			{/*</Row>*/}

			{/*<ScrollView>*/}
			{/*  <Box flexDir={'row'} flexWrap={'wrap'} >*/}
			{/*{survey?.length>0?survey?.map((e, idx)=><Card key={idx} {...e}/>):null}*/}
			{/*  </Box>*/}
			{/*</ScrollView>*/}

			<Box flex={'1'} alignItems={'center'}>

				<FlatList
					showsVerticalScrollIndicator={false}
					numColumns={5}
					data={survey}
					renderItem={({item}) => (<Card {...item}/>)}
					keyExtractor={(item) => item.id}
					refreshing={isLoading}
					onRefresh={getAllSurvey}
				/>
			</Box>
		</Box>
	</>);
};

export default Index;
