import { Box, Pressable, Row, Text } from 'native-base';
import React, { useEffect, useState } from 'react';
import { SurveyNumberDropDown } from '../../../../@types/onlineTypes/index';
import ListModal from '../../../../components/ListModal';
import Entypo from 'react-native-vector-icons/Entypo';
import { colors } from '../../../../styles';
import useDict from '../../../../hooks/useDict';
import { useStateContext } from '../../../../hooks';

interface Props {
	disableAllFields?: boolean;
	surveyNumbers?: SurveyNumberDropDown[];
}

export default function SurveyNumberDropDownSelector(props: Props) {
	const ln = useDict();
	const state = useStateContext();
	const [showSurveyNumberModal, setShowSurveyNumberModal] = useState(false);
	const [surveyNumbers, setSurveyNumbers] = useState<SurveyNumberDropDown[]>(props.surveyNumbers || []);

	useEffect(() => {
		if (props.surveyNumbers) {
			setSurveyNumbers(props.surveyNumbers);
		}
	}, [props.surveyNumbers]);

	function handleSurveyNumberSelection(surveyNumber: string) {
		state.handleSelectedLocationData('surveyNumber')(surveyNumber);
		setShowSurveyNumberModal(false);
	}

	return (
		<Box bg="white">
			<Row space="2" p="1" px="2">
				<Box flex="1">
					<Pressable
						p="1"
						alignItems="center"
						flexDir={'row'}
						onPress={() => setShowSurveyNumberModal(true)}
						isDisabled={props.disableAllFields}
						opacity={props.disableAllFields ? 0.7 : 1}
					>
						<Row alignItems="center">
							<Row flex="1">
								<Text color="dark.600" bold>
									{ln('Survey Number')}
								</Text>
								<Text color="black" bold px="2">
									{state.selectedLocationData.surveyNumber}
								</Text>
							</Row>
							<Box>
								<Entypo name="chevron-down" size={24} color={colors.dark[600]} />
							</Box>
						</Row>
					</Pressable>
					{showSurveyNumberModal ? (
						<ListModal
							labelKey="survey_number"
							data={surveyNumbers}
							isOpen={showSurveyNumberModal}
							keysToLookup={["survey_number"]}
							handleClose={() => setShowSurveyNumberModal(false)}
							onSelect={e => handleSurveyNumberSelection(e.survey_number?.toString())}
							title={ln('Survey Number')}
						/>
					) : null}
				</Box>
			</Row>
		</Box>
	);
}
