import { Box, Button, Center, Input, Pressable, Row, Text } from "native-base";
import React, { useState } from "react";
import { Alert, BackHandler } from "react-native";
import api from "../../api";
import { useAuth, useStateContext } from "../../hooks";

export default function Index() {
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState<string>("");

  const auth = useAuth();
  const state = useStateContext();

  const PASSWORD = "12345";

  const validatePassword = async () => {
    if (PASSWORD === input) {
      setShowSettings(true);
    } else {
      Alert.alert("Error", "Password Incorrect");
    }
  };
  const handleDeviceRegistration = async () => {
    if (!auth.deviceId) {
      Alert.alert("Error", "device id error");
      return;
    }
    await api.auth.registerDevice({
      userId: auth.user.userId,
      deviceId: auth.deviceId
    });
  };

  const dropTables = async () => {
    Alert.alert(
      "Alert",
      "Tables were removed and app will be closed. This will refresh the app",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Okay",
          onPress: async () =>{
            if(auth.user.userId){
              await auth.signOut()
            }
            await api.local.tables.dropTables({ secureTables: ["appSettings"] });
            BackHandler.exitApp()
          }
        },
      ]
    );
  };

  return showSettings ? (
    <Box p="2">
      <Text fontSize={"md"} bold>
        Developer settings
      </Text>

      <Box>
        <Row space="2">
          <Text>Device Id</Text>
          <Text>{auth.deviceId}</Text>
        </Row>
        <Box my="2">
          <Box borderBottomColor="gray.200" borderBottomWidth={1}>
            <Button onPress={handleDeviceRegistration}>Register device</Button>
          </Box>
        </Box>

        <Box>
          <Row space="2">
            <Text>DISTANCE_ACCURACY_THRESHOLD - </Text>
            <Text>{state.DISTANCE_ACCURACY_THRESHOLD}</Text>
          </Row>
          <Box>
            <Text>Available Options</Text>
            <Row flexWrap={"wrap"}>
              {[500, 100, 10, 5, 1, 0.2, 0].map((e) => (
                <Box
                  m="1"
                  borderColor={"gray.300"}
                  borderWidth="1"
                  rounded="md"
                  key={e}
                >
                  <Button
                    p="2"
                    px="4"
                    onPress={() => state.setDISTANCE_ACCURACY_THRESHOLD(e)}
                  >
                    {e || "0"}
                  </Button>
                </Box>
              ))}
            </Row>
          </Box>
        </Box>

        {/* //!  */}
        <Box>
          <Text bold fontSize={"md"}>
            Drop all tables and exit app
          </Text>
          <Button onPress={dropTables} bg="danger.500">
            Drop Tables
          </Button>
        </Box>
      </Box>
    </Box>
  ) : (
    <Box flex="1" justifyContent={"center"}>
      <Center>
        <Box>
          <Text bold>Enter Developer Password</Text>
          <Input my="2" value={input} onChangeText={setInput} />
          <Box my="2">
            <Button onPress={validatePassword}>Open</Button>
          </Box>
        </Box>
      </Center>
    </Box>
  );
}
