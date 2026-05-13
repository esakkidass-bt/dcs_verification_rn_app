import {LatLng} from 'react-native-maps';

// geojson interface with properties and multi polygon type
export interface GeoJsonMultiPolygon {
  type: string;
  properties: {
    district_code: number;
    taluk_code: number;
    village_code: number;
    survey_number: string;
    sub_division_number: string;
    centroid_longitude: number;
    centroid_latitude: number;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface ICordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface IRegion extends ICordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BoundBoxProps {
  northEast: LatLng;
  southWest: LatLng;
}
