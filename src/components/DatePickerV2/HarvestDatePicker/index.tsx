import {Box, Button, Center, Row, Select, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {Modal} from 'react-native';
import useDict from '../../../hooks/useDict';

interface Props {
  yearsLength: number;
  onChange: (date: string) => void;
  close: () => void;
  isOpen: boolean;
  sowenDate?: string;
}

const Index = (props: Props) => {
  const ln = useDict();
  const [values, setValues] = useState({
    month: '',
    year: '',
    date: '',
  });

  const handleInputChanges = (key: 'month' | 'year') => (value: string) => {
    setValues(prev => ({...prev, [key]: value}));
  };

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

  // generate years for given length
  const years = Array.from(
    {length: props.yearsLength},
    (_, i) => new Date().getFullYear() + i,
  );

  function generateMonths(year: number) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const months = [];
    if (year === currentYear) {
      const currentMonth = currentDate.getMonth();
      for (let i = currentMonth; i <= 11; i++) {
        const month = i + 1;
        months.push(month);
      }
    } else {
      for (let i = 0; i <= 11; i++) {
        const month = i + 1;
        months.push(month);
      }
    }
    return months;
  }
  // generate previous months if the values.year is the current year otherwise generate all months
  const months = generateMonths(parseInt(values.year));

  function lastDayOfMonth(year: any, month: any) {
    return new Date((new Date(year, month, 1) as any) - 1).getDate();
  }
  const handleSubmit = async () => {
    props.onChange(
      `${values.year}/${values.month}/${lastDayOfMonth(
        values.year,
        values.month,
      )}`,
    );
    props.close();
  };

  useEffect(() => {
    return () =>
      setValues({
        month: '',
        year: '',
        date: '',
      });
  }, []);
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
          {!props.sowenDate ? (
            <Box>
              <Center>
                <Text fontSize={'lg'} mt={'4'}>
                  Please Select Tentative Sown Month first
                </Text>
                <Button m="2" w="5/6" onPress={props.close}>
                  {ln('Close')}
                </Button>
              </Center>
            </Box>
          ) : (
            <Box>
              <Center mt="2">
                <Text bold fontSize={'sm'}>
                  {ln('Pick harvest a month and year')}
                </Text>
                <Row space="2" px="2">
                  <Box flex="1">
                    <Select
                      placeholder={ln('Year')}
                      defaultValue={values.year}
                      onValueChange={handleInputChanges('year')}
                      w="full">
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
                      w="full"
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
                <Button
                  m="2"
                  w="5/6"
                  onPress={handleSubmit}
                  isDisabled={!values?.month || !values?.year}>
                  {ln('Okay')}
                </Button>
              </Center>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default Index;
