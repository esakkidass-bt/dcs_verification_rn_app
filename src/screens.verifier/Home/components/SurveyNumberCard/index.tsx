
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OwnerDetailsOnlineProps } from '../../../../@types/onlineTypes/index';
import { OwnerDetailsOfflineProps } from '../../../../@types/offlineTypes/index';

type Props = {
	data: OwnerDetailsOnlineProps | OwnerDetailsOfflineProps;
};

const SurveyNumberCard: React.FC<Props> = ({ data }) => {
	// Support both online and offline props
		const surveyNumber = (data as any).survey_number || (data as any).surveyNumber || '-';
		const subdivision = (data as any).sub_division_number || (data as any).subDivisionNumber || '-';
		const ownerName = (data as any).owner_name || (data as any).ownerName || '-';
		const extent = (data as any).extent || '-';
		const theervai = (data as any).theervai || '-';

	return (
		<View style={styles.card}>
			<Text style={styles.label}>Survey Number: <Text style={styles.value}>{surveyNumber}</Text></Text>
			<Text style={styles.label}>Subdivision: <Text style={styles.value}>{subdivision}</Text></Text>
			<Text style={styles.label}>Owner Name: <Text style={styles.value}>{ownerName}</Text></Text>
			<Text style={styles.label}>Extent (Ares): <Text style={styles.value}>{extent}</Text></Text>
			<Text style={styles.label}>Theervai: <Text style={styles.value}>{theervai}</Text></Text>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 16,
		// marginVertical: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	label: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 4,
	},
	value: {
		fontWeight: 'normal',
		color: '#333',
	},
});

export default SurveyNumberCard;
