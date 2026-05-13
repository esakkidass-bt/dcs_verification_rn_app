import {ICordinates} from '../../@types/geoJson';

export interface LocationContextProps {
  getCurrentLocation: (callback?: (e: ICordinates) => void) => void;
  previousLocation?: ICordinates;
  handleSimulatedCurrentLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
  simulatedCurrentLocation: ICordinates | null;
  resetSimulatedCurrentLocation: () => void;
  isSimulatingTheLocation: boolean;
}
export interface LocationProviderProps {
  children: React.ReactNode;
}
