import {Alert} from 'react-native';
import {IUser} from '../../@types';

import {POST} from '../../helpers';

type PropsTaluk = {
    userId: IUser['userId'];
    deviceId: string;
    role_group_id: number;
    district_code: number;
    dropdown_type: 'taluk_code';
    taluk_code?: never;
};

type PropsVillage = {
    userId: IUser['userId'];
    deviceId: string;
    role_group_id: number;
    district_code: number;
    dropdown_type: 'village_code';
    taluk_code: number; // mandatory when dropdown_type is 'village_code'
};

type Props = PropsTaluk | PropsVillage;

interface IVillageProps {
    village_code: number;
    village_name: string;
    xyz_link:string;
    taluk_code: string;
    taluk_name: string;
    district_code: string;
    district_name: string;
    taluk_lgd_code: number;
    village_lgd_code: string;
    centroid_latitude: number;
    centroid_longitude: number;
    district_lgd_code: number;
}

interface ITalukProps {
  taluk_code: number;
  taluk_name: string;
  district_code: number;
  district_name: string;
}

async function getLocation(props: PropsTaluk): Promise<ITalukProps[]>;
async function getLocation(props: PropsVillage): Promise<IVillageProps[]>;
async function getLocation(props: Props): Promise<ITalukProps[] | IVillageProps[]> {
    const name = 'location > assigned_taluk_village';
    return await POST({
        name,
        path: 'online_assigned_taluk_village',
        headers: {
            'X-USER-ID': props.userId,
            'X-DEVICE-ID': props.deviceId,
        },
        data: {
            role_group_id: props.role_group_id,
            district_code: props.district_code,
            dropdown_type: props.dropdown_type,
            ...(props.dropdown_type === 'village_code'
                ? {taluk_code: props.taluk_code}
                : {}),
        },
    }).then(([status, response]) => {
        const res = response;
        if (status === 200) {
            // narrow return type based on the discriminant
            if (props.dropdown_type === 'village_code') {
                return res?.data?.village_details as IVillageProps[];
            }
            return res?.data as ITalukProps[];
        } else {
            Alert.alert('Error', `${res} in ${name}, \nError Code: ${status}`);
            return [];
        }
    });
}

export default getLocation;
