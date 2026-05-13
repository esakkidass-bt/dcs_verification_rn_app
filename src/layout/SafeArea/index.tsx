import {Box, IBoxProps} from 'native-base';
import React from 'react';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props extends IBoxProps {
  children: React.ReactNode;
}

const Index = ({children, ...props}: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={[]} style={{flex: 1}}>
      <Box flex={1}
      // paddingTop={insets.top}
      // paddingBottom={insets.bottom}
      {...props}>
        {children}
      </Box>
    </SafeAreaView>
  );
  // return (
  //   <SafeAreaView style={{flex: 1}}>
  //     <Box flex="1" safeArea {...props}>
  //       {children}
  //     </Box>
  //   </SafeAreaView>
  // );
};

export default Index;
