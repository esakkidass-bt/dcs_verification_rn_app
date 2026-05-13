import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';

const CustomTextInput = ({
    label,
    value,
    onChangeText,
    style = {},
    maintitle,
    type = 'default',
    astrict,
    ...props
}: any) => {
    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.maintitle}>{maintitle}</Text>
                {astrict && <Text style={styles.astrict}> *</Text>}
            </View>

            <TextInput
                mode="outlined"
                label={label}
                value={value ?? ''}
                onChangeText={onChangeText}
                keyboardType={type}
                style={[styles.input, style]}
                theme={{
                    colors: { primary: 'black', background: 'white', text: 'black' },
                    fonts: {
                        labelLarge: { fontFamily: 'Poppins-SemiBold', fontSize: 12 },
                        bodyLarge: { fontFamily: 'Poppins-SemiBold', fontSize: 14 },
                    },
                }}
                {...props}
            />
        </View>
    );
};

export default CustomTextInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    astrict: {
        fontSize: 16,
        color: 'red',
        marginLeft: 2,
    },
    maintitle: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: 'black',
    },
    input: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        backgroundColor: 'white',
        color: 'black',
    },
});
