import {Box, Icon, Pressable, Row, Text} from 'native-base';
import React, {useCallback, useEffect} from 'react';
import api from '../../../api';
import {
  DistrictsOnlineProps,
  TalukOnlineProps,
  VillageDetail,
  VillageOnlineProps,
} from '../../../@types';
import {useAuth, useStateContext} from '../../../hooks';
import useDict from '../../../hooks/useDict';
import ListModal from '../../ListModal';
import Entypo from 'react-native-vector-icons/Entypo';
import {asyncStorage} from '../../../helpers/asyncStorage';
import getLocation from '../../../api/location';

// interface Props {
//   disableAllFields?: boolean;
// }

export default function Index() {
  // props: Props
  const ln = useDict();
  const auth = useAuth();
  const {
    handleSelectedLocationData,
    selectedLocationData,
    handleVillageSelect,
    handleSelectedFeature,
    setError,
  } = useStateContext();

  const [showModal, setShowModal] = React.useState<
    'district' | 'taluk' | 'village' | null
  >(null);

  const [districts, setDistricts] = React.useState<DistrictsOnlineProps[]>([]);
  const [taluks, setTaluks] = React.useState<TalukOnlineProps[]>([]);
  const [villages, setVillages] = React.useState<VillageOnlineProps[]>([]);
  const [assignedLocations, setAssignedLocations] = React.useState<
    VillageDetail[]
  >([]);

  const getAssignedLocationDetails = useCallback(async () => {
    await api
      .assignedLocationDetails({
        deviceId: auth.deviceId as string,
        userId: auth.user.userId,
      })
      .then(async e => {
        if (e) {
          await asyncStorage.storeObj('assignedLocationDetails', e);
          setAssignedLocations([...e?.village_details] as VillageDetail[]);
        }
      });
  }, [auth.deviceId, auth.user.userId]);

  useEffect(() => {
    getAssignedLocationDetails();
  }, [getAssignedLocationDetails]);

  const getDistricts = useCallback(async () => {
    let _districts = auth.user.assignedVillages?.map(loc => {
      return {
        districtCode: loc.districtCode?.toString(),
        districtName: loc.districtName,
      };
    });

    _districts = [
      ...new Map(_districts.map(item => [item.districtCode, item])).values(),
    ];
    setDistricts(_districts);

    return _districts;
  }, [assignedLocations]);

  const getTaluks = useCallback(
    async (districtCode: string) => {
      const assignedTaluk = await getLocation({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
        role_group_id: auth.user.role_group_id,
        district_code: districtCode ? Number(districtCode) : 0,
        dropdown_type: 'taluk_code',
      });
      let _taluks = assignedTaluk?.map(loc => {
        return {
          talukCode: loc.taluk_code.toString(),
          talukName: loc.taluk_name,
          districtCode: loc.district_code.toString(),
        };
      });
      _taluks = [
        ...new Map(_taluks.map(item => [item.talukCode, item])).values(),
      ];
      setTaluks(_taluks);
      return _taluks;
    },
    [auth.deviceId, auth.user.role_group_id, auth.user.userId],
  );

  const getVillages = useCallback(
    async (talukCode: string) => {
      setVillages([]);
      const assignedVillages = await getLocation({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
        role_group_id: auth.user.role_group_id,
        district_code: Number(selectedLocationData.district),
        dropdown_type: 'village_code',
        taluk_code: Number(talukCode),
      });
      console.log('>> assigend village ', JSON.stringify(assignedVillages, 2));
      const _villages = assignedVillages?.map(loc => {
        return {
          villageCode: loc.village_lgd_code.toString(),
          villageName: loc.village_name.toString(),
          parentVillageCode: loc.village_lgd_code.toString(),
          talukCode: loc.taluk_code.toString(),
          lat: loc.centroid_latitude.toString(),
          lng: loc.centroid_longitude.toString(),
          xyzTileLink: loc.xyz_link,
        };
      });
      setVillages(_villages);
      return _villages;
    },
    [
      auth.deviceId,
      auth.user.userId,
      auth.user.role_group_id,
      selectedLocationData.district,
    ],
  );

  async function onVillageSelect(village: VillageOnlineProps) {
    const {...villageData} = village;
  
    handleVillageSelect({
      ...villageData,
      districtName: districts?.find(e => {
        return e.districtCode === selectedLocationData.district;
      })?.districtName,
      talukName: taluks?.find(e => {
        return e.talukCode === selectedLocationData.taluk;
      })?.talukName,
      villageName: village.villageName||'',
    });

    await api.spatialData
      .villageBoundry({
        userId: auth.user.userId,
        deviceId: auth.deviceId as string,
        districtCode: selectedLocationData.district,
        talukCode: selectedLocationData.taluk,
        villageCode: village.villageCode,
      })
      .then(e => {
        if (e) {
          setError(null);
          handleSelectedFeature('village')(e.features);
        } else {
          setError('Village boundary not found. Please contact TNeGA');
        }
      });
  }

  // useEffect(() => {
  //   if (selectedLocationData?.village) {
  //     const village = villages?.find(
  //       e => e.villageCode === selectedLocationData.village,
  //     );
  //     handleSelectedLocationData('villageLat')(village?.lat);
  //     handleSelectedLocationData('villageLon')(village?.lng);
  //     console.log('village', village);
  //   }
  // }, [selectedLocationData.village, villages]);

  useEffect(() => {
    if (auth.user.userId) {
      getDistricts().then(_districts => {
        handleSelectedLocationData('district')(_districts?.[0]?.districtCode);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user.userId, getDistricts]);

  useEffect(() => {
    if (selectedLocationData.district) {
      getTaluks(selectedLocationData.district).then(_taluks => {
        // handleSelectedLocationData('taluk')(_taluks?.[0]?.talukCode);
      });
    }
    return () => {
      setTaluks([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocationData.district]);

  useEffect(() => {
    if (taluks?.length > 0) {
      console.log(taluks?.[0]);
      handleSelectedLocationData('taluk')(taluks?.[0]?.talukCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taluks]);

  useEffect(() => {
    if (villages?.length > 0) {
      // handleSelectedLocationData('taluk')(taluks?.[0]?.talukCode);
      onVillageSelect(villages[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villages]);

  useEffect(() => {
    if (selectedLocationData.taluk) {
      getVillages(selectedLocationData.taluk);
    }
    return () => {
      setVillages([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocationData.taluk]);

  return (
    <Box bg="primary.600" px="2">
      <Row space={'2'}>
        <Pressable
          onPress={() => {
            setShowModal('district');
          }}
          flex="1">
          <Row space="2" alignItems={'center'}>
            <Text fontSize="xs" color="white" fontWeight="bold">
              {ln('District')}
            </Text>
            <Icon as={Entypo} name="chevron-down" size="sm" color="white" />
          </Row>

          <Text color="white" isTruncated>
            {auth.user.assignedVillages?.find(e => {
              return e.districtCode === String(selectedLocationData.district);
            })?.districtName || ln('Choose District')}
          </Text>
        </Pressable>
        <Box borderWidth={'1'} borderColor="white" my="2" />

        <Pressable
          onPress={() => {
            setShowModal('taluk');
          }}
          flex="1">
          <Row space="2" alignItems={'center'}>
            <Text fontSize="xs" color="white" fontWeight="bold">
              {ln('Taluk')}
            </Text>
            <Icon as={Entypo} name="chevron-down" size="sm" color="white" />
          </Row>
          <Text color="white" flex="1" isTruncated>
            {taluks?.find(e => {
              return (
                e.districtCode === selectedLocationData.district &&
                e.talukCode === selectedLocationData.taluk
              );
            })?.talukName || ln('Choose Taluk')}
          </Text>
        </Pressable>
        <Box borderWidth={'1'} borderColor="white" my="2" />

        <Pressable
          onPress={() => {
            setShowModal('village');
          }}
          flex="1">
          <Row space="2" alignItems={'center'}>
            <Text fontSize="xs" color="white" fontWeight="bold">
              {ln('Village')}
            </Text>
            <Icon as={Entypo} name="chevron-down" size="sm" color="white" />
          </Row>
          <Text color="white" flex="1" isTruncated>
            {villages?.find(e => {
              return e.villageCode === selectedLocationData.village;
            })?.villageName || ln('Choose Village')}
          </Text>
        </Pressable>
      </Row>

      {showModal === 'district' ? (
        <ListModal
          keyExtractor="districtCode"
          labelKey="districtName"
          labelEscape="Unknown"
          keysToLookup={['districtName']}
          data={districts?.map(e => ({
            ...e,
            disabled: e.districtCode === selectedLocationData.district,
          }))}
          isOpen={showModal === 'district'}
          handleClose={() => setShowModal(null)}
          onSelect={e => {
            handleSelectedLocationData('district')(e.districtCode);
          }}
          title={ln('District')}
        />
      ) : null}
      {showModal === 'taluk' ? (
        <ListModal
          keyExtractor="talukCode"
          labelKey="talukName"
          labelEscape="Unknown"
          keysToLookup={['talukName']}
          data={taluks?.map(e => ({
            ...e,
            disabled: e.talukCode === selectedLocationData.taluk,
          }))}
          isOpen={showModal === 'taluk'}
          handleClose={() => setShowModal(null)}
          onSelect={e => {
            handleSelectedLocationData('taluk')(e.talukCode);
          }}
          title={ln('Taluk')}
        />
      ) : null}
      {showModal === 'village' ? (
        <ListModal
          keyExtractor="villageCode"
          labelKey="villageName"
          labelEscape="Unknown"
          keysToLookup={['villageName']}
          data={villages?.map(e => ({
            ...e,
            disabled: e.villageCode === selectedLocationData.village,
          }))}
          isOpen={showModal === 'village'}
          handleClose={() => setShowModal(null)}
          onSelect={async (e: VillageOnlineProps) => {
            // handleSelectedLocationData("village")('');
            // handleSelectedLocationData("village")(e.villageCode);

            await onVillageSelect(e);
          }}
          title={ln('Village')}
        />
      ) : null}
    </Box>
  );
}
