import React from "react";
import { Box, Center , Text} from "native-base";

interface Props {}

const Index = (props: Props) => {
  return (
    <Box flex="1" justifyContent={"center"}>
      <Center>
        <Text>Loading...</Text>
      </Center>
    </Box>
  );
};

export default Index;
