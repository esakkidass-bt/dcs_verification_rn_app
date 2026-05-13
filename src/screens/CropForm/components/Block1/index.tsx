import {Box, Icon, Pressable, Radio, Row, Text} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {
  MiscCroppingMethodOnlineProps,
  SeasonOnlineProps,
} from '../../../../@types';
import api from '../../../../api';
import {useAuth, useStateContext} from '../../../../hooks';
import useDict from '../../../../hooks/useDict';
import CroppingMethodDocModal from '../CroppingMethodDocModal';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  onChange: (e: any) => any;
  formData: any;
  previewMode?: boolean;
}
const Index = (props: Props) => {
  const ln = useDict();
  const auth = useAuth();
  const state = useStateContext();
  const [season, setSeason] = useState<SeasonOnlineProps>();
  const [croppingSeasons, setCroppingSeasons] =
    useState<MiscCroppingMethodOnlineProps[]>();

  const getSeasons = useCallback(async () => {
    await api.season
      .getSeasons({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(([status, res]) => {
        if (status === 200) {
          const seasonList = (res as SeasonOnlineProps[]).filter(
            e => e.village_code === state.selectedLocationData.village,
          );
          setSeason(seasonList[0]);
          props.onChange('season')(seasonList[0].season_id.toString());
          props.onChange('masterSeasonId')(
            seasonList[0].master_season_id.toString(),
          );
        }
      });
  }, [state.selectedLocationData.village]);

  const getCroppingMethod = useCallback(async () => {
    await api.misc
      .croppingMethod({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
      })
      .then(e => setCroppingSeasons(e));
  }, [auth.user.userId, auth.deviceId]);

  useEffect(() => {
    getCroppingMethod();
    getSeasons();
  }, []);

  const [isCroppingMethodDocOpen, setIsCroppingMethodDocOpen] = useState(false);

  const openCroppingMethodDocModal = () => {
    setIsCroppingMethodDocOpen(true);
  };
  const closeCroppingMethodDocModal = () => {
    setIsCroppingMethodDocOpen(false);
  };
  return (
    <Box p="4" bg="white" m="1" borderRadius={'xl'}>
      <Row space="2">
        <Text fontSize={'sm'} bold color="primary.600">
          {ln('Season')}
        </Text>
        <Text fontSize={'sm'} bold>
          {season?.season_name}
        </Text>
      </Row>

      {/* //? Cropping Method */}
      <Box>
        <Pressable onPress={openCroppingMethodDocModal}>
          <Row alignItems={'center'} space="2">
            <Text fontSize={'sm'} bold color="primary.600">
              {ln('Cropping Method')}
            </Text>

            <Icon
              as={Ionicons}
              name="information-circle-outline"
              color={'green.600'}
              size="sm"
            />
          </Row>
        </Pressable>
        {closeCroppingMethodDocModal ? (
          <CroppingMethodDocModal
            isOpen={isCroppingMethodDocOpen}
            handleClose={closeCroppingMethodDocModal}
          />
        ) : null}
        <Row space="4">
          <Radio.Group
            isDisabled={props.previewMode}
            name="croppingMethod"
            onChange={props.onChange('method')}
            defaultValue={props.formData.method?.toString()}>
            <Row space="4" flexWrap={'wrap'}>
              {croppingSeasons
                ? croppingSeasons?.map((croppingSeason, i) => (
                    <Radio
                      isDisabled={props.previewMode}
                      value={croppingSeason.cropping_method_id.toString()}
                      size="sm"
                      key={i}>
                      {ln(croppingSeason.cropping_method as any)}
                    </Radio>
                  ))
                : null}
            </Row>
          </Radio.Group>
        </Row>
      </Box>
    </Box>
  );
};

export default Index;
