import {Box, Button, Center, Row, Select, Text} from 'native-base';
import React, {useState} from 'react';
import {Modal} from 'react-native';
import useDict from '../../../hooks/useDict';

interface Props {
  yearsLength: number;
  onChange: (date: string) => void;
  close: () => void;
  isOpen: boolean;
}

const Index = (props: Props) => {
  const ln = useDict();
  const [values, setValues] = useState({
    month: '',
    year: '',
    date: '1',
  });

  const handleInputChanges = (key: 'month' | 'year') => (value: string) => {
    setValues(prev => ({...prev, [key]: value}));
  };

  // generate previous years for given length
  const years = Array.from(
    {length: props.yearsLength},
    (_, i) => new Date().getFullYear() - i,
  );

  const monthsValue = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  // generate previous months if the values.year is the current year otherwise generate all months
  const months = Array.from(
    {
      length:
        values.year === new Date().getFullYear().toString()
          ? new Date().getMonth() + 1
          : 12,
    },
    (_, i) => i + 1,
  );

  const handleSubmit = async () => {
    props.onChange(`${values.year}/${values.month}/1`);

    props.close();
  };
  return (
    <Modal
      animationType="fade"
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '20px',
      }}
      transparent={true}
      visible={props.isOpen}
      onRequestClose={props.close}>
      <Box
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <Box bg="white" p="2" w="5/6" rounded={'xl'} overflow="hidden">
          <Box>
            <Center mt="2">
              <Text bold fontSize={'sm'}>
                {ln('Pick sown month and year')}
              </Text>
              <Row space="2" p="1">
                <Box flex="1">
                  <Select
                    p="1"
                    placeholder={ln('Year')}
                    defaultValue={values.year}
                    onValueChange={handleInputChanges('year')}>
                    {years.map(year => (
                      <Select.Item
                        key={year}
                        value={year.toString()}
                        label={year.toString()}
                      />
                    ))}
                  </Select>
                </Box>
                <Box flex="1">
                  <Select
                    p="1"
                    placeholder={ln('Month')}
                    defaultValue={values.month}
                    onValueChange={handleInputChanges('month')}
                    isDisabled={!values.year}>
                    {months.map(month => (
                      <Select.Item
                        key={month}
                        value={month.toString()}
                        label={monthsValue[month - 1]}
                      />
                    ))}
                  </Select>
                </Box>
              </Row>
              {/* <Box m="2" flex='1'> */}
              <Button
                m="2"
                w="5/6"
                onPress={handleSubmit}
                isDisabled={!values?.month || !values?.year}>
                Okay
              </Button>
              {/* </Box> */}
            </Center>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default Index;
