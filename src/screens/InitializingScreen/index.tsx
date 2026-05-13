import { Box, Button, Center, Image, Pressable, Row, Text } from 'native-base';
import React, { useEffect, useState } from 'react';

import config from '../../config';
import { useAuth, useStateContext } from '../../hooks';
import useDict from '../../hooks/useDict';
import { navigation } from '../../routers/navigation';
import api from '../../api';
import { tableNames } from '../../api/local/tables/tableData';
import { SQLiteService } from '../../services';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const { languageCode, setLanguageCode } = useStateContext();

  // useEffect(() => {
  //   // checkDevMode()
  // }, [languageCode])

  const ln = useDict();
  const auth = useAuth();
  const globalState = useStateContext();

  const languages: {
    label: string;
    languageCode: any;
  }[] = [
      {
        label: ln('ln-english'),
        languageCode: 'en',
      },
      {
        label: ln('ln-tamil'),
        languageCode: 'ta',
      },
    ];

  const handleContinue = () => {
    navigation.navigate('LogIn');
  };

  const [initiateTableCreation, setInitiateTableCreation] = useState(true);
  // Check if database exists and initialize if it doesn't
  const checkDatabase = async () => {
    const db = await new SQLiteService().getDb();
    const tableNamesWithQuotes = tableNames.map(name => `'${name}'`);

    db.transaction(async tx => {
      tx.executeSql(
        `SELECT name
                     FROM sqlite_master
                     WHERE type = "table"
                       AND name IN (
                       ${tableNamesWithQuotes.join(', ')}
                       )`,
        [],
        async (tx2, result) => {
          if (result.rows.length < tableNames?.length) {
            setInitiateTableCreation(true);
          } else {
            console.log(
              'Tables created :',
              result.rows.length,
              '\nTotal tables:',
              tableNames?.length,
            );
            auth.setTableCreated(true);
          }
        },
        (tx2, error) => {
          console.log('error', error);
          return true;
        },
      );
      return;
    });
  };

  // Call checkDatabase() function when app is opened
  useEffect(() => {
    if (initiateTableCreation) {
      // auth.openLoader('Initializing...');
      setInitiateTableCreation(false);
      api.local.tables.createTables({
        callback: () => {
          checkDatabase();
          setIsLoading(false);
        },
      });
    }
    // getColumns('user')
    // getColumns('assignedVillage')
    // getPermissions();
  }, [initiateTableCreation]);

  return (
    <Box flex="1" bg="primary.100">
      <Center mt="4">
        {/* {config?.env === "dev" ? (
          <Button
            bg="danger.500"
            onPress={async () => {
              await api.local.tables.dropTables();
            }}
          >
            Drop Tables
          </Button>
        ) : null} */}
      </Center>
      {/* {isLoading ? (
        <Box justifyContent={'center'}>
          <Center>
            <Text>Loading.....</Text>
          </Center>
        </Box>
      ) : ( */}
      <Box justifyContent={'center'} alignItems={'center'} flex="1">
        <Center w="5/6">
          <Image
            source={{
              uri: 'https://smartcity.eletsonline.com/wp-content/uploads/2014/08/Tamil_Nadu_Emblem.png',
            }}
            alt="Crop Survey"
            w="16"
            h="16"
          />
          <Box alignItems={'center'}>
            <Text
              color="primary.900"
              fontSize={globalState?.languageCode === 'en' ? '4xl' : '2xl'}>
              {ln('appTitle')}
            </Text>
            <Text color="primary.900" fontSize={'md'}>
              {ln('Online')}
            </Text>
            <Text
              fontWeight={'bold'}
              color="gray.400"
              fontSize={globalState?.languageCode === 'en' ? 'md' : 'sm'}>
              {ln('slogan')}
            </Text>
          </Box>
        </Center>

        <Center mt="1/6" w="5/6">
          {/* //? language selector */}
          <Text
            mb="2"
            fontSize={globalState?.languageCode === 'en' ? 'md' : 'sm'}
            bold
            textAlign={'center'}>
            {ln('Choose your preferred language')}
          </Text>
          <Row space="3">
            {languages.map((language, idx) => (
              <Box key={idx}>
                <Pressable
                  bg={
                    languageCode === language.languageCode
                      ? 'green.600'
                      : 'transparent'
                  }
                  borderRadius={'full'}
                  p="2"
                  px="4"
                  onPress={() => setLanguageCode(language.languageCode)}>
                  <Text
                    color={
                      languageCode === language.languageCode
                        ? 'white'
                        : 'black'
                    }>
                    {language.label}
                  </Text>
                </Pressable>
              </Box>
            ))}
          </Row>

          <Box mt="8">
            <Button
              opacity={languageCode ? 1 : 0.5}
              disabled={!languageCode}
              onPress={handleContinue}>
              {ln('continue')}
            </Button>
          </Box>
        </Center>
      </Box>
      {/* )} */}
      {config?.env === 'dev' ? (
        <Center>
          <Text fontSize={'xs'}>version - {config.version}</Text>
          <Text fontSize={'xs'}>{auth.deviceId}</Text>
        </Center>
      ) : null}
    </Box>
  );
}
